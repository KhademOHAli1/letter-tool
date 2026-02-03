/**
 * API route for managing a specific application
 * GET: Get application details
 * POST: Review application (approve/reject)
 */

import { type NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/server";
import { reviewApplicationSchema } from "@/lib/schemas";
import { createServerSupabaseClient } from "@/lib/supabase";

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id] - Get application details
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const session = await getSession();

		if (!session.isAuthenticated || !isSuperAdmin(session.user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaigner_applications")
			.select("*")
			.eq("id", id)
			.single();

		if (error || !data) {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Get application error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/applications/[id] - Review application (approve/reject)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const session = await getSession();

		if (!session.isAuthenticated || !isSuperAdmin(session.user)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = reviewApplicationSchema.safeParse({
			...body,
			applicationId: id,
		});

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Validation error", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const supabase = createServerSupabaseClient();

		// Get current application
		const { data: application, error: fetchError } = await supabase
			.from("campaigner_applications")
			.select("*")
			.eq("id", id)
			.single();

		if (fetchError || !application) {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 },
			);
		}

		if (application.status !== "pending") {
			return NextResponse.json(
				{ error: "Application has already been reviewed" },
				{ status: 400 },
			);
		}

		const userId = session.user?.id;

		if (parsed.data.action === "approve") {
			// Update application status
			const { error: updateError } = await supabase
				.from("campaigner_applications")
				.update({
					status: "approved",
					reviewed_at: new Date().toISOString(),
					reviewed_by: userId,
					review_notes: parsed.data.notes || null,
				})
				.eq("id", id);

			if (updateError) {
				console.error("Failed to approve application:", updateError);
				return NextResponse.json(
					{ error: "Failed to approve application" },
					{ status: 500 },
				);
			}

			// Check if user already exists and update their profile
			const { data: existingUser } = await supabase
				.from("user_profiles")
				.select("id")
				.eq("email", application.email)
				.single();

			if (existingUser) {
				await supabase
					.from("user_profiles")
					.update({
						role: "organizer",
						account_status: "active",
						organization_name: application.organization_name,
						organization_website: application.organization_website,
						approved_at: new Date().toISOString(),
						approved_by: userId,
					})
					.eq("id", existingUser.id);

				// Link user to application
				await supabase
					.from("campaigner_applications")
					.update({ user_id: existingUser.id })
					.eq("id", id);
			}

			// Log activity
			await supabase.from("activity_logs").insert({
				actor_id: userId,
				actor_email: session.user?.email,
				actor_role: session.user?.profile?.role,
				action: "application.approved",
				resource_type: "application",
				resource_id: id,
				details: {
					email: application.email,
					notes: parsed.data.notes,
				},
			});

			return NextResponse.json({
				success: true,
				message: "Application approved",
			});
		}

		// Reject application
		if (!parsed.data.reason) {
			return NextResponse.json(
				{ error: "Rejection reason is required" },
				{ status: 400 },
			);
		}

		const { error: rejectError } = await supabase
			.from("campaigner_applications")
			.update({
				status: "rejected",
				reviewed_at: new Date().toISOString(),
				reviewed_by: userId,
				rejection_reason: parsed.data.reason,
				review_notes: parsed.data.notes || null,
			})
			.eq("id", id);

		if (rejectError) {
			console.error("Failed to reject application:", rejectError);
			return NextResponse.json(
				{ error: "Failed to reject application" },
				{ status: 500 },
			);
		}

		// Log activity
		await supabase.from("activity_logs").insert({
			actor_id: userId,
			actor_email: session.user?.email,
			actor_role: session.user?.profile?.role,
			action: "application.rejected",
			resource_type: "application",
			resource_id: id,
			details: {
				email: application.email,
				reason: parsed.data.reason,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Application rejected",
		});
	} catch (error) {
		console.error("Review application error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
