/**
 * Unit tests for prompt builder module
 * Phase 10, Epic 10.2, Task 10.2.1
 *
 * Tests prompt variable substitution and text formatting
 */
import { describe, expect, it } from "vitest";
import {
	buildPrompt,
	formatDemandsForPrompt,
	formatSelectedDemands,
	getCountryName,
	getLanguageName,
	getLocalizedText,
	getRepresentativeTitle,
	validateTemplate,
} from "@/lib/campaigns/prompt-builder";
import type { CampaignDemand } from "@/lib/types";

describe("getLocalizedText", () => {
	it("returns text for requested language", () => {
		const text = { en: "Hello", de: "Hallo", fr: "Bonjour" };
		expect(getLocalizedText(text, "en")).toBe("Hello");
		expect(getLocalizedText(text, "de")).toBe("Hallo");
		expect(getLocalizedText(text, "fr")).toBe("Bonjour");
	});

	it("falls back to English when language not found", () => {
		const text = { en: "Hello", de: "Hallo" };
		expect(getLocalizedText(text, "fr")).toBe("Hello");
	});

	it("falls back to first available when English not found", () => {
		const text = { de: "Hallo", fr: "Bonjour" };
		expect(getLocalizedText(text, "es")).toBe("Hallo");
	});

	it("returns empty string for empty object", () => {
		expect(getLocalizedText({}, "en")).toBe("");
	});

	it("uses custom fallback language", () => {
		const text = { de: "Hallo", fr: "Bonjour" };
		expect(getLocalizedText(text, "es", "fr")).toBe("Bonjour");
	});
});

describe("getCountryName", () => {
	it("returns localized country names", () => {
		expect(getCountryName("de", "en")).toBe("Germany");
		expect(getCountryName("de", "de")).toBe("Deutschland");
		expect(getCountryName("fr", "fr")).toBe("France");
	});

	it("falls back to English for unknown language", () => {
		expect(getCountryName("uk", "de")).toBe("United Kingdom");
	});

	it("returns uppercase code for unknown country", () => {
		expect(getCountryName("xx", "en")).toBe("XX");
	});
});

describe("getRepresentativeTitle", () => {
	it("returns localized representative titles", () => {
		expect(getRepresentativeTitle("de", "en")).toBe("Member of the Bundestag");
		expect(getRepresentativeTitle("de", "de")).toBe(
			"Mitglied des Bundestages (MdB)",
		);
		expect(getRepresentativeTitle("ca", "fr")).toBe("Député(e)");
	});

	it("falls back to English for unknown language", () => {
		expect(getRepresentativeTitle("uk", "de")).toBe("Member of Parliament");
	});

	it("returns default for unknown country", () => {
		expect(getRepresentativeTitle("xx", "en")).toBe("Representative");
	});
});

describe("getLanguageName", () => {
	it("returns language names", () => {
		expect(getLanguageName("en")).toBe("English");
		expect(getLanguageName("de")).toBe("German");
		expect(getLanguageName("fr")).toBe("French");
		expect(getLanguageName("es")).toBe("Spanish");
		expect(getLanguageName("fa")).toBe("Farsi");
	});

	it("returns code for unknown language", () => {
		expect(getLanguageName("xx")).toBe("xx");
	});
});

describe("formatDemandsForPrompt", () => {
	const mockDemands: CampaignDemand[] = [
		{
			id: "1",
			campaignId: "c1",
			title: { en: "First Demand", de: "Erste Forderung" },
			description: { en: "Description 1", de: "Beschreibung 1" },
			briefText: { en: "Brief 1", de: "Kurz 1" },
			sortOrder: 0,
			completed: false,
			completedDate: null,
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
		},
		{
			id: "2",
			campaignId: "c1",
			title: { en: "Second Demand", de: "Zweite Forderung" },
			description: { en: "Description 2", de: "Beschreibung 2" },
			briefText: { en: "Brief 2", de: "Kurz 2" },
			sortOrder: 1,
			completed: true,
			completedDate: "2026-01-15T00:00:00Z",
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-15T00:00:00Z",
		},
		{
			id: "3",
			campaignId: "c1",
			title: { en: "Third Demand", de: "Dritte Forderung" },
			description: { en: "Description 3", de: "Beschreibung 3" },
			briefText: { en: "Brief 3", de: "Kurz 3" },
			sortOrder: 2,
			completed: false,
			completedDate: null,
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
		},
	];

	it("formats demands in English", () => {
		const result = formatDemandsForPrompt(mockDemands, "en");
		expect(result).toContain("First Demand");
		expect(result).toContain("Brief 1");
	});

	it("formats demands in German", () => {
		const result = formatDemandsForPrompt(mockDemands, "de");
		expect(result).toContain("Erste Forderung");
		expect(result).toContain("Kurz 1");
	});

	it("filters out completed demands by default", () => {
		const result = formatDemandsForPrompt(mockDemands, "en");
		expect(result).not.toContain("Second Demand");
		expect(result).toContain("First Demand");
		expect(result).toContain("Third Demand");
	});

	it("includes completed demands when onlyIncomplete is false", () => {
		const result = formatDemandsForPrompt(mockDemands, "en", {
			onlyIncomplete: false,
		});
		expect(result).toContain("Second Demand");
	});

	it("includes descriptions when requested", () => {
		const result = formatDemandsForPrompt(mockDemands, "en", {
			includeDescription: true,
		});
		expect(result).toContain("Description 1");
	});

	it("numbers demands correctly", () => {
		const result = formatDemandsForPrompt(mockDemands, "en");
		expect(result).toMatch(/^1\./);
		expect(result).toContain("2.");
	});
});

