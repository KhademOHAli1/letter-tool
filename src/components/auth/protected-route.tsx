/**
 * ProtectedRoute - Client-side route protection
 * Phase 5: Frontend Admin Interface
 *
 * Wraps pages that require authentication.
 * Redirects to sign-in if not authenticated.
 * Optionally checks for specific role requirements.
 */

"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/lib/auth/types";
import { useAuth } from "./auth-provider";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: UserRole;
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	requiredRole,
	redirectTo = "/auth/sign-in",
}: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, isLoading, profile } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		if (!isAuthenticated) {
			// Redirect to sign-in with current path as redirect param
			const currentPath =
				typeof window !== "undefined" ? window.location.pathname : "";
			const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
			router.replace(redirectUrl);
			return;
		}

		// Check role requirement if specified
		if (requiredRole && profile) {
			const roleHierarchy: Record<UserRole, number> = {
				user: 1,
				organizer: 2,
				admin: 3,
			};

			const userRoleLevel = roleHierarchy[profile.role];
			const requiredRoleLevel = roleHierarchy[requiredRole];

			if (userRoleLevel < requiredRoleLevel) {
				// User doesn't have required role - redirect to dashboard with error
				router.replace("/admin?error=insufficient_permissions");
			}
		}
	}, [isAuthenticated, isLoading, profile, requiredRole, redirectTo, router]);

	// Show loading state while checking auth
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render children if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	// Don't render if role check fails
	if (requiredRole && profile) {
		const roleHierarchy: Record<UserRole, number> = {
			user: 1,
			organizer: 2,
			admin: 3,
		};

		if (roleHierarchy[profile.role] < roleHierarchy[requiredRole]) {
			return null;
		}
	}

	return <>{children}</>;
}
