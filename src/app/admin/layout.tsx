/**
 * Admin Layout - wraps all admin pages
 * Phase 5: Frontend Admin Interface
 *
 * Provides auth protection and admin navigation.
 */

import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<AuthProvider>
			<ProtectedRoute requiredRole="organizer">
				<div className="flex min-h-screen">
					<AdminSidebar />
					<div className="flex flex-1 flex-col">
						<AdminHeader />
						<main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
					</div>
				</div>
			</ProtectedRoute>
		</AuthProvider>
	);
}
