import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCampaignBySlug } from "@/lib/campaigns";
import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/campaigns/[slug]/heatmap
 * Returns geographic heat map data for a campaign
 *
 * Query params:
 * - level: Aggregation level (country | region | district | postal) - default: region
 * - country: Filter by country code (optional)
 * - limit: Max records to return (default: 500, max: 2000)
 *
 * Returns geographic breakdown at specified level for visualization
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const { searchParams } = new URL(request.url);
		const level = searchParams.get("level") || "region";
		const countryFilter = searchParams.get("country");
		const limit = Math.min(
			Math.max(Number.parseInt(searchParams.get("limit") || "500", 10), 1),
			2000,
		);

		// Validate level
		if (!["country", "region", "district", "postal"].includes(level)) {
			return NextResponse.json(
				{
					error: "Invalid level. Must be: country, region, district, or postal",
				},
				{ status: 400 },
			);
		}

		// Get campaign
		const campaign = await getCampaignBySlug(slug);
		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
		}

		const supabase = createServerSupabaseClient();

		// Query the appropriate view based on level
		const viewName = `campaign_heatmap_${level}`;

		let query = supabase
			.from(viewName)
			.select("*")
			.eq("campaign_id", campaign.id)
			.order("letter_count", { ascending: false })
			.limit(limit);

		if (countryFilter) {
			query = query.eq("country", countryFilter);
		}

		const { data, error } = await query;

		if (error) {
			console.error(`Heat map query error (${level}):`, error);
			return NextResponse.json(
				{ error: "Failed to fetch heat map data" },
				{ status: 500 },
			);
		}

		// Transform data based on level
		const heatmapData = (data || []).map((row) => {
			const base = {
				country: row.country,
				letterCount: row.letter_count,
				uniqueReps: row.unique_reps,
				lastLetterAt: row.last_letter_at,
			};

			switch (level) {
				case "postal":
					return {
						...base,
						postalCode: row.postal_code,
					};
				case "district":
					return {
						...base,
						districtId: row.district_id,
						districtName: row.district_name,
						uniquePostcodes: row.unique_postcodes,
					};
				case "region":
					return {
						...base,
						regionCode: row.region_code,
						uniqueDistricts: row.unique_districts,
						uniquePostcodes: row.unique_postcodes,
					};
				default:
					return {
						...base,
						uniqueDistricts: row.unique_districts,
						uniquePostcodes: row.unique_postcodes,
						firstLetterAt: row.first_letter_at,
					};
			}
		});

		// Calculate totals for context
		const totals = {
			totalLetters: heatmapData.reduce((sum, d) => sum + d.letterCount, 0),
			uniqueAreas: heatmapData.length,
			maxLetters: Math.max(...heatmapData.map((d) => d.letterCount), 0),
		};

		return NextResponse.json(
			{
				campaign: {
					id: campaign.id,
					slug: campaign.slug,
					name: campaign.name,
				},
				level,
				countryFilter: countryFilter || null,
				totals,
				data: heatmapData,
			},
			{
				headers: {
					// Cache for 5 minutes
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
				},
			},
		);
	} catch (error) {
		console.error("Heat map error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch heat map data" },
			{ status: 500 },
		);
	}
}
