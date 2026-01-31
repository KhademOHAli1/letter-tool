import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCampaignBySlug, getCampaignStats } from "@/lib/campaigns";
import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/campaigns/[slug]/stats
 * Returns detailed analytics for a specific campaign
 *
 * Query params:
 * - days: Number of days for time series (default: 30, max: 365)
 * - country: Filter by country code (optional)
 *
 * Returns:
 * - summary: Total letters, unique reps, goal progress
 * - timeSeries: Letters per day for charting
 * - topDemands: Most selected demands
 * - topRepresentatives: Most contacted representatives
 * - byCountry: Breakdown by country
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const { searchParams } = new URL(request.url);
		const days = Math.min(
			Math.max(Number.parseInt(searchParams.get("days") || "30", 10), 1),
			365,
		);
		const countryFilter = searchParams.get("country");

		// Get campaign
		const campaign = await getCampaignBySlug(slug);
		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
		}

		// Get basic stats
		const stats = await getCampaignStats(campaign.id);

		// Get detailed analytics from views
		const supabase = createServerSupabaseClient();

		// Time series data
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		let timeSeriesQuery = supabase
			.from("campaign_letters_by_day")
			.select("*")
			.eq("campaign_id", campaign.id)
			.gte("date", startDate.toISOString().split("T")[0])
			.order("date", { ascending: true });

		if (countryFilter) {
			timeSeriesQuery = timeSeriesQuery.eq("country", countryFilter);
		}

		const { data: timeSeriesData, error: tsError } = await timeSeriesQuery;

		// Top demands
		const { data: demandData, error: demandError } = await supabase
			.from("campaign_demand_stats")
			.select("*")
			.eq("campaign_id", campaign.id)
			.order("selection_count", { ascending: false })
			.limit(10);

		// Top representatives
		let topRepsQuery = supabase
			.from("campaign_top_representatives")
			.select("*")
			.eq("campaign_id", campaign.id)
			.order("letter_count", { ascending: false })
			.limit(20);

		if (countryFilter) {
			topRepsQuery = topRepsQuery.eq("country", countryFilter);
		}

		const { data: topRepsData, error: repsError } = await topRepsQuery;

		// Geographic breakdown
		const { data: geoData, error: geoError } = await supabase
			.from("campaign_geographic_stats")
			.select("*")
			.eq("campaign_id", campaign.id)
			.order("letter_count", { ascending: false });

		// Goal progress
		const { data: goalData, error: goalError } = await supabase
			.from("campaign_goal_progress")
			.select("*")
			.eq("campaign_id", campaign.id)
			.single();

		// Log any errors but don't fail the request
		if (tsError) console.warn("Time series query error:", tsError);
		if (demandError) console.warn("Demand stats query error:", demandError);
		if (repsError) console.warn("Top reps query error:", repsError);
		if (geoError) console.warn("Geographic stats query error:", geoError);
		if (goalError && goalError.code !== "PGRST116")
			console.warn("Goal progress query error:", goalError);

		// Build response
		const response = {
			campaign: {
				id: campaign.id,
				slug: campaign.slug,
				name: campaign.name,
				goalLetters: campaign.goalLetters,
			},
			summary: {
				totalLetters: stats?.totalLetters ?? 0,
				uniqueRepresentatives: stats?.uniqueRepresentatives ?? 0,
				countriesActive: stats?.countriesActive ?? 0,
				goalProgress: goalData?.progress_percentage ?? null,
				firstLetterAt: stats?.firstLetterAt,
				lastLetterAt: stats?.lastLetterAt,
			},
			timeSeries: (timeSeriesData || []).map((row) => ({
				date: row.date,
				country: row.country,
				letters: row.letter_count,
				uniqueReps: row.unique_reps,
			})),
			topDemands: (demandData || []).map((row) => ({
				demandId: row.demand_id,
				count: row.selection_count,
			})),
			topRepresentatives: (topRepsData || []).map((row) => ({
				id: row.mdb_id,
				name: row.mdb_name,
				party: row.mdb_party,
				district: row.wahlkreis_name,
				country: row.country,
				letterCount: row.letter_count,
			})),
			byCountry: aggregateByCountry(geoData || []),
			byParty: aggregateByParty(geoData || []),
		};

		return NextResponse.json(response, {
			headers: {
				// Cache for 5 minutes, allow stale for 1 minute while revalidating
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
			},
		});
	} catch (error) {
		console.error("Campaign stats error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch campaign statistics" },
			{ status: 500 },
		);
	}
}

/**
 * Aggregate geographic data by country
 */
function aggregateByCountry(
	data: Array<{
		country: string;
		letter_count: number;
		unique_reps: number;
		unique_districts: number;
	}>,
) {
	const byCountry: Record<
		string,
		{ letters: number; reps: number; districts: number }
	> = {};

	for (const row of data) {
		if (!byCountry[row.country]) {
			byCountry[row.country] = { letters: 0, reps: 0, districts: 0 };
		}
		byCountry[row.country].letters += row.letter_count;
		byCountry[row.country].reps += row.unique_reps;
		byCountry[row.country].districts += row.unique_districts;
	}

	return Object.entries(byCountry).map(([country, stats]) => ({
		country,
		...stats,
	}));
}

/**
 * Aggregate geographic data by party
 */
function aggregateByParty(
	data: Array<{
		party: string | null;
		letter_count: number;
		unique_reps: number;
	}>,
) {
	const byParty: Record<string, { letters: number; reps: number }> = {};

	for (const row of data) {
		const party = row.party || "Unknown";
		if (!byParty[party]) {
			byParty[party] = { letters: 0, reps: 0 };
		}
		byParty[party].letters += row.letter_count;
		byParty[party].reps += row.unique_reps;
	}

	return Object.entries(byParty)
		.map(([party, stats]) => ({
			party,
			...stats,
		}))
		.sort((a, b) => b.letters - a.letters);
}
