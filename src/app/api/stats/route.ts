import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLetterStats } from "@/lib/supabase";

/**
 * GET /api/stats?country=de|ca|uk
 * Returns aggregated statistics about letter generations.
 * Public endpoint - no authentication required.
 * @param country - Filter by country (default: "de" for backwards compatibility)
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const country = (searchParams.get("country") || "de") as
			| "de"
			| "ca"
			| "uk"
			| "fr";
		const stats = await getLetterStats(country);

		if (!stats) {
			return NextResponse.json(
				{ error: "Statistiken nicht verfügbar" },
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
		return NextResponse.json(
			{ error: "Ein Fehler ist aufgetreten" },
			{ status: 500 },
		);
	}
}
