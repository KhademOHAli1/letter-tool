/**
 * Platform Settings API
 * POST /api/superadmin/settings - Update a setting
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { updatePlatformSettingSchema } from "@/lib/schemas";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
	try {
		const user = await getUser();

		if (!user || !isSuperAdmin(user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body = await request.json();

		// Validate input
		const parsed = updatePlatformSettingSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const { key, value } = parsed.data;

		const supabase = createServerSupabaseClient();

		// Get current value
		const { data: existing } = await supabase
			.from("platform_settings")
			.select("value")
			.eq("key", key)
			.single();

		// Upsert the setting
		const { error: upsertError } = await supabase
			.from("platform_settings")
			.upsert(
				{
					key,
					value,
					updated_at: new Date().toISOString(),
					updated_by: user.id,
				},
				{ onConflict: "key" },
			);

		if (upsertError) {
			console.error("Error updating setting:", upsertError);
			return NextResponse.json(
				{ error: "Failed to update setting" },
				{ status: 500 },
			);
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			action: "settings_updated",
			resource_type: "platform",
			resource_id: key,
			actor_id: user.id,
			details: {
				key,
				previous_value: existing?.value,
				new_value: value,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in update setting:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const user = await getUser();

		if (!user || !isSuperAdmin(user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("platform_settings")
			.select("*")
			.order("key");

		if (error) {
			console.error("Error fetching settings:", error);
			return NextResponse.json(
				{ error: "Failed to fetch settings" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ settings: data });
	} catch (error) {
		console.error("Error in get settings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
