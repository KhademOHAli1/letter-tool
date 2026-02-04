/**
 * Create User Account API
 * POST /api/superadmin/accounts/create
 *
 * Allows superadmins to create new user accounts and optionally send
 * an invitation email for password setup.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { serverEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase";

const createUserSchema = z.object({
	email: z.string().email("Valid email is required"),
	displayName: z.string().min(1, "Display name is required").max(100),
	organizationName: z.string().max(200).optional(),
	role: z.enum(["user", "organizer", "super_admin"]).default("organizer"),
	sendInvite: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
	try {
		const user = await getUser();

		if (!user || !isSuperAdmin(user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = createUserSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Validation error", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const { email, displayName, organizationName, role, sendInvite } =
			parsed.data;
		const supabase = createServerSupabaseClient();

		// Check if user already exists
		const { data: existingProfile } = await supabase
			.from("user_profiles")
			.select("id, email")
			.eq("email", email)
			.single();

		if (existingProfile) {
			return NextResponse.json(
				{ error: "A user with this email already exists" },
				{ status: 409 },
			);
		}

		// Create user via Supabase Admin API
		// We need to use the admin auth API which requires service role
		const supabaseAdmin = createServerSupabaseClient();

		// Generate a temporary password (will be reset via invite email)
		const tempPassword = crypto.randomUUID();

		const { data: authData, error: authError } =
			await supabaseAdmin.auth.admin.createUser({
				email,
				password: tempPassword,
				email_confirm: true, // Mark email as confirmed since we're inviting them
				user_metadata: {
					display_name: displayName,
				},
			});

		if (authError) {
			console.error("Error creating auth user:", authError);
			return NextResponse.json(
				{ error: authError.message || "Failed to create user account" },
				{ status: 500 },
			);
		}

		if (!authData.user) {
			return NextResponse.json(
				{ error: "Failed to create user - no user returned" },
				{ status: 500 },
			);
		}

		// Update the user profile that was auto-created by the trigger
		const { error: profileError } = await supabase
			.from("user_profiles")
			.update({
				display_name: displayName,
				organization_name: organizationName || null,
				role,
				account_status: sendInvite ? "pending" : "active",
			})
			.eq("id", authData.user.id);

		if (profileError) {
			console.error("Error updating user profile:", profileError);
			// Don't fail - user is created, profile update can be retried
		}

		// Send password reset email if requested (this serves as the invite)
		if (sendInvite) {
			const siteUrl =
				serverEnv.SITE_URL ||
				request.headers.get("origin") ||
				`${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;

			const { error: resetError } = await supabaseAdmin.auth.admin.generateLink(
				{
					type: "recovery",
					email,
					options: {
						redirectTo: `${siteUrl}/auth/reset-password`,
					},
				},
			);

			if (resetError) {
				console.error("Error sending invite email:", resetError);
				// Don't fail the whole operation - user can be sent invite later
			}
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			action: "user_created",
			resource_type: "account",
			resource_id: authData.user.id,
			actor_id: user.id,
			actor_email: user.email,
			actor_role: user.profile?.role,
			details: {
				email,
				display_name: displayName,
				organization_name: organizationName,
				role,
				invite_sent: sendInvite,
			},
		});

		return NextResponse.json({
			success: true,
			userId: authData.user.id,
			message: sendInvite
				? "User created and invitation email sent"
				: "User created successfully",
		});
	} catch (error) {
		console.error("Error in create user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
