/**
 * Applications Queue Page (Super Admin only)
 * Review and process campaigner applications
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { CampaignerApplication } from "@/lib/types";
import { ApplicationsClient } from "./applications-client";

async function getApplications(
	status?: string,
): Promise<CampaignerApplication[]> {
	const supabase = createServerSupabaseClient();

	let query = supabase
		.from("campaigner_applications")
		.select("*")
		.order("created_at", { ascending: false });

	if (status && status !== "all") {
		query = query.eq("status", status);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching applications:", error);
		return [];
	}

	return data as CampaignerApplication[];
}

interface PageProps {
	searchParams: Promise<{ status?: string }>;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/admin");
	}

	const { status } = await searchParams;
	const applications = await getApplications(status);

	return (
		<ApplicationsClient applications={applications} currentStatus={status} />
	);
}
