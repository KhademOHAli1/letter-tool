/**
 * Step 2: Details
 * Cause context, goal, and date settings
 */

"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DetailsData {
	causeContext: string;
	goalLetters: number | null;
	startDate: string | null;
	endDate: string | null;
}

interface StepDetailsProps {
	data: DetailsData;
	onChange: (data: DetailsData) => void;
	onValidityChange: (valid: boolean) => void;
}

export function StepDetails({
	data,
	onChange,
	onValidityChange,
}: StepDetailsProps) {
	// Track previous validity to avoid unnecessary parent updates
	const prevValidRef = useRef<boolean | null>(null);

	// Validate the step - only call onValidityChange when value changes
	useEffect(() => {
		// Cause context is required
		const isValid = data.causeContext.trim().length >= 50;
		if (prevValidRef.current !== isValid) {
			prevValidRef.current = isValid;
			onValidityChange(isValid);
		}
	}, [data.causeContext, onValidityChange]);

	return (
		<div className="space-y-6">
			{/* Cause Context */}
			<div className="space-y-2">
				<Label htmlFor="causeContext" className="text-base font-medium">
					Cause Context *
				</Label>
				<p className="text-sm text-muted-foreground">
					Provide background information about your cause. This will be used by
					the AI to generate personalized letters. Be specific about the
					situation, key facts, and why action is needed. (Minimum 50
					characters)
				</p>
				<Textarea
					id="causeContext"
					value={data.causeContext}
					onChange={(e) => onChange({ ...data, causeContext: e.target.value })}
					placeholder="Example: This campaign focuses on raising awareness about [issue]. The situation is [describe current state]. We are calling on representatives to [specific action] because [reason]..."
					rows={8}
					className={
						data.causeContext.length > 0 && data.causeContext.length < 50
							? "border-destructive"
							: ""
					}
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>
						{data.causeContext.length < 50 && data.causeContext.length > 0 && (
							<span className="text-destructive">
								Need at least {50 - data.causeContext.length} more characters
							</span>
						)}
					</span>
					<span>{data.causeContext.length} characters</span>
				</div>
			</div>

			{/* Goal */}
			<div className="space-y-2">
				<Label htmlFor="goalLetters" className="text-base font-medium">
					Letter Goal
				</Label>
				<p className="text-sm text-muted-foreground">
					Set a target number of letters for your campaign (optional). This will
					be displayed as a progress bar on the campaign page.
				</p>
				<Input
					id="goalLetters"
					type="number"
					min={1}
					value={data.goalLetters || ""}
					onChange={(e) =>
						onChange({
							...data,
							goalLetters: e.target.value
								? Number.parseInt(e.target.value, 10)
								: null,
						})
					}
					placeholder="e.g., 10000"
					className="max-w-xs"
				/>
			</div>

			{/* Dates */}
			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="startDate" className="text-base font-medium">
						Start Date
					</Label>
					<p className="text-sm text-muted-foreground">
						When should the campaign go live? (optional)
					</p>
					<Input
						id="startDate"
						type="date"
						value={data.startDate || ""}
						onChange={(e) =>
							onChange({
								...data,
								startDate: e.target.value || null,
							})
						}
						className="max-w-xs"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="endDate" className="text-base font-medium">
						End Date
					</Label>
					<p className="text-sm text-muted-foreground">
						When should the campaign end? (optional)
					</p>
					<Input
						id="endDate"
						type="date"
						value={data.endDate || ""}
						onChange={(e) =>
							onChange({
								...data,
								endDate: e.target.value || null,
							})
						}
						min={data.startDate || undefined}
						className="max-w-xs"
					/>
				</div>
			</div>
		</div>
	);
}
