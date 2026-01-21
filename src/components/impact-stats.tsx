"use client";

import { useEffect, useState } from "react";

interface LetterStats {
	total_letters: number;
	unique_mdbs: number;
	letters_by_party: { party: string; count: number }[];
}

export function ImpactStats() {
	const [stats, setStats] = useState<LetterStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				const res = await fetch("/api/stats");
				if (res.ok) {
					const data = await res.json();
					setStats(data);
				}
			} catch (err) {
				console.error("Failed to fetch stats:", err);
			} finally {
				setLoading(false);
			}
		}
		fetchStats();
	}, []);

	// Don't show anything if no stats after loading
	if (!loading && (!stats || stats.total_letters === 0)) {
		return null;
	}

	// Skeleton loading state
	if (loading || !stats) {
		return (
			<section className="border-t border-border/30 bg-primary/5">
				<div className="container mx-auto max-w-4xl px-4 py-8">
					<div className="text-center space-y-4">
						<div className="h-6 w-48 bg-muted/60 rounded mx-auto animate-pulse" />
						<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
							<div className="text-center space-y-2">
								<div className="h-10 w-16 bg-muted/60 rounded mx-auto animate-pulse" />
								<div className="h-4 w-20 bg-muted/40 rounded mx-auto animate-pulse" />
							</div>
							<div className="text-center space-y-2">
								<div className="h-10 w-12 bg-muted/60 rounded mx-auto animate-pulse" />
								<div className="h-4 w-24 bg-muted/40 rounded mx-auto animate-pulse" />
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="border-t border-border/30 bg-primary/5">
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center space-y-4">
					<h2 className="text-lg font-semibold text-foreground">
						Gemeinsam für Menschenrechte
					</h2>
					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
						<div className="text-center">
							<p className="text-3xl md:text-4xl font-bold text-primary">
								{stats.total_letters}
							</p>
							<p className="text-sm text-muted-foreground">Briefe erstellt</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl font-bold text-primary">
								{stats.unique_mdbs}
							</p>
							<p className="text-sm text-muted-foreground">MdBs erreicht</p>
						</div>
					</div>
					{stats.letters_by_party.length > 0 && (
						<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
							{stats.letters_by_party
								.sort((a, b) => b.count - a.count)
								.slice(0, 5)
								.map(({ party, count }) => (
									<span
										key={party}
										className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs"
									>
										<span className="font-medium">{party}</span>
										<span className="text-muted-foreground">{count}</span>
									</span>
								))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
