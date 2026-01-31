/**
 * Integration tests for campaign API routes
 * Phase 10, Epic 10.2, Task 10.2.1
 *
 * Tests API routes with mocked Supabase client
 * No production database is touched
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the Supabase client before importing anything that uses it
vi.mock("@/lib/supabase", () => ({
	createServerSupabaseClient: vi.fn(),
}));

// Mock next/cache to avoid caching issues in tests
vi.mock("next/cache", () => ({
	unstable_cache: vi.fn((fn) => fn),
	revalidateTag: vi.fn(),
	revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase";
import type { Campaign, CampaignDemand } from "@/lib/types";

// Type-safe mock for Supabase
type MockSupabaseClient = {
	from: ReturnType<typeof vi.fn>;
};

function createMockSupabaseClient(): MockSupabaseClient {
	return {
		from: vi.fn(),
	};
}

describe("Campaign Queries", () => {
	let mockSupabase: MockSupabaseClient;

	beforeEach(() => {
		vi.resetModules();
		mockSupabase = createMockSupabaseClient();
		vi.mocked(createServerSupabaseClient).mockReturnValue(
			mockSupabase as unknown as ReturnType<typeof createServerSupabaseClient>,
		);
	});

	describe("getCampaignBySlug", () => {
		it("returns campaign when found", async () => {
			const mockCampaign = {
				id: "test-id",
				slug: "test-campaign",
				name: { en: "Test Campaign" },
				description: { en: "Test description" },
				status: "active",
				cause_context: "Test context",
				country_codes: ["de"],
				goal_letters: 1000,
				start_date: null,
				end_date: null,
				created_by: null,
				created_at: "2026-01-01T00:00:00Z",
				updated_at: "2026-01-01T00:00:00Z",
			};

			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: mockCampaign,
							error: null,
						}),
					}),
				}),
			});

			// Import after mocks are set up
			const { getCampaignBySlug } = await import("@/lib/campaigns/queries");
			const result = await getCampaignBySlug("test-campaign");

			expect(result).not.toBeNull();
			expect(result?.slug).toBe("test-campaign");
			expect(result?.name).toEqual({ en: "Test Campaign" });
		});

		it("returns null when campaign not found", async () => {
			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: null,
							error: { code: "PGRST116", message: "Not found" },
						}),
					}),
				}),
			});

			const { getCampaignBySlug } = await import("@/lib/campaigns/queries");
			const result = await getCampaignBySlug("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("listActiveCampaigns", () => {
		it("returns active campaigns", async () => {
			const mockCampaigns = [
				{
					id: "1",
					slug: "campaign-1",
					name: { en: "Campaign 1" },
					description: { en: "Description 1" },
					status: "active",
					cause_context: null,
					country_codes: ["de"],
					goal_letters: 1000,
					start_date: null,
					end_date: null,
					created_by: null,
					created_at: "2026-01-01T00:00:00Z",
					updated_at: "2026-01-01T00:00:00Z",
				},
				{
					id: "2",
					slug: "campaign-2",
					name: { en: "Campaign 2" },
					description: { en: "Description 2" },
					status: "active",
					cause_context: null,
					country_codes: ["ca"],
					goal_letters: 2000,
					start_date: null,
					end_date: null,
					created_by: null,
					created_at: "2026-01-02T00:00:00Z",
					updated_at: "2026-01-02T00:00:00Z",
				},
			];

			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						order: vi.fn().mockResolvedValue({
							data: mockCampaigns,
							error: null,
						}),
					}),
				}),
			});

			const { listActiveCampaigns } = await import("@/lib/campaigns/queries");
			const result = await listActiveCampaigns();

			expect(result).toHaveLength(2);
			expect(result[0].slug).toBe("campaign-1");
			expect(result[1].slug).toBe("campaign-2");
		});

		it("filters by country code when provided", async () => {
			const mockOrderFn = vi.fn();
			const mockContainsFn = vi.fn();

			// Match the actual query chain: from().select().eq().order().contains()
			mockOrderFn.mockReturnValue({
				contains: mockContainsFn.mockResolvedValue({
					data: [],
					error: null,
				}),
			});

			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						order: mockOrderFn,
					}),
				}),
			});

			const { listActiveCampaigns } = await import("@/lib/campaigns/queries");
			await listActiveCampaigns("de");

			expect(mockContainsFn).toHaveBeenCalledWith("country_codes", ["de"]);
		});
	});

	describe("getCampaignDemands", () => {
		it("returns demands for a campaign", async () => {
			const mockDemands = [
				{
					id: "d1",
					campaign_id: "c1",
					title: { en: "Demand 1" },
					description: { en: "Description 1" },
					brief_text: { en: "Brief 1" },
					sort_order: 0,
					completed: false,
					completed_date: null,
					created_at: "2026-01-01T00:00:00Z",
					updated_at: "2026-01-01T00:00:00Z",
				},
				{
					id: "d2",
					campaign_id: "c1",
					title: { en: "Demand 2" },
					description: { en: "Description 2" },
					brief_text: { en: "Brief 2" },
					sort_order: 1,
					completed: true,
					completed_date: "2026-01-15T00:00:00Z",
					created_at: "2026-01-01T00:00:00Z",
					updated_at: "2026-01-15T00:00:00Z",
				},
			];

			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						order: vi.fn().mockResolvedValue({
							data: mockDemands,
							error: null,
						}),
					}),
				}),
			});

			const { getCampaignDemands } = await import("@/lib/campaigns/queries");
			const result = await getCampaignDemands("c1");

			expect(result).toHaveLength(2);
			expect(result[0].title).toEqual({ en: "Demand 1" });
			expect(result[1].completed).toBe(true);
		});
	});
});

describe("Campaign Mutations", () => {
	let mockSupabase: MockSupabaseClient;

	beforeEach(() => {
		vi.resetModules();
		mockSupabase = createMockSupabaseClient();
		vi.mocked(createServerSupabaseClient).mockReturnValue(
			mockSupabase as unknown as ReturnType<typeof createServerSupabaseClient>,
		);
	});

	describe("createCampaign", () => {
		it("creates a new campaign", async () => {
			const newCampaign = {
				slug: "new-campaign",
				name: { en: "New Campaign" },
				description: { en: "New description" },
				countryCodes: ["de"],
			};

			const mockCreatedCampaign = {
				id: "new-id",
				slug: "new-campaign",
				name: { en: "New Campaign" },
				description: { en: "New description" },
				status: "draft",
				cause_context: null,
				country_codes: ["de"],
				goal_letters: null,
				start_date: null,
				end_date: null,
				created_by: null,
				created_at: "2026-01-30T00:00:00Z",
				updated_at: "2026-01-30T00:00:00Z",
			};

			mockSupabase.from.mockReturnValue({
				insert: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: mockCreatedCampaign,
							error: null,
						}),
					}),
				}),
			});

			const { createCampaign } = await import("@/lib/campaigns/mutations");
			const result = await createCampaign(newCampaign);

			expect(result).not.toBeNull();
			expect(result?.slug).toBe("new-campaign");
			expect(result?.status).toBe("draft");
		});
	});

	describe("deleteCampaign", () => {
		it("soft deletes a campaign by setting status to completed", async () => {
			mockSupabase.from.mockReturnValue({
				update: vi.fn().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						data: null,
						error: null,
					}),
				}),
			});

			const { deleteCampaign } = await import("@/lib/campaigns/mutations");
			// deleteCampaign returns void, it throws on error
			await expect(deleteCampaign("test-id")).resolves.toBeUndefined();
		});
	});
});

describe("Campaign Stats", () => {
	let mockSupabase: MockSupabaseClient;

	beforeEach(() => {
		vi.resetModules();
		mockSupabase = createMockSupabaseClient();
		vi.mocked(createServerSupabaseClient).mockReturnValue(
			mockSupabase as unknown as ReturnType<typeof createServerSupabaseClient>,
		);
	});

	describe("getCampaignStats", () => {
		it("returns aggregated campaign stats", async () => {
			const mockStats = {
				campaign_id: "test-id",
				total_letters: 500,
				unique_representatives: 50,
				countries_active: 3,
				first_letter_at: "2026-01-01T00:00:00Z",
				last_letter_at: "2026-01-30T00:00:00Z",
			};

			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: mockStats,
							error: null,
						}),
					}),
				}),
			});

			const { getCampaignStats } = await import("@/lib/campaigns/queries");
			const result = await getCampaignStats("test-id");

			expect(result).not.toBeNull();
			expect(result?.totalLetters).toBe(500);
			expect(result?.uniqueRepresentatives).toBe(50);
			expect(result?.countriesActive).toBe(3);
		});

		it("returns empty stats when no letters exist", async () => {
			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: null,
							error: { code: "PGRST116", message: "Not found" },
						}),
					}),
				}),
			});

			const { getCampaignStats } = await import("@/lib/campaigns/queries");
			const result = await getCampaignStats("test-id");

			expect(result).not.toBeNull();
			expect(result?.totalLetters).toBe(0);
		});
	});
});