describe("formatSelectedDemands", () => {
	const mockDemands: CampaignDemand[] = [
		{
			id: "demand-1",
			campaignId: "c1",
			title: { en: "Demand A" },
			description: { en: "Desc A" },
			briefText: { en: "Brief A" },
			sortOrder: 0,
			completed: false,
			completedDate: null,
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
		},
		{
			id: "demand-2",
			campaignId: "c1",
			title: { en: "Demand B" },
			description: { en: "Desc B" },
			briefText: { en: "Brief B" },
			sortOrder: 1,
			completed: false,
			completedDate: null,
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
		},
		{
			id: "demand-3",
			campaignId: "c1",
			title: { en: "Demand C" },
			description: { en: "Desc C" },
			briefText: { en: "Brief C" },
			sortOrder: 2,
			completed: false,
			completedDate: null,
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
		},
	];

	it("only includes selected demands", () => {
		const result = formatSelectedDemands(
			mockDemands,
			["demand-1", "demand-3"],
			"en",
		);
		expect(result).toContain("Demand A");
		expect(result).toContain("Demand C");
		expect(result).not.toContain("Demand B");
	});

	it("handles empty selection", () => {
		const result = formatSelectedDemands(mockDemands, [], "en");
		expect(result).toBe("");
	});

	it("handles non-existent demand IDs", () => {
		const result = formatSelectedDemands(
			mockDemands,
			["non-existent", "demand-1"],
			"en",
		);
		expect(result).toContain("Demand A");
		expect(result.split("\n").length).toBe(1);
	});
});

describe("buildPrompt", () => {
	const mockVariables = {
		campaignName: "Test Campaign",
		campaignDescription: "A campaign for testing",
		causeContext: "Context about the cause",
		demands: "1. First demand\n2. Second demand",
		selectedDemands: "1. Selected demand",
		countryName: "Germany",
		languageName: "German",
		representativeTitle: "Member of the Bundestag",
		currentDate: "2026-01-30",
	};

	it("replaces all template variables", () => {
		const template =
			"Campaign: {{campaign_name}}\nCountry: {{country_name}}\nDemands:\n{{demands}}";
		const result = buildPrompt(template, mockVariables);

		expect(result).toContain("Campaign: Test Campaign");
		expect(result).toContain("Country: Germany");
		expect(result).toContain("1. First demand");
	});

	it("replaces multiple occurrences of same variable", () => {
		const template = "{{campaign_name}} - {{campaign_name}}";
		const result = buildPrompt(template, mockVariables);

		expect(result).toBe("Test Campaign - Test Campaign");
	});

	it("preserves unmatched text", () => {
		const template = "Prefix {{campaign_name}} Suffix";
		const result = buildPrompt(template, mockVariables);

		expect(result).toBe("Prefix Test Campaign Suffix");
	});

	it("handles templates with no variables", () => {
		const template = "Static content without variables";
		const result = buildPrompt(template, mockVariables);

		expect(result).toBe("Static content without variables");
	});

	it("handles all supported variables", () => {
		const template = `
Name: {{campaign_name}}
Desc: {{campaign_description}}
Context: {{cause_context}}
Country: {{country_name}}
Lang: {{language_name}}
Rep: {{representative_title}}
Date: {{current_date}}
Demands: {{demands}}
Selected: {{selected_demands}}
`.trim();

		const result = buildPrompt(template, mockVariables);

		expect(result).toContain("Name: Test Campaign");
		expect(result).toContain("Desc: A campaign for testing");
		expect(result).toContain("Context: Context about the cause");
		expect(result).toContain("Country: Germany");
		expect(result).toContain("Lang: German");
		expect(result).toContain("Rep: Member of the Bundestag");
		expect(result).toContain("Date: 2026-01-30");
		expect(result).toContain("1. First demand");
		expect(result).toContain("Selected: 1. Selected demand");
	});
});

describe("validateTemplate", () => {
	it("validates template with all required variables", () => {
		const template = `
You are helping write letters about {{campaign_name}}.
Context: {{cause_context}}
Demands: {{demands}}
Selected: {{selected_demands}}
`;
		const result = validateTemplate(template);
		expect(result.valid).toBe(true);
		expect(result.missingVariables).toEqual([]);
	});

	it("identifies missing required variables", () => {
		const template = "Simple template with {{campaign_name}} only";
		const result = validateTemplate(template);
		expect(result.valid).toBe(false);
		// missingVariables contains the full placeholder syntax
		expect(result.missingVariables).toContain("{{cause_context}}");
		expect(result.missingVariables).toContain("{{demands}}");
		expect(result.missingVariables).toContain("{{selected_demands}}");
	});

	it("returns warnings for missing optional variables", () => {
		const template =
			"{{cause_context}} {{demands}} {{selected_demands}}";
		const result = validateTemplate(template);
		expect(result.valid).toBe(true);
		expect(result.warnings.length).toBeGreaterThan(0);
	});
});
