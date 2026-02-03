/**
 * Target Table Editor
 * Import, map, validate, and save custom target lists.
 * Supports two variants: "dialog" (popup) and "inline" (embedded in page).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import {
	autoMapHeaders,
	detectDelimiter,
	parseDelimited,
	REQUIRED_TARGET_FIELDS,
	TARGET_FIELD_HELP,
	TARGET_FIELD_LABELS,
	TARGET_FIELDS,
	TARGET_TEMPLATE_CSV,
	type TargetField,
	type TargetUploadRow,
} from "@/lib/campaign-targets";

type TableEditorMode = "wizard" | "database";
type TableEditorVariant = "dialog" | "inline";

interface TargetTableEditorProps {
	mode: TableEditorMode;
	/** Display variant: "dialog" (popup) or "inline" (embedded in page) */
	variant?: TableEditorVariant;
	/** For dialog variant: controls visibility */
	open?: boolean;
	/** For dialog variant: callback when visibility changes */
	onOpenChange?: (open: boolean) => void;
	campaignId?: string;
	onApply?: (rows: TargetUploadRow[]) => void;
	onSaved?: (rows: TargetUploadRow[]) => void;
	/** For inline variant: callback when user cancels/dismisses */
	onCancel?: () => void;
}

type RowIssue = {
	row: number;
	messages: string[];
};

const EMAIL_PATTERN = /.+@.+\..+/;
const PREVIEW_ROW_COUNT = 20;

// Internal type with unique ID for editable rows
type EditableRow = TargetUploadRow & { _id: string };

let rowIdCounter = 0;
function generateRowId(): string {
	rowIdCounter += 1;
	return `row-${Date.now()}-${rowIdCounter}`;
}

function rowsFromJson(input: string): string[][] {
	let json: unknown;
	try {
		json = JSON.parse(input);
	} catch {
		throw new Error("Invalid JSON format.");
	}

	if (!Array.isArray(json)) {
		throw new Error("JSON must be an array of objects.");
	}

	const records = json.filter(
		(entry) => typeof entry === "object" && entry !== null,
	) as Record<string, unknown>[];

	const headers = new Set<string>();
	for (const record of records) {
		for (const key of Object.keys(record)) {
			headers.add(key);
		}
	}

	const headerList = Array.from(headers);
	if (headerList.length === 0) return [];

	const rows = [headerList];
	for (const record of records) {
		rows.push(headerList.map((key) => String(record[key] ?? "")));
	}

	return rows;
}

function buildColumnLabels(headers: string[], columnCount: number): string[] {
	if (headers.length > 0) return headers;
	return Array.from(
		{ length: columnCount },
		(_, index) => `Column ${index + 1}`,
	);
}

function createEmptyTarget(): EditableRow {
	return {
		_id: generateRowId(),
		name: "",
		email: "",
		postal_code: "",
		city: "",
		region: "",
		country_code: "",
		category: "",
		image_url: "",
		latitude: "",
		longitude: "",
	};
}

