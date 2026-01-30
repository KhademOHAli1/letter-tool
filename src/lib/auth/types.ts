/**
 * Authentication types
 * Phase 4: Backend Authentication & Authorization
 */

// User roles matching the database enum
export type UserRole = "user" | "organizer" | "admin";

// User profile from database
export interface UserProfile {
	id: string;
	displayName: string | null;
	avatarUrl: string | null;
	role: UserRole;
	email: string | null;
	createdAt: string;
	updatedAt: string;
}

// Authenticated user with session info
export interface AuthUser {
	id: string;
	email: string | null;
	profile: UserProfile | null;
}

// Session response from getSession
export interface AuthSession {
	user: AuthUser | null;
	isAuthenticated: boolean;
}

// Auth error types
export class AuthError extends Error {
	constructor(
		message: string,
		public code: "UNAUTHENTICATED" | "UNAUTHORIZED" | "FORBIDDEN",
	) {
		super(message);
		this.name = "AuthError";
	}
}
