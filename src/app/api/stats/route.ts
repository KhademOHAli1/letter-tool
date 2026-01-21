import { NextResponse } from "next/server";
import { getLetterStats } from "@/lib/supabase";

/**
 * GET /api/stats
 * Returns aggregated statistics about letter generations.
 * Public endpoint - no authentication required.
 */
export async function GET() {
	try {
		const stats = await getLetterStats();

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
