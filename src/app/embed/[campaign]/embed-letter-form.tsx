"use client";

/**
 * Embed Letter Form Component
 * Phase 9: Sharing & Distribution
 *
 * Minimal letter form optimized for embedding in external websites
 * Supports customization via props (theme, colors, visibility)
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign, CampaignDemand } from "@/lib/types";

interface EmbedOptions {
	theme: "light" | "dark" | "auto";
	hideHeader: boolean;
	hideStats: boolean;
	primaryColor?: string;
}

interface EmbedLetterFormProps {
	campaign: Campaign;
	demands: CampaignDemand[];
	country: string;
	options: EmbedOptions;
}

// Get localized text helper
function getLocalizedText(
	text: Record<string, string> | null | undefined,
	lang = "en",
): string {
	if (!text) return "";
	if (text[lang]) return text[lang];
	const values = Object.values(text);
	return values[0] ?? "";
}

export function EmbedLetterForm({
	campaign,
	demands,
	country,
	options,
}: EmbedLetterFormProps) {
	const [formData, setFormData] = useState({
		postalCode: "",
		concern: "",
		demands: [] as string[],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [letter, setLetter] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Determine language based on country
	const lang = country === "de" ? "de" : country === "fr" ? "fr" : "en";

	// Apply custom theme
	useEffect(() => {
		if (options.primaryColor) {
			document.documentElement.style.setProperty(
				"--embed-primary",
				options.primaryColor,
			);
		}

		// Handle theme
		if (options.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else if (options.theme === "light") {
			document.documentElement.classList.remove("dark");
		}
	}, [options.primaryColor, options.theme]);

	const handleDemandToggle = (demandId: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			demands: checked
				? [...prev.demands, demandId]
				: prev.demands.filter((id) => id !== demandId),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// Get selected demand titles for the prompt
			const selectedDemandTitles = demands
				.filter((d) => formData.demands.includes(d.id))
				.map(
					(d) =>
						getLocalizedText(d.briefText, lang) ||
						getLocalizedText(d.title, lang),
				);

			const response = await fetch("/api/generate-letter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					country,
					senderPlz: formData.postalCode,
					senderConcern: formData.concern,
					selectedDemands: selectedDemandTitles,
					campaignId: campaign.id,
					stream: false, // Use non-streaming for embed simplicity
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate letter");
			}

			const data = await response.json();
			setLetter(data.letter);

			// Post message to parent window for cross-origin communication
			if (window.parent !== window) {
				window.parent.postMessage(
					{
						type: "letter-generated",
						campaignSlug: campaign.slug,
						letterLength: data.letter.length,
					},
					"*",
				);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyLetter = async () => {
		if (letter) {
			await navigator.clipboard.writeText(letter);
		}
	};

	const handleReset = () => {
		setLetter(null);
		setFormData({ postalCode: "", concern: "", demands: [] });
	};

	// Labels based on language
	const labels = {
		title:
			lang === "de"
				? "Brief schreiben"
				: lang === "fr"
					? "Écrire une lettre"
					: "Write a Letter",
		postalCode:
			lang === "de"
				? "Postleitzahl"
				: lang === "fr"
					? "Code postal"
					: "Postal Code",
		concern:
			lang === "de"
				? "Ihr Anliegen"
				: lang === "fr"
					? "Votre préoccupation"
					: "Your Concern",
		concernPlaceholder:
			lang === "de"
				? "Was beschäftigt Sie an diesem Thema?"
				: lang === "fr"
					? "Qu'est-ce qui vous préoccupe dans ce sujet?"
					: "What concerns you about this issue?",
		demands:
			lang === "de" ? "Forderungen" : lang === "fr" ? "Demandes" : "Demands",
		generate:
			lang === "de"
				? "Brief generieren"
				: lang === "fr"
					? "Générer la lettre"
					: "Generate Letter",
		generating:
			lang === "de"
				? "Generiere..."
				: lang === "fr"
					? "Génération..."
					: "Generating...",
		copy: lang === "de" ? "Kopieren" : lang === "fr" ? "Copier" : "Copy",
		newLetter:
			lang === "de"
				? "Neuer Brief"
				: lang === "fr"
					? "Nouvelle lettre"
					: "New Letter",
		yourLetter:
			lang === "de"
				? "Ihr Brief"
				: lang === "fr"
					? "Votre lettre"
					: "Your Letter",
	};

	// Show letter result
	if (letter) {
		return (
			<div className="p-4 max-w-2xl mx-auto">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">{labels.yourLetter}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
							<pre className="whitespace-pre-wrap text-sm font-sans">
								{letter}
							</pre>
						</div>
						<div className="flex gap-2">
							<Button onClick={handleCopyLetter} className="flex-1">
								{labels.copy}
							</Button>
							<Button variant="outline" onClick={handleReset}>
								{labels.newLetter}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<form onSubmit={handleSubmit}>
				<Card>
					{!options.hideHeader && (
						<CardHeader className="pb-2">
							<CardTitle className="text-lg">
								{getLocalizedText(campaign.name, lang) || labels.title}
							</CardTitle>
							{campaign.description && (
								<p className="text-sm text-muted-foreground">
									{getLocalizedText(campaign.description, lang)}
								</p>
							)}
						</CardHeader>
					)}
					<CardContent className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">
								{error}
							</div>
						)}

						{/* Postal Code */}
						<div className="space-y-2">
							<Label htmlFor="postal-code">{labels.postalCode}</Label>
							<Input
								id="postal-code"
								value={formData.postalCode}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										postalCode: e.target.value,
									}))
								}
								placeholder={country === "de" ? "12345" : "A1A 1A1"}
								required
								className="max-w-xs"
							/>
						</div>

						{/* Concern */}
						<div className="space-y-2">
							<Label htmlFor="concern">{labels.concern}</Label>
							<Textarea
								id="concern"
								value={formData.concern}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, concern: e.target.value }))
								}
								placeholder={labels.concernPlaceholder}
								rows={3}
							/>
						</div>

						{/* Demands */}
						{demands.length > 0 && (
							<div className="space-y-2">
								<Label>{labels.demands}</Label>
								<div className="space-y-2">
									{demands.map((demand) => (
										<div key={demand.id} className="flex items-start gap-2">
											<Checkbox
												id={`demand-${demand.id}`}
												checked={formData.demands.includes(demand.id)}
												onCheckedChange={(checked) =>
													handleDemandToggle(demand.id, checked === true)
												}
											/>
											<label
												htmlFor={`demand-${demand.id}`}
												className="text-sm leading-tight cursor-pointer"
											>
												{getLocalizedText(demand.title, lang)}
											</label>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Submit */}
						<Button
							type="submit"
							disabled={isLoading || !formData.postalCode}
							className="w-full"
							style={
								options.primaryColor
									? { backgroundColor: options.primaryColor }
									: undefined
							}
						>
							{isLoading ? labels.generating : labels.generate}
						</Button>
					</CardContent>
				</Card>
			</form>

			{/* Powered by footer */}
			<p className="text-center text-xs text-muted-foreground mt-4">
				Powered by{" "}
				<a
					href={`/c/${campaign.slug}`}
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-foreground"
				>
					Letter Tools
				</a>
			</p>
		</div>
	);
}
