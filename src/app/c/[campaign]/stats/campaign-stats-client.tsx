"use client";

/**
 * Campaign Stats Client Component
 * Phase 8: Frontend Analytics Dashboard
 *
 * Interactive stats dashboard with charts and geographic heat map
 */

import { ArrowLeft, BarChart3, MapPin, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart } from "@/components/charts/bar-chart";
import { GeographicHeatMap } from "@/components/charts/geographic-heatmap";
import { LineChart } from "@/components/charts/line-chart";
import { ProgressRing } from "@/components/charts/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Campaign } from "@/lib/types";

// Helper function to get localized text
function getLocalizedText(
	text: Record<string, string> | null | undefined,
	lang = "en",
): string {
	if (!text) return "";
	if (text[lang]) return text[lang];
	const values = Object.values(text);
	return values[0] ?? "";
}

interface CampaignStatsClientProps {
	campaign: Campaign;
}

interface CampaignStats {
	summary: {
		totalLetters: number;
		uniqueRepresentatives: number;
		uniquePostcodes: number;
		periodLetters: number;
		periodGrowth: number;
	};
	timeSeries: Array<{
		date: string;
		letters: number;
		cumulative: number;
	}>;
	topDemands: Array<{
		demand: string;
		count: number;
	}>;
	topRepresentatives: Array<{
		name: string;
		party: string;
		count: number;
	}>;
	byCountry: Array<{
		country: string;
		count: number;
	}>;
	byParty: Array<{
		party: string;
		count: number;
	}>;
}

interface HeatMapData {
	total: number;
	uniqueAreas: number;
	data: Array<{
		letterCount: number;
		uniqueReps: number;
		country: string;
		postalCode?: string;
		districtId?: string;
		districtName?: string;
		regionCode?: string;
		uniqueDistricts?: number;
		uniquePostcodes?: number;
	}>;
}

type HeatMapLevel = "country" | "region" | "district" | "postal";

