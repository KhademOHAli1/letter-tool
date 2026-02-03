/**
 * Campaign mutations module
 * Write operations for campaigns, demands, and prompts
 * Phase 2, Epic 2.1, Tasks 2.1.2, 2.1.3, 2.1.4
 */
import { revalidateTag } from "next/cache";
import { createServerSupabaseClient } from "../supabase";
import type {
	Campaign,
	CampaignDemand,
	CampaignPrompt,
	CampaignStatus,
	CreateCampaignInput,
	CreateDemandInput,
	CreatePromptInput,
	UpdateCampaignInput,
	UpdateDemandInput,
	UpdatePromptInput,
} from "../types";
import { CACHE_TAGS } from "./queries";

/**
 * Generate a URL-safe slug from a name
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

/**
 * Cache profile for revalidation (Next.js 16+)
 * Using "max" for stale-while-revalidate semantics
 */
const CACHE_PROFILE = "max" as const;

/**
 * Revalidate all campaign-related caches
 */
function revalidateCampaignCaches(slug?: string) {
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);
	if (slug) {
		revalidateTag(CACHE_TAGS.campaign(slug), CACHE_PROFILE);
	}
}

// ============================================================================
// Campaign CRUD
// ============================================================================

/**
 * Create a new campaign
 */
export async function createCampaign(
	data: CreateCampaignInput,
	userId?: string,
): Promise<Campaign> {
	const supabase = createServerSupabaseClient();

	const insertData = {
		slug: data.slug,
		name: data.name,
		description: data.description,
		status: data.status || "draft",
		cause_context: data.causeContext || null,
		country_codes: data.countryCodes,
		use_custom_targets: data.useCustomTargets ?? false,
		goal_letters: data.goalLetters || null,
		start_date: data.startDate || null,
		end_date: data.endDate || null,
		created_by: userId || null,
	};

	const { data: result, error } = await supabase
		.from("campaigns")
		.insert(insertData)
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error creating campaign:", error);
		if (error.code === "23505") {
			throw new Error(`Campaign with slug "${data.slug}" already exists`);
		}
		throw new Error(`Failed to create campaign: ${error.message}`);
	}

	revalidateCampaignCaches();

	return {
		id: result.id,
		slug: result.slug,
		name: result.name,
		description: result.description,
		status: result.status,
		causeContext: result.cause_context,
		countryCodes: result.country_codes,
		useCustomTargets:
			(result.use_custom_targets as boolean | undefined) ??
			(result.useCustomTargets as boolean | undefined) ??
			false,
		goalLetters: result.goal_letters,
		startDate: result.start_date,
		endDate: result.end_date,
		createdBy: result.created_by,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
	id: string,
	data: UpdateCampaignInput,
): Promise<Campaign> {
	const supabase = createServerSupabaseClient();

	// Build update object with only provided fields
	const updateData: Record<string, unknown> = {};
	if (data.slug !== undefined) updateData.slug = data.slug;
	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.status !== undefined) updateData.status = data.status;
	if (data.causeContext !== undefined)
		updateData.cause_context = data.causeContext;
	if (data.countryCodes !== undefined)
		updateData.country_codes = data.countryCodes;
	if (data.useCustomTargets !== undefined)
		updateData.use_custom_targets = data.useCustomTargets;
	if (data.goalLetters !== undefined)
		updateData.goal_letters = data.goalLetters;
	if (data.startDate !== undefined) updateData.start_date = data.startDate;
	if (data.endDate !== undefined) updateData.end_date = data.endDate;

	const { data: result, error } = await supabase
		.from("campaigns")
		.update(updateData)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error updating campaign:", error);
		if (error.code === "23505") {
			throw new Error(`Campaign with slug "${data.slug}" already exists`);
		}
		throw new Error(`Failed to update campaign: ${error.message}`);
	}

	revalidateCampaignCaches(result.slug);

	return {
		id: result.id,
		slug: result.slug,
		name: result.name,
		description: result.description,
		status: result.status,
		causeContext: result.cause_context,
		countryCodes: result.country_codes,
		useCustomTargets:
			(result.use_custom_targets as boolean | undefined) ??
			(result.useCustomTargets as boolean | undefined) ??
			false,
		goalLetters: result.goal_letters,
		startDate: result.start_date,
		endDate: result.end_date,
		createdBy: result.created_by,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Soft delete a campaign (set status to completed and add deletion marker)
 * We don't actually delete to preserve letter generation history
 */
export async function deleteCampaign(id: string): Promise<void> {
	const supabase = createServerSupabaseClient();

	const { error } = await supabase
		.from("campaigns")
		.update({ status: "completed" })
		.eq("id", id);

	if (error) {
		console.error("[CAMPAIGNS] Error deleting campaign:", error);
		throw new Error(`Failed to delete campaign: ${error.message}`);
	}

	revalidateCampaignCaches();
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
	id: string,
	status: CampaignStatus,
): Promise<void> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("campaigns")
		.update({ status })
		.eq("id", id)
		.select("slug")
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error updating status:", error);
		throw new Error(`Failed to update status: ${error.message}`);
	}

	revalidateCampaignCaches(data.slug);
}

