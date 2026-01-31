/**
 * Campaign Public Card
 * Displays campaign info in the campaigns directory
 * Phase 6: Frontend Public Campaign Experience
 */

import { ArrowRight, Target, Users } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/lib/types";

interface CampaignPublicCardProps {
	campaign: Campaign;
	letterCount?: number;
	/** Preferred language for localized content */
	language?: string;
}

// Country labels for elegant display
const COUNTRY_LABELS: Record<string, string> = {
	de: "Germany",
	ca: "Canada",
	uk: "United Kingdom",
	us: "United States",
	fr: "France",
};

export function CampaignPublicCard({
	campaign,
	letterCount = 0,
	language = "en",
}: CampaignPublicCardProps) {
	// Get localized name and description
	const name =
		campaign.name[language] ||
		campaign.name.en ||
		Object.values(campaign.name)[0];
	const description =
		campaign.description?.[language] ||
		campaign.description?.en ||
		(campaign.description ? Object.values(campaign.description)[0] : "");

	// Calculate progress
	const progress = campaign.goalLetters
		? Math.min(100, Math.round((letterCount / campaign.goalLetters) * 100))
		: null;

	// Truncate description
	const truncatedDescription =
		description.length > 120 ? `${description.slice(0, 120)}...` : description;

	return (
		<Link href={`/c/${campaign.slug}`} className="block group">
			<div
				className="
					h-full relative p-6 rounded-2xl
					bg-linear-to-br from-card to-card/80
					border border-border/40
					shadow-sm
					transition-all duration-300 ease-out
					hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5
					hover:-translate-y-0.5
					group-focus-visible:ring-2 group-focus-visible:ring-primary
					active:scale-[0.995]
				"
			>
				{/* Subtle gradient overlay on hover */}
				<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

				<div className="relative flex flex-col h-full">
					{/* Country tags */}
					<div className="flex items-center gap-2 mb-4">
						{campaign.countryCodes.slice(0, 3).map((code) => (
							<span
								key={code}
								className="
									inline-flex px-2.5 py-1 
									text-[11px] font-medium uppercase tracking-wider
									text-muted-foreground/60
									bg-muted/40 rounded-md
									border border-border/30
								"
								title={COUNTRY_LABELS[code] || code.toUpperCase()}
							>
								{code}
							</span>
						))}
						{campaign.countryCodes.length > 3 && (
							<span className="text-[11px] text-muted-foreground/50">
								+{campaign.countryCodes.length - 3}
							</span>
						)}
					</div>

					{/* Campaign name */}
					<h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
						{name}
					</h3>

					{/* Description */}
					<p className="text-sm text-muted-foreground/80 line-clamp-3 mb-4 leading-relaxed flex-1">
						{truncatedDescription}
					</p>

					{/* Stats */}
					<div className="flex items-center gap-4 text-sm text-muted-foreground/70 mb-4">
						<div className="flex items-center gap-1.5">
							<Users className="h-3.5 w-3.5" />
							<span>{letterCount.toLocaleString()} letters</span>
						</div>
						{campaign.goalLetters && (
							<div className="flex items-center gap-1.5">
								<Target className="h-3.5 w-3.5" />
								<span>Goal: {campaign.goalLetters.toLocaleString()}</span>
							</div>
						)}
					</div>

					{/* Progress bar */}
					{progress !== null && (
						<div className="space-y-2 mb-4">
							<Progress value={progress} className="h-1 bg-muted/50" />
							<p className="text-xs text-muted-foreground/60 text-right">
								{progress}% of goal
							</p>
						</div>
					)}

					{/* CTA */}
					<div className="flex items-center justify-between pt-2 border-t border-border/30">
						<span
							className={`
								inline-flex px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-md
								${
									campaign.status === "active"
										? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
										: "text-muted-foreground/60 bg-muted/40"
								}
							`}
						>
							{campaign.status}
						</span>
						<span className="text-sm text-muted-foreground/60 flex items-center gap-1.5 group-hover:text-primary group-hover:gap-2.5 transition-all duration-200">
							Take action
							<ArrowRight className="h-4 w-4" />
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
