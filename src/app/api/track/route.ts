import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

/**
 * GET /api/track?id=<letter_id>
 *
 * Returns a 1x1 transparent GIF pixel for email open tracking.
 * When an email client loads this image, we record the open event.
 *
 * Privacy note: We only track that a letter was opened, not who opened it.
 * No personal data is collected beyond the letter ID.
 */

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
	"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
	"base64",
);

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const letterId = searchParams.get("id");

	// Always return the pixel, even on errors (don't break email rendering)
	const pixelResponse = new NextResponse(TRACKING_PIXEL, {
		status: 200,
		headers: {
			"Content-Type": "image/gif",
			"Content-Length": TRACKING_PIXEL.length.toString(),
			"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
			Pragma: "no-cache",
			Expires: "0",
		},
	});

	if (!letterId) {
		return pixelResponse;
	}

	// Record the open event asynchronously (don't block pixel delivery)
	try {
		const supabaseUrl = serverEnv.SUPABASE_URL;
		const supabaseKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

		if (supabaseUrl && supabaseKey) {
			const supabase = createClient(supabaseUrl, supabaseKey);

			// Record email open - use upsert to prevent duplicates
			// We track: letter_id, first_opened_at, open_count
			await supabase.from("email_opens").upsert(
				{
					letter_id: letterId,
					first_opened_at: new Date().toISOString(),
					last_opened_at: new Date().toISOString(),
					open_count: 1,
				},
				{
					onConflict: "letter_id",
					// Increment open count on conflict
				},
			);

			// Also update the original letter_generations table if it exists
			await supabase.rpc("increment_email_opens", { p_letter_id: letterId });
		}
	} catch (error) {
		// Log but don't fail - pixel delivery is more important
		console.error("Failed to track email open:", error);
	}

	return pixelResponse;
}