// ============================================================================
// Campaign Demands CRUD
// ============================================================================

/**
 * Create a new demand for a campaign
 */
export async function createDemand(
	campaignId: string,
	data: CreateDemandInput,
): Promise<CampaignDemand> {
	const supabase = createServerSupabaseClient();

	// Get max sort_order for this campaign
	const { data: maxOrder } = await supabase
		.from("campaign_demands")
		.select("sort_order")
		.eq("campaign_id", campaignId)
		.order("sort_order", { ascending: false })
		.limit(1)
		.single();

	const sortOrder = data.sortOrder ?? (maxOrder?.sort_order ?? -1) + 1;

	const { data: result, error } = await supabase
		.from("campaign_demands")
		.insert({
			campaign_id: campaignId,
			title: data.title,
			description: data.description,
			brief_text: data.briefText,
			sort_order: sortOrder,
		})
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error creating demand:", error);
		throw new Error(`Failed to create demand: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignDemands(campaignId), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);

	return {
		id: result.id,
		campaignId: result.campaign_id,
		title: result.title,
		description: result.description,
		briefText: result.brief_text,
		sortOrder: result.sort_order,
		completed: result.completed,
		completedDate: result.completed_date,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Update a demand
 */
export async function updateDemand(
	id: string,
	data: UpdateDemandInput,
): Promise<CampaignDemand> {
	const supabase = createServerSupabaseClient();

	const updateData: Record<string, unknown> = {};
	if (data.title !== undefined) updateData.title = data.title;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.briefText !== undefined) updateData.brief_text = data.briefText;
	if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
	if (data.completed !== undefined) updateData.completed = data.completed;
	if (data.completedDate !== undefined)
		updateData.completed_date = data.completedDate;

	const { data: result, error } = await supabase
		.from("campaign_demands")
		.update(updateData)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error updating demand:", error);
		throw new Error(`Failed to update demand: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignDemands(result.campaign_id), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);

	return {
		id: result.id,
		campaignId: result.campaign_id,
		title: result.title,
		description: result.description,
		briefText: result.brief_text,
		sortOrder: result.sort_order,
		completed: result.completed,
		completedDate: result.completed_date,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Delete a demand
 */
export async function deleteDemand(id: string): Promise<void> {
	const supabase = createServerSupabaseClient();

	// Get campaign_id first for cache invalidation
	const { data: demand, error: fetchError } = await supabase
		.from("campaign_demands")
		.select("campaign_id")
		.eq("id", id)
		.single();

	if (fetchError) {
		console.error("[CAMPAIGNS] Error fetching demand:", fetchError);
		throw new Error(`Failed to find demand: ${fetchError.message}`);
	}

	const { error } = await supabase
		.from("campaign_demands")
		.delete()
		.eq("id", id);

	if (error) {
		console.error("[CAMPAIGNS] Error deleting demand:", error);
		throw new Error(`Failed to delete demand: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignDemands(demand.campaign_id), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);
}

/**
 * Reorder demands within a campaign
 */
export async function reorderDemands(
	campaignId: string,
	orderedIds: string[],
): Promise<void> {
	const supabase = createServerSupabaseClient();

	// Update each demand's sort_order in a transaction-like manner
	const updates = orderedIds.map((id, index) => ({
		id,
		sort_order: index,
	}));

	for (const update of updates) {
		const { error } = await supabase
			.from("campaign_demands")
			.update({ sort_order: update.sort_order })
			.eq("id", update.id)
			.eq("campaign_id", campaignId);

		if (error) {
			console.error("[CAMPAIGNS] Error reordering demand:", error);
			throw new Error(`Failed to reorder demands: ${error.message}`);
		}
	}

	revalidateTag(CACHE_TAGS.campaignDemands(campaignId), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);
}

/**
 * Mark a demand as completed or uncompleted
 */
export async function markDemandCompleted(
	id: string,
	completed: boolean,
): Promise<CampaignDemand> {
	return updateDemand(id, {
		completed,
		completedDate: completed ? new Date().toISOString().split("T")[0] : null,
	});
}

// ============================================================================
// Campaign Prompts CRUD
// ============================================================================

/**
 * Create a new prompt version for a campaign
 */
export async function createPrompt(
	campaignId: string,
	data: CreatePromptInput,
): Promise<CampaignPrompt> {
	const supabase = createServerSupabaseClient();

	// Get the next version number
	const { data: maxVersion } = await supabase
		.from("campaign_prompts")
		.select("version")
		.eq("campaign_id", campaignId)
		.eq("country_code", data.countryCode)
		.eq("language", data.language)
		.order("version", { ascending: false })
		.limit(1)
		.single();

	const version = (maxVersion?.version ?? 0) + 1;

	// Deactivate any existing active prompts for this combination
	await supabase
		.from("campaign_prompts")
		.update({ is_active: false })
		.eq("campaign_id", campaignId)
		.eq("country_code", data.countryCode)
		.eq("language", data.language)
		.eq("is_active", true);

	// Insert the new prompt as active
	const { data: result, error } = await supabase
		.from("campaign_prompts")
		.insert({
			campaign_id: campaignId,
			country_code: data.countryCode,
			language: data.language,
			system_prompt: data.systemPrompt,
			version,
			is_active: true,
			description: data.description || null,
		})
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error creating prompt:", error);
		throw new Error(`Failed to create prompt: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignPrompts(campaignId), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);

	return {
		id: result.id,
		campaignId: result.campaign_id,
		countryCode: result.country_code,
		language: result.language,
		systemPrompt: result.system_prompt,
		version: result.version,
		isActive: result.is_active,
		description: result.description,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Update a prompt (creates a new version if system_prompt changes)
 */
export async function updatePrompt(
	id: string,
	data: UpdatePromptInput,
): Promise<CampaignPrompt> {
	const supabase = createServerSupabaseClient();

	// If updating systemPrompt, we should create a new version instead
	if (data.systemPrompt !== undefined) {
		// Get the current prompt
		const { data: current, error: fetchError } = await supabase
			.from("campaign_prompts")
			.select("*")
			.eq("id", id)
			.single();

		if (fetchError) {
			throw new Error(`Failed to find prompt: ${fetchError.message}`);
		}

		// Create a new version
		return createPrompt(current.campaign_id, {
			countryCode: current.country_code,
			language: current.language,
			systemPrompt: data.systemPrompt,
			description: data.description ?? current.description,
		});
	}

	// For non-content updates (description, isActive)
	const updateData: Record<string, unknown> = {};
	if (data.description !== undefined) updateData.description = data.description;
	if (data.isActive !== undefined) updateData.is_active = data.isActive;

	const { data: result, error } = await supabase
		.from("campaign_prompts")
		.update(updateData)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("[CAMPAIGNS] Error updating prompt:", error);
		throw new Error(`Failed to update prompt: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignPrompts(result.campaign_id), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);

	return {
		id: result.id,
		campaignId: result.campaign_id,
		countryCode: result.country_code,
		language: result.language,
		systemPrompt: result.system_prompt,
		version: result.version,
		isActive: result.is_active,
		description: result.description,
		createdAt: result.created_at,
		updatedAt: result.updated_at,
	};
}

/**
 * Activate a specific prompt version
 */
export async function activatePromptVersion(id: string): Promise<void> {
	const supabase = createServerSupabaseClient();

	// Get the prompt to activate
	const { data: prompt, error: fetchError } = await supabase
		.from("campaign_prompts")
		.select("*")
		.eq("id", id)
		.single();

	if (fetchError) {
		throw new Error(`Failed to find prompt: ${fetchError.message}`);
	}

	// Deactivate current active prompt for this combination
	await supabase
		.from("campaign_prompts")
		.update({ is_active: false })
		.eq("campaign_id", prompt.campaign_id)
		.eq("country_code", prompt.country_code)
		.eq("language", prompt.language)
		.eq("is_active", true);

	// Activate the selected prompt
	const { error } = await supabase
		.from("campaign_prompts")
		.update({ is_active: true })
		.eq("id", id);

	if (error) {
		console.error("[CAMPAIGNS] Error activating prompt:", error);
		throw new Error(`Failed to activate prompt: ${error.message}`);
	}

	revalidateTag(CACHE_TAGS.campaignPrompts(prompt.campaign_id), CACHE_PROFILE);
	revalidateTag(CACHE_TAGS.campaigns, CACHE_PROFILE);
}
