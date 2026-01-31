import { z } from "zod";
import { HELP_ACTION_CATEGORIES } from "./prompts/letter-prompt";

/**
 * Zod schema for letter input validation.
 * Used with react-hook-form for form validation.
 */
export const letterInputSchema = z.object({
	senderName: z
		.string()
		.min(1, "Name ist erforderlich")
		.max(100, "Name ist zu lang"),

	senderLocation: z
		.string()
		.min(1, "Ort ist erforderlich")
		.max(100, "Ort ist zu lang"),

	personalConnection: z
		.string()
		.min(1, "Bitte teile deine persönliche Verbindung")
		.max(2000, "Bitte kürze deine Beschreibung (max. 2000 Zeichen)"),

	concreteDetail: z
		.string()
		.max(500, "Bitte kürze das Detail (max. 500 Zeichen)")
		.optional()
		.or(z.literal("")),

	communityConnection: z
		.string()
		.max(500, "Bitte kürze die Beschreibung (max. 500 Zeichen)")
		.optional()
		.or(z.literal("")),

	urgencyReason: z
		.string()
		.max(300, "Bitte kürze die Begründung (max. 300 Zeichen)")
		.optional()
		.or(z.literal("")),

	targetAudience: z.enum(
		["friends", "colleagues", "community", "general-public"],
		{ message: "Bitte wähle eine Zielgruppe" },
	),

	tone: z.enum(["calm-factual", "emotional-serious"], {
		message: "Bitte wähle einen Ton",
	}),

	verifiableAnchor: z
		.string()
		.max(300, "Bitte kürze den Anker (max. 300 Zeichen)")
		.optional(),

	selectedHelpActions: z
		.array(z.enum(HELP_ACTION_CATEGORIES as unknown as [string, ...string[]]))
		.length(3, "Bitte wähle genau 3 Hilfsoptionen"),
});

export type LetterInputSchema = z.infer<typeof letterInputSchema>;

// ============================================================================
// Campaign Platform Schemas (Phase 1, Epic 1.2)
// ============================================================================

/**
 * Valid campaign status values
 */
export const CAMPAIGN_STATUSES = [
	"draft",
	"active",
	"paused",
	"completed",
] as const;

/**
 * Supported country codes
 */
export const COUNTRY_CODES = ["de", "ca", "uk", "us", "fr"] as const;

/**
 * Supported language codes
 */
export const LANGUAGE_CODES = ["en", "de", "fr", "es", "fa"] as const;

/**
 * Schema for multi-language text (JSONB in database)
 * At least one language must be provided, not all are required
 */
export const multiLangTextSchema = z
	.object({
		en: z.string().optional(),
		de: z.string().optional(),
		fr: z.string().optional(),
		es: z.string().optional(),
		fa: z.string().optional(),
	})
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: "At least one language translation is required",
	});

/**
 * Schema for validating a campaign slug
 */
export const campaignSlugSchema = z
	.string()
	.min(3, "Slug must be at least 3 characters")
	.max(50, "Slug must be at most 50 characters")
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		"Slug must be lowercase letters, numbers, and hyphens only",
	);

/**
 * Schema for a campaign demand
 */
export const campaignDemandSchema = z.object({
	id: z.string().uuid(),
	campaignId: z.string().uuid(),
	title: multiLangTextSchema,
	description: multiLangTextSchema,
	briefText: multiLangTextSchema,
	sortOrder: z.number().int().min(0),
	completed: z.boolean(),
	completedDate: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

/**
 * Schema for a campaign prompt
 */
export const campaignPromptSchema = z.object({
	id: z.string().uuid(),
	campaignId: z.string().uuid(),
	countryCode: z.enum(COUNTRY_CODES),
	language: z.enum(LANGUAGE_CODES),
	systemPrompt: z
		.string()
		.min(100, "System prompt must be at least 100 characters"),
	version: z.number().int().min(1),
	isActive: z.boolean(),
	description: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

/**
 * Schema for a full campaign
 */
export const campaignSchema = z.object({
	id: z.string().uuid(),
	slug: campaignSlugSchema,
	name: multiLangTextSchema,
	description: multiLangTextSchema,
	status: z.enum(CAMPAIGN_STATUSES),
	causeContext: z.string().nullable(),
	countryCodes: z
		.array(z.enum(COUNTRY_CODES))
		.min(1, "At least one country is required"),
	goalLetters: z.number().int().positive().nullable(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
	createdBy: z.string().uuid().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

/**
 * Schema for creating a new campaign
 */
export const createCampaignSchema = z.object({
	slug: campaignSlugSchema,
	name: multiLangTextSchema,
	description: multiLangTextSchema,
	status: z.enum(CAMPAIGN_STATUSES).optional().default("draft"),
	causeContext: z.string().max(5000).optional(),
	countryCodes: z
		.array(z.enum(COUNTRY_CODES))
		.min(1, "At least one country is required"),
	goalLetters: z.number().int().positive().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

/**
 * Schema for updating an existing campaign (all fields optional)
 */
export const updateCampaignSchema = z.object({
	slug: campaignSlugSchema.optional(),
	name: multiLangTextSchema.optional(),
	description: multiLangTextSchema.optional(),
	status: z.enum(CAMPAIGN_STATUSES).optional(),
	causeContext: z.string().max(5000).nullable().optional(),
	countryCodes: z.array(z.enum(COUNTRY_CODES)).min(1).optional(),
	goalLetters: z.number().int().positive().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
});

/**
 * Schema for creating a campaign demand
 */
export const createDemandSchema = z.object({
	title: multiLangTextSchema,
	description: multiLangTextSchema,
	briefText: multiLangTextSchema,
	sortOrder: z.number().int().min(0).optional().default(0),
});

/**
 * Schema for updating a campaign demand
 */
export const updateDemandSchema = z.object({
	title: multiLangTextSchema.optional(),
	description: multiLangTextSchema.optional(),
	briefText: multiLangTextSchema.optional(),
	sortOrder: z.number().int().min(0).optional(),
	completed: z.boolean().optional(),
	completedDate: z.string().nullable().optional(),
});

/**
 * Schema for creating a campaign prompt
 */
export const createPromptSchema = z.object({
	countryCode: z.enum(COUNTRY_CODES),
	language: z.enum(LANGUAGE_CODES),
	systemPrompt: z
		.string()
		.min(100, "System prompt must be at least 100 characters"),
	description: z.string().max(500).optional(),
});

/**
 * Schema for updating a campaign prompt
 */
export const updatePromptSchema = z.object({
	systemPrompt: z.string().min(100).optional(),
	description: z.string().max(500).nullable().optional(),
	isActive: z.boolean().optional(),
});

// Inferred types from schemas
export type CampaignSchema = z.infer<typeof campaignSchema>;
export type CreateCampaignSchema = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignSchema = z.infer<typeof updateCampaignSchema>;
export type CampaignDemandSchema = z.infer<typeof campaignDemandSchema>;
export type CreateDemandSchema = z.infer<typeof createDemandSchema>;
export type UpdateDemandSchema = z.infer<typeof updateDemandSchema>;
export type CampaignPromptSchema = z.infer<typeof campaignPromptSchema>;
export type CreatePromptSchema = z.infer<typeof createPromptSchema>;
export type UpdatePromptSchema = z.infer<typeof updatePromptSchema>;
