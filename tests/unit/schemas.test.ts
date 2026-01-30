/**
 * Unit tests for Zod validation schemas
 * Phase 10, Epic 10.2, Task 10.2.1
 *
 * These tests validate schemas without touching the database
 */
import { describe, expect, it } from "vitest";
import {
	CAMPAIGN_STATUSES,
	COUNTRY_CODES,
	LANGUAGE_CODES,
	campaignDemandSchema,
	campaignSchema,
	campaignSlugSchema,
	createCampaignSchema,
	letterInputSchema,
	multiLangTextSchema,
	updateCampaignSchema,
} from "@/lib/schemas";

describe("Campaign Slug Schema", () => {
	it("accepts valid slugs", () => {
		expect(campaignSlugSchema.safeParse("iran-2026").success).toBe(true);
		expect(campaignSlugSchema.safeParse("my-campaign").success).toBe(true);
		expect(campaignSlugSchema.safeParse("test123").success).toBe(true);
		expect(campaignSlugSchema.safeParse("abc").success).toBe(true);
	});

	it("rejects invalid slugs", () => {
		// Too short
		expect(campaignSlugSchema.safeParse("ab").success).toBe(false);
		// Contains uppercase
		expect(campaignSlugSchema.safeParse("Iran-2026").success).toBe(false);
		// Contains spaces
		expect(campaignSlugSchema.safeParse("my campaign").success).toBe(false);
		// Starts with hyphen
		expect(campaignSlugSchema.safeParse("-campaign").success).toBe(false);
		// Ends with hyphen
		expect(campaignSlugSchema.safeParse("campaign-").success).toBe(false);
		// Double hyphens
		expect(campaignSlugSchema.safeParse("my--campaign").success).toBe(false);
		// Contains special characters
		expect(campaignSlugSchema.safeParse("my_campaign").success).toBe(false);
	});
});

