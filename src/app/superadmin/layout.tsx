/**
 * Super Admin Layout
 * Protected layout for platform administrators
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SuperAdminSidebar } from "@/components/superadmin/sidebar";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Super Admin | Letter Tools",
	description: "Platform administration dashboard",
};

export default async function SuperAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session.isAuthenticated) {
		redirect("/auth/sign-in?redirect=/superadmin");
	}

	if (!isSuperAdmin(session.user)) {
		redirect("/admin");
	}

	return (
		<div className="flex min-h-screen">
			<SuperAdminSidebar user={session.user} />
			<main className="flex-1 overflow-auto bg-muted/30">
				<div className="p-6">{children}</div>
			</main>
		</div>
	);
}
