/**
 * Permission system for authorization
 * Phase 4: Backend Authentication & Authorization
 *
 * Defines permissions and role mappings.
 * Only campaign creators need accounts - regular letter writers are anonymous.
 */

import type { AuthUser, UserRole } from "./types";

// Permission types
export type Permission =
	| "campaign:create"
	| "campaign:read"
	| "campaign:update"
	| "campaign:delete"
	| "campaign:publish"
	| "demand:create"
	| "demand:update"
	| "demand:delete"
	| "prompt:create"
	| "prompt:update"
	| "prompt:delete"
	| "user:manage"
	| "admin:access";

// Role to permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	user: [
		// Regular users can't manage campaigns
		// They can only write letters (which doesn't require auth)
	],
	organizer: [
		"campaign:create",
		"campaign:read",
		"campaign:update",
		"campaign:delete",
		"campaign:publish",
		"demand:create",
		"demand:update",
		"demand:delete",
		"prompt:create",
		"prompt:update",
		"prompt:delete",
	],
	admin: [
		"campaign:create",
		"campaign:read",
		"campaign:update",
		"campaign:delete",
		"campaign:publish",
		"demand:create",
		"demand:update",
		"demand:delete",
		"prompt:create",
		"prompt:update",
		"prompt:delete",
		"user:manage",
		"admin:access",
	],
};

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(
	user: AuthUser | null,
	permission: Permission,
): boolean {
	if (!user || !user.profile) {
		return false;
	}

	const role = user.profile.role;
	const permissions = ROLE_PERMISSIONS[role] || [];

	return permissions.includes(permission);
}

/**
 * Check if a user can access a campaign (either as owner or admin).
 */
export function canAccessCampaign(
	user: AuthUser | null,
	campaignCreatedBy: string | null,
): boolean {
	if (!user) {
		return false;
	}

	// Admins can access any campaign
	if (user.profile?.role === "admin") {
		return true;
	}

	// Organizers can access their own campaigns
	if (user.profile?.role === "organizer" && campaignCreatedBy === user.id) {
		return true;
	}

	return false;
}

/**
 * Check if a user can create campaigns.
 */
export function canCreateCampaign(user: AuthUser | null): boolean {
	return hasPermission(user, "campaign:create");
}

/**
 * Check if a user can edit a specific campaign.
 */
export function canEditCampaign(
	user: AuthUser | null,
	campaignCreatedBy: string | null,
): boolean {
	if (!hasPermission(user, "campaign:update")) {
		return false;
	}

	return canAccessCampaign(user, campaignCreatedBy);
}

/**
 * Check if a user can delete a specific campaign.
 */
export function canDeleteCampaign(
	user: AuthUser | null,
	campaignCreatedBy: string | null,
): boolean {
	if (!hasPermission(user, "campaign:delete")) {
		return false;
	}

	return canAccessCampaign(user, campaignCreatedBy);
}

/**
 * Check if user is an admin.
 */
export function isAdmin(user: AuthUser | null): boolean {
	return user?.profile?.role === "admin";
}

/**
 * Check if user is an organizer or admin.
 */
export function isOrganizer(user: AuthUser | null): boolean {
	const role = user?.profile?.role;
	return role === "organizer" || role === "admin";
}

/**
 * Get all permissions for a user.
 */
export function getUserPermissions(user: AuthUser | null): Permission[] {
	if (!user || !user.profile) {
		return [];
	}

	return ROLE_PERMISSIONS[user.profile.role] || [];
}
