/**
 * Super Admin Dashboard
 * Overview of platform status and quick actions
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { SuperAdminDashboardClient } from "./dashboard-client";

async function getDashboardStats() {
	const supabase = createServerSupabaseClient();

	// Get application counts
	const { data: applicationStats } = await supabase
		.from("campaigner_applications")
		.select("status")
		.returns<{ status: string }[]>();

	const pendingApplications =
		applicationStats?.filter((a: { status: string }) => a.status === "pending")
			.length ?? 0;
	const totalApplications = applicationStats?.length ?? 0;

	// Get user counts by status
	const { data: userStats } = await supabase
		.from("user_profiles")
		.select("account_status, role")
		.returns<{ account_status: string; role: string }[]>();

	const activeOrganizers =
		userStats?.filter(
			(u: { account_status: string; role: string }) =>
				u.role === "organizer" && u.account_status === "active",
		).length ?? 0;
	const trialOrganizers =
		userStats?.filter(
			(u: { account_status: string; role: string }) =>
				u.role === "organizer" && u.account_status === "trial",
		).length ?? 0;
	const suspendedAccounts =
		userStats?.filter(
			(u: { account_status: string }) => u.account_status === "suspended",
		).length ?? 0;

	// Get campaign counts
	const { count: activeCampaigns } = await supabase
		.from("campaigns")
		.select("*", { count: "exact", head: true })
		.eq("status", "active");

	const { count: totalCampaigns } = await supabase
		.from("campaigns")
		.select("*", { count: "exact", head: true });

	// Get recent activity
	const { data: recentActivity } = await supabase
		.from("activity_logs")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(10);

	return {
		applications: {
			pending: pendingApplications,
			total: totalApplications,
		},
		organizers: {
			active: activeOrganizers,
			trial: trialOrganizers,
			suspended: suspendedAccounts,
		},
		campaigns: {
			active: activeCampaigns ?? 0,
			total: totalCampaigns ?? 0,
		},
		recentActivity: recentActivity ?? [],
	};
}

export default async function SuperAdminDashboardPage() {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/");
	}

	const stats = await getDashboardStats();

	return <SuperAdminDashboardClient stats={stats} />;
}