describe("Multi-Language Text Schema", () => {
	it("accepts valid multi-lang objects with one language", () => {
		// Schema allows optional fields, at least one must be present
		const result = multiLangTextSchema.safeParse({ en: "Hello" });
		expect(result.success).toBe(true);
	});

	it("accepts multi-lang objects with multiple languages", () => {
		const result = multiLangTextSchema.safeParse({
			en: "Hello",
			de: "Hallo",
			fr: "Bonjour",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty objects (no translations)", () => {
		const result = multiLangTextSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("rejects objects with only undefined values", () => {
		const result = multiLangTextSchema.safeParse({
			en: undefined,
			de: undefined,
		});
		expect(result.success).toBe(false);
	});
});

describe("Campaign Status Constants", () => {
	it("has expected status values", () => {
		expect(CAMPAIGN_STATUSES).toContain("draft");
		expect(CAMPAIGN_STATUSES).toContain("active");
		expect(CAMPAIGN_STATUSES).toContain("paused");
		expect(CAMPAIGN_STATUSES).toContain("completed");
		expect(CAMPAIGN_STATUSES).toHaveLength(4);
	});
});

describe("Country Codes Constants", () => {
	it("has expected country codes", () => {
		expect(COUNTRY_CODES).toContain("de");
		expect(COUNTRY_CODES).toContain("ca");
		expect(COUNTRY_CODES).toContain("uk");
		expect(COUNTRY_CODES).toContain("us");
		expect(COUNTRY_CODES).toContain("fr");
	});
});

describe("Language Codes Constants", () => {
	it("has expected language codes", () => {
		expect(LANGUAGE_CODES).toContain("en");
		expect(LANGUAGE_CODES).toContain("de");
		expect(LANGUAGE_CODES).toContain("fr");
		expect(LANGUAGE_CODES).toContain("es");
		expect(LANGUAGE_CODES).toContain("fa");
	});
});

describe("Create Campaign Schema", () => {
	const validCampaign = {
		slug: "test-campaign",
		name: { en: "Test Campaign" },
		description: { en: "A test campaign description" },
		countryCodes: ["de"],
	};

	it("accepts valid campaign data", () => {
		const result = createCampaignSchema.safeParse(validCampaign);
		expect(result.success).toBe(true);
	});

	it("applies default status of draft", () => {
		const result = createCampaignSchema.parse(validCampaign);
		expect(result.status).toBe("draft");
	});

	it("accepts explicit status", () => {
		const result = createCampaignSchema.parse({
			...validCampaign,
			status: "active",
		});
		expect(result.status).toBe("active");
	});

	it("requires at least one country", () => {
		const result = createCampaignSchema.safeParse({
			...validCampaign,
			countryCodes: [],
		});
		expect(result.success).toBe(false);
	});

	it("accepts optional fields", () => {
		const result = createCampaignSchema.parse({
			...validCampaign,
			causeContext: "Some context about the cause",
			goalLetters: 10000,
			startDate: "2026-01-01",
			endDate: "2026-12-31",
		});
		expect(result.causeContext).toBe("Some context about the cause");
		expect(result.goalLetters).toBe(10000);
	});

	it("rejects invalid status", () => {
		const result = createCampaignSchema.safeParse({
			...validCampaign,
			status: "invalid-status",
		});
		expect(result.success).toBe(false);
	});

	it("rejects negative goal letters", () => {
		const result = createCampaignSchema.safeParse({
			...validCampaign,
			goalLetters: -100,
		});
		expect(result.success).toBe(false);
	});
});

describe("Update Campaign Schema", () => {
	it("allows partial updates", () => {
		const result = updateCampaignSchema.safeParse({
			name: { en: "Updated Name" },
		});
		expect(result.success).toBe(true);
	});

	it("allows updating status only", () => {
		const result = updateCampaignSchema.safeParse({
			status: "paused",
		});
		expect(result.success).toBe(true);
	});

	it("allows empty update (no fields)", () => {
		const result = updateCampaignSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});

describe("Campaign Demand Schema", () => {
	const validDemand = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		campaignId: "123e4567-e89b-12d3-a456-426614174001",
		title: { en: "Demand Title" },
		description: { en: "Demand description" },
		briefText: { en: "Brief text" },
		sortOrder: 0,
		completed: false,
		completedDate: null,
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
	};

	it("accepts valid demand data", () => {
		const result = campaignDemandSchema.safeParse(validDemand);
		expect(result.success).toBe(true);
	});

	it("accepts completed demand with date", () => {
		const result = campaignDemandSchema.safeParse({
			...validDemand,
			completed: true,
			completedDate: "2026-01-15T00:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("rejects negative sort order", () => {
		const result = campaignDemandSchema.safeParse({
			...validDemand,
			sortOrder: -1,
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid UUID for id", () => {
		const result = campaignDemandSchema.safeParse({
			...validDemand,
			id: "not-a-uuid",
		});
		expect(result.success).toBe(false);
	});
});

describe("Letter Input Schema", () => {
	// Use actual help action values from the schema
	const validHelpActions = [
		"Verbreite nur verifizierte Informationen und unterstütze unabhängige Berichterstattung",
		"Spende an seriöse Menschenrechts- oder Hilfsorganisationen",
		"Unterstütze sichere Dokumentation von Menschenrechtsverletzungen",
	] as const;

	const validLetterInput = {
		senderName: "Test User",
		senderLocation: "Berlin",
		personalConnection:
			"I have friends in Iran and I care deeply about human rights.",
		targetAudience: "general-public" as const,
		tone: "calm-factual" as const,
		selectedHelpActions: validHelpActions,
	};

	it("accepts valid letter input", () => {
		const result = letterInputSchema.safeParse(validLetterInput);
		expect(result.success).toBe(true);
	});

	it("requires sender name", () => {
		const result = letterInputSchema.safeParse({
			...validLetterInput,
			senderName: "",
		});
		expect(result.success).toBe(false);
	});

	it("requires exactly 3 help actions", () => {
		const result = letterInputSchema.safeParse({
			...validLetterInput,
			selectedHelpActions: ["write-letters", "spread-awareness"],
		});
		expect(result.success).toBe(false);
	});

	it("accepts optional fields as empty strings", () => {
		const result = letterInputSchema.safeParse({
			...validLetterInput,
			concreteDetail: "",
			communityConnection: "",
			urgencyReason: "",
		});
		expect(result.success).toBe(true);
	});

	it("rejects personal connection over 2000 chars", () => {
		const result = letterInputSchema.safeParse({
			...validLetterInput,
			personalConnection: "x".repeat(2001),
		});
		expect(result.success).toBe(false);
	});
});
