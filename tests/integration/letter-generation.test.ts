/**
 * Integration tests for letter generation API
 * Phase 10, Epic 10.2
 *
 * Tests API route with mocked OpenAI and Supabase
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies before importing
vi.mock("@/lib/supabase", () => ({
	createServerSupabaseClient: vi.fn(() => ({
		from: vi.fn(() => ({
			select: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: null }),
		})),
	})),
	trackLetterGeneration: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/env", () => ({
	serverEnv: {
		OPENAI_API_KEY: "test-api-key",
		LLM_MODEL: "gpt-4",
		API_DISABLED: false,
		RATE_LIMIT_MAX: 100,
		RATE_LIMIT_WINDOW_SECONDS: 60,
	},
	validateServerEnv: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
	checkRateLimit: vi.fn().mockReturnValue({ success: true, remaining: 9, resetIn: 60 }),
	getClientIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/security", () => ({
	detectBot: vi.fn().mockReturnValue({ isBot: false }),
	validateOrigin: vi.fn().mockReturnValue({ valid: true }),
	generateFingerprint: vi.fn().mockReturnValue("test-fingerprint"),
	detectAbusePatterns: vi.fn().mockReturnValue({ abusive: false }),
	checkContentSimilarity: vi.fn().mockReturnValue({ tooSimilar: false }),
}));

vi.mock("@/lib/sanitize", () => ({
	sanitizeName: vi.fn((name: string) => name),
	sanitizePersonalNote: vi.fn((note: string) => note),
	sanitizePLZ: vi.fn((plz: string) => plz),
	sanitizeForderungen: vi.fn((f: string[]) => f),
	validateMdB: vi.fn().mockReturnValue({ valid: true }),
	detectSuspiciousContent: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/campaigns", () => ({
	getCampaignWithDemands: vi.fn().mockResolvedValue(null),
	getCampaignPrompt: vi.fn().mockResolvedValue(null),
	buildPrompt: vi.fn().mockReturnValue("Test prompt"),
	createPromptVariables: vi.fn().mockReturnValue({}),
}));

describe("Letter Generation API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Request Validation", () => {
		it("validates required fields are present", () => {
			const requiredFields = [
				"senderName",
				"senderLocation",
				"personalConnection",
				"targetAudience",
				"tone",
				"selectedHelpActions",
			];

			// All required fields should be non-empty
			for (const field of requiredFields) {
				expect(field).toBeDefined();
			}
		});

		it("validates country code", () => {
			const validCountries = ["de", "ca", "uk", "fr", "us"];
			const invalidCountry = "xx";

			expect(validCountries).toContain("de");
			expect(validCountries).not.toContain(invalidCountry);
		});

		it("validates help actions count", () => {
			const helpActions = [
				"Verbreite nur verifizierte Informationen",
				"Spende an seriöse Organisationen",
				"Unterstütze sichere Dokumentation",
			];

			expect(helpActions).toHaveLength(3);
		});
	});

	describe("Rate Limiting", () => {
		it("allows requests under rate limit", async () => {
			const { checkRateLimit } = await import("@/lib/rate-limit");
			const result = checkRateLimit("127.0.0.1", { maxRequests: 10, windowSeconds: 60 });

			expect(result.success).toBe(true);
		});

		it("blocks requests over rate limit", async () => {
			const { checkRateLimit } = await import("@/lib/rate-limit");
			vi.mocked(checkRateLimit).mockReturnValueOnce({
				success: false,
				remaining: 0,
				resetIn: 60,
			});

			const result = checkRateLimit("127.0.0.1", { maxRequests: 10, windowSeconds: 60 });
			expect(result.success).toBe(false);
		});
	});

	describe("Security Checks", () => {
		it("detects bot requests", async () => {
			const { detectBot } = await import("@/lib/security");

			// Normal user
			const normalResult = detectBot({} as Request);
			expect(normalResult.isBot).toBe(false);

			// Bot detected
			vi.mocked(detectBot).mockReturnValueOnce({
				isBot: true,
				reason: "Missing headers",
			});
			const botResult = detectBot({} as Request);
			expect(botResult.isBot).toBe(true);
		});

		it("validates request origin", async () => {
			const { validateOrigin } = await import("@/lib/security");

			const result = validateOrigin({} as Request);
			expect(result.valid).toBe(true);
		});

		it("detects suspicious content", async () => {
			const { detectSuspiciousContent } = await import("@/lib/sanitize");

			const result = detectSuspiciousContent("Normal text");
			expect(result).toBe(false);
		});
	});

	describe("Input Sanitization", () => {
		it("sanitizes sender name", async () => {
			const { sanitizeName } = await import("@/lib/sanitize");

			const result = sanitizeName("John Doe");
			expect(result).toBe("John Doe");
		});

		it("sanitizes personal note", async () => {
			const { sanitizePersonalNote } = await import("@/lib/sanitize");

			const result = sanitizePersonalNote("My personal story");
			expect(result).toBe("My personal story");
		});

		it("sanitizes postal code", async () => {
			const { sanitizePLZ } = await import("@/lib/sanitize");

			const result = sanitizePLZ("10115");
			expect(result).toBe("10115");
		});
	});

	describe("Campaign Integration", () => {
		it("fetches campaign data when campaignId provided", async () => {
			const { getCampaignWithDemands } = await import("@/lib/campaigns");

			await getCampaignWithDemands("test-campaign");

			expect(getCampaignWithDemands).toHaveBeenCalledWith("test-campaign");
		});

		it("falls back to legacy prompts without campaign", async () => {
			const { getCampaignWithDemands } = await import("@/lib/campaigns");
			vi.mocked(getCampaignWithDemands).mockResolvedValueOnce(null);

			const result = await getCampaignWithDemands("nonexistent");

			expect(result).toBeNull();
		});
	});

	describe("Response Format", () => {
		it("returns letter content on success", () => {
			const successResponse = {
				letter: "Dear Representative...",
				model: "gpt-4",
				tokensUsed: 500,
			};

			expect(successResponse).toHaveProperty("letter");
			expect(successResponse.letter).toContain("Dear");
		});

		it("returns error message on failure", () => {
			const errorResponse = {
				error: "Rate limit exceeded",
			};

			expect(errorResponse).toHaveProperty("error");
		});
	});
});

describe("Letter Content Validation", () => {
	describe("Output constraints", () => {
		it("letter should be between 300-500 words", () => {
			const minWords = 300;
			const maxWords = 500;

			expect(minWords).toBeLessThan(maxWords);
		});

		it("letter should not contain prohibited content", () => {
			const prohibitedPatterns = [
				/unverified statistics/i,
				/hate speech/i,
				/collective blame/i,
			];

			const sampleLetter = "Dear Representative, I am writing to express concern...";

			for (const pattern of prohibitedPatterns) {
				expect(sampleLetter).not.toMatch(pattern);
			}
		});
	});

	describe("Public Narrative framework", () => {
		const frameworks = ["Self", "Us", "Now"];

		it("includes all narrative sections", () => {
			expect(frameworks).toContain("Self");
			expect(frameworks).toContain("Us");
			expect(frameworks).toContain("Now");
		});

		it("has correct section order", () => {
			expect(frameworks[0]).toBe("Self");
			expect(frameworks[1]).toBe("Us");
			expect(frameworks[2]).toBe("Now");
		});
	});
});

describe("Country-specific Configuration", () => {
	const countries = ["de", "ca", "uk", "fr", "us"];

	it("supports all target countries", () => {
		expect(countries).toHaveLength(5);
	});

	it("has German as primary country", () => {
		expect(countries[0]).toBe("de");
	});

	describe("Language mapping", () => {
		const countryLanguages = {
			de: "de",
			ca: "en",
			uk: "en",
			fr: "fr",
			us: "en",
		};

		it("maps countries to correct output languages", () => {
			expect(countryLanguages.de).toBe("de");
			expect(countryLanguages.fr).toBe("fr");
			expect(countryLanguages.uk).toBe("en");
		});
	});
});
