/**
 * Activity Logs Page
 * View all platform activity
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { ActivityLog } from "@/lib/types";
import { ActivityLogsClient } from "./activity-client";

async function getActivityLogs(
	entityType?: string,
	limit = 100,
): Promise<ActivityLog[]> {
	const supabase = createServerSupabaseClient();

	let query = supabase
		.from("activity_logs")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (entityType && entityType !== "all") {
		query = query.eq("resource_type", entityType);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching activity logs:", error);
		return [];
	}

	return (data ?? []).map(
		(log: {
			id: string;
			actor_id: string | null;
			actor_email: string | null;
			actor_role: string | null;
			action: string;
			resource_type: string | null;
			resource_id: string | null;
			details: Record<string, unknown>;
			ip_address: string | null;
			user_agent: string | null;
			created_at: string;
		}): ActivityLog => ({
			id: log.id,
			actorId: log.actor_id,
			actorEmail: log.actor_email,
			actorRole: log.actor_role as ActivityLog["actorRole"],
			action: log.action,
			resourceType: log.resource_type,
			resourceId: log.resource_id,
			details: log.details ?? {},
			ipAddress: log.ip_address,
			userAgent: log.user_agent,
			createdAt: log.created_at,
		}),
	);
}

interface PageProps {
	searchParams: Promise<{ type?: string }>;
}

export default async function ActivityPage({ searchParams }: PageProps) {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/admin");
	}

	const { type } = await searchParams;
	const logs = await getActivityLogs(type);

	return <ActivityLogsClient logs={logs} currentType={type} />;
}
