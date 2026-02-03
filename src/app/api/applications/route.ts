/**
 * API route for campaigner applications
 * POST: Submit a new application (public)
 * GET: List applications (super_admin only)
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/server";
import { createApplicationSchema } from "@/lib/schemas";
import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/applications - Submit a new application
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const parsed = createApplicationSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Validation error", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const supabase = createServerSupabaseClient();

		// Check if email already has a pending application
		const { data: existing } = await supabase
			.from("campaigner_applications")
			.select("id, status")
			.eq("email", parsed.data.email)
			.eq("status", "pending")
			.single();

		if (existing) {
			return NextResponse.json(
				{ error: "You already have a pending application" },
				{ status: 409 },
			);
		}

		// Insert application
		const { data, error } = await supabase
			.from("campaigner_applications")
			.insert({
				email: parsed.data.email,
				name: parsed.data.name,
				organization_name: parsed.data.organizationName || null,
				organization_website: parsed.data.organizationWebsite || null,
				organization_description: parsed.data.organizationDescription || null,
				social_links: parsed.data.socialLinks || [],
				referral_source: parsed.data.referralSource || null,
				intended_use: parsed.data.intendedUse,
				expected_volume: parsed.data.expectedVolume || null,
				status: "pending",
			})
			.select()
			.single();

		if (error) {
			console.error("Failed to create application:", error);
			return NextResponse.json(
				{ error: "Failed to submit application" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, id: data.id }, { status: 201 });
	} catch (error) {
		console.error("Application submission error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * GET /api/applications - List applications (super_admin only)
 */
export async function GET(request: NextRequest) {
	try {
		const session = await getSession();

		if (!session.isAuthenticated || !isSuperAdmin(session.user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status") || "pending";
		const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
		const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

		const supabase = createServerSupabaseClient();

		let query = supabase
			.from("campaigner_applications")
			.select("*", { count: "exact" })
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (status !== "all") {
			query = query.eq("status", status);
		}

		const { data, count, error } = await query;

		if (error) {
			console.error("Failed to fetch applications:", error);
			return NextResponse.json(
				{ error: "Failed to fetch applications" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			applications: data,
			total: count,
			limit,
			offset,
		});
	} catch (error) {
		console.error("Applications list error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
