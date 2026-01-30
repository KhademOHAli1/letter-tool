/**
 * Prompts Tab - Campaign Edit Page
 */

"use client";

import { AlertCircle, Loader2, Save, Wand2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { Campaign, CampaignPrompt } from "@/lib/types";

interface PromptsTabProps {
	campaign: Campaign;
}

const COUNTRY_NAMES: Record<string, string> = {
	de: "Germany",
	ca: "Canada",
	uk: "United Kingdom",
	us: "United States",
	fr: "France",
};

const DEFAULT_LANGUAGES: Record<string, string> = {
	de: "de",
	ca: "en",
	uk: "en",
	us: "en",
	fr: "fr",
};

export function PromptsTab({ campaign }: PromptsTabProps) {
	const [prompts, setPrompts] = useState<CampaignPrompt[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedCountry, setSelectedCountry] = useState<string>(
		campaign.countryCodes[0] || "de",
	);
	const [editingPrompt, setEditingPrompt] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);

	const fetchPrompts = useCallback(async () => {
		const supabase = getSupabaseBrowserClient();

		const { data, error } = await supabase
			.from("campaign_prompts")
			.select("*")
			.eq("campaign_id", campaign.id)
			.eq("is_active", true);

		if (error) {
			console.error("Error fetching prompts:", error);
		} else {
			setPrompts((data as CampaignPrompt[]) || []);
		}

		setIsLoading(false);
	}, [campaign.id]);

	useEffect(() => {
		fetchPrompts();
	}, [fetchPrompts]);

	useEffect(() => {
		// Set editing prompt when country changes
		const prompt = prompts.find((p) => p.countryCode === selectedCountry);
		setEditingPrompt(prompt?.systemPrompt || "");
	}, [selectedCountry, prompts]);

	const handleSavePrompt = async () => {
		setIsSaving(true);

		try {
			const supabase = getSupabaseBrowserClient();

			const existingPrompt = prompts.find(
				(p) => p.countryCode === selectedCountry,
			);

			if (existingPrompt) {
				// Update existing prompt
				const { error } = await supabase
					.from("campaign_prompts")
					.update({
						system_prompt: editingPrompt,
						version: existingPrompt.version + 1,
					})
					.eq("id", existingPrompt.id);

				if (error) throw error;
			} else {
				// Create new prompt
				const { error } = await supabase.from("campaign_prompts").insert({
					campaign_id: campaign.id,
					country_code: selectedCountry,
					language: DEFAULT_LANGUAGES[selectedCountry] || "en",
					system_prompt: editingPrompt,
					is_active: true,
					version: 1,
				});

				if (error) throw error;
			}

			// Refresh prompts
			await fetchPrompts();
		} catch (error) {
			console.error("Error saving prompt:", error);
			alert("Failed to save prompt. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const hasPromptForCountry = (country: string) => {
		return prompts.some((p) => p.countryCode === country);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<Wand2 className="h-5 w-5 text-primary" />
						<div>
							<CardTitle>AI Prompts</CardTitle>
							<CardDescription>
								Configure the system prompts used to generate letters for each
								country
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Country selector */}
					<div className="space-y-2">
						<Label>Select Country</Label>
						<div className="flex items-center gap-4">
							<Select
								value={selectedCountry}
								onValueChange={setSelectedCountry}
							>
								<SelectTrigger className="w-64">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{campaign.countryCodes.map((code) => (
										<SelectItem key={code} value={code}>
											{COUNTRY_NAMES[code] || code.toUpperCase()}
											{hasPromptForCountry(code) && " ✓"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{!hasPromptForCountry(selectedCountry) && (
								<span className="text-sm text-muted-foreground">
									No custom prompt - using default template
								</span>
							)}
						</div>
					</div>

					{/* Info about default template */}
					{!hasPromptForCountry(selectedCountry) && (
						<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
							<div className="flex gap-3">
								<AlertCircle className="h-5 w-5 text-blue-600" />
								<div className="text-sm">
									<p className="font-medium text-blue-800 dark:text-blue-200">
										Using Default Template
									</p>
									<p className="text-blue-700 dark:text-blue-300">
										This country is using the default Public Narrative prompt
										template. Add a custom prompt below to override it.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Prompt editor */}
					<div className="space-y-2">
						<Label htmlFor="prompt">System Prompt</Label>
						<Textarea
							id="prompt"
							value={editingPrompt}
							onChange={(e) => setEditingPrompt(e.target.value)}
							placeholder="Enter the system prompt for letter generation..."
							rows={20}
							className="font-mono text-sm"
						/>
						<p className="text-xs text-muted-foreground">
							Available template variables: {"{{cause_context}}"},{" "}
							{"{{demands}}"}, {"{{personal_story}}"}, {"{{selected_demands}}"},{" "}
							{"{{representative}}"}
						</p>
					</div>

					{/* Save button */}
					<div className="flex justify-end">
						<Button
							onClick={handleSavePrompt}
							disabled={isSaving || editingPrompt.trim().length < 50}
						>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Prompt
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Prompt versions (future enhancement) */}
			{prompts.filter((p) => p.countryCode === selectedCountry).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Version History
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Current version:{" "}
							{prompts.find((p) => p.countryCode === selectedCountry)
								?.version || 1}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Version history feature coming soon
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
