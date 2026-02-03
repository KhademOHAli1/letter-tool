/**
 * Campaign queries module
 * Read operations for campaigns with caching support
 * Phase 2, Epic 2.1, Task 2.1.1
 */
import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "../supabase";
import type {
	Campaign,
	CampaignDemand,
	CampaignPrompt,
	CampaignStats,
	CampaignTarget,
	CampaignWithDemands,
} from "../types";

// Cache tags for revalidation
export const CACHE_TAGS = {
	campaigns: "campaigns",
	campaign: (slug: string) => `campaign:${slug}`,
	campaignDemands: (campaignId: string) => `campaign-demands:${campaignId}`,
	campaignPrompts: (campaignId: string) => `campaign-prompts:${campaignId}`,
	campaignTargets: (campaignId: string) => `campaign-targets:${campaignId}`,
} as const;

/**
 * Check if an error indicates the table doesn't exist (migrations not applied)
 */
function isTableNotFoundError(error: {
	code?: string;
	message?: string;
}): boolean {
	return (
		error.code === "42P01" ||
		error.code === "PGRST205" ||
		error.message?.includes("does not exist") ||
		error.message?.includes("schema cache") ||
		false
	);
}

/**
 * Transform database row to Campaign type (snake_case to camelCase)
 */
function transformCampaign(row: Record<string, unknown>): Campaign {
	return {
		id: row.id as string,
		slug: row.slug as string,
		name: row.name as Record<string, string>,
		description: row.description as Record<string, string>,
		status: row.status as Campaign["status"],
		causeContext: row.cause_context as string | null,
		countryCodes: row.country_codes as string[],
		useCustomTargets:
			(row.use_custom_targets as boolean) ??
			(row.useCustomTargets as boolean) ??
			false,
		goalLetters: row.goal_letters as number | null,
		startDate: row.start_date as string | null,
		endDate: row.end_date as string | null,
		createdBy: row.created_by as string | null,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}

/**
 * Transform database row to CampaignDemand type
 */
function transformDemand(row: Record<string, unknown>): CampaignDemand {
	return {
		id: row.id as string,
		campaignId: row.campaign_id as string,
		title: row.title as Record<string, string>,
		description: row.description as Record<string, string>,
		briefText: row.brief_text as Record<string, string>,
		sortOrder: row.sort_order as number,
		completed: row.completed as boolean,
		completedDate: row.completed_date as string | null,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}

/**
 * Transform database row to CampaignPrompt type
 */
function transformPrompt(row: Record<string, unknown>): CampaignPrompt {
	return {
		id: row.id as string,
		campaignId: row.campaign_id as string,
		countryCode: row.country_code as string,
		language: row.language as string,
		systemPrompt: row.system_prompt as string,
		version: row.version as number,
		isActive: row.is_active as boolean,
		description: row.description as string | null,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}

/**
 * Transform database row to CampaignTarget type
 */
function transformTarget(row: Record<string, unknown>): CampaignTarget {
	return {
		id: row.id as string,
		campaignId: row.campaign_id as string,
		name: row.name as string,
		email: row.email as string,
		postalCode: row.postal_code as string,
		city: (row.city as string | null) ?? null,
		region: (row.region as string | null) ?? null,
		countryCode: (row.country_code as string | null) ?? null,
		category: (row.category as string | null) ?? null,
		imageUrl: (row.image_url as string | null) ?? null,
		latitude: (row.latitude as number | null) ?? null,
		longitude: (row.longitude as number | null) ?? null,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}

/**
 * Get a campaign by its slug
 * Cached for 60 seconds, revalidated on campaign updates
 */
export const getCampaignBySlug = unstable_cache(
	async (slug: string): Promise<Campaign | null> => {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaigns")
			.select("*")
			.eq("slug", slug)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// Not found
				return null;
			}
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaigns table not found - migrations may not be applied",
				);
				return null;
			}
			console.error("[CAMPAIGNS] Error fetching campaign by slug:", error);
			throw new Error(`Failed to fetch campaign: ${error.message}`);
		}

		return transformCampaign(data);
	},
	["campaign-by-slug"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * Get a campaign by its ID
 * Cached for 60 seconds
 */
export const getCampaignById = unstable_cache(
	async (id: string): Promise<Campaign | null> => {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaigns")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaigns table not found - migrations may not be applied",
				);
				return null;
			}
			console.error("[CAMPAIGNS] Error fetching campaign by id:", error);
			throw new Error(`Failed to fetch campaign: ${error.message}`);
		}

		return transformCampaign(data);
	},
	["campaign-by-id"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * List all active campaigns, optionally filtered by country
 * Cached for 60 seconds
 */
export const listActiveCampaigns = unstable_cache(
	async (countryCode?: string): Promise<Campaign[]> => {
		const supabase = createServerSupabaseClient();

		let query = supabase
			.from("campaigns")
			.select("*")
			.eq("status", "active")
			.order("created_at", { ascending: false });

		if (countryCode) {
			query = query.contains("country_codes", [countryCode]);
		}

		const { data, error } = await query;

		if (error) {
			// Handle case where table doesn't exist yet (migrations not applied)
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaigns table not found - migrations may not be applied",
				);
				return [];
			}
			console.error("[CAMPAIGNS] Error listing active campaigns:", error);
			throw new Error(`Failed to list campaigns: ${error.message}`);
		}

		return (data || []).map(transformCampaign);
	},
	["active-campaigns"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * List campaigns by organizer (created_by)
 * Not cached - used in admin dashboard where freshness matters
 */
export async function listCampaignsByOrganizer(
	userId: string,
): Promise<Campaign[]> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("campaigns")
		.select("*")
		.eq("created_by", userId)
		.order("updated_at", { ascending: false });

	if (error) {
		if (isTableNotFoundError(error)) {
			console.warn(
				"[CAMPAIGNS] Campaigns table not found - migrations may not be applied",
			);
			return [];
		}
		console.error("[CAMPAIGNS] Error listing campaigns by organizer:", error);
		throw new Error(`Failed to list campaigns: ${error.message}`);
	}

	return (data || []).map(transformCampaign);
}

