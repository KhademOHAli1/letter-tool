import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getCampaignStats, getCampaignWithDemands } from "@/lib/campaigns";
import type { Language } from "@/lib/i18n/translations";
import type { CampaignStats } from "@/lib/types";
import { CampaignLayoutClient } from "./campaign-layout-client";

interface CampaignLayoutProps {
	children: React.ReactNode;
	params: Promise<{ campaign: string }>;
}

// Country-specific language configurations
const COUNTRY_LANGUAGES: Record<string, Language[]> = {
	de: ["de", "en"],
	ca: ["en", "fr"],
	uk: ["en"],
	fr: ["fr", "en"],
	us: ["en"],
};

// Default language per country
const DEFAULT_LANG: Record<string, Language> = {
	de: "de",
	ca: "en",
	uk: "en",
	fr: "fr",
	us: "en",
};

/**
 * Get default language for a campaign based on its primary country
 */
function getCampaignDefaultLanguage(countryCodes: string[]): Language {
	// Use first country's default language
	const primaryCountry = countryCodes[0] ?? "de";
	return DEFAULT_LANG[primaryCountry] ?? "en";
}

/**
 * Get available languages for a campaign based on its countries
 */
function getCampaignAvailableLanguages(countryCodes: string[]): Language[] {
	const languages = new Set<Language>();
	for (const country of countryCodes) {
		const countryLangs = COUNTRY_LANGUAGES[country] ?? ["en"];
		for (const lang of countryLangs) {
			languages.add(lang);
		}
	}
	return Array.from(languages);
}

/**
 * Generate metadata for campaign pages
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ campaign: string }>;
}): Promise<Metadata> {
	const { campaign: campaignSlug } = await params;
	const campaignData = await getCampaignWithDemands(campaignSlug);

	if (!campaignData) {
		return {
			title: "Campaign Not Found",
		};
	}

	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as Language | undefined;

	// Determine effective language
	const defaultLang = getCampaignDefaultLanguage(campaignData.countryCodes);
	const availableLangs = getCampaignAvailableLanguages(
		campaignData.countryCodes,
	);
	const lang =
		langCookie && availableLangs.includes(langCookie)
			? langCookie
			: defaultLang;

	// Get localized name and description
	const name =
		campaignData.name[lang] ??
		campaignData.name.en ??
		Object.values(campaignData.name)[0];
	const description =
		campaignData.description[lang] ??
		campaignData.description.en ??
		Object.values(campaignData.description)[0];

	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ?? "https://stimme-fuer-iran.de";

	return {
		title: name,
		description,
		openGraph: {
			title: name,
			description,
			type: "website",
			url: `${baseUrl}/c/${campaignSlug}`,
			images: [
				{
					url: `/api/og?campaign=${campaignSlug}&lang=${lang}`,
					width: 1200,
					height: 630,
					alt: name,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: name,
			description,
		},
	};
}

/**
 * Server layout for /c/[campaign] routes
 * Fetches campaign data and provides it to client components
 */
export default async function CampaignLayout({
	children,
	params,
}: CampaignLayoutProps) {
	const { campaign: campaignSlug } = await params;

	// Fetch campaign with demands
	const campaignData = await getCampaignWithDemands(campaignSlug);

	if (!campaignData) {
		notFound();
	}

	// Extract demands from the result
	const { demands, ...campaign } = campaignData;

	// Only show active campaigns (or allow preview with special param)
	if (campaign.status !== "active" && campaign.status !== "draft") {
		notFound();
	}

	// Fetch stats (optional, don't fail if unavailable)
	let stats: CampaignStats | null | undefined;
	try {
		stats = await getCampaignStats(campaign.id);
	} catch (e) {
		console.warn("Failed to fetch campaign stats:", e);
	}

	// Get language settings from cookie
	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as Language | undefined;

	const defaultLanguage = getCampaignDefaultLanguage(campaign.countryCodes);
	const availableLanguages = getCampaignAvailableLanguages(
		campaign.countryCodes,
	);
	const language =
		langCookie && availableLanguages.includes(langCookie)
			? langCookie
			: defaultLanguage;

	return (
		<>
			{/* JSON-LD structured data for SEO */}
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined for SEO.
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name:
							campaign.name[language] ||
							campaign.name.en ||
							Object.values(campaign.name)[0],
						description:
							campaign.description?.[language] ||
							campaign.description?.en ||
							(campaign.description
								? Object.values(campaign.description)[0]
								: ""),
						url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://stimme-fuer-iran.de"}/c/${campaignSlug}`,
						mainEntity: {
							"@type": "Campaign",
							name:
								campaign.name[language] ||
								campaign.name.en ||
								Object.values(campaign.name)[0],
							description:
								campaign.description?.[language] ||
								campaign.description?.en ||
								(campaign.description
									? Object.values(campaign.description)[0]
									: ""),
							...(campaign.goalLetters && {
								target: {
									"@type": "EntryPoint",
									description: `Goal: ${campaign.goalLetters} letters`,
								},
							}),
						},
						potentialAction: {
							"@type": "WriteAction",
							name: "Write a letter",
							target: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://stimme-fuer-iran.de"}/c/${campaignSlug}/${campaign.countryCodes[0]}/editor`,
						},
					}),
				}}
			/>
			<CampaignLayoutClient
				campaign={campaign}
				demands={demands}
				stats={stats ?? undefined}
				defaultLanguage={defaultLanguage}
				availableLanguages={availableLanguages}
				currentLanguage={language}
			>
				{children}
			</CampaignLayoutClient>
		</>
	);
}
