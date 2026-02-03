/**
 * GET /api/campaigns - List campaigns
 * POST /api/campaigns - Create a new campaign (requires auth)
 * Phase 2, Epic 2.3, Tasks 2.3.1, 2.3.3
 */
import { type NextRequest, NextResponse } from "next/server";
import { hasPermission } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/server";
import {
	createCampaign,
	getCampaignStats,
	listActiveCampaigns,
} from "@/lib/campaigns";
import { createCampaignSchema } from "@/lib/schemas";
import type { Campaign } from "@/lib/types";

// Cache control for listing
const CACHE_MAX_AGE = 60; // 1 minute

/**
 * GET /api/campaigns
 * List active campaigns with optional filters
 *
 * Query params:
 * - country: Filter by country code (de, ca, uk, us, fr)
 * - includeStats: Include letter stats (true/false)
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const countryCode = searchParams.get("country") || undefined;
		const includeStats = searchParams.get("includeStats") === "true";

		// Fetch campaigns
		const campaigns = await listActiveCampaigns(countryCode);

		// Optionally include stats
		let result: (Campaign & {
			stats?: { totalLetters: number; uniqueRepresentatives: number };
		})[] = campaigns;

		if (includeStats) {
			result = await Promise.all(
				campaigns.map(async (campaign) => {
					const stats = await getCampaignStats(campaign.id);
					return {
						...campaign,
						stats: stats
							? {
									totalLetters: stats.totalLetters,
									uniqueRepresentatives: stats.uniqueRepresentatives,
								}
							: undefined,
					};
				}),
			);
		}

		return NextResponse.json(
			{ campaigns: result },
			{
				headers: {
					"Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=300`,
				},
			},
		);
	} catch (error) {
		console.error("[API] Error listing campaigns:", error);
		return NextResponse.json(
			{ error: "Failed to list campaigns" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/campaigns
 * Create a new campaign
 *
 * Requires authentication (to be implemented in Phase 4)
 * For now, uses service role which should only be called from admin
 */
export async function POST(request: NextRequest) {
	try {
		// Authentication check
		const session = await getSession();
		if (!session.isAuthenticated || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check permission
		if (!hasPermission(session.user, "campaign:create")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Parse and validate request body
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "Invalid request format" },
				{ status: 400 },
			);
		}

		const parseResult = createCampaignSchema.safeParse(body);
		if (!parseResult.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: parseResult.error.flatten() },
				{ status: 400 },
			);
		}

		// Create the campaign with authenticated user as owner
		const campaign = await createCampaign(parseResult.data, session.user.id);

		return NextResponse.json({ campaign }, { status: 201 });
	} catch (error) {
		console.error("[API] Error creating campaign:", error);

		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}

		return NextResponse.json(
			{ error: "Failed to create campaign" },
			{ status: 500 },
		);
	}
}