/**
 * Get campaign with its demands
 * Cached for 60 seconds
 */
export const getCampaignWithDemands = unstable_cache(
	async (slug: string): Promise<CampaignWithDemands | null> => {
		const supabase = createServerSupabaseClient();

		// Fetch campaign
		const { data: campaignData, error: campaignError } = await supabase
			.from("campaigns")
			.select("*")
			.eq("slug", slug)
			.single();

		if (campaignError) {
			if (campaignError.code === "PGRST116") {
				return null;
			}
			if (isTableNotFoundError(campaignError)) {
				console.warn(
					"[CAMPAIGNS] Campaigns table not found - migrations may not be applied",
				);
				return null;
			}
			console.error("[CAMPAIGNS] Error fetching campaign:", campaignError);
			throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
		}

		const campaign = transformCampaign(campaignData);

		// Fetch demands
		const { data: demandsData, error: demandsError } = await supabase
			.from("campaign_demands")
			.select("*")
			.eq("campaign_id", campaign.id)
			.order("sort_order", { ascending: true });

		if (demandsError) {
			if (isTableNotFoundError(demandsError)) {
				// Return campaign without demands if table doesn't exist
				return { ...campaign, demands: [] };
			}
			console.error("[CAMPAIGNS] Error fetching demands:", demandsError);
			throw new Error(`Failed to fetch demands: ${demandsError.message}`);
		}

		return {
			...campaign,
			demands: (demandsData || []).map(transformDemand),
		};
	},
	["campaign-with-demands"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * Get demands for a campaign
 * Cached for 60 seconds
 */
export const getCampaignDemands = unstable_cache(
	async (campaignId: string): Promise<CampaignDemand[]> => {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_demands")
			.select("*")
			.eq("campaign_id", campaignId)
			.order("sort_order", { ascending: true });

		if (error) {
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaign demands table not found - migrations may not be applied",
				);
				return [];
			}
			console.error("[CAMPAIGNS] Error fetching demands:", error);
			throw new Error(`Failed to fetch demands: ${error.message}`);
		}

		return (data || []).map(transformDemand);
	},
	["campaign-demands"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * Get active prompt for a campaign/country/language combination
 * Cached for 60 seconds - critical for letter generation
 */
export const getCampaignPrompt = unstable_cache(
	async (
		campaignId: string,
		countryCode: string,
		language: string,
	): Promise<CampaignPrompt | null> => {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_prompts")
			.select("*")
			.eq("campaign_id", campaignId)
			.eq("country_code", countryCode)
			.eq("language", language)
			.eq("is_active", true)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// Not found - try fallback to English
				if (language !== "en") {
					return getCampaignPrompt(campaignId, countryCode, "en");
				}
				return null;
			}
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaign prompts table not found - migrations may not be applied",
				);
				return null;
			}
			console.error("[CAMPAIGNS] Error fetching prompt:", error);
			throw new Error(`Failed to fetch prompt: ${error.message}`);
		}

		return transformPrompt(data);
	},
	["campaign-prompt"],
	{ revalidate: 60, tags: [CACHE_TAGS.campaigns] },
);

