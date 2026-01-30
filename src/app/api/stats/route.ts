import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCampaignBySlug, getCampaignStats } from "@/lib/campaigns";
import { createServerSupabaseClient, getLetterStats } from "@/lib/supabase";

/**
 * GET /api/stats
 * Returns aggregated statistics about letter generations.
 * Public endpoint - no authentication required.
 *
 * Query params:
 * - country: Filter by country code (de|ca|uk|fr|us, default: "de")
 * - campaign: Filter by campaign slug (optional)
 * - platform: If "true", returns platform-wide totals with campaign breakdown
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const country = (searchParams.get("country") || "de") as
			| "de"
			| "ca"
			| "uk"
			| "fr"
			| "us";
		const campaignSlug = searchParams.get("campaign");
		const platformWide = searchParams.get("platform") === "true";

		// If campaign filter is specified, return campaign-specific stats
		if (campaignSlug) {
			const campaign = await getCampaignBySlug(campaignSlug);
			if (!campaign) {
				return NextResponse.json(
					{ error: "Campaign not found" },
					{ status: 404 },
				);
			}

			const stats = await getCampaignStats(campaign.id);
			return NextResponse.json(
				{
					campaign: {
						id: campaign.id,
						slug: campaign.slug,
						name: campaign.name,
					},
					stats: {
						totalLetters: stats?.totalLetters ?? 0,
						uniqueRepresentatives: stats?.uniqueRepresentatives ?? 0,
						countriesActive: stats?.countriesActive ?? 0,
						goalLetters: campaign.goalLetters,
						goalProgress: campaign.goalLetters
							? Math.round(
									((stats?.totalLetters ?? 0) / campaign.goalLetters) * 100,
								)
							: null,
					},
				},
				{
					headers: {
						"Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
					},
				},
			);
		}

		// If platform-wide stats requested
		if (platformWide) {
			const supabase = createServerSupabaseClient();

			// Get platform-wide stats
			const { data: platformData, error: platformError } = await supabase
				.from("platform_stats")
				.select("*")
				.single();

			// Get campaign breakdown
			const { data: campaignData, error: campaignError } = await supabase
				.from("campaign_summary")
				.select("*")
				.limit(50);

			if (platformError && platformError.code !== "PGRST116") {
				console.warn("Platform stats error:", platformError);
			}
			if (campaignError) {
				console.warn("Campaign summary error:", campaignError);
			}

			return NextResponse.json(
				{
					platform: {
						totalLetters: platformData?.total_letters ?? 0,
						totalRepresentatives: platformData?.total_representatives ?? 0,
						activeCampaigns: platformData?.active_campaigns ?? 0,
						countriesActive: platformData?.countries_active ?? 0,
						firstLetterAt: platformData?.first_letter_at,
						lastLetterAt: platformData?.last_letter_at,
					},
					campaigns: (campaignData || []).map((c) => ({
						id: c.campaign_id,
						slug: c.slug,
						name: c.name,
						status: c.status,
						totalLetters: c.total_letters,
						uniqueRepresentatives: c.unique_representatives,
						goalLetters: c.goal_letters,
						progressPercentage: c.progress_percentage,
					})),
				},
				{
					headers: {
						"Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
					},
				},
			);
		}

		// Default: Legacy country-based stats (backward compatible)
		const stats = await getLetterStats(country);

		if (!stats) {
			return NextResponse.json(
				{ error: "Statistics not available" },
				{ status: 503 },
			);
		}

		return NextResponse.json(stats, {
			headers: {
				// Cache for 5 minutes
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
			},
		});
	} catch (error) {
		console.error("Stats error:", error);
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}
