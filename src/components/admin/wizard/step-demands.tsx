/**
 * Step 3: Demands
 * Political demands for the campaign
 */

"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DemandItem {
	id: string;
	title: Record<string, string>;
	description: Record<string, string>;
	briefText: Record<string, string>;
}

export interface DemandsData {
	items: DemandItem[];
}

interface StepDemandsProps {
	data: DemandsData;
	onChange: (data: DemandsData) => void;
	onValidityChange: (valid: boolean) => void;
}

const LANGUAGES = ["en", "de"];

export function StepDemands({
	data,
	onChange,
	onValidityChange,
}: StepDemandsProps) {
	// Track previous validity to avoid unnecessary parent updates
	const prevValidRef = useRef<boolean | null>(null);

	// Validate the step - need at least one demand with a title
	useEffect(() => {
		const isValid = data.items.some((item) =>
			Object.values(item.title).some((t) => t.trim().length > 0),
		);
		if (prevValidRef.current !== isValid) {
			prevValidRef.current = isValid;
			onValidityChange(isValid);
		}
	}, [data.items, onValidityChange]);

	const addDemand = () => {
		const newDemand: DemandItem = {
			id: crypto.randomUUID(),
			title: { en: "", de: "" },
			description: { en: "", de: "" },
			briefText: { en: "", de: "" },
		};
		onChange({ items: [...data.items, newDemand] });
	};

	const removeDemand = (id: string) => {
		if (data.items.length <= 1) {
			return; // Keep at least one demand
		}
		onChange({ items: data.items.filter((item) => item.id !== id) });
	};

	const updateDemand = (
		id: string,
		field: keyof DemandItem,
		lang: string,
		value: string,
	) => {
		onChange({
			items: data.items.map((item) =>
				item.id === id
					? {
							...item,
							[field]: {
								...(item[field] as Record<string, string>),
								[lang]: value,
							},
						}
					: item,
			),
		});
	};

	const moveDemand = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= data.items.length) return;

		const newItems = [...data.items];
		[newItems[index], newItems[newIndex]] = [
			newItems[newIndex],
			newItems[index],
		];
		onChange({ items: newItems });
	};

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">
					Add the political demands for your campaign. These will be shown to
					letter writers who can select which demands to include in their
					letters.
				</p>
			</div>

			<div className="space-y-4">
				{data.items.map((demand, index) => (
					<Card key={demand.id}>
						<CardContent className="pt-4">
							<div className="flex items-start gap-3">
								{/* Drag handle / reorder buttons */}
								<div className="flex flex-col items-center gap-1 pt-2">
									<GripVertical className="h-5 w-5 text-muted-foreground" />
									<button
										type="button"
										onClick={() => moveDemand(index, "up")}
										disabled={index === 0}
										className="p-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
									>
										↑
									</button>
									<button
										type="button"
										onClick={() => moveDemand(index, "down")}
										disabled={index === data.items.length - 1}
										className="p-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
									>
										↓
									</button>
								</div>

								<div className="flex-1 space-y-4">
									{/* Demand number */}
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-muted-foreground">
											Demand #{index + 1}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeDemand(demand.id)}
											disabled={data.items.length <= 1}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>

									{/* Title */}
									<div className="space-y-2">
										<Label className="text-sm font-medium">Title *</Label>
										{LANGUAGES.map((lang) => (
											<div key={lang} className="flex items-center gap-2">
												<span className="w-8 text-xs text-muted-foreground uppercase">
													{lang}
												</span>
												<Input
													value={demand.title[lang] || ""}
													onChange={(e) =>
														updateDemand(
															demand.id,
															"title",
															lang,
															e.target.value,
														)
													}
													placeholder={`Demand title in ${lang === "en" ? "English" : "German"}`}
												/>
											</div>
										))}
									</div>

									{/* Description */}
									<div className="space-y-2">
										<Label className="text-sm font-medium">Description</Label>
										<p className="text-xs text-muted-foreground">
											Full description shown when users expand the demand
										</p>
										{LANGUAGES.map((lang) => (
											<div key={lang} className="flex items-start gap-2">
												<span className="w-8 pt-2 text-xs text-muted-foreground uppercase">
													{lang}
												</span>
												<Textarea
													value={demand.description[lang] || ""}
													onChange={(e) =>
														updateDemand(
															demand.id,
															"description",
															lang,
															e.target.value,
														)
													}
													placeholder={`Description in ${lang === "en" ? "English" : "German"}`}
													rows={2}
													className="flex-1"
												/>
											</div>
										))}
									</div>

									{/* Brief text */}
									<div className="space-y-2">
										<Label className="text-sm font-medium">Brief Text</Label>
										<p className="text-xs text-muted-foreground">
											Short version used in the generated letter
										</p>
										{LANGUAGES.map((lang) => (
											<div key={lang} className="flex items-center gap-2">
												<span className="w-8 text-xs text-muted-foreground uppercase">
													{lang}
												</span>
												<Input
													value={demand.briefText[lang] || ""}
													onChange={(e) =>
														updateDemand(
															demand.id,
															"briefText",
															lang,
															e.target.value,
														)
													}
													placeholder={`Brief text in ${lang === "en" ? "English" : "German"}`}
												/>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Button
				type="button"
				variant="outline"
				onClick={addDemand}
				className="w-full"
			>
				<Plus className="mr-2 h-4 w-4" />
				Add Another Demand
			</Button>

			{data.items.length === 0 ||
				(!Object.values(data.items[0].title).some((t) => t.trim()) && (
					<p className="text-sm text-destructive">
						Please add at least one demand with a title
					</p>
				))}
		</div>
	);
}
