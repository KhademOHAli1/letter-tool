/**
 * Campaigns module - public API
 * Re-exports all campaign-related functions
 */

// Context provider (client-side)
export { CampaignProvider, useCampaign, useCampaignOptional } from "./context";

// Mutations (write operations)
export {
	activatePromptVersion,
	createCampaign,
	createDemand,
	createPrompt,
	deleteCampaign,
	deleteDemand,
	generateSlug,
	markDemandCompleted,
	reorderDemands,
	updateCampaign,
	updateCampaignStatus,
	updateDemand,
	updatePrompt,
} from "./mutations";

// Prompt builder
export {
	buildPrompt,
	createPromptVariables,
	DEFAULT_PROMPT_TEMPLATE,
	formatDemandsForPrompt,
	formatSelectedDemands,
	getCountryName,
	getLocalizedText,
	getRepresentativeTitle,
	type PromptVariables,
	validateTemplate,
} from "./prompt-builder";
// Queries (read operations)
export {
	CACHE_TAGS,
	getCampaignById,
	getCampaignBySlug,
	getCampaignDemands,
	getCampaignPrompt,
	getCampaignStats,
	getCampaignTargetById,
	getCampaignWithDemands,
	listActiveCampaigns,
	listCampaignsByOrganizer,
	listCampaignTargets,
	listPromptVersions,
} from "./queries";
