/**
 * Campaign Public Card
 * Displays campaign info in the campaigns directory
 * Phase 6: Frontend Public Campaign Experience
 */

import { ArrowRight, Target, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/lib/types";

interface CampaignPublicCardProps {
	campaign: Campaign;
	letterCount?: number;
	/** Preferred language for localized content */
	language?: string;
}

// Country flags
const COUNTRY_FLAGS: Record<string, string> = {
	de: "🇩🇪",
	ca: "🇨🇦",
	uk: "🇬🇧",
	us: "🇺🇸",
	fr: "🇫🇷",
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
			<Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 group-focus-visible:ring-2 group-focus-visible:ring-primary">
				<CardContent className="pt-6">
					{/* Country flags */}
					<div className="flex items-center gap-1 mb-3">
						{campaign.countryCodes.map((code) => (
							<span key={code} className="text-lg" title={code.toUpperCase()}>
								{COUNTRY_FLAGS[code] || "🌍"}
							</span>
						))}
					</div>

					{/* Campaign name */}
					<h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
						{name}
					</h3>

					{/* Description */}
					<p className="text-sm text-muted-foreground line-clamp-3 mb-4">
						{truncatedDescription}
					</p>

					{/* Stats */}
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Users className="h-4 w-4" />
							<span>{letterCount.toLocaleString()} letters</span>
						</div>
						{campaign.goalLetters && (
							<div className="flex items-center gap-1">
								<Target className="h-4 w-4" />
								<span>Goal: {campaign.goalLetters.toLocaleString()}</span>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className="pt-0 pb-6 flex flex-col gap-3">
					{/* Progress bar */}
					{progress !== null && (
						<div className="w-full">
							<Progress value={progress} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1 text-right">
								{progress}% of goal
							</p>
						</div>
					)}

					{/* CTA */}
					<div className="flex items-center justify-between w-full">
						<Badge
							variant={campaign.status === "active" ? "default" : "secondary"}
						>
							{campaign.status === "active" ? "Active" : campaign.status}
						</Badge>
						<span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
							Take action
							<ArrowRight className="h-4 w-4" />
						</span>
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}
