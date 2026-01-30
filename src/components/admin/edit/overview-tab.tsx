/**
 * Overview Tab - Campaign Edit Page
 */

"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign, CampaignStatus } from "@/lib/types";

interface OverviewTabProps {
	campaign: Campaign;
	onChange: (updates: Partial<Campaign>) => void;
}

const LANGUAGES = ["en", "de"];

export function OverviewTab({ campaign, onChange }: OverviewTabProps) {
	const name = campaign.name as Record<string, string>;
	const description = campaign.description as Record<string, string>;

	const handleNameChange = (lang: string, value: string) => {
		onChange({
			name: { ...name, [lang]: value },
		});
	};

	const handleDescriptionChange = (lang: string, value: string) => {
		onChange({
			description: { ...description, [lang]: value },
		});
	};

	const handleStatusChange = (status: CampaignStatus) => {
		onChange({ status });
	};

	const handleCauseContextChange = (value: string) => {
		onChange({ causeContext: value });
	};

	return (
		<div className="space-y-6">
			{/* Status Card */}
			<Card>
				<CardHeader>
					<CardTitle>Campaign Status</CardTitle>
					<CardDescription>
						Control whether your campaign is visible to the public
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Select value={campaign.status} onValueChange={handleStatusChange}>
							<SelectTrigger className="w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-sm text-muted-foreground">
							{campaign.status === "active" &&
								"Campaign is live and visible to the public"}
							{campaign.status === "draft" && "Campaign is only visible to you"}
							{campaign.status === "paused" && "Campaign is temporarily hidden"}
							{campaign.status === "completed" && "Campaign has ended"}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Name & Description */}
			<Card>
				<CardHeader>
					<CardTitle>Name & Description</CardTitle>
					<CardDescription>
						Basic information about your campaign
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<Label className="text-base font-medium">Campaign Name</Label>
						{LANGUAGES.map((lang) => (
							<div key={lang} className="space-y-1">
								<Label
									htmlFor={`name-${lang}`}
									className="text-sm text-muted-foreground"
								>
									{lang === "en" ? "English" : "German"}
								</Label>
								<Input
									id={`name-${lang}`}
									value={name[lang] || ""}
									onChange={(e) => handleNameChange(lang, e.target.value)}
									placeholder={`Campaign name in ${lang === "en" ? "English" : "German"}`}
								/>
							</div>
						))}
					</div>

					<div className="space-y-4">
						<Label className="text-base font-medium">Description</Label>
						{LANGUAGES.map((lang) => (
							<div key={lang} className="space-y-1">
								<Label
									htmlFor={`desc-${lang}`}
									className="text-sm text-muted-foreground"
								>
									{lang === "en" ? "English" : "German"}
								</Label>
								<Textarea
									id={`desc-${lang}`}
									value={description[lang] || ""}
									onChange={(e) =>
										handleDescriptionChange(lang, e.target.value)
									}
									placeholder={`Description in ${lang === "en" ? "English" : "German"}`}
									rows={3}
								/>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Cause Context */}
			<Card>
				<CardHeader>
					<CardTitle>Cause Context</CardTitle>
					<CardDescription>
						Background information used by the AI to generate letters
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						value={campaign.causeContext || ""}
						onChange={(e) => handleCauseContextChange(e.target.value)}
						placeholder="Enter background information about your cause..."
						rows={8}
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						{(campaign.causeContext || "").length} characters
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
