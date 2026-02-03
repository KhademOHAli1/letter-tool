"use client";

/**
 * Campaign Context Provider
 * Provides campaign data to campaign-specific routes
 * Phase 3, Epic 3.2
 */

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type {
	Campaign,
	CampaignDemand,
	CampaignStats,
	CampaignTarget,
} from "../types";

// Type for localized text helper
type GetLocalizedText = (
	text: Record<string, string>,
	fallbackLang?: string,
) => string;

interface CampaignContextType {
	/** The current campaign */
	campaign: Campaign;
	/** Campaign demands */
	demands: CampaignDemand[];
	/** Campaign targets (custom recipient list) */
	targets: CampaignTarget[];
	/** Campaign statistics (optional, may not be loaded) */
	stats?: CampaignStats;
	/** Helper to get localized text based on current language */
	getLocalizedText: GetLocalizedText;
	/** Whether this is a legacy campaign (pre-platform) */
	isLegacy: boolean;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

interface CampaignProviderProps {
	children: ReactNode;
	/** Campaign data (from server component) */
	campaign: Campaign;
	/** Campaign demands (from server component) */
	demands: CampaignDemand[];
	/** Campaign targets (from server component) */
	targets: CampaignTarget[];
	/** Optional campaign stats */
	stats?: CampaignStats;
	/** Current language for localization */
	language: string;
}

/**
 * Campaign Provider component
 * Wraps campaign routes with campaign context
 */
export function CampaignProvider({
	children,
	campaign,
	demands,
	targets,
	stats,
	language,
}: CampaignProviderProps) {
	// Create localized text helper
	const getLocalizedText: GetLocalizedText = useMemo(() => {
		return (text: Record<string, string>, fallbackLang = "en") => {
			if (!text) return "";
			// Try current language first
			if (text[language]) return text[language];
			// Try fallback language
			if (text[fallbackLang]) return text[fallbackLang];
			// Return first available value
			const values = Object.values(text);
			return values[0] ?? "";
		};
	}, [language]);

	// Determine if this is a legacy campaign
	const isLegacy = campaign.slug === "iran-2026";

	const value = useMemo(
		() => ({
			campaign,
			demands,
			targets,
			stats,
			getLocalizedText,
			isLegacy,
		}),
		[campaign, demands, targets, stats, getLocalizedText, isLegacy],
	);

	return (
		<CampaignContext.Provider value={value}>
			{children}
		</CampaignContext.Provider>
	);
}

/**
 * Hook to access campaign context
 * @throws Error if used outside CampaignProvider
 */
export function useCampaign(): CampaignContextType {
	const context = useContext(CampaignContext);
	if (!context) {
		throw new Error("useCampaign must be used within a CampaignProvider");
	}
	return context;
}

/**
 * Hook to optionally access campaign context
 * Returns null if not within a CampaignProvider (for backward compat)
 */
export function useCampaignOptional(): CampaignContextType | null {
	return useContext(CampaignContext);
}

/**
 * Standalone utility to get localized text from a multilingual record.
 * For use outside of CampaignProvider (e.g., server components)
 */
export function getLocalizedText(
	text: Record<string, string> | null | undefined,
	lang = "en",
	fallbackLang = "en",
): string {
	if (!text) return "";
	// Try requested language first
	if (text[lang]) return text[lang];
	// Try fallback language
	if (text[fallbackLang]) return text[fallbackLang];
	// Return first available value
	const values = Object.values(text);
	return values[0] ?? "";
}

// Re-export types for convenience
export type { Campaign, CampaignDemand } from "../types";
