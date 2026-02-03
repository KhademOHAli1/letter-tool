import type { HelpActionCategory } from "./prompts/letter-prompt";

/**
 * Personal inputs required from the user to generate a letter.
 * All fields marked as required must be provided.
 */
export interface LetterInput {
	// 1) Sender context
	senderName: string;
	senderLocation: string; // City, optionally country

	// 2) Story of Self (2-4 sentences)
	personalConnection: string; // Connection to Iran or the topic
	concreteDetail: string; // Specific moment, message, call, image, situation

	// 3) Story of Us (1-2 sentences)
	communityConnection: string; // Why this affects "us" as society/community

	// 4) Story of Now (1 sentence)
	urgencyReason: string; // Why action is needed now

	// 5) Target audience and tone
	targetAudience: TargetAudience;
	tone: LetterTone;

	// 6) Optional: verifiable anchor
	verifiableAnchor?: string;

	// Selected help actions (exactly 3)
	selectedHelpActions: [
		HelpActionCategory,
		HelpActionCategory,
		HelpActionCategory,
	];
}

export type TargetAudience =
	| "friends"
	| "colleagues"
	| "community"
	| "general-public";

export type LetterTone = "calm-factual" | "emotional-serious";

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
	friends: "Freunde",
	colleagues: "Kolleg*innen",
	community: "Community",
	"general-public": "Breite Öffentlichkeit",
};

export const TONE_LABELS: Record<LetterTone, string> = {
	"calm-factual": "Ruhig-sachlich",
	"emotional-serious": "Emotional-ernst",
};

/**
 * Generated letter response from the LLM
 */
export interface GeneratedLetter {
	content: string;
	wordCount: number;
	missingInputs?: string[]; // Any PI inputs that were missing
}

/**
 * Future: Database types for MdBs and Wahlkreise
 */
export interface MdB {
	id: string;
	name: string;
	email: string;
	party: string;
	wahlkreisId: string;
}

export interface Wahlkreis {
	id: string;
	name: string;
	plzRanges: string[]; // Postal code ranges covered
}

// ============================================================================
// Campaign Platform Types (Phase 1, Epic 1.2)
// ============================================================================

/**
 * Campaign status enum matching database enum
 */
export type CampaignStatus = "draft" | "active" | "paused" | "completed";

/**
 * Multi-language text stored as JSONB in database
 * Keys are language codes (en, de, fr, es, fa)
 */
export type MultiLangText = Record<string, string>;

/**
 * Campaign entity - the core unit of the multi-campaign platform
 */
export interface Campaign {
	id: string;
	slug: string;
	name: MultiLangText;
	description: MultiLangText;
	status: CampaignStatus;
	causeContext: string | null;
	countryCodes: string[];
	useCustomTargets: boolean;
	goalLetters: number | null;
	startDate: string | null; // ISO date string
	endDate: string | null; // ISO date string
	createdBy: string | null;
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
}

/**
 * Campaign target - custom recipient for campaign outreach
 */
