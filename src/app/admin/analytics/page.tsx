/**
 * Admin Analytics Page
 * Shows platform-wide analytics and campaign performance metrics
 */

"use client";

import { BarChart3, Globe, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { GeographicHeatMap } from "@/components/charts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

interface PlatformStats {
	totalLetters: number;
	totalCampaigns: number;
	uniqueRepresentatives: number;
	countriesActive: number;
}

interface CountryData {
	country: string;
	letterCount: number;
	uniqueReps: number;
}

export default function AdminAnalyticsPage() {
	const [stats, setStats] = useState<PlatformStats | null>(null);
	const [countryData, setCountryData] = useState<CountryData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			const supabase = getSupabaseBrowserClient();

			// Get total letters
			const { count: letterCount } = await supabase
				.from("letter_generations")
				.select("*", { count: "exact", head: true });

			// Get total campaigns
			const { count: campaignCount } = await supabase
				.from("campaigns")
				.select("*", { count: "exact", head: true });

			// Get unique representatives (with country for aggregation)
			const { data: repData } = await supabase
				.from("letter_generations")
				.select("mdb_id, country")
				.not("mdb_id", "is", null);

			const uniqueReps = new Set(repData?.map((r) => r.mdb_id)).size;

			// Get all letters with country for aggregation
			const { data: letterData } = await supabase
				.from("letter_generations")
				.select("country")
				.not("country", "is", null);

			const uniqueCountries = new Set(letterData?.map((c) => c.country)).size;

			setStats({
				totalLetters: letterCount || 0,
				totalCampaigns: campaignCount || 0,
				uniqueRepresentatives: uniqueReps,
				countriesActive: uniqueCountries,
			});

			// Aggregate letters by country
			const countryStats: Record<string, { count: number; reps: Set<string> }> =
				{};
			for (const row of letterData || []) {
				const c = row.country || "unknown";
				if (!countryStats[c]) {
					countryStats[c] = { count: 0, reps: new Set() };
				}
				countryStats[c].count++;
			}
			// Add rep counts from separate query
			for (const row of repData || []) {
				const c = row.country || "unknown";
				if (countryStats[c] && row.mdb_id) {
					countryStats[c].reps.add(row.mdb_id);
				}
			}

			const aggregatedCountryData: CountryData[] = Object.entries(countryStats)
				.filter(([key]) => key !== "unknown")
				.map(([country, data]) => ({
					country,
					letterCount: data.count,
					uniqueReps: data.reps.size,
				}))
				.sort((a, b) => b.letterCount - a.letterCount);

			setCountryData(aggregatedCountryData);
			setIsLoading(false);
		};

		fetchStats();
	}, []);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
				<p className="text-muted-foreground">
					Platform-wide performance metrics and insights
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Letters</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-20" />
						) : (
							<div className="text-2xl font-bold">
								{stats?.totalLetters.toLocaleString()}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Letters generated on the platform
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Campaigns</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-20" />
						) : (
							<div className="text-2xl font-bold">
								{stats?.totalCampaigns.toLocaleString()}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Active and completed campaigns
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Representatives Contacted
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-20" />
						) : (
							<div className="text-2xl font-bold">
								{stats?.uniqueRepresentatives.toLocaleString()}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Unique representatives reached
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Countries</CardTitle>
						<Globe className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-20" />
						) : (
							<div className="text-2xl font-bold">
								{stats?.countriesActive.toLocaleString()}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Countries with activity
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Country Participation Map */}
			{isLoading ? (
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-75 w-full" />
					</CardContent>
				</Card>
			) : (
				<GeographicHeatMap data={countryData} level="country" />
			)}

			{/* Activity Over Time - Coming Soon */}
			<Card>
				<CardHeader>
					<CardTitle>Activity Over Time</CardTitle>
					<CardDescription>
						Letter generation trends across all campaigns
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-75 items-center justify-center rounded-lg border border-dashed">
						<div className="text-center">
							<BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
							<p className="mt-2 text-sm text-muted-foreground">
								Charts coming soon
							</p>
							<p className="text-xs text-muted-foreground">
								Detailed analytics will be available in a future update
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
