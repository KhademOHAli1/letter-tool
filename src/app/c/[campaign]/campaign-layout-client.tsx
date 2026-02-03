"use client";

/**
 * Client-side wrapper for campaign layout
 * Provides language and campaign context
 * Phase 3, Epic 3.1
 */

import type { ReactNode } from "react";
import { CampaignProvider } from "@/lib/campaigns/context";
import { type Language, LanguageProvider } from "@/lib/i18n/context";
import type {
	Campaign,
	CampaignDemand,
	CampaignStats,
	CampaignTarget,
} from "@/lib/types";

interface CampaignLayoutClientProps {
	children: ReactNode;
	campaign: Campaign;
	demands: CampaignDemand[];
	targets: CampaignTarget[];
	stats?: CampaignStats;
	defaultLanguage: Language;
	availableLanguages: Language[];
	currentLanguage: Language;
}

export function CampaignLayoutClient({
	children,
	campaign,
	demands,
	targets,
	stats,
	defaultLanguage,
	availableLanguages,
	currentLanguage,
}: CampaignLayoutClientProps) {
	return (
		<LanguageProvider
			initialLanguage={defaultLanguage}
			availableLanguages={availableLanguages}
		>
			<CampaignProvider
				campaign={campaign}
				demands={demands}
				targets={targets}
				stats={stats}
				language={currentLanguage}
			>
				{children}
			</CampaignProvider>
		</LanguageProvider>
	);
}
