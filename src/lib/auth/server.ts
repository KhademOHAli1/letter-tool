/**
 * Server-side authentication utilities
 * Phase 4: Backend Authentication & Authorization
 *
 * Uses @supabase/ssr for Next.js App Router compatibility.
 * These functions should only be used in:
 * - Server Components
 * - Route Handlers (API routes)
 * - Server Actions
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv, serverEnv } from "../env";
import type { AuthError, AuthSession, AuthUser, UserRole } from "./types";

/**
 * Create a Supabase client for server-side operations with cookie handling.
 * This client respects RLS policies based on the authenticated user.
 */
export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(
		clientEnv.NEXT_PUBLIC_SUPABASE_URL || serverEnv.SUPABASE_URL || "",
		clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing sessions.
					}
				},
			},
		},
	);
}

/**
 * Get the current session and user.
 * Returns null user if not authenticated (does not throw).
 */
export async function getSession(): Promise<AuthSession> {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { user: null, isAuthenticated: false };
	}

	// Fetch user profile
	const { data: profile } = await supabase
		.from("user_profiles")
		.select("*")
		.eq("id", user.id)
		.single();

	const authUser: AuthUser = {
		id: user.id,
		email: user.email ?? null,
		profile: profile
			? {
					id: profile.id,
					displayName: profile.display_name,
					avatarUrl: profile.avatar_url,
					role: profile.role as UserRole,
					email: profile.email,
					createdAt: profile.created_at,
					updatedAt: profile.updated_at,
				}
			: null,
	};

	return { user: authUser, isAuthenticated: true };
}

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AuthUser | null> {
	const session = await getSession();
	return session.user;
}

/**
 * Require authentication - throws if not authenticated.
 * Use in API routes that require a logged-in user.
 */
export async function requireAuth(): Promise<AuthUser> {
	const user = await getUser();

	if (!user) {
		const error = new Error("Authentication required") as AuthError;
		error.code = "UNAUTHENTICATED";
		throw error;
	}

	return user;
}

/**
 * Require a specific role - throws if user doesn't have required role.
 * Role hierarchy: admin > organizer > user
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
	const user = await requireAuth();

	const roleHierarchy: Record<UserRole, number> = {
		user: 1,
		organizer: 2,
		admin: 3,
	};

	const userRoleLevel = roleHierarchy[user.profile?.role ?? "user"];
	const requiredRoleLevel = roleHierarchy[requiredRole];

	if (userRoleLevel < requiredRoleLevel) {
		const error = new Error(
			`Requires ${requiredRole} role or higher`,
		) as AuthError;
		error.code = "FORBIDDEN";
		throw error;
	}

	return user;
}

/**
 * Check if user owns a campaign.
 * Used for authorization checks on campaign operations.
 */
export async function isOwnerOfCampaign(
	userId: string,
	campaignId: string,
): Promise<boolean> {
	const supabase = await createSupabaseServerClient();

	const { data } = await supabase
		.from("campaigns")
		.select("created_by")
		.eq("id", campaignId)
		.single();

	return data?.created_by === userId;
}

/**
 * Require campaign ownership - throws if user doesn't own the campaign.
 * Admins bypass this check.
 */
export async function requireCampaignOwnership(
	campaignId: string,
): Promise<AuthUser> {
	const user = await requireAuth();

	// Admins can access any campaign
	if (user.profile?.role === "admin") {
		return user;
	}

	const isOwner = await isOwnerOfCampaign(user.id, campaignId);

	if (!isOwner) {
		const error = new Error("You don't have access to this campaign");
		(error as AuthError).code = "FORBIDDEN";
		throw error;
	}

	return user;
}