export function TargetTableEditor({
	mode,
	variant = "dialog",
	open,
	onOpenChange,
	campaignId,
	onApply,
	onSaved,
	onCancel,
}: TargetTableEditorProps) {
	const [activeTab, setActiveTab] = useState("upload");
	const [sourceLabel, setSourceLabel] = useState<string | null>(null);
	const [rawRows, setRawRows] = useState<string[][]>([]);
	const [dataHasHeader, setDataHasHeader] = useState(true);
	const [pasteHasHeader, setPasteHasHeader] = useState(true);
	const [headers, setHeaders] = useState<string[]>([]);
	const [mapping, setMapping] = useState<Array<TargetField | null>>([]);
	const [importError, setImportError] = useState<string | null>(null);
	const [pasteText, setPasteText] = useState("");
	const [googleUrl, setGoogleUrl] = useState("");
	const [isFetchingSheet, setIsFetchingSheet] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editableTargets, setEditableTargets] = useState<EditableRow[]>([]);

	const hasData = rawRows.length > 0;

	// Reset state when dialog is closed (dialog variant only)
	useEffect(() => {
		if (variant !== "dialog" || open) return;
		setActiveTab("upload");
		setSourceLabel(null);
		setRawRows([]);
		setHeaders([]);
		setMapping([]);
		setImportError(null);
		setPasteText("");
		setGoogleUrl("");
		setDataHasHeader(true);
		setPasteHasHeader(true);
		setIsFetchingSheet(false);
		setIsSaving(false);
		setIsEditMode(false);
		setEditableTargets([]);
	}, [open, variant]);

	// Auto-start manual entry mode when switching to manual tab
	useEffect(() => {
		if (activeTab === "manual" && !isEditMode && editableTargets.length === 0) {
			setEditableTargets([createEmptyTarget()]);
			setIsEditMode(true);
			setSourceLabel("Manual entry");
			setImportError(null);
		}
	}, [activeTab, isEditMode, editableTargets.length]);

	const handleClose = () => {
		if (variant === "dialog") {
			onOpenChange?.(false);
		} else {
			onCancel?.();
		}
	};

	const handleEditImported = () => {
		// Convert validated targets to editable mode with unique IDs
		setEditableTargets(
			validation.targets.map((t) => ({ ...t, _id: generateRowId() })),
		);
		setIsEditMode(true);
	};

	const handleAddRow = () => {
		setEditableTargets((prev) => [...prev, createEmptyTarget()]);
	};

	const handleDeleteRow = (index: number) => {
		setEditableTargets((prev) => prev.filter((_, i) => i !== index));
	};

	const handleCellChange = (
		rowIndex: number,
		field: TargetField,
		value: string,
	) => {
		setEditableTargets((prev) =>
			prev.map((row, i) => (i === rowIndex ? { ...row, [field]: value } : row)),
		);
	};

	const setTableData = (rows: string[][], label: string, header = true) => {
		if (rows.length === 0) {
			setImportError("No rows found in that file.");
			return;
		}
		setImportError(null);
		setSourceLabel(label);
		setRawRows(rows);
		setDataHasHeader(header);

		const columnCount = rows[0]?.length ?? 0;
		const nextHeaders = header
			? rows[0].map((cell, index) => cell || `Column ${index + 1}`)
			: buildColumnLabels([], columnCount);
		setHeaders(nextHeaders);
		setMapping(autoMapHeaders(nextHeaders));
	};

	const handleFileUpload = async (file: File) => {
		setImportError(null);
		try {
			const content = await file.text();
			if (file.name.toLowerCase().endsWith(".json")) {
				const rows = rowsFromJson(content);
				setTableData(rows, file.name, true);
				return;
			}

			const delimiter = file.name.toLowerCase().endsWith(".tsv")
				? "\t"
				: detectDelimiter(content);
			const rows = parseDelimited(content, delimiter);
			setTableData(rows, file.name, true);
		} catch (error) {
			setImportError(
				error instanceof Error ? error.message : "Failed to parse file.",
			);
		}
	};

	const handlePasteParse = () => {
		if (!pasteText.trim()) {
			setImportError("Paste a table before parsing.");
			return;
		}

		try {
			const delimiter = detectDelimiter(pasteText);
			const rows = parseDelimited(pasteText, delimiter);
			setTableData(rows, "Pasted table", pasteHasHeader);
		} catch (error) {
			setImportError(
				error instanceof Error ? error.message : "Failed to parse paste.",
			);
		}
	};

	const handleGoogleImport = async () => {
		if (!googleUrl.trim()) {
			setImportError("Enter a Google Sheets URL.");
			return;
		}

		setIsFetchingSheet(true);
		setImportError(null);

		try {
			const response = await fetch("/api/targets/google-sheet", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: googleUrl }),
			});

			if (!response.ok) {
				const payload = (await response.json()) as { error?: string };
				throw new Error(payload.error || "Failed to load Google Sheet.");
			}

			const payload = (await response.json()) as { csv: string };
			const rows = parseDelimited(payload.csv, detectDelimiter(payload.csv));
			setTableData(rows, "Google Sheet", true);
		} catch (error) {
			setImportError(
				error instanceof Error ? error.message : "Failed to load Google Sheet.",
			);
		} finally {
			setIsFetchingSheet(false);
		}
	};

	const handleDownloadTemplate = () => {
		const blob = new Blob([TARGET_TEMPLATE_CSV], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "campaign-targets-template.csv";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleMappingChange = (index: number, field: TargetField | null) => {
		setMapping((prev) => {
			const next = [...prev];
			if (field) {
				const existing = next.findIndex(
					(current, currentIndex) =>
						current === field && currentIndex !== index,
				);
				if (existing >= 0) {
					next[existing] = null;
				}
			}
			next[index] = field;
			return next;
		});
	};

	const handleAutoMap = () => {
		setMapping(autoMapHeaders(headers));
	};

	const handleHeaderToggle = (checked: boolean) => {
		setDataHasHeader(checked);
		if (!rawRows.length) return;
		const columnCount = rawRows[0]?.length ?? 0;
		const nextHeaders = checked
			? rawRows[0].map((cell, index) => cell || `Column ${index + 1}`)
			: buildColumnLabels([], columnCount);
		setHeaders(nextHeaders);
		setMapping(autoMapHeaders(nextHeaders));
	};

	const validation = useMemo(() => {
		if (!hasData) {
			return {
				totalRows: 0,
				validRows: 0,
				skippedRows: 0,
				issues: [] as RowIssue[],
				targets: [] as TargetUploadRow[],
				missingRequiredColumns: REQUIRED_TARGET_FIELDS,
			};
		}

		const missingRequiredColumns = REQUIRED_TARGET_FIELDS.filter(
			(field) => !mapping.includes(field),
		);

		const startIndex = dataHasHeader ? 1 : 0;
		const totalRows = Math.max(rawRows.length - startIndex, 0);
		let skippedRows = 0;
		const issues: RowIssue[] = [];
		const targets: TargetUploadRow[] = [];

		for (let i = startIndex; i < rawRows.length; i += 1) {
			const row = rawRows[i] ?? [];
			if (row.every((cell) => cell.trim().length === 0)) {
				skippedRows += 1;
				continue;
			}

			const entry: Partial<TargetUploadRow> = {};
			mapping.forEach((field, index) => {
				if (!field) return;
				const value = row[index]?.trim();
				if (value) {
					entry[field] = value;
				}
			});

			const rowIssues: string[] = [];
			for (const field of REQUIRED_TARGET_FIELDS) {
				if (!entry[field] || entry[field]?.trim().length === 0) {
					rowIssues.push(`Missing ${TARGET_FIELD_LABELS[field]}`);
				}
			}
			if (entry.email && !EMAIL_PATTERN.test(entry.email)) {
				rowIssues.push("Invalid email format");
			}

			if (rowIssues.length > 0) {
				issues.push({ row: i + 1, messages: rowIssues });
				continue;
			}

			targets.push(entry as TargetUploadRow);
		}

		return {
			totalRows,
			validRows: targets.length,
			skippedRows,
			issues,
			targets,
			missingRequiredColumns,
		};
	}, [dataHasHeader, hasData, mapping, rawRows]);

	const previewRows = useMemo(() => {
		if (!hasData) return [];
		const startIndex = dataHasHeader ? 1 : 0;
		return rawRows.slice(startIndex, startIndex + PREVIEW_ROW_COUNT);
	}, [dataHasHeader, hasData, rawRows]);

	// Validation for editable mode
	const editValidation = useMemo(() => {
		if (!isEditMode || editableTargets.length === 0) {
			return {
				totalRows: 0,
				validRows: 0,
				issues: [] as RowIssue[],
				targets: [] as TargetUploadRow[],
			};
		}

		const issues: RowIssue[] = [];
		const targets: TargetUploadRow[] = [];

		for (let i = 0; i < editableTargets.length; i += 1) {
			const row = editableTargets[i];
			const rowIssues: string[] = [];

			// Check required fields
			for (const field of REQUIRED_TARGET_FIELDS) {
				if (!row[field] || row[field]?.trim().length === 0) {
					rowIssues.push(`Missing ${TARGET_FIELD_LABELS[field]}`);
				}
			}

			// Validate email format
			if (row.email && !EMAIL_PATTERN.test(row.email)) {
				rowIssues.push("Invalid email format");
			}

			if (rowIssues.length > 0) {
				issues.push({ row: i + 1, messages: rowIssues });
			} else {
				targets.push(row);
			}
		}

		return {
			totalRows: editableTargets.length,
			validRows: targets.length,
			issues,
			targets,
		};
	}, [isEditMode, editableTargets]);

	// Choose which validation to use based on mode
	const activeValidation = isEditMode ? editValidation : validation;
	const activeTargets = isEditMode
		? editValidation.targets
		: validation.targets;

	const canSave =
		(isEditMode ? editableTargets.length > 0 : hasData) &&
		activeTargets.length > 0 &&
		activeValidation.issues.length === 0 &&
		(isEditMode || validation.missingRequiredColumns.length === 0) &&
		!isSaving;

	const handleSave = async () => {
		if (!canSave) return;

		if (mode === "wizard") {
			onApply?.(activeTargets);
			handleClose();
			return;
		}

		if (!campaignId) {
			setImportError("Missing campaign ID for database mode.");
			return;
		}

		setIsSaving(true);
		setImportError(null);

		try {
			const supabase = getSupabaseBrowserClient();
			const { error: deleteError } = await supabase
				.from("campaign_targets")
				.delete()
				.eq("campaign_id", campaignId);
			if (deleteError) throw deleteError;

			const inserts = activeTargets.map((row) => ({
				campaign_id: campaignId,
				name: row.name,
				email: row.email,
				postal_code: row.postal_code,
				city: row.city || null,
				region: row.region || null,
				country_code: row.country_code || null,
				category: row.category || null,
				image_url: row.image_url || null,
				latitude: row.latitude ? Number.parseFloat(row.latitude) : null,
				longitude: row.longitude ? Number.parseFloat(row.longitude) : null,
			}));

			const chunkSize = 500;
			for (let i = 0; i < inserts.length; i += chunkSize) {
				const chunk = inserts.slice(i, i + chunkSize);
				const { error } = await supabase.from("campaign_targets").insert(chunk);
				if (error) throw error;
			}

			onSaved?.(activeTargets);
			handleClose();
		} catch (error) {
			setImportError(
				error instanceof Error ? error.message : "Failed to save targets.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	// Shared footer content
	const footerContent = (
		<>
			<Button variant="outline" onClick={handleClose}>
				Cancel
			</Button>
			<Button onClick={handleSave} disabled={!canSave}>
				{isSaving ? "Saving…" : "Save Audience"}
			</Button>
		</>
	);

	// Main body content (shared between variants)
	const bodyContent = (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="manual">Manual Entry</TabsTrigger>
					<TabsTrigger value="upload">Upload File</TabsTrigger>
					<TabsTrigger value="paste">Paste Table</TabsTrigger>
					<TabsTrigger value="google">Google Sheets</TabsTrigger>
				</TabsList>

				<TabsContent value="manual" className="space-y-3">
					<div>
						<p className="text-sm font-medium">Start with an empty table</p>
						<p className="text-xs text-muted-foreground">
							Add rows manually one by one. Required fields: name, email,
							postal_code.
						</p>
					</div>
				</TabsContent>

				<TabsContent value="upload" className="space-y-3">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm font-medium">Upload a target list</p>
							<p className="text-xs text-muted-foreground">
								CSV, TSV, or JSON with required fields: name, email,
								postal_code.
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownloadTemplate}
						>
							Download template
						</Button>
					</div>
					<Input
						type="file"
						accept=".csv,.tsv,.json"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleFileUpload(file);
							e.currentTarget.value = "";
						}}
					/>
				</TabsContent>

				<TabsContent value="paste" className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="paste-table">Paste a table</Label>
						<Textarea
							id="paste-table"
							value={pasteText}
							onChange={(event) => setPasteText(event.target.value)}
							placeholder="Paste CSV or TSV rows here"
							rows={6}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="paste-header"
							checked={pasteHasHeader}
							onCheckedChange={(checked) =>
								setPasteHasHeader(checked as boolean)
							}
						/>
						<label htmlFor="paste-header" className="text-sm">
							First row contains headers
						</label>
					</div>
					<Button type="button" onClick={handlePasteParse}>
						Parse Table
					</Button>
				</TabsContent>

				<TabsContent value="google" className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="google-url">Public Google Sheets URL</Label>
						<Input
							id="google-url"
							value={googleUrl}
							onChange={(event) => setGoogleUrl(event.target.value)}
							placeholder="https://docs.google.com/spreadsheets/d/..."
						/>
						<p className="text-xs text-muted-foreground">
							The sheet must be shared publicly (Anyone with the link).
						</p>
					</div>
					<Button
						type="button"
						onClick={handleGoogleImport}
						disabled={isFetchingSheet}
					>
						{isFetchingSheet ? "Loading…" : "Import Sheet"}
					</Button>
				</TabsContent>
			</Tabs>

			{importError && <p className="text-sm text-destructive">{importError}</p>}

			{!hasData && !isEditMode && (
				<p className="text-sm text-muted-foreground">
					Import a table to see column mapping and validation.
				</p>
			)}

			{/* Editable table mode */}
			{isEditMode && (
				<div className="space-y-4">
					<div className="rounded-lg border p-4 space-y-2">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex flex-wrap gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">Source:</span>{" "}
									{sourceLabel || "Manual entry"}
								</div>
								<div>
									<span className="text-muted-foreground">Rows:</span>{" "}
									{editValidation.totalRows}
								</div>
								<div>
									<span className="text-muted-foreground">Valid:</span>{" "}
									{editValidation.validRows}
								</div>
								{editValidation.issues.length > 0 && (
									<div className="text-destructive">
										{editValidation.issues.length} invalid
									</div>
								)}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setIsEditMode(false);
									setEditableTargets([]);
								}}
							>
								Back to Import
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Edit Table</p>
							<Button variant="outline" size="sm" onClick={handleAddRow}>
								+ Add Row
							</Button>
						</div>
						<div className="overflow-x-auto rounded-lg border">
							<table className="min-w-full text-sm">
								<thead className="bg-muted/40 text-left">
									<tr>
										<th className="px-2 py-2 w-8">#</th>
										{TARGET_FIELDS.map((field) => (
											<th key={field} className="px-2 py-2 min-w-30">
												<span
													className={
														REQUIRED_TARGET_FIELDS.includes(field)
															? "text-destructive"
															: ""
													}
												>
													{TARGET_FIELD_LABELS[field]}
													{REQUIRED_TARGET_FIELDS.includes(field) && " *"}
												</span>
											</th>
										))}
										<th className="px-2 py-2 w-12">Actions</th>
									</tr>
								</thead>
								<tbody>
									{editableTargets.map((row, rowIndex) => {
										const rowIssue = editValidation.issues.find(
											(i) => i.row === rowIndex + 1,
										);
										return (
											<tr
												key={row._id}
												className={`border-t ${rowIssue ? "bg-destructive/5" : ""}`}
											>
												<td className="px-2 py-1 text-muted-foreground text-xs">
													{rowIndex + 1}
												</td>
												{TARGET_FIELDS.map((field) => {
													const isRequired =
														REQUIRED_TARGET_FIELDS.includes(field);
													const isEmpty =
														isRequired &&
														(!row[field] || row[field].trim() === "");
													const isEmailInvalid =
														field === "email" &&
														row.email &&
														!EMAIL_PATTERN.test(row.email);
													const hasError = isEmpty || isEmailInvalid;
													return (
														<td
															key={`${row._id}-${field}`}
															className="px-1 py-1"
														>
															<Input
																type={field === "email" ? "email" : "text"}
																value={row[field] || ""}
																onChange={(e) =>
																	handleCellChange(
																		rowIndex,
																		field,
																		e.target.value,
																	)
																}
																className={`h-8 text-xs ${hasError ? "border-destructive" : ""}`}
																placeholder={TARGET_FIELD_LABELS[field]}
															/>
														</td>
													);
												})}
												<td className="px-2 py-1">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteRow(rowIndex)}
														className="h-8 w-8 p-0 text-destructive hover:text-destructive"
														disabled={editableTargets.length === 1}
													>
														×
													</Button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						{editValidation.issues.length > 0 && (
							<p className="text-xs text-destructive">
								{editValidation.issues.length} row(s) have errors. Fix required
								fields to save.
							</p>
						)}
					</div>
				</div>
			)}

			{hasData && !isEditMode && (
				<div className="space-y-6">
					<div className="rounded-lg border p-4 space-y-2">
						<div className="flex flex-wrap gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">Source:</span>{" "}
								{sourceLabel || "Imported table"}
							</div>
							<div>
								<span className="text-muted-foreground">Rows:</span>{" "}
								{validation.totalRows}
							</div>
							<div>
								<span className="text-muted-foreground">Valid:</span>{" "}
								{validation.validRows}
							</div>
							<div>
								<span className="text-muted-foreground">Skipped:</span>{" "}
								{validation.skippedRows}
							</div>
						</div>
						{validation.missingRequiredColumns.length > 0 && (
							<p className="text-sm text-destructive">
								Missing required columns:{" "}
								{validation.missingRequiredColumns
									.map((field) => TARGET_FIELD_LABELS[field])
									.join(", ")}
							</p>
						)}
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Column Mapping</p>
							<Button variant="ghost" size="sm" onClick={handleAutoMap}>
								Auto-map headers
							</Button>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Checkbox
								id="data-header"
								checked={dataHasHeader}
								onCheckedChange={(checked) =>
									handleHeaderToggle(checked as boolean)
								}
							/>
							<label htmlFor="data-header">First row contains headers</label>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{headers.map((header, index) => (
								<div key={`col-${header || index}`} className="space-y-1">
									<p className="text-xs text-muted-foreground">
										{header || `Column ${index + 1}`}
									</p>
									<Select
										value={mapping[index] ?? "ignore"}
										onValueChange={(value) =>
											handleMappingChange(
												index,
												value === "ignore" ? null : (value as TargetField),
											)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Ignore column" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ignore">Ignore</SelectItem>
											{TARGET_FIELDS.map((field) => (
												<SelectItem key={field} value={field}>
													{TARGET_FIELD_LABELS[field]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground">
										{mapping[index]
											? TARGET_FIELD_HELP[mapping[index] as TargetField]
											: "Not mapped"}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Preview (first 20 rows)</p>
							<Button
								variant="outline"
								size="sm"
								onClick={handleEditImported}
								disabled={validation.targets.length === 0}
							>
								Edit Table
							</Button>
						</div>
						<div className="overflow-x-auto rounded-lg border">
							<table className="min-w-full text-sm">
								<thead className="bg-muted/40 text-left">
									<tr>
										{headers.map((header, index) => (
											<th key={`th-${header || index}`} className="px-3 py-2">
												{header || `Column ${index + 1}`}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{previewRows.map((row) => {
										// Create stable key from row content
										const rowKey = row.slice(0, 3).join("-") || row.join("-");
										return (
											<tr key={rowKey} className="border-t last:border-b">
												{headers.map((header, colIndex) => (
													<td
														key={`${rowKey}-${header || colIndex}`}
														className="px-3 py-2"
													>
														{row[colIndex] || ""}
													</td>
												))}
											</tr>
										);
									})}
									{previewRows.length === 0 && (
										<tr>
											<td
												colSpan={headers.length}
												className="px-3 py-4 text-center text-muted-foreground"
											>
												No data rows found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>

					{validation.issues.length > 0 && (
						<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2">
							<p className="text-sm font-medium text-destructive">
								{validation.issues.length} row(s) need attention
							</p>
							<ul className="text-xs text-muted-foreground space-y-1">
								{validation.issues.slice(0, 8).map((issue) => (
									<li key={`issue-${issue.row}`}>
										Row {issue.row}: {issue.messages.join("; ")}
									</li>
								))}
								{validation.issues.length > 8 && (
									<li>…and {validation.issues.length - 8} more</li>
								)}
							</ul>
							<p className="text-xs text-muted-foreground">
								Fix the source file or mapping to continue.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);

	// Inline variant: renders as a Card directly on the page
	if (variant === "inline") {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Audience Table Editor</CardTitle>
					<CardDescription>
						Import a table, map columns to the target schema, and save the list.
					</CardDescription>
				</CardHeader>
				<CardContent>{bodyContent}</CardContent>
				<CardFooter className="flex justify-end gap-2">
					{footerContent}
				</CardFooter>
			</Card>
		);
	}

	// Dialog variant: renders as a popup modal
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Audience Table Editor</DialogTitle>
					<DialogDescription>
						Import a table, map columns to the target schema, and save the list.
					</DialogDescription>
				</DialogHeader>
				{bodyContent}
				<DialogFooter className="gap-2">{footerContent}</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
