/**
 * Prompt builder module
 * Builds dynamic LLM prompts from templates with variable substitution
 * Phase 2, Epic 2.2, Task 2.2.1
 */
import type { CampaignDemand, MultiLangText } from "../types";

/**
 * Template variables that can be used in campaign prompts
 */
export interface PromptVariables {
	/** Campaign name in the target language */
	campaignName: string;
	/** Campaign description in the target language */
	campaignDescription: string;
	/** Background context about the cause */
	causeContext: string;
	/** Formatted list of demands */
	demands: string;
	/** Formatted list of selected demands */
	selectedDemands: string;
	/** Country name */
	countryName: string;
	/** Language name */
	languageName: string;
	/** Representative title (e.g., "Member of Parliament", "Representative") */
	representativeTitle: string;
	/** Current date */
	currentDate: string;
}

/**
 * Get text for a specific language from MultiLangText, with fallback
 */
export function getLocalizedText(
	text: MultiLangText,
	language: string,
	fallbackLanguage = "en",
): string {
	return (
		text[language] || text[fallbackLanguage] || Object.values(text)[0] || ""
	);
}

/**
 * Format demands into a numbered list for prompt injection
 */
export function formatDemandsForPrompt(
	demands: CampaignDemand[],
	language: string,
	options: { includeDescription?: boolean; onlyIncomplete?: boolean } = {},
): string {
	const { includeDescription = false, onlyIncomplete = true } = options;

	const filteredDemands = onlyIncomplete
		? demands.filter((d) => !d.completed)
		: demands;

	return filteredDemands
		.map((demand, index) => {
			const title = getLocalizedText(demand.title, language);
			const briefText = getLocalizedText(demand.briefText, language);

			if (includeDescription) {
				const description = getLocalizedText(demand.description, language);
				return `${index + 1}. ${title}\n   ${description}\n   Brief: ${briefText}`;
			}

			return `${index + 1}. ${title} - ${briefText}`;
		})
		.join("\n");
}

/**
 * Format selected demands for prompt injection (subset of all demands)
 */
export function formatSelectedDemands(
	demands: CampaignDemand[],
	selectedIds: string[],
	language: string,
): string {
	const selectedDemands = demands.filter((d) => selectedIds.includes(d.id));
	return formatDemandsForPrompt(selectedDemands, language, {
		includeDescription: false,
		onlyIncomplete: false,
	});
}

/**
 * Country code to full name mapping
 */
const COUNTRY_NAMES: Record<string, Record<string, string>> = {
	de: { en: "Germany", de: "Deutschland", fr: "Allemagne" },
	ca: { en: "Canada", fr: "Canada" },
	uk: { en: "United Kingdom" },
	us: { en: "United States" },
	fr: { en: "France", fr: "France", de: "Frankreich" },
};

/**
 * Get country name in the specified language
 */
export function getCountryName(countryCode: string, language: string): string {
	const names = COUNTRY_NAMES[countryCode] || {};
	return names[language] || names.en || countryCode.toUpperCase();
}

/**
 * Representative titles by country
 */
const REPRESENTATIVE_TITLES: Record<string, Record<string, string>> = {
	de: {
		en: "Member of the Bundestag",
		de: "Mitglied des Bundestages (MdB)",
	},
	ca: {
		en: "Member of Parliament",
		fr: "Député(e)",
	},
	uk: {
		en: "Member of Parliament",
	},
	us: {
		en: "Representative",
	},
	fr: {
		en: "Member of the National Assembly",
		fr: "Député(e)",
	},
};

/**
 * Get representative title for a country in the specified language
 */
export function getRepresentativeTitle(
	countryCode: string,
	language: string,
): string {
	const titles = REPRESENTATIVE_TITLES[countryCode] || {};
	return titles[language] || titles.en || "Representative";
}

/**
 * Language code to full name mapping
 */
export const LANGUAGE_NAMES: Record<string, string> = {
	en: "English",
	de: "German",
	fr: "French",
	es: "Spanish",
	fa: "Farsi",
};

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
	return LANGUAGE_NAMES[code] || code;
}

