/**
 * Demands Tab - Campaign Edit Page
 */

"use client";

import { Check, GripVertical, Plus, Trash2, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { CampaignDemand } from "@/lib/types";

interface DemandsTabProps {
	campaignId: string;
	demands: CampaignDemand[];
	onChange: (demands: CampaignDemand[]) => void;
}

const LANGUAGES = ["en", "de"];

export function DemandsTab({ campaignId, demands, onChange }: DemandsTabProps) {
	const [editingDemand, setEditingDemand] = useState<CampaignDemand | null>(
		null,
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleAddDemand = () => {
		const newDemand: CampaignDemand = {
			id: crypto.randomUUID(),
			campaignId: campaignId,
			title: { en: "", de: "" },
			description: { en: "", de: "" },
			briefText: { en: "", de: "" },
			sortOrder: demands.length,
			completed: false,
			completedDate: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setEditingDemand(newDemand);
		setIsDialogOpen(true);
	};

	const handleEditDemand = (demand: CampaignDemand) => {
		setEditingDemand({ ...demand });
		setIsDialogOpen(true);
	};

	const handleSaveDemand = () => {
		if (!editingDemand) return;

		const existingIndex = demands.findIndex((d) => d.id === editingDemand.id);
		if (existingIndex >= 0) {
			const updated = [...demands];
			updated[existingIndex] = editingDemand;
			onChange(updated);
		} else {
			onChange([...demands, editingDemand]);
		}

		setIsDialogOpen(false);
		setEditingDemand(null);
	};

	const handleDeleteDemand = (id: string) => {
		if (confirm("Are you sure you want to delete this demand?")) {
			onChange(demands.filter((d) => d.id !== id));
		}
	};

	const handleToggleCompleted = (id: string, completed: boolean) => {
		onChange(
			demands.map((d) =>
				d.id === id
					? {
							...d,
							completed,
							completed_date: completed ? new Date().toISOString() : null,
						}
					: d,
			),
		);
	};

	const handleMoveDemand = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= demands.length) return;

		const updated = [...demands];
		[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
		onChange(updated);
	};

	const updateEditingDemand = (
		field: keyof CampaignDemand,
		lang: string,
		value: string,
	) => {
		if (!editingDemand) return;
		setEditingDemand({
			...editingDemand,
			[field]: {
				...(editingDemand[field] as Record<string, string>),
				[lang]: value,
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Campaign Demands</CardTitle>
						<CardDescription>
							The political demands letter writers can include in their letters
						</CardDescription>
					</div>
					<Button onClick={handleAddDemand}>
						<Plus className="mr-2 h-4 w-4" />
						Add Demand
					</Button>
				</CardHeader>
				<CardContent>
					{demands.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-muted-foreground">No demands yet</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={handleAddDemand}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Demand
							</Button>
						</div>
					) : (
						<div className="space-y-3">
							{demands.map((demand, index) => {
								const title =
									(demand.title as Record<string, string>).en ||
									(demand.title as Record<string, string>).de ||
									Object.values(demand.title as Record<string, string>)[0] ||
									"Untitled";

								return (
									<div
										key={demand.id}
										className={`flex items-center gap-3 rounded-lg border p-3 ${
											demand.completed ? "bg-muted/50" : ""
										}`}
									>
										{/* Drag handle */}
										<div className="flex flex-col items-center gap-1">
											<GripVertical className="h-5 w-5 text-muted-foreground" />
											<button
												type="button"
												onClick={() => handleMoveDemand(index, "up")}
												disabled={index === 0}
												className="p-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
											>
												↑
											</button>
											<button
												type="button"
												onClick={() => handleMoveDemand(index, "down")}
												disabled={index === demands.length - 1}
												className="p-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
											>
												↓
											</button>
										</div>

										{/* Completed checkbox */}
										<Checkbox
											checked={demand.completed}
											onCheckedChange={(checked) =>
												handleToggleCompleted(demand.id, checked as boolean)
											}
										/>

										{/* Content */}
										<button
											type="button"
											className="flex-1 text-left"
											onClick={() => handleEditDemand(demand)}
										>
											<span
												className={`font-medium ${
													demand.completed
														? "line-through text-muted-foreground"
														: ""
												}`}
											>
												{index + 1}. {title}
											</span>
											{demand.completed && demand.completedDate && (
												<span className="ml-2 text-xs text-green-600">
													✓ Completed
												</span>
											)}
										</button>

										{/* Delete button */}
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDeleteDemand(demand.id)}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{demands.some((d) => d.id === editingDemand?.id)
								? "Edit Demand"
								: "Add Demand"}
						</DialogTitle>
						<DialogDescription>
							Enter the demand details in each language you support
						</DialogDescription>
					</DialogHeader>

					{editingDemand && (
						<div className="space-y-6 py-4">
							{/* Title */}
							<div className="space-y-3">
								<Label className="text-base font-medium">Title</Label>
								{LANGUAGES.map((lang) => (
									<div key={lang} className="flex items-center gap-2">
										<span className="w-8 text-xs text-muted-foreground uppercase">
											{lang}
										</span>
										<Input
											value={
												(editingDemand.title as Record<string, string>)[lang] ||
												""
											}
											onChange={(e) =>
												updateEditingDemand("title", lang, e.target.value)
											}
											placeholder={`Title in ${lang === "en" ? "English" : "German"}`}
										/>
									</div>
								))}
							</div>

							{/* Description */}
							<div className="space-y-3">
								<Label className="text-base font-medium">Description</Label>
								<p className="text-xs text-muted-foreground">
									Full description shown when users expand the demand
								</p>
								{LANGUAGES.map((lang) => (
									<div key={lang} className="flex items-start gap-2">
										<span className="w-8 pt-2 text-xs text-muted-foreground uppercase">
											{lang}
										</span>
										<Textarea
											value={
												(editingDemand.description as Record<string, string>)[
													lang
												] || ""
											}
											onChange={(e) =>
												updateEditingDemand("description", lang, e.target.value)
											}
											placeholder={`Description in ${lang === "en" ? "English" : "German"}`}
											rows={3}
											className="flex-1"
										/>
									</div>
								))}
							</div>

							{/* Brief Text */}
							<div className="space-y-3">
								<Label className="text-base font-medium">Brief Text</Label>
								<p className="text-xs text-muted-foreground">
									Short version used in the generated letter
								</p>
								{LANGUAGES.map((lang) => (
									<div key={lang} className="flex items-center gap-2">
										<span className="w-8 text-xs text-muted-foreground uppercase">
											{lang}
										</span>
										<Input
											value={
												(editingDemand.briefText as Record<string, string>)[
													lang
												] || ""
											}
											onChange={(e) =>
												updateEditingDemand("briefText", lang, e.target.value)
											}
											placeholder={`Brief text in ${lang === "en" ? "English" : "German"}`}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button onClick={handleSaveDemand}>
							<Check className="mr-2 h-4 w-4" />
							Save Demand
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