export function CampaignStatsClient({ campaign }: CampaignStatsClientProps) {
	const [stats, setStats] = useState<CampaignStats | null>(null);
	const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null);
	const [heatMapLevel, setHeatMapLevel] = useState<HeatMapLevel>("region");
	const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
		campaign.countryCodes?.[0] || undefined,
	);
	const [days, setDays] = useState(30);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const campaignName = getLocalizedText(campaign.name, "en");

	// Fetch campaign stats
	useEffect(() => {
		async function fetchStats() {
			try {
				const params = new URLSearchParams({ days: days.toString() });
				if (selectedCountry) {
					params.set("country", selectedCountry);
				}

				const res = await fetch(
					`/api/campaigns/${campaign.slug}/stats?${params}`,
				);
				if (!res.ok) throw new Error("Failed to fetch stats");
				const data = await res.json();
				setStats(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load stats");
			}
		}

		fetchStats();
	}, [campaign.slug, days, selectedCountry]);

	// Fetch heat map data
	useEffect(() => {
		async function fetchHeatMap() {
			try {
				const params = new URLSearchParams({ level: heatMapLevel });
				if (selectedCountry) {
					params.set("country", selectedCountry);
				}

				const res = await fetch(
					`/api/campaigns/${campaign.slug}/heatmap?${params}`,
				);
				if (!res.ok) throw new Error("Failed to fetch heat map data");
				const data = await res.json();
				setHeatMapData(data);
			} catch (err) {
				console.error("Heat map fetch error:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchHeatMap();
	}, [campaign.slug, heatMapLevel, selectedCountry]);

	// Calculate goal progress
	const goalProgress = campaign.goalLetters
		? Math.min(
				((stats?.summary.totalLetters || 0) / campaign.goalLetters) * 100,
				100,
			)
		: 0;

	if (loading && !stats) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-muted rounded w-1/3" />
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-24 bg-muted rounded-lg" />
						))}
					</div>
					<div className="h-64 bg-muted rounded-lg" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<Card className="border-destructive">
					<CardContent className="py-8 text-center">
						<p className="text-destructive">{error}</p>
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="mt-4 text-sm underline"
						>
							Try again
						</button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<Link
					href={`/c/${campaign.slug}`}
					className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-1" />
					Back to campaign
				</Link>
				<h1 className="text-3xl font-bold">{campaignName} - Impact Stats</h1>
				<p className="text-muted-foreground mt-2">
					Track the progress and reach of this campaign
				</p>
			</div>

			{/* Time range selector */}
			<div className="flex items-center gap-2 mb-6">
				<span className="text-sm text-muted-foreground">Time range:</span>
				{[7, 30, 90, 365].map((d) => (
					<button
						key={d}
						type="button"
						onClick={() => setDays(d)}
						className={`px-3 py-1 text-sm rounded-full transition-colors ${
							days === d
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground hover:bg-muted/80"
						}`}
					>
						{d === 7
							? "7 days"
							: d === 30
								? "30 days"
								: d === 90
									? "90 days"
									: "1 year"}
					</button>
				))}
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Letters</p>
								<p className="text-3xl font-bold">
									{stats?.summary.totalLetters.toLocaleString() || 0}
								</p>
							</div>
							<BarChart3 className="w-8 h-8 text-primary/50" />
						</div>
						{stats?.summary.periodGrowth !== undefined && (
							<p className="text-xs text-muted-foreground mt-2">
								<span
									className={
										stats.summary.periodGrowth > 0
											? "text-green-600"
											: stats.summary.periodGrowth < 0
												? "text-red-600"
												: ""
									}
								>
									{stats.summary.periodGrowth > 0 ? "+" : ""}
									{stats.summary.periodGrowth.toFixed(1)}%
								</span>{" "}
								vs previous period
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Representatives</p>
								<p className="text-3xl font-bold">
									{stats?.summary.uniqueRepresentatives.toLocaleString() || 0}
								</p>
							</div>
							<Users className="w-8 h-8 text-primary/50" />
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							Unique representatives contacted
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Postal Codes</p>
								<p className="text-3xl font-bold">
									{stats?.summary.uniquePostcodes.toLocaleString() || 0}
								</p>
							</div>
							<MapPin className="w-8 h-8 text-primary/50" />
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							Geographic reach
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Goal Progress</p>
								{campaign.goalLetters ? (
									<p className="text-3xl font-bold">
										{goalProgress.toFixed(0)}%
									</p>
								) : (
									<p className="text-lg text-muted-foreground">No goal set</p>
								)}
							</div>
							<ProgressRing
								value={goalProgress}
								size={48}
								strokeWidth={4}
								showValue={false}
							/>
						</div>
						{campaign.goalLetters && (
							<p className="text-xs text-muted-foreground mt-2">
								{stats?.summary.totalLetters.toLocaleString() || 0} /{" "}
								{campaign.goalLetters.toLocaleString()} letters
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Charts row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Time series chart */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUp className="w-5 h-5" />
							Letters Over Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						{stats?.timeSeries && stats.timeSeries.length > 0 ? (
							<LineChart
								data={stats.timeSeries}
								dataKeys={[
									{
										key: "letters",
										color: "hsl(var(--primary))",
										label: "Daily",
									},
									{
										key: "cumulative",
										color: "hsl(var(--muted-foreground))",
										label: "Cumulative",
									},
								]}
								height={300}
								showLegend
							/>
						) : (
							<div className="flex items-center justify-center h-75 text-muted-foreground">
								No time series data available
							</div>
						)}
					</CardContent>
				</Card>

				{/* Party breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<BarChart3 className="w-5 h-5" />
							Letters by Party
						</CardTitle>
					</CardHeader>
					<CardContent>
						{stats?.byParty && stats.byParty.length > 0 ? (
							<BarChart
								data={stats.byParty.slice(0, 8).map((p) => ({
									name: p.party || "Unknown",
									value: p.count,
								}))}
								height={300}
								horizontal
							/>
						) : (
							<div className="flex items-center justify-center h-75 text-muted-foreground">
								No party data available
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Geographic heat map */}
			<div className="mb-8">
				<GeographicHeatMap
					data={heatMapData?.data || []}
					level={heatMapLevel}
					selectedCountry={selectedCountry}
					onLevelChange={setHeatMapLevel}
					onRegionClick={(region) => {
						// Drill down logic
						if (heatMapLevel === "country") {
							setSelectedCountry(region.country);
							setHeatMapLevel("region");
						} else if (heatMapLevel === "region") {
							setHeatMapLevel("district");
						} else if (heatMapLevel === "district") {
							setHeatMapLevel("postal");
						}
					}}
				/>
			</div>

			{/* Top representatives table */}
			{stats?.topRepresentatives && stats.topRepresentatives.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Top Representatives</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="text-left py-2 font-medium">Name</th>
										<th className="text-left py-2 font-medium">Party</th>
										<th className="text-right py-2 font-medium">Letters</th>
									</tr>
								</thead>
								<tbody>
									{stats.topRepresentatives.slice(0, 10).map((rep, idx) => (
										<tr
											key={`${rep.name}-${idx}`}
											className="border-b last:border-0"
										>
											<td className="py-2">{rep.name}</td>
											<td className="py-2 text-muted-foreground">
												{rep.party}
											</td>
											<td className="py-2 text-right font-medium">
												{rep.count.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
