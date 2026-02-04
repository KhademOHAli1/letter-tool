/**
 * Campaigners Management Page
 * View and manage all platform campaigners
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { CampaignersClient } from "./campaigners-client";

interface CampaignerWithStats {
	id: string;
	displayName: string | null;
	email: string;
	role: string;
	accountStatus: string;
	planTier: string;
	organizationName: string | null;
	campaignQuota: number;
	monthlyLetterQuota: number;
	lettersThisMonth: number;
	createdAt: string;
	lastActiveAt: string | null;
	campaignCount: number;
}

async function getCampaigners(status?: string): Promise<CampaignerWithStats[]> {
	const supabase = createServerSupabaseClient();

	// Get organizers with their profiles
	let query = supabase
		.from("user_profiles")
		.select(`
			id,
			display_name,
			email,
			role,
			account_status,
			plan_tier,
			organization_name,
			max_campaigns,
			monthly_letter_quota,
			monthly_letters_used,
			created_at,
			updated_at
		`)
		.eq("role", "organizer")
		.order("created_at", { ascending: false });

	if (status && status !== "all") {
		query = query.eq("account_status", status);
	}

	const { data: profiles, error: profilesError } = await query;

	if (profilesError) {
		console.error("Error fetching campaigners:", profilesError);
		return [];
	}

	// Get campaign counts per user
	type ProfileRow = {
		id: string;
		display_name: string | null;
		email: string | null;
		role: string;
		account_status: string | null;
		plan_tier: string | null;
		organization_name: string | null;
		max_campaigns: number | null;
		monthly_letter_quota: number | null;
		monthly_letters_used: number | null;
		created_at: string;
		updated_at: string;
	};
	const campaignerIds = profiles?.map((p: ProfileRow) => p.id) ?? [];

	// Get campaign counts per user
	const { data: campaignCounts } = await supabase
		.from("campaigns")
		.select("created_by")
		.in("created_by", campaignerIds);

	const countMap = new Map<string, number>();
	campaignCounts?.forEach((c: { created_by: string | null }) => {
		if (c.created_by) {
			countMap.set(c.created_by, (countMap.get(c.created_by) ?? 0) + 1);
		}
	});

	return (profiles ?? []).map((p: ProfileRow) => ({
		id: p.id,
		displayName: p.display_name,
		email: p.email ?? "",
		role: p.role,
		accountStatus: p.account_status ?? "pending",
		planTier: p.plan_tier ?? "free",
		organizationName: p.organization_name,
		campaignQuota: p.max_campaigns ?? 3,
		monthlyLetterQuota: p.monthly_letter_quota ?? 1000,
		lettersThisMonth: p.monthly_letters_used ?? 0,
		createdAt: p.created_at,
		lastActiveAt: p.updated_at,
		campaignCount: countMap.get(p.id) ?? 0,
	}));
}

interface PageProps {
	searchParams: Promise<{ status?: string }>;
}

export default async function CampaignersPage({ searchParams }: PageProps) {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/admin");
	}

	const { status } = await searchParams;
	const campaigners = await getCampaigners(status);

	return <CampaignersClient campaigners={campaigners} currentStatus={status} />;
}
