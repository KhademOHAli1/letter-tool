/**
 * Settings Tab - Campaign Edit Page
 */

"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { Campaign } from "@/lib/types";

interface SettingsTabProps {
	campaign: Campaign;
	onChange: (updates: Partial<Campaign>) => void;
	onDelete: () => void;
}

const COUNTRIES = [
	{ code: "de", name: "Germany", flag: "🇩🇪" },
	{ code: "ca", name: "Canada", flag: "🇨🇦" },
	{ code: "uk", name: "United Kingdom", flag: "🇬🇧" },
	{ code: "us", name: "United States", flag: "🇺🇸" },
	{ code: "fr", name: "France", flag: "🇫🇷" },
];

export function SettingsTab({
	campaign,
	onChange,
	onDelete,
}: SettingsTabProps) {
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const countryCodes = campaign.countryCodes;

	const handleCountryToggle = (code: string, checked: boolean) => {
		const newCodes = checked
			? [...countryCodes, code]
			: countryCodes.filter((c) => c !== code);

		onChange({ countryCodes: newCodes });
	};

	const handleGoalChange = (value: string) => {
		onChange({
			goalLetters: value ? Number.parseInt(value, 10) : null,
		});
	};

	const handleDateChange = (
		field: "start_date" | "end_date",
		value: string,
	) => {
		onChange({ [field]: value || null });
	};

	const handleDelete = async () => {
		if (deleteConfirmation !== campaign.slug) return;

		setIsDeleting(true);

		try {
			const supabase = getSupabaseBrowserClient();

			// Delete related data first
			await supabase
				.from("campaign_demands")
				.delete()
				.eq("campaign_id", campaign.id);
			await supabase
				.from("campaign_prompts")
				.delete()
				.eq("campaign_id", campaign.id);

			// Delete the campaign
			const { error } = await supabase
				.from("campaigns")
				.delete()
				.eq("id", campaign.id);

			if (error) throw error;

			onDelete();
			router.push("/admin/campaigns");
		} catch (error) {
			console.error("Error deleting campaign:", error);
			alert("Failed to delete campaign. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Goal and Dates */}
			<Card>
				<CardHeader>
					<CardTitle>Campaign Goals</CardTitle>
					<CardDescription>
						Set targets and timeframes for your campaign
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="goalLetters">Letter Goal</Label>
						<p className="text-sm text-muted-foreground">
							Set a target number of letters to display progress to supporters
						</p>
						<Input
							id="goalLetters"
							type="number"
							min={1}
							value={campaign.goalLetters || ""}
							onChange={(e) => handleGoalChange(e.target.value)}
							placeholder="e.g., 10000"
							className="max-w-xs"
						/>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="date"
								value={campaign.startDate || ""}
								onChange={(e) => handleDateChange("start_date", e.target.value)}
								className="max-w-xs"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								value={campaign.endDate || ""}
								onChange={(e) => handleDateChange("end_date", e.target.value)}
								min={campaign.startDate || undefined}
								className="max-w-xs"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Target Countries */}
			<Card>
				<CardHeader>
					<CardTitle>Target Countries</CardTitle>
					<CardDescription>
						Select which countries this campaign targets
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{COUNTRIES.map((country) => (
							<div
								key={country.code}
								className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
							>
								<Checkbox
									id={`country-${country.code}`}
									checked={countryCodes.includes(country.code)}
									onCheckedChange={(checked) =>
										handleCountryToggle(country.code, checked as boolean)
									}
									disabled={
										countryCodes.length === 1 &&
										countryCodes.includes(country.code)
									}
								/>
								<label
									htmlFor={`country-${country.code}`}
									className="flex cursor-pointer items-center gap-2"
								>
									<span className="text-lg">{country.flag}</span>
									<span className="text-sm font-medium">{country.name}</span>
								</label>
							</div>
						))}
					</div>
					{countryCodes.length === 1 && (
						<p className="mt-2 text-xs text-muted-foreground">
							At least one country must be selected
						</p>
					)}
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<CardTitle className="text-destructive">Danger Zone</CardTitle>
					</div>
					<CardDescription>
						Irreversible actions that affect your campaign
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
						<div>
							<p className="font-medium">Delete Campaign</p>
							<p className="text-sm text-muted-foreground">
								Permanently delete this campaign and all its data
							</p>
						</div>
						<Button
							variant="destructive"
							onClick={() => setIsDeleteDialogOpen(true)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-destructive">
							Delete Campaign
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete the
							campaign and all associated data including demands, prompts, and
							analytics.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<p className="text-sm">
							To confirm, type the campaign slug:{" "}
							<code className="rounded bg-muted px-2 py-1 font-mono text-sm">
								{campaign.slug}
							</code>
						</p>
						<Input
							value={deleteConfirmation}
							onChange={(e) => setDeleteConfirmation(e.target.value)}
							placeholder="Enter campaign slug"
							className="font-mono"
						/>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setDeleteConfirmation("");
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteConfirmation !== campaign.slug || isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Campaign
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