/**
 * Build a complete prompt by replacing template variables
 *
 * Template variables are in the format: {{variable_name}}
 *
 * Available variables:
 * - {{campaign_name}} - Campaign name in target language
 * - {{campaign_description}} - Campaign description
 * - {{cause_context}} - Background context about the cause
 * - {{demands}} - All incomplete demands as numbered list
 * - {{selected_demands}} - User-selected demands as numbered list
 * - {{country_name}} - Full country name
 * - {{language_name}} - Target language name
 * - {{representative_title}} - Title for political representative
 * - {{current_date}} - Current date in ISO format
 */
export function buildPrompt(
	template: string,
	variables: PromptVariables,
): string {
	const replacements: Record<string, string> = {
		"{{campaign_name}}": variables.campaignName,
		"{{campaign_description}}": variables.campaignDescription,
		"{{cause_context}}": variables.causeContext,
		"{{demands}}": variables.demands,
		"{{selected_demands}}": variables.selectedDemands,
		"{{country_name}}": variables.countryName,
		"{{language_name}}": variables.languageName,
		"{{representative_title}}": variables.representativeTitle,
		"{{current_date}}": variables.currentDate,
	};

	let result = template;
	for (const [placeholder, value] of Object.entries(replacements)) {
		result = result.replaceAll(placeholder, value);
	}

	return result;
}

/**
 * Create prompt variables from campaign data
 */
export function createPromptVariables(
	campaign: {
		name: MultiLangText;
		description: MultiLangText;
		causeContext: string | null;
	},
	demands: CampaignDemand[],
	selectedDemandIds: string[],
	countryCode: string,
	language: string,
): PromptVariables {
	return {
		campaignName: getLocalizedText(campaign.name, language),
		campaignDescription: getLocalizedText(campaign.description, language),
		causeContext: campaign.causeContext || "",
		demands: formatDemandsForPrompt(demands, language),
		selectedDemands: formatSelectedDemands(
			demands,
			selectedDemandIds,
			language,
		),
		countryName: getCountryName(countryCode, language),
		languageName: LANGUAGE_NAMES[language] || language,
		representativeTitle: getRepresentativeTitle(countryCode, language),
		currentDate: new Date().toISOString().split("T")[0],
	};
}

/**
 * Validate that a template has all required variables
 */
export function validateTemplate(template: string): {
	valid: boolean;
	missingVariables: string[];
	warnings: string[];
} {
	const requiredVariables = [
		"{{cause_context}}",
		"{{demands}}",
		"{{selected_demands}}",
	];

	const optionalVariables = [
		"{{campaign_name}}",
		"{{campaign_description}}",
		"{{country_name}}",
		"{{language_name}}",
		"{{representative_title}}",
		"{{current_date}}",
	];

	const missingVariables = requiredVariables.filter(
		(v) => !template.includes(v),
	);

	const warnings: string[] = [];
	for (const v of optionalVariables) {
		if (!template.includes(v)) {
			warnings.push(`Optional variable ${v} not used in template`);
		}
	}

	return {
		valid: missingVariables.length === 0,
		missingVariables,
		warnings,
	};
}

/**
 * Default prompt template that can be used as a starting point
 */
export const DEFAULT_PROMPT_TEMPLATE = `You are an expert advocacy letter writer helping citizens compose personal letters to their {{representative_title}} about {{campaign_name}}.

## Campaign Context
{{cause_context}}

## Political Demands
The campaign is advocating for the following demands:
{{demands}}

## User's Selected Focus
The letter should emphasize these demands:
{{selected_demands}}

## Instructions
1. Write a personal, compelling letter in {{language_name}}
2. Use the Public Narrative framework (Story of Self, Story of Us, Story of Now)
3. Keep the letter between 300-500 words
4. Be factual and avoid unverified claims
5. Be respectful but firm
6. Include a clear call to action

## Output Format
Return ONLY the letter content, no additional commentary.
`;
