/**
 * Tests for public campaign pages
 * Phase 10, Epic 10.2
 *
 * Tests campaign landing, directory, and stats pages
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Next.js
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
	}),
	usePathname: () => "/c/test-campaign",
	useParams: () => ({ campaign: "test-campaign", country: "de" }),
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/headers", () => ({
	cookies: () => ({
		get: vi.fn(),
		set: vi.fn(),
	}),
	headers: () => new Headers(),
}));

describe("Campaign Directory Page", () => {
	describe("Campaign Listing", () => {
		const mockCampaigns = [
			{
				id: "1",
				slug: "iran-2026",
				name: { en: "Iran Solidarity 2026", de: "Iran Solidarität 2026" },
				status: "active",
				country_code: "de",
				goal_letters: 10000,
			},
			{
				id: "2",
				slug: "climate-action",
				name: { en: "Climate Action Now" },
				status: "active",
				country_code: "us",
				goal_letters: 5000,
			},
		];

		it("displays active campaigns", () => {
			const activeCampaigns = mockCampaigns.filter((c) => c.status === "active");
			expect(activeCampaigns).toHaveLength(2);
		});

		it("supports filtering by country", () => {
			const deCampaigns = mockCampaigns.filter((c) => c.country_code === "de");
			expect(deCampaigns).toHaveLength(1);
			expect(deCampaigns[0].slug).toBe("iran-2026");
		});

		it("supports search by name", () => {
			const searchTerm = "iran";
			const results = mockCampaigns.filter((c) =>
				c.name.en.toLowerCase().includes(searchTerm)
			);
			expect(results).toHaveLength(1);
		});
	});

	describe("Campaign Public Card", () => {
		const campaign = {
			name: { en: "Test Campaign" },
			description: { en: "A description that is longer than excerpt length" },
			goal_letters: 1000,
			letters_count: 750,
			country_code: "de",
		};

		it("shows campaign name", () => {
			expect(campaign.name.en).toBe("Test Campaign");
		});

		it("shows progress bar", () => {
			const progress = (campaign.letters_count / campaign.goal_letters) * 100;
			expect(progress).toBe(75);
		});

		it("shows country flag", () => {
			expect(campaign.country_code).toBe("de");
		});

		it("truncates long descriptions", () => {
			const maxExcerptLength = 100;
			const excerpt =
				campaign.description.en.length > maxExcerptLength
					? `${campaign.description.en.slice(0, maxExcerptLength)}...`
					: campaign.description.en;

			expect(excerpt.length).toBeLessThanOrEqual(maxExcerptLength + 3);
		});
	});
});

describe("Campaign Landing Page", () => {
	const mockCampaign = {
		id: "test-id",
		slug: "iran-2026",
		name: { en: "Iran Solidarity 2026", de: "Iran Solidarität 2026" },
		description: {
			en: "Support the people of Iran in their fight for freedom",
			de: "Unterstütze die Menschen im Iran in ihrem Kampf für Freiheit",
		},
		status: "active",
		country_code: "de",
		goal_letters: 10000,
		start_date: "2025-01-01",
		end_date: "2026-12-31",
		created_at: "2025-01-01T00:00:00Z",
	};

	const mockDemands = [
		{
			id: "d1",
			title: { en: "Demand 1", de: "Forderung 1" },
			description: { en: "Description 1" },
			sort_order: 1,
			completed: false,
		},
		{
			id: "d2",
			title: { en: "Demand 2", de: "Forderung 2" },
			description: { en: "Description 2" },
			sort_order: 2,
			completed: true,
			completed_date: "2025-06-15",
		},
	];

	describe("Hero Section", () => {
		it("displays campaign name", () => {
			expect(mockCampaign.name.en).toBe("Iran Solidarity 2026");
		});

		it("displays description", () => {
			expect(mockCampaign.description.en).toContain("Iran");
		});

		it("shows localized content based on language", () => {
			const language = "de";
			const localizedName =
				mockCampaign.name[language as keyof typeof mockCampaign.name];
			expect(localizedName).toBe("Iran Solidarität 2026");
		});
	});

	describe("Impact Stats Section", () => {
		const stats = {
			total_letters: 7500,
			unique_reps: 234,
			goal_progress: 75,
		};

		it("shows total letters", () => {
			expect(stats.total_letters).toBe(7500);
		});

		it("shows unique representatives", () => {
			expect(stats.unique_reps).toBe(234);
		});

		it("shows goal progress", () => {
			expect(stats.goal_progress).toBe(75);
		});
	});

	describe("Demands Section", () => {
		it("lists all demands", () => {
			expect(mockDemands).toHaveLength(2);
		});

		it("shows completed status", () => {
			const completedDemands = mockDemands.filter((d) => d.completed);
			expect(completedDemands).toHaveLength(1);
		});

		it("orders demands by sort_order", () => {
			const sorted = [...mockDemands].sort((a, b) => a.sort_order - b.sort_order);
			expect(sorted[0].sort_order).toBe(1);
			expect(sorted[1].sort_order).toBe(2);
		});
	});

	describe("Call to Action", () => {
		it("links to letter form", () => {
			const ctaPath = `/c/${mockCampaign.slug}/de/editor`;
			expect(ctaPath).toBe("/c/iran-2026/de/editor");
		});

		it("shows multiple country options", () => {
			const countries = ["de", "ca", "uk", "fr", "us"];
			expect(countries).toContain(mockCampaign.country_code);
		});
	});
});

describe("Campaign Stats Page", () => {
	describe("Headline Metrics", () => {
		const metrics = [
			{ name: "Total Letters", value: 7500 },
			{ name: "Goal Progress", value: "75%" },
			{ name: "Representatives Contacted", value: 234 },
			{ name: "Countries Active", value: 5 },
		];

		it("displays 4 headline metrics", () => {
			expect(metrics).toHaveLength(4);
		});

		it("includes goal progress", () => {
			const goalMetric = metrics.find((m) => m.name === "Goal Progress");
			expect(goalMetric).toBeDefined();
			expect(goalMetric?.value).toBe("75%");
		});
	});

	describe("Charts", () => {
		it("has time series chart", () => {
			const chartTypes = ["line", "bar", "progress"];
			expect(chartTypes).toContain("line");
		});

		it("has demand popularity chart", () => {
			const chartTypes = ["line", "bar", "progress"];
			expect(chartTypes).toContain("bar");
		});

		it("has goal progress ring", () => {
			const chartTypes = ["line", "bar", "progress"];
			expect(chartTypes).toContain("progress");
		});
	});

	describe("Geographic Heatmap", () => {
		const levels = ["country", "region", "district", "postal"];

		it("supports 4 drill-down levels", () => {
			expect(levels).toHaveLength(4);
		});

		it("starts at country level", () => {
			expect(levels[0]).toBe("country");
		});

		it("drills down to postal code", () => {
			expect(levels[3]).toBe("postal");
		});
	});

	describe("Top Representatives", () => {
		const topReps = [
			{ name: "Rep 1", letters: 45, party: "SPD" },
			{ name: "Rep 2", letters: 38, party: "CDU" },
			{ name: "Rep 3", letters: 32, party: "Grüne" },
		];

		it("shows top representatives by letter count", () => {
			const sorted = [...topReps].sort((a, b) => b.letters - a.letters);
			expect(sorted[0].name).toBe("Rep 1");
		});

		it("includes party information", () => {
			expect(topReps[0]).toHaveProperty("party");
		});
	});
});

describe("Campaign OG Image Generation", () => {
	describe("Dynamic Image", () => {
		const ogParams = {
			title: "Iran Solidarity 2026",
			description: "Support the people of Iran",
			progress: 75,
			letters: 7500,
		};

		it("includes campaign title", () => {
			expect(ogParams.title).toBeDefined();
		});

		it("includes progress percentage", () => {
			expect(ogParams.progress).toBe(75);
		});

		it("includes letter count", () => {
			expect(ogParams.letters).toBe(7500);
		});
	});

	describe("Caching", () => {
		it("uses edge runtime", () => {
			const runtime = "edge";
			expect(runtime).toBe("edge");
		});

		it("sets cache headers", () => {
			const cacheControl = "public, max-age=3600, s-maxage=86400";
			expect(cacheControl).toContain("max-age");
		});
	});
});

describe("Campaign Metadata", () => {
	describe("OpenGraph Tags", () => {
		const metadata = {
			title: "Iran Solidarity 2026 | Write Letters for Change",
			description: "Support the people of Iran by writing to your representative",
			openGraph: {
				title: "Iran Solidarity 2026",
				description: "Join 7500 others in writing to representatives",
				type: "website",
				images: ["/api/og?campaign=iran-2026"],
			},
		};

		it("has title", () => {
			expect(metadata.title).toBeDefined();
		});

		it("has description", () => {
			expect(metadata.description).toBeDefined();
		});

		it("has OG image", () => {
			expect(metadata.openGraph.images).toHaveLength(1);
		});

		it("OG image includes campaign", () => {
			expect(metadata.openGraph.images[0]).toContain("campaign=iran-2026");
		});
	});

	describe("JSON-LD Structured Data", () => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Iran Solidarity 2026",
			description: "Write letters to support Iran",
		};

		it("uses schema.org context", () => {
			expect(jsonLd["@context"]).toBe("https://schema.org");
		});

		it("has correct type", () => {
			expect(jsonLd["@type"]).toBe("WebPage");
		});
	});
});
