/**
 * Auth module - public API
 * Re-exports all auth-related functions
 */

// Permissions
export {
	canAccessCampaign,
	canCreateCampaign,
	canDeleteCampaign,
	canEditCampaign,
	getUserPermissions,
	hasPermission,
	isAdmin,
	isOrganizer,
	type Permission,
} from "./permissions";
// Types
export type {
	AuthError,
	AuthSession,
	AuthUser,
	UserProfile,
	UserRole,
} from "./types";

// Note: Server and client utilities should be imported directly
// to avoid bundling server code in client components
// import { getSession } from "@/lib/auth/server";
// import { signIn } from "@/lib/auth/client";
