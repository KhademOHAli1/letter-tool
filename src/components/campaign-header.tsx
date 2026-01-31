"use client";

/**
 * Campaign header component
 * Displays campaign name, description, and goal progress
 * Phase 3, Epic 3.3
 */

import { Target, Vote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface CampaignHeaderProps {
	/** Campaign name (localized) */
	name: string;
	/** Campaign description (localized) */
	description: string;
	/** Goal number of letters (optional) */
	goalLetters?: number | null;
	/** Current number of letters */
	currentLetters?: number;
	/** Show compact version */
	compact?: boolean;
}

export function CampaignHeader({
	name,
	description,
	goalLetters,
	currentLetters = 0,
	compact = false,
}: CampaignHeaderProps) {
	const { language } = useLanguage();

	// Calculate progress
	const progressPercent = goalLetters
		? Math.min(100, Math.round((currentLetters / goalLetters) * 100))
		: null;

	if (compact) {
		return (
			<div className="container mx-auto max-w-3xl px-6 py-6">
				<div className="flex items-center gap-3">
					<Vote className="h-5 w-5 text-primary shrink-0" />
					<h1 className="text-lg font-semibold text-foreground truncate">
						{name}
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-16 md:pb-14">
			<div className="text-center space-y-4 md:space-y-6">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
					<Vote className="h-4 w-4 shrink-0" />
					<span>
						{language === "de"
							? "Kampagne"
							: language === "fr"
								? "Campagne"
								: "Campaign"}
					</span>
				</div>

				{/* Main Heading */}
				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
					{name}
				</h1>

				{/* Description */}
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					{description}
				</p>

				{/* Goal progress */}
				{goalLetters && progressPercent !== null && (
					<div className="pt-4">
						<div className="inline-flex items-center gap-3 bg-background/80 backdrop-blur rounded-full px-4 py-2">
							<Target className="h-4 w-4 text-primary" />
							<div className="text-sm">
								<span className="font-semibold text-primary">
									{currentLetters.toLocaleString()}
								</span>
								<span className="text-muted-foreground">
									{" "}
									/ {goalLetters.toLocaleString()}{" "}
									{language === "de"
										? "Briefe"
										: language === "fr"
											? "lettres"
											: "letters"}
								</span>
							</div>
							<div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-primary transition-all duration-500"
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
							<span className="text-xs font-medium text-primary">
								{progressPercent}%
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
