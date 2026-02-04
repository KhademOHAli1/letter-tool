import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { clientEnv, serverEnv, validateServerEnv } from "@/lib/env";

export async function DELETE() {
	validateServerEnv();

	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Validate we have the required config
	if (
		!clientEnv.NEXT_PUBLIC_SUPABASE_URL ||
		!serverEnv.SUPABASE_SERVICE_ROLE_KEY
	) {
		return NextResponse.json(
			{ error: "Server configuration error" },
			{ status: 500 },
		);
	}

	// Create admin client for user deletion
	const supabaseAdmin = createClient(
		clientEnv.NEXT_PUBLIC_SUPABASE_URL,
		serverEnv.SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);

	try {
		// First, delete the user profile (cascades will handle related data)
		const { error: profileError } = await supabaseAdmin
			.from("user_profiles")
			.delete()
			.eq("id", user.id);

		if (profileError) {
			console.error("Error deleting profile:", profileError);
			// Continue anyway - the auth user deletion is more important
		}

		// Delete the auth user
		const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
			user.id,
		);

		if (authError) {
			console.error("Error deleting auth user:", authError);
			return NextResponse.json(
				{ error: "Failed to delete account. Please contact support." },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Account deletion error:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}
