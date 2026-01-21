"use client";

import { useEffect, useState } from "react";

interface CampaignGoalProps {
	/** The target number of letters */
	goal?: number;
	/** Show compact version without text */
	compact?: boolean;
}

interface Stats {
	total_letters: number;
	unique_mdbs: number;
}

export function CampaignGoal({
	goal = 1000,
	compact = false,
}: CampaignGoalProps) {
	const [stats, setStats] = useState<Stats | null>(null);

	useEffect(() => {
		fetch("/api/stats")
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.total_letters === "number") {
					setStats(data);
				} else {
					setStats({ total_letters: 0, unique_mdbs: 0 });
				}
			})
			.catch(() => setStats({ total_letters: 0, unique_mdbs: 0 }));
	}, []);

	if (!stats) {
		return <div className="animate-pulse h-16 bg-muted/50 rounded-lg" />;
	}

	const progress = Math.min((stats.total_letters / goal) * 100, 100);
	const remaining = Math.max(goal - stats.total_letters, 0);

	if (compact) {
		return (
			<div className="space-y-1.5">
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>
						{stats.total_letters.toLocaleString("de-DE")} von{" "}
						{goal.toLocaleString("de-DE")} Briefen
					</span>
					<span>{progress.toFixed(0)}%</span>
				</div>
				<div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
					<div
						className="h-full bg-primary/70 transition-all duration-1000 ease-out"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="py-4 px-1">
			<div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
				<span>
					<strong className="text-foreground font-medium">
						{stats.total_letters.toLocaleString("de-DE")}
					</strong>{" "}
					von {goal.toLocaleString("de-DE")} Briefen geschrieben
				</span>
				<span>{progress.toFixed(0)}%</span>
			</div>

			{/* Progress bar */}
			<div className="h-2 bg-muted/50 rounded-full overflow-hidden">
				<div
					className="h-full bg-primary/60 transition-all duration-1000 ease-out rounded-full"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{stats.unique_mdbs > 0 && (
				<p className="text-xs text-muted-foreground mt-2">
					{stats.unique_mdbs} Abgeordnete kontaktiert
				</p>
			)}
		</div>
	);
}
