/**
 * Send Password Reset / Invitation Email API
 * POST /api/superadmin/accounts/[id]/send-reset
 *
 * Allows superadmins to send a password reset email to a user.
 * This can be used as an invitation email for new users or for
 * users who have forgotten their password.
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { serverEnv } from "@/lib/env";
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
		const supabase = createServerSupabaseClient();

		// Get user profile to get email
		const { data: profile, error: profileError } = await supabase
			.from("user_profiles")
			.select("id, email, display_name, organization_name")
			.eq("id", id)
			.single();

		if (profileError || !profile) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (!profile.email) {
			return NextResponse.json(
				{ error: "User has no email address" },
				{ status: 400 },
			);
		}

		// Generate password reset link
		const siteUrl =
			serverEnv.SITE_URL ||
			request.headers.get("origin") ||
			`${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;

		const { error: resetError } = await supabase.auth.admin.generateLink({
			type: "recovery",
			email: profile.email,
			options: {
				redirectTo: `${siteUrl}/auth/reset-password`,
			},
		});

		if (resetError) {
			console.error("Error generating reset link:", resetError);
			return NextResponse.json(
				{ error: resetError.message || "Failed to generate reset link" },
				{ status: 500 },
			);
		}

		// Note: Supabase admin.generateLink returns the link but doesn't send email
		// We need to use resetPasswordForEmail for that, but it requires the user
		// to have signed in before. For admin-triggered resets, we use generateLink
		// and could either:
		// 1. Send email ourselves
		// 2. Use Supabase's invite user functionality
		//
		// For now, let's use the standard reset flow which sends the email
		const { error: emailError } = await supabase.auth.resetPasswordForEmail(
			profile.email,
			{
				redirectTo: `${siteUrl}/auth/reset-password`,
			},
		);

		if (emailError) {
			console.error("Error sending reset email:", emailError);
			return NextResponse.json(
				{ error: emailError.message || "Failed to send reset email" },
				{ status: 500 },
			);
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			action: "password_reset_sent",
			resource_type: "account",
			resource_id: id,
			actor_id: user.id,
			actor_email: user.email,
			actor_role: user.profile?.role,
			details: {
				email: profile.email,
				display_name: profile.display_name,
			},
		});

		return NextResponse.json({
			success: true,
			message: `Password reset email sent to ${profile.email}`,
		});
	} catch (error) {
		console.error("Error sending password reset:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
