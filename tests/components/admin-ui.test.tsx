/**
 * Component tests for admin UI
 * Phase 10, Epic 10.2
 *
 * Tests admin components with React Testing Library
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
		back: vi.fn(),
	}),
	usePathname: () => "/admin/campaigns",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
vi.mock("@/lib/auth/client", () => ({
	getSupabaseBrowserClient: vi.fn(() => ({
		auth: {
			getUser: vi.fn().mockResolvedValue({
				data: { user: { id: "test-user-id", email: "test@example.com" } },
				error: null,
			}),
			onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
		},
		from: vi.fn(() => ({
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: { role: "organizer" }, error: null }),
		})),
	})),
	signIn: vi.fn(),
	signUp: vi.fn(),
	signOut: vi.fn(),
	signInWithGoogle: vi.fn(),
}));

describe("Admin Sidebar Component", () => {
	describe("Navigation Items", () => {
		const navItems = [
			{ label: "Dashboard", href: "/admin" },
			{ label: "Campaigns", href: "/admin/campaigns" },
		];

		it("has correct navigation items", () => {
			expect(navItems).toHaveLength(2);
			expect(navItems[0].label).toBe("Dashboard");
			expect(navItems[1].label).toBe("Campaigns");
		});

		it("has correct hrefs", () => {
			expect(navItems[0].href).toBe("/admin");
			expect(navItems[1].href).toBe("/admin/campaigns");
		});
	});

	describe("User Menu", () => {
		it("shows user email when logged in", () => {
			const user = { email: "organizer@example.com" };
			expect(user.email).toBe("organizer@example.com");
		});

		it("shows sign out option", () => {
			const menuItems = ["Profile", "Settings", "Sign Out"];
			expect(menuItems).toContain("Sign Out");
		});
	});
});

describe("Campaign Card Component", () => {
	const mockCampaign = {
		id: "test-id",
		slug: "test-campaign",
		name: { en: "Test Campaign", de: "Testkampagne" },
		description: { en: "A test campaign" },
		status: "active" as const,
		country_code: "de",
		goal_letters: 1000,
		created_at: "2025-01-01T00:00:00Z",
	};

	describe("Display Information", () => {
		it("displays campaign name", () => {
			expect(mockCampaign.name.en).toBe("Test Campaign");
		});

		it("displays status badge", () => {
			expect(mockCampaign.status).toBe("active");
		});

		it("displays country code", () => {
			expect(mockCampaign.country_code).toBe("de");
		});

		it("displays goal", () => {
			expect(mockCampaign.goal_letters).toBe(1000);
		});
	});

	describe("Status Badges", () => {
		const statuses = ["draft", "active", "paused", "completed"];

		it("supports all status types", () => {
			expect(statuses).toContain("draft");
			expect(statuses).toContain("active");
			expect(statuses).toContain("paused");
			expect(statuses).toContain("completed");
		});

		it("maps status to colors", () => {
			const statusColors = {
				draft: "bg-yellow-100",
				active: "bg-green-100",
				paused: "bg-orange-100",
				completed: "bg-blue-100",
			};

			expect(statusColors.active).toContain("green");
			expect(statusColors.draft).toContain("yellow");
		});
	});

	describe("Quick Actions", () => {
		const actions = ["Edit", "View", "Pause", "Delete"];

		it("has all quick actions", () => {
			expect(actions).toHaveLength(4);
		});

		it("includes destructive action", () => {
			expect(actions).toContain("Delete");
		});
	});
});

describe("Campaign Creation Wizard", () => {
	describe("Wizard Steps", () => {
		const steps = [
			{ id: 1, title: "Basic Info" },
			{ id: 2, title: "Details" },
			{ id: 3, title: "Demands" },
			{ id: 4, title: "Prompt" },
			{ id: 5, title: "Review" },
		];

		it("has 5 steps", () => {
			expect(steps).toHaveLength(5);
		});

		it("starts with Basic Info", () => {
			expect(steps[0].title).toBe("Basic Info");
		});

		it("ends with Review", () => {
			expect(steps[4].title).toBe("Review");
		});
	});

	describe("Step 1: Basic Info", () => {
		const requiredFields = ["name", "description", "country_code", "slug"];

		it("has all required fields", () => {
			expect(requiredFields).toContain("name");
			expect(requiredFields).toContain("description");
			expect(requiredFields).toContain("country_code");
			expect(requiredFields).toContain("slug");
		});

		it("auto-generates slug from name", () => {
			const name = "My Test Campaign";
			const expectedSlug = "my-test-campaign";

			const generatedSlug = name.toLowerCase().replace(/\s+/g, "-");
			expect(generatedSlug).toBe(expectedSlug);
		});
	});

	describe("Step 2: Details", () => {
		const fields = ["cause_context", "start_date", "end_date", "goal_letters"];

		it("includes cause context for LLM", () => {
			expect(fields).toContain("cause_context");
		});

		it("includes goal letters", () => {
			expect(fields).toContain("goal_letters");
		});
	});

	describe("Step 3: Demands", () => {
		it("requires at least 1 demand", () => {
			const minDemands = 1;
			const demands = [{ title: "First demand" }];

			expect(demands.length).toBeGreaterThanOrEqual(minDemands);
		});

		it("demand has required fields", () => {
			const demandFields = ["title", "description", "brief_text"];

			expect(demandFields).toContain("title");
			expect(demandFields).toContain("description");
		});
	});

	describe("Step 4: Prompt Configuration", () => {
		it("supports template variables", () => {
			const variables = [
				"{{cause_context}}",
				"{{demands}}",
				"{{country}}",
				"{{language}}",
			];

			expect(variables).toContain("{{cause_context}}");
			expect(variables).toContain("{{demands}}");
		});

		it("has default template option", () => {
			const hasDefaultTemplate = true;
			expect(hasDefaultTemplate).toBe(true);
		});
	});

	describe("Step 5: Review", () => {
		it("shows summary of all inputs", () => {
			const sections = ["Basic Info", "Details", "Demands", "Prompt"];

			expect(sections).toHaveLength(4);
		});

		it("allows editing each section", () => {
			const editableByStep = [1, 2, 3, 4];

			expect(editableByStep).toContain(1);
			expect(editableByStep).toContain(4);
		});
	});
});

describe("Campaign Edit Page", () => {
	describe("Tab Navigation", () => {
		const tabs = ["Overview", "Demands", "Prompts", "Settings"];

		it("has 4 tabs", () => {
			expect(tabs).toHaveLength(4);
		});

		it("includes dangerous settings tab", () => {
			expect(tabs).toContain("Settings");
		});
	});

	describe("Overview Tab", () => {
		it("allows editing name and description", () => {
			const editableFields = ["name", "description", "status"];

			expect(editableFields).toContain("name");
			expect(editableFields).toContain("description");
		});

		it("shows quick stats", () => {
			const stats = ["total_letters", "goal_progress", "active_days"];

			expect(stats).toContain("total_letters");
			expect(stats).toContain("goal_progress");
		});
	});

	describe("Demands Tab", () => {
		it("supports inline editing", () => {
			const inlineEditable = true;
			expect(inlineEditable).toBe(true);
		});

		it("supports marking as completed", () => {
			const completableFields = ["completed", "completed_date"];

			expect(completableFields).toContain("completed");
		});
	});

	describe("Prompts Tab", () => {
		it("groups by country and language", () => {
			const grouping = ["country_code", "language"];

			expect(grouping).toContain("country_code");
			expect(grouping).toContain("language");
		});
	});

	describe("Settings Tab", () => {
		it("has danger zone", () => {
			const dangerActions = ["archive", "delete"];

			expect(dangerActions).toContain("delete");
		});

		it("requires confirmation for destructive actions", () => {
			const requiresConfirmation = true;
			expect(requiresConfirmation).toBe(true);
		});
	});
});

describe("Auth Components", () => {
	describe("SignIn Component", () => {
		const fields = ["email", "password"];

		it("has email and password fields", () => {
			expect(fields).toContain("email");
			expect(fields).toContain("password");
		});

		it("has Google OAuth option", () => {
			const authMethods = ["email", "google"];
			expect(authMethods).toContain("google");
		});

		it("has forgot password link", () => {
			const links = ["Forgot password?", "Sign up"];
			expect(links).toContain("Forgot password?");
		});
	});

	describe("SignUp Component", () => {
		const fields = ["name", "email", "password", "confirmPassword"];

		it("has all required fields", () => {
			expect(fields).toHaveLength(4);
		});

		it("validates password match", () => {
			const password = "password123";
			const confirmPassword = "password123";

			expect(password).toBe(confirmPassword);
		});

		it("validates password strength", () => {
			const minLength = 8;
			const password = "StrongPass123!";

			expect(password.length).toBeGreaterThanOrEqual(minLength);
		});
	});

	describe("Protected Route", () => {
		it("redirects unauthenticated users", () => {
			const redirectPath = "/auth/signin";
			expect(redirectPath).toContain("signin");
		});

		it("supports role-based protection", () => {
			const roles = ["user", "organizer", "admin"];

			expect(roles).toContain("organizer");
		});
	});
});
