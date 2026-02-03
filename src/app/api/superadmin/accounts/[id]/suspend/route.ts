/**
 * Suspend Account API
 * POST /api/superadmin/accounts/[id]/suspend
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const user = await getUser();

		if (!user || !isSuperAdmin(user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const { id } = await context.params;
		const body = await request.json();
		const { reason } = body;

		const supabase = createServerSupabaseClient();

		// Get current account status
		const { data: profile, error: fetchError } = await supabase
			.from("user_profiles")
			.select("account_status, display_name, organization_name")
			.eq("id", id)
			.single();

		if (fetchError || !profile) {
			return NextResponse.json({ error: "Account not found" }, { status: 404 });
		}

		if (profile.account_status === "suspended") {
			return NextResponse.json(
				{ error: "Account is already suspended" },
				{ status: 400 },
			);
		}

		// Update account status
		const { error: updateError } = await supabase
			.from("user_profiles")
			.update({
				account_status: "suspended",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (updateError) {
			console.error("Error suspending account:", updateError);
			return NextResponse.json(
				{ error: "Failed to suspend account" },
				{ status: 500 },
			);
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			action: "account_suspended",
			resource_type: "account",
			resource_id: id,
			actor_id: user.id,
			details: {
				organization_name: profile.organization_name,
				display_name: profile.display_name,
				reason,
				previous_status: profile.account_status,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in suspend account:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
