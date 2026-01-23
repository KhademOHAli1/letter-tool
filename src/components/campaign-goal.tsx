"use client";

import {
	Github,
	PartyPopper,
	Search,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface CampaignGoalProps {
	/** Show compact version without text */
	compact?: boolean;
	/** Country code to fetch stats for */
	country?: "de" | "ca" | "uk" | "fr";
}

interface Stats {
	total_letters: number;
	unique_mdbs: number;
}

// Milestone thresholds for auto-scaling
const MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

// Get next milestone based on current count
function getNextMilestone(current: number): number {
	for (const milestone of MILESTONES) {
		if (current < milestone) {
			return milestone;
		}
	}
	// Beyond all milestones, round up to next 10000
	return Math.ceil((current + 1) / 10000) * 10000;
}

// Check if we just crossed a milestone
function getCrossedMilestone(current: number): number | null {
	for (const milestone of MILESTONES) {
		// Consider "crossed" if we're within 5 of the milestone
		if (current >= milestone && current < milestone + 5) {
			return milestone;
		}
	}
	return null;
}

export function CampaignGoal({
	compact = false,
	country = "de",
}: CampaignGoalProps) {
	const { language } = useLanguage();
	const [stats, setStats] = useState<Stats | null>(null);
	const [showCelebration, setShowCelebration] = useState(false);
	const [crossedMilestone, setCrossedMilestone] = useState<number | null>(null);

	const locale = language === "de" ? "de-DE" : "en-US";

	useEffect(() => {
		fetch(`/api/stats?country=${country}`)
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.total_letters === "number") {
					setStats(data);

					// Check if we crossed a milestone
					const milestone = getCrossedMilestone(data.total_letters);
					if (milestone) {
						setCrossedMilestone(milestone);
						setShowCelebration(true);

						// Hide celebration after 5 seconds
						setTimeout(() => {
							setShowCelebration(false);
						}, 5000);
					}
				} else {
					setStats({ total_letters: 0, unique_mdbs: 0 });
				}
			})
			.catch(() => setStats({ total_letters: 0, unique_mdbs: 0 }));
	}, [country]);

	if (!stats) {
		return <div className="animate-pulse h-16 bg-muted/50 rounded-lg" />;
	}

	// Auto-scale the goal based on progress
	const goal = getNextMilestone(stats.total_letters);
	const progress = Math.min((stats.total_letters / goal) * 100, 100);
	const isNearGoal = progress >= 90;

	if (compact) {
		return (
			<div className="space-y-1.5">
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>
						{stats.total_letters.toLocaleString(locale)}{" "}
						{language === "de" ? "von" : "of"} {goal.toLocaleString(locale)}{" "}
						{language === "de" ? "Briefen" : "letters"}
					</span>
					<span>{progress.toFixed(0)}%</span>
				</div>
				<div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-1000 ease-out ${
							isNearGoal ? "bg-primary animate-pulse" : "bg-primary/70"
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="py-4 px-1 relative">
			{/* Celebration overlay for milestone */}
			{showCelebration && crossedMilestone && (
				<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
					<div className="animate-bounce bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
						<PartyPopper className="h-5 w-5" />
						<span className="font-bold">
							{crossedMilestone.toLocaleString(locale)}{" "}
							{language === "de" ? "Briefe erreicht!" : "letters reached!"}
						</span>
						<Sparkles className="h-5 w-5" />
					</div>
				</div>
			)}

			{/* Header with dynamic goal */}
			<div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
				<div className="flex items-center gap-2">
					<Target className="h-4 w-4 text-primary" />
					<span>
						<strong className="text-foreground font-medium">
							{stats.total_letters.toLocaleString(locale)}
						</strong>{" "}
						{language === "de"
							? `von ${goal.toLocaleString(locale)} Briefen`
							: `of ${goal.toLocaleString(locale)} letters`}
					</span>
				</div>
				<span className={`font-medium ${isNearGoal ? "text-primary" : ""}`}>
					{progress.toFixed(0)}%
				</span>
			</div>

			{/* Progress bar with milestone markers */}
			<div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
				{/* Milestone markers */}
				{MILESTONES.filter(
					(m) => m < goal && m > stats.total_letters * 0.1,
				).map((milestone) => {
					const position = (milestone / goal) * 100;
					if (position > 5 && position < 95) {
						return (
							<div
								key={milestone}
								className="absolute top-0 bottom-0 w-0.5 bg-border/50"
								style={{ left: `${position}%` }}
							/>
						);
					}
					return null;
				})}

				{/* Progress fill */}
				<div
					className={`h-full rounded-full transition-all duration-1000 ease-out ${
						isNearGoal
							? "bg-linear-to-r from-primary to-primary/80 animate-pulse"
							: "bg-primary/60"
					}`}
					style={{ width: `${progress}%` }}
				>
					{/* Shimmer effect when near goal */}
					{isNearGoal && (
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
					)}
				</div>
			</div>

			{/* Stats row */}
			<div className="flex items-center justify-between mt-2">
				{stats.unique_mdbs > 0 && (
					<p className="text-xs text-muted-foreground flex items-center gap-1">
						<TrendingUp className="h-3 w-3" />
						{stats.unique_mdbs}{" "}
						{language === "de" ? "Abgeordnete kontaktiert" : "MPs contacted"}
					</p>
				)}

				{/* Next milestone hint */}
				{isNearGoal && (
					<p className="text-xs text-primary font-medium animate-pulse">
						{language === "de"
							? `Noch ${(goal - stats.total_letters).toLocaleString(locale)} bis zum Ziel!`
							: `Only ${(goal - stats.total_letters).toLocaleString(locale)} to go!`}
					</p>
				)}
			</div>

			{/* Trust notice - subtle and unobtrusive */}
			<div className="mt-3 pt-3 border-t border-border/30">
				<div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
					<Link
						href="/daten-transparenz"
						className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
					>
						<Search className="h-3 w-3" />
						<span>{language === "de" ? "Transparent" : "Transparent"}</span>
					</Link>
					<span className="text-border">•</span>
					<a
						href="https://github.com/KhademOHAli1/letter-tool"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
					>
						<Github className="h-3 w-3" />
						<span>Open Source</span>
					</a>
				</div>
			</div>
		</div>
	);
}