export interface CampaignTarget {
	id: string;
	campaignId: string;
	name: string;
	email: string;
	postalCode: string;
	city?: string | null;
	region?: string | null;
	countryCode?: string | null;
	category?: string | null;
	imageUrl?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Campaign demand - a political ask/demand for a campaign
 */
export interface CampaignDemand {
	id: string;
	campaignId: string;
	title: MultiLangText;
	description: MultiLangText;
	briefText: MultiLangText;
	sortOrder: number;
	completed: boolean;
	completedDate: string | null; // ISO date string
	createdAt: string;
	updatedAt: string;
}

/**
 * Campaign prompt - LLM system prompt for a specific campaign/country/language
 */
export interface CampaignPrompt {
	id: string;
	campaignId: string;
	countryCode: string;
	language: string;
	systemPrompt: string;
	version: number;
	isActive: boolean;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Campaign with its demands - used for fetching campaign with related data
 */
export interface CampaignWithDemands extends Campaign {
	demands: CampaignDemand[];
}

/**
 * Campaign with full related data
 */
export interface CampaignFull extends CampaignWithDemands {
	prompts: CampaignPrompt[];
}

/**
 * Campaign stats from the campaign_stats view
 */
export interface CampaignStats {
	campaignId: string;
	totalLetters: number;
	uniqueRepresentatives: number;
	countriesActive: number;
	firstLetterAt: string | null;
	lastLetterAt: string | null;
}

/**
 * Input for creating a new campaign
 */
export interface CreateCampaignInput {
	slug: string;
	name: MultiLangText;
	description: MultiLangText;
	status?: CampaignStatus;
	causeContext?: string;
	countryCodes: string[];
	useCustomTargets?: boolean;
	goalLetters?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * Input for updating an existing campaign
 */
export interface UpdateCampaignInput {
	slug?: string;
	name?: MultiLangText;
	description?: MultiLangText;
	status?: CampaignStatus;
	causeContext?: string | null;
	countryCodes?: string[];
	useCustomTargets?: boolean;
	goalLetters?: number | null;
	startDate?: string | null;
	endDate?: string | null;
}

/**
 * Input for creating a campaign demand
 */
export interface CreateDemandInput {
	title: MultiLangText;
	description: MultiLangText;
	briefText: MultiLangText;
	sortOrder?: number;
}

/**
 * Input for updating a campaign demand
 */
export interface UpdateDemandInput {
	title?: MultiLangText;
	description?: MultiLangText;
	briefText?: MultiLangText;
	sortOrder?: number;
	completed?: boolean;
	completedDate?: string | null;
}

/**
 * Input for creating a campaign prompt
 */
export interface CreatePromptInput {
	countryCode: string;
	language: string;
	systemPrompt: string;
	description?: string;
}

/**
 * Input for updating a campaign prompt
 */
export interface UpdatePromptInput {
	systemPrompt?: string;
	description?: string;
	isActive?: boolean;
}

// ============================================================================
// Super Admin / SaaS Platform Types
// ============================================================================

/**
 * User role enum matching database enum
 */
export type UserRole = "user" | "organizer" | "admin" | "super_admin";

/**
 * Account status enum for SaaS platform
 */
export type AccountStatus =
	| "pending"
	| "active"
	| "trial"
	| "suspended"
	| "deactivated";

/**
 * Plan tier enum for subscription/quota management
 */
export type PlanTier =
	| "free"
	| "starter"
	| "professional"
	| "enterprise"
	| "unlimited";

/**
 * Extended user profile with SaaS platform fields
 */
export interface UserProfile {
	id: string;
	displayName: string | null;
	avatarUrl: string | null;
	email: string | null;
	role: UserRole;
	accountStatus: AccountStatus;
	planTier: PlanTier;
	organizationName: string | null;
	organizationWebsite: string | null;
	bio: string | null;
	monthlyLetterQuota: number;
	monthlyLettersUsed: number;
	maxCampaigns: number;
	quotaResetAt: string | null;
	approvedAt: string | null;
	approvedBy: string | null;
	suspendedAt: string | null;
	suspendedReason: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Campaigner application status
 */
export type ApplicationStatus =
	| "pending"
	| "approved"
	| "rejected"
	| "withdrawn";

/**
 * Social link for application
 */
export interface SocialLink {
	platform: string;
	url: string;
}

/**
 * Campaigner application entity
 */
export interface CampaignerApplication {
	id: string;
	email: string;
	name: string;
	organizationName: string | null;
	organizationWebsite: string | null;
	organizationDescription: string | null;
	socialLinks: SocialLink[];
	referralSource: string | null;
	intendedUse: string;
	expectedVolume: string | null;
	status: ApplicationStatus;
	reviewedAt: string | null;
	reviewedBy: string | null;
	reviewNotes: string | null;
	rejectionReason: string | null;
	userId: string | null;
	termsAcceptedAt: string;
	termsVersion: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Activity log entry
 */
export interface ActivityLog {
	id: string;
	actorId: string | null;
	actorEmail: string | null;
	actorRole: UserRole | null;
	action: string;
	resourceType: string | null;
	resourceId: string | null;
	details: Record<string, unknown>;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

/**
 * Platform setting entry
 */
export interface PlatformSetting {
	key: string;
	value: unknown;
	description: string | null;
	updatedAt: string;
	updatedBy: string | null;
}

/**
 * Input for submitting a campaigner application
 */
export interface CreateApplicationInput {
	email: string;
	name: string;
	organizationName?: string;
	organizationWebsite?: string;
	organizationDescription?: string;
	socialLinks?: SocialLink[];
	referralSource?: string;
	intendedUse: string;
	expectedVolume?: string;
}

/**
 * Input for reviewing an application
 */
export interface ReviewApplicationInput {
	applicationId: string;
	action: "approve" | "reject";
	notes?: string;
	reason?: string; // Required for rejection
}

/**
 * Input for updating account status
 */
export interface UpdateAccountStatusInput {
	userId: string;
	action: "suspend" | "reactivate" | "deactivate";
	reason?: string; // Required for suspend
}

/**
 * Input for updating account quotas
 */
export interface UpdateAccountQuotasInput {
	userId: string;
	monthlyLetterQuota?: number;
	maxCampaigns?: number;
	planTier?: PlanTier;
}
