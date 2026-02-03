/**
 * Update Account Quotas API
 * POST /api/superadmin/accounts/[id]/quotas
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { updateAccountQuotasSchema } from "@/lib/schemas";
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

		// Validate input
		const parsed = updateAccountQuotasSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const { maxCampaigns, monthlyLetterQuota } = parsed.data;

		const supabase = createServerSupabaseClient();

		// Get current quotas
		const { data: profile, error: fetchError } = await supabase
			.from("user_profiles")
			.select(
				"max_campaigns, monthly_letter_quota, display_name, organization_name",
			)
			.eq("id", id)
			.single();

		if (fetchError || !profile) {
			return NextResponse.json({ error: "Account not found" }, { status: 404 });
		}

		// Update quotas
		const updates: Record<string, unknown> = {
			updated_at: new Date().toISOString(),
		};

		if (maxCampaigns !== undefined) {
			updates.max_campaigns = maxCampaigns;
		}
		if (monthlyLetterQuota !== undefined) {
			updates.monthly_letter_quota = monthlyLetterQuota;
		}

		const { error: updateError } = await supabase
			.from("user_profiles")
			.update(updates)
			.eq("id", id);

		if (updateError) {
			console.error("Error updating quotas:", updateError);
			return NextResponse.json(
				{ error: "Failed to update quotas" },
				{ status: 500 },
			);
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			action: "account_quotas_updated",
			resource_type: "account",
			resource_id: id,
			actor_id: user.id,
			details: {
				organization_name: profile.organization_name,
				display_name: profile.display_name,
				previous_max_campaigns: profile.max_campaigns,
				previous_monthly_letter_quota: profile.monthly_letter_quota,
				new_max_campaigns: maxCampaigns ?? profile.max_campaigns,
				new_monthly_letter_quota:
					monthlyLetterQuota ?? profile.monthly_letter_quota,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in update quotas:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
