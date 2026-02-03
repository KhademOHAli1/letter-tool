/**
 * Step 5: Review
 * Review all data before creating the campaign
 */

"use client";

import { AlertCircle, Check, Edit2 } from "lucide-react";
import type { CampaignWizardData } from "@/app/admin/campaigns/new/page";
import { Flag } from "@/components/flags";
import { Badge } from "@/components/ui/badge";

interface StepReviewProps {
	data: CampaignWizardData;
}

const AUDIENCE_LABELS: Record<string, string> = {
	de: "German Bundestag",
	uk: "UK House of Commons",
	us: "US Congress",
	fr: "French National Assembly",
	ca: "Canadian Parliament",
};

export function StepReview({ data }: StepReviewProps) {
	const primaryName =
		data.basicInfo.name.en ||
		data.basicInfo.name.de ||
		Object.values(data.basicInfo.name)[0] ||
		"Untitled";

	const primaryDescription =
		data.basicInfo.description.en ||
		data.basicInfo.description.de ||
		Object.values(data.basicInfo.description)[0] ||
		"No description";

	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-muted/30 p-4">
				<div className="flex gap-3">
					<Check className="h-5 w-5 text-primary" />
					<div>
						<h4 className="font-medium">Ready to create your campaign!</h4>
						<p className="text-sm text-muted-foreground">
							Review the details below and click &quot;Create Campaign&quot;
							when you&apos;re ready. Your campaign will be created in draft
							mode.
						</p>
					</div>
				</div>
			</div>

			{/* Basic Info Section */}
			<section className="space-y-3">
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
						1
					</span>
					Basic Information
				</h3>
				<div className="rounded-lg border p-4 space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Campaign Name</p>
						<p className="font-medium">{primaryName}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">URL</p>
						<code className="text-sm bg-muted px-2 py-1 rounded">
							/c/{data.basicInfo.slug}
						</code>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Description</p>
						<p className="text-sm">{primaryDescription}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Target Audience</p>
						<div className="flex flex-wrap gap-1 mt-1">
							{data.basicInfo.countryCodes.map((code) => {
								const label = AUDIENCE_LABELS[code] || code.toUpperCase();
								return (
									<Badge key={code} variant="secondary">
										<span className="flex items-center gap-1">
											{label}
											<Flag country={code} className="h-3 w-4" />
										</span>
									</Badge>
								);
							})}
						</div>
					</div>
					{data.basicInfo.useCustomTargets && (
						<div>
							<p className="text-sm text-muted-foreground">Custom Audience</p>
							<p className="text-sm">
								{data.basicInfo.customTargets.length} targets loaded
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Details Section */}
			<section className="space-y-3">
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
						2
					</span>
					Campaign Details
				</h3>
				<div className="rounded-lg border p-4 space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Cause Context</p>
						<p className="text-sm line-clamp-3">{data.details.causeContext}</p>
						<p className="text-xs text-muted-foreground mt-1">
							{data.details.causeContext.length} characters
						</p>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Goal</p>
							<p className="font-medium">
								{data.details.goalLetters
									? `${data.details.goalLetters.toLocaleString()} letters`
									: "No goal set"}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Start Date</p>
							<p className="font-medium">
								{data.details.startDate || "Not set"}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">End Date</p>
							<p className="font-medium">{data.details.endDate || "Not set"}</p>
						</div>
					</div>
				</div>
			</section>

			{/* Demands Section */}
			<section className="space-y-3">
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
						3
					</span>
					Demands ({data.demands.items.length})
				</h3>
				<div className="rounded-lg border p-4 space-y-2">
					{data.demands.items.map((demand, index) => {
						const title =
							demand.title.en ||
							demand.title.de ||
							Object.values(demand.title)[0] ||
							"Untitled demand";
						return (
							<div key={demand.id} className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">{index + 1}.</span>
								<span>{title}</span>
							</div>
						);
					})}
				</div>
			</section>

			{/* Prompts Section */}
			<section className="space-y-3">
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
						4
					</span>
					AI Prompt Configuration
				</h3>
				<div className="rounded-lg border p-4">
					<div className="flex items-center gap-2">
						{data.prompts.useDefaultTemplate ? (
							<>
								<Check className="h-4 w-4 text-green-600" />
								<span>Using default Public Narrative template</span>
							</>
						) : (
							<>
								<Edit2 className="h-4 w-4 text-amber-600" />
								<span>
									Using custom prompt ({data.prompts.customPrompt.length} chars)
								</span>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Note about draft */}
			<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
				<div className="flex gap-3">
					<AlertCircle className="h-5 w-5 text-blue-600" />
					<div className="text-sm">
						<p className="font-medium text-blue-800 dark:text-blue-200">
							Campaign will be created as Draft
						</p>
						<p className="text-blue-700 dark:text-blue-300">
							You can test letter generation and make changes before publishing.
							Set the campaign to &quot;Active&quot; when you&apos;re ready to
							go live.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