/**
 * List all prompt versions for a campaign/country/language
 * Not cached - used in admin for version management
 */
export async function listPromptVersions(
	campaignId: string,
	countryCode: string,
	language: string,
): Promise<CampaignPrompt[]> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("campaign_prompts")
		.select("*")
		.eq("campaign_id", campaignId)
		.eq("country_code", countryCode)
		.eq("language", language)
		.order("version", { ascending: false });

	if (error) {
		if (isTableNotFoundError(error)) {
			console.warn(
				"[CAMPAIGNS] Campaign prompts table not found - migrations may not be applied",
			);
			return [];
		}
		console.error("[CAMPAIGNS] Error listing prompt versions:", error);
		throw new Error(`Failed to list prompts: ${error.message}`);
	}

	return (data || []).map(transformPrompt);
}

/**
 * Get campaign stats from the campaign_stats view
 * Cached for 5 minutes (stats don't need to be real-time)
 */
export const getCampaignStats = unstable_cache(
	async (campaignId: string): Promise<CampaignStats | null> => {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_stats")
			.select("*")
			.eq("campaign_id", campaignId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No letters yet - return empty stats
				return {
					campaignId,
					totalLetters: 0,
					uniqueRepresentatives: 0,
					countriesActive: 0,
					firstLetterAt: null,
					lastLetterAt: null,
				};
			}
			if (isTableNotFoundError(error)) {
				console.warn(
					"[CAMPAIGNS] Campaign stats view not found - migrations may not be applied",
				);
				return {
					campaignId,
					totalLetters: 0,
					uniqueRepresentatives: 0,
					countriesActive: 0,
					firstLetterAt: null,
					lastLetterAt: null,
				};
			}
			console.error("[CAMPAIGNS] Error fetching stats:", error);
			throw new Error(`Failed to fetch stats: ${error.message}`);
		}

		return {
			campaignId: data.campaign_id,
			totalLetters: data.total_letters,
			uniqueRepresentatives: data.unique_representatives,
			countriesActive: data.countries_active,
			firstLetterAt: data.first_letter_at,
			lastLetterAt: data.last_letter_at,
		};
	},
	["campaign-stats"],
	{ revalidate: 300, tags: [CACHE_TAGS.campaigns] },
);

/**
 * List targets for a campaign
 * Not cached to keep admin updates visible quickly
 */
export async function listCampaignTargets(
	campaignId: string,
): Promise<CampaignTarget[]> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("campaign_targets")
		.select("*")
		.eq("campaign_id", campaignId)
		.order("name", { ascending: true });

	if (error) {
		if (isTableNotFoundError(error)) {
			console.warn(
				"[CAMPAIGNS] Campaign targets table not found - migrations may not be applied",
			);
			return [];
		}
		console.error("[CAMPAIGNS] Error listing campaign targets:", error);
		throw new Error(`Failed to list campaign targets: ${error.message}`);
	}

	return (data || []).map(transformTarget);
}

/**
 * Get a single target for a campaign by ID
 */
export async function getCampaignTargetById(
	campaignId: string,
	targetId: string,
): Promise<CampaignTarget | null> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("campaign_targets")
		.select("*")
		.eq("campaign_id", campaignId)
		.eq("id", targetId)
		.single();

	if (error) {
		if (error.code === "PGRST116") {
			return null;
		}
		if (isTableNotFoundError(error)) {
			console.warn(
				"[CAMPAIGNS] Campaign targets table not found - migrations may not be applied",
			);
			return null;
		}
		console.error("[CAMPAIGNS] Error fetching campaign target:", error);
		throw new Error(`Failed to fetch campaign target: ${error.message}`);
	}

	return transformTarget(data);
}
