import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isValidCountry } from "@/lib/country-config";
import { clientEnv } from "@/lib/env";
import { CountryLanguageWrapper } from "./country-language-init";

interface CountryLayoutProps {
	children: React.ReactNode;
	params: Promise<{ country: string }>;
}

// Country-specific language configurations
const COUNTRY_LANGUAGES: Record<string, ("de" | "en" | "fr")[]> = {
	de: ["de", "en"],
	ca: ["en", "fr"],
	uk: ["en"],
	fr: ["fr", "en"],
	us: ["en"],
};

// SEO content per country and language
const SEO_CONTENT = {
	de: {
		de: {
			title: "Stimme für Iran",
			description:
				"Setze dich für Menschenrechte im Iran ein. Schreibe einen persönlichen Brief an deinen Bundestagsabgeordneten – schnell, einfach und wirkungsvoll.",
			ogAlt: "Stimme für Iran",
		},
		en: {
			title: "Voice for Iran",
			description:
				"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			ogAlt: "Voice for Iran",
		},
		fr: {
			title: "Voix pour l'Iran",
			description:
				"Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député – rapide, simple et efficace.",
			ogAlt: "Voix pour l'Iran",
		},
	},
	ca: {
		de: {
			title: "Stimme für Iran",
			description:
				"Setze dich für Menschenrechte im Iran ein. Schreibe deinem kanadischen Abgeordneten.",
			ogAlt: "Stimme für Iran",
		},
		en: {
			title: "Voice for Iran",
			description:
				"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			ogAlt: "Voice for Iran",
		},
		fr: {
			title: "Voix pour l'Iran",
			description:
				"Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député(e) – rapide, simple et efficace.",
			ogAlt: "Voix pour l'Iran",
		},
	},
	uk: {
		de: {
			title: "Stimme für Iran",
			description:
				"Setze dich für Menschenrechte im Iran ein. Schreibe deinem britischen Abgeordneten.",
			ogAlt: "Stimme für Iran",
		},
		en: {
			title: "Voice for Iran",
			description:
				"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			ogAlt: "Voice for Iran",
		},
		fr: {
			title: "Voix pour l'Iran",
			description:
				"Défendez les droits humains en Iran. Écrivez à votre député britannique.",
			ogAlt: "Voix pour l'Iran",
		},
	},
	fr: {
		de: {
			title: "Stimme für Iran",
			description:
				"Setze dich für Menschenrechte im Iran ein. Schreibe deinem französischen Abgeordneten.",
			ogAlt: "Stimme für Iran",
		},
		en: {
			title: "Voice for Iran",
			description:
				"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			ogAlt: "Voice for Iran",
		},
		fr: {
			title: "Voix pour l'Iran",
			description:
				"Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député(e) – rapide, simple et efficace.",
			ogAlt: "Voix pour l'Iran",
		},
	},
	us: {
		en: {
			title: "Voice for Iran",
			description:
				"Advocate for human rights in Iran. Write a personal letter to your Representative or Senator – quick, easy and effective.",
			ogAlt: "Voice for Iran",
		},
	},
} as const;

// Default language per country
const DEFAULT_LANG: Record<string, "de" | "en" | "fr"> = {
	de: "de",
	ca: "en",
	uk: "en",
	fr: "fr",
	us: "en",
};

// Locale codes for OpenGraph
const OG_LOCALES: Record<string, Record<string, string>> = {
	de: { de: "de_DE", en: "en_DE", fr: "fr_DE" },
	ca: { de: "de_CA", en: "en_CA", fr: "fr_CA" },
	uk: { de: "de_GB", en: "en_GB", fr: "fr_GB" },
	fr: { de: "de_FR", en: "en_FR", fr: "fr_FR" },
	us: { en: "en_US" },
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ country: string }>;
}): Promise<Metadata> {
	const { country } = await params;
	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as
		| "de"
		| "en"
		| "fr"
		| undefined;

	// Determine effective language
	const defaultLang = DEFAULT_LANG[country] ?? "en";
	const availableLangs = COUNTRY_LANGUAGES[country] ?? ["en"];
	const lang =
		langCookie && availableLangs.includes(langCookie)
			? langCookie
			: defaultLang;

	// Get SEO content
	const countrySeo =
		SEO_CONTENT[country as keyof typeof SEO_CONTENT] ?? SEO_CONTENT.de;
	const seo = countrySeo[lang as keyof typeof countrySeo] ?? countrySeo.en;

	const locale = OG_LOCALES[country]?.[lang] ?? "en_US";
	const baseUrl = clientEnv.NEXT_PUBLIC_BASE_URL;

	return {
		title: seo.title,
		description: seo.description,
		keywords: [
			"Iran",
			lang === "de"
				? "Menschenrechte"
				: lang === "fr"
					? "droits humains"
					: "human rights",
			lang === "de"
				? "Brief schreiben"
				: lang === "fr"
					? "écrire une lettre"
					: "write letter",
			lang === "de"
				? "Solidarität"
				: lang === "fr"
					? "solidarité"
					: "solidarity",
			lang === "de" ? "Diaspora" : "diaspora",
		],
		openGraph: {
			title: seo.title,
			description: seo.description,
			type: "website",
			locale,
			url: `${baseUrl}/${country}`,
			siteName:
				lang === "de"
					? "Stimme für Iran"
					: lang === "fr"
						? "Voix pour l'Iran"
						: "Voice for Iran",
			images: [
				{
					url: `/api/og?country=${country}&lang=${lang}`,
					width: 1200,
					height: 630,
					alt: seo.ogAlt,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: seo.title,
			description: seo.description,
			images: [
				{
					url: `/api/og?country=${country}&lang=${lang}`,
					alt: seo.ogAlt,
				},
			],
		},
		alternates: {
			canonical: `${baseUrl}/${country}`,
			languages: Object.fromEntries(
				availableLangs.map((l) => [l, `${baseUrl}/${country}?lang=${l}`]),
			),
		},
	};
}

/**
 * Server layout for [country] routes.
 * Wraps children with correct default language for the country.
 */
export default async function CountryLayout({
	children,
	params,
}: CountryLayoutProps) {
	const { country } = await params;

	// Validate country code - reject invalid ones (like 'qr', 'admin', etc.)
	if (!isValidCountry(country)) {
		notFound();
	}

	const defaultLanguage = country === "de" ? "de" : "en";
	const availableLanguages = COUNTRY_LANGUAGES[country] ?? ["en"];

	return (
		<CountryLanguageWrapper
			defaultLanguage={defaultLanguage}
			availableLanguages={availableLanguages}
		>
			{children}
		</CountryLanguageWrapper>
	);
}
