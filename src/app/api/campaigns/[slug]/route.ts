/**
 * GET /api/campaigns/[slug] - Get campaign by slug
 * PUT /api/campaigns/[slug] - Update campaign (requires auth)
 * Phase 2, Epic 2.3, Tasks 2.3.2, 2.3.4
 */
import { type NextRequest, NextResponse } from "next/server";
import {
	getCampaignBySlug,
	getCampaignStats,
	getCampaignWithDemands,
	updateCampaign,
} from "@/lib/campaigns";
import { updateCampaignSchema } from "@/lib/schemas";

// Cache control
const CACHE_MAX_AGE = 60; // 1 minute

interface RouteParams {
	params: Promise<{ slug: string }>;
}

/**
 * GET /api/campaigns/[slug]
 * Get a campaign with its demands
 *
 * Query params:
 * - includeStats: Include letter stats (true/false)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug } = await params;
		const { searchParams } = new URL(request.url);
		const includeStats = searchParams.get("includeStats") === "true";

		const campaign = await getCampaignWithDemands(slug);

		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
		}

		// Optionally include stats
		let result: typeof campaign & {
			stats?: {
				totalLetters: number;
				uniqueRepresentatives: number;
				goalProgress: number | null;
			};
		} = campaign;

		if (includeStats) {
			const stats = await getCampaignStats(campaign.id);
			result = {
				...campaign,
				stats: stats
					? {
							totalLetters: stats.totalLetters,
							uniqueRepresentatives: stats.uniqueRepresentatives,
							goalProgress: campaign.goalLetters
								? Math.min(
										100,
										Math.round(
											(stats.totalLetters / campaign.goalLetters) * 100,
										),
									)
								: null,
						}
					: undefined,
			};
		}

		return NextResponse.json(
			{ campaign: result },
			{
				headers: {
					"Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=300`,
				},
			},
		);
	} catch (error) {
		console.error("[API] Error fetching campaign:", error);
		return NextResponse.json(
			{ error: "Failed to fetch campaign" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/campaigns/[slug]
 * Update a campaign
 *
 * Requires authentication and ownership (to be implemented in Phase 4)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug } = await params;

		// TODO: Add authentication and ownership check in Phase 4
		// const session = await getSession(request);
		// if (!session) {
		//   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		// }
		// const campaign = await getCampaignBySlug(slug);
		// if (!campaign || campaign.createdBy !== session.userId) {
		//   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		// }

		// Get current campaign to get ID
		const current = await getCampaignBySlug(slug);
		if (!current) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
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

		const parseResult = updateCampaignSchema.safeParse(body);
		if (!parseResult.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: parseResult.error.flatten() },
				{ status: 400 },
			);
		}

		// Update the campaign
		const updated = await updateCampaign(current.id, parseResult.data);

		return NextResponse.json({ campaign: updated });
	} catch (error) {
		console.error("[API] Error updating campaign:", error);

		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}

		return NextResponse.json(
			{ error: "Failed to update campaign" },
			{ status: 500 },
		);
	}
}
