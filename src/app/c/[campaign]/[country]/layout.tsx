import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getCampaignWithDemands } from "@/lib/campaigns";
import { getCountryConfig, isValidCountry } from "@/lib/country-config";
import { clientEnv } from "@/lib/env";
import type { Language } from "@/lib/i18n/translations";
import { CountryLayoutClient } from "./country-layout-client";

interface CountryLayoutProps {
	children: React.ReactNode;
	params: Promise<{ campaign: string; country: string }>;
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
 * Generate metadata for campaign country pages
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ campaign: string; country: string }>;
}): Promise<Metadata> {
	const { campaign: campaignSlug, country } = await params;

	// Validate country
	if (!isValidCountry(country)) {
		return { title: "Country Not Found" };
	}

	const campaignData = await getCampaignWithDemands(campaignSlug);
	if (!campaignData) {
		return { title: "Campaign Not Found" };
	}

	const countryConfig = getCountryConfig(
		country as "de" | "ca" | "uk" | "fr" | "us",
	);

	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as Language | undefined;

	// Determine effective language
	const defaultLang = DEFAULT_LANG[country] ?? "en";
	const availableLangs = COUNTRY_LANGUAGES[country] ?? ["en"];
	const lang =
		langCookie && availableLangs.includes(langCookie)
			? langCookie
			: defaultLang;

	// Get localized campaign name
	const campaignName =
		campaignData.name[lang] ??
		campaignData.name.en ??
		Object.values(campaignData.name)[0];
	const countryName =
		countryConfig?.name[lang === "de" ? "native" : "en"] ??
		country.toUpperCase();

	const title = `${campaignName} | ${countryName}`;
	const description =
		campaignData.description[lang] ??
		campaignData.description.en ??
		Object.values(campaignData.description)[0];

	const baseUrl = clientEnv.NEXT_PUBLIC_BASE_URL;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			url: `${baseUrl}/c/${campaignSlug}/${country}`,
			images: [
				{
					url: `/api/og?campaign=${campaignSlug}&country=${country}&lang=${lang}`,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [
				{
					url: `/api/og?campaign=${campaignSlug}&country=${country}&lang=${lang}`,
					alt: title,
				},
			],
		},
	};
}

/**
 * Server layout for /c/[campaign]/[country] routes
 * Validates country and provides country-specific context
 */
export default async function CountryLayout({
	children,
	params,
}: CountryLayoutProps) {
	const { campaign: campaignSlug, country } = await params;

	// Validate country code
	if (!isValidCountry(country)) {
		notFound();
	}

	// Verify country is part of campaign
	const campaignData = await getCampaignWithDemands(campaignSlug);
	if (!campaignData) {
		notFound();
	}

	if (!campaignData.countryCodes.includes(country)) {
		notFound();
	}

	// Get country config
	const countryConfig = getCountryConfig(
		country as "de" | "ca" | "uk" | "fr" | "us",
	);
	if (!countryConfig || !countryConfig.isReady) {
		notFound();
	}

	// Get language settings from cookie
	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as Language | undefined;

	const defaultLanguage = DEFAULT_LANG[country] ?? "en";
	const availableLanguages = COUNTRY_LANGUAGES[country] ?? ["en"];
	const language =
		langCookie && availableLanguages.includes(langCookie)
			? langCookie
			: defaultLanguage;

	return (
		<CountryLayoutClient
			country={country}
			defaultLanguage={defaultLanguage}
			availableLanguages={availableLanguages}
			currentLanguage={language}
		>
			{children}
		</CountryLayoutClient>
	);
}
