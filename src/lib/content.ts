import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";

export type ContentLanguage = "de" | "en" | "fr" | "fa";

/** Valid document slugs */
export type DocSlug =
	| "impressum"
	| "datenschutz"
	| "daten-transparenz"
	| "privacy"
	| "legal"
	| "data-transparency";

/** Document slugs that are valid for each country */
const COUNTRY_DOC_SLUGS: Record<string, DocSlug[]> = {
	de: ["impressum", "datenschutz", "daten-transparenz"],
	ca: ["privacy", "legal", "data-transparency"],
	uk: ["privacy", "legal", "data-transparency"],
	fr: ["privacy", "legal", "data-transparency"],
	us: ["privacy", "legal", "data-transparency"],
};

/** Map slugs to canonical document identifiers */
const SLUG_TO_DOC: Record<DocSlug, keyof typeof docMeta> = {
	impressum: "impressum",
	datenschutz: "datenschutz",
	"daten-transparenz": "daten-transparenz",
	privacy: "datenschutz", // English alias for privacy policy
	legal: "impressum", // English alias for legal notice
	"data-transparency": "daten-transparenz", // English alias for data transparency
};

/**
 * Check if a slug is a valid document slug
 */
export function isValidDocSlug(slug: string): slug is DocSlug {
	return slug in SLUG_TO_DOC;
}

/**
 * Check if a document is available for a specific country
 */
export function isDocAvailableForCountry(
	slug: DocSlug,
	country: string,
): boolean {
	const availableDocs = COUNTRY_DOC_SLUGS[country];
	return availableDocs?.includes(slug) ?? false;
}

/**
 * Get the user's preferred language from cookies
 * Falls back to German if not set
 */
export async function getPreferredLanguage(): Promise<"de" | "en"> {
	try {
		const cookieStore = await cookies();
		const lang = cookieStore.get("lang")?.value;
		if (lang === "en") return "en";
		return "de";
	} catch {
		return "de";
	}
}

/**
 * Load markdown content for a document page
 * @param docName - The document file name (without .md extension)
 * @param language - The language to load
 * @returns The markdown content
 */
export async function loadDocContent(
	docName: string,
	language: ContentLanguage,
): Promise<string> {
	const filePath = path.join(
		process.cwd(),
		"content",
		language,
		`${docName}.md`,
	);
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return content;
	} catch {
		// Fallback to German if the file doesn't exist, then English
		try {
			const fallbackPath = path.join(
				process.cwd(),
				"content",
				"de",
				`${docName}.md`,
			);
			return await fs.readFile(fallbackPath, "utf-8");
		} catch {
			const enFallbackPath = path.join(
				process.cwd(),
				"content",
				"en",
				`${docName}.md`,
			);
			return fs.readFile(enFallbackPath, "utf-8");
		}
	}
}

/**
 * Document metadata for each language
 */
export const docMeta = {
	datenschutz: {
		de: {
			title: "Datenschutzerklärung",
			subtitle: "Informationen gemäß Art. 13 und 14 DSGVO",
			fileName: "datenschutz",
		},
		en: {
			title: "Privacy Policy",
			subtitle: "Information according to Art. 13 and 14 GDPR",
			fileName: "privacy-policy",
		},
	},
	impressum: {
		de: {
			title: "Impressum",
			subtitle: "Angaben gemäß § 5 TMG (Telemediengesetz)",
			fileName: "impressum",
		},
		en: {
			title: "Legal Notice",
			subtitle: "Information according to § 5 TMG (German Telemedia Act)",
			fileName: "legal-notice",
		},
	},
	"daten-transparenz": {
		de: {
			title: "Daten-Transparenz",
			subtitle: "Was passiert wirklich mit euren Daten?",
			fileName: "daten-transparenz",
		},
		en: {
			title: "Data Transparency",
			subtitle: "What really happens with your data?",
			fileName: "data-transparency",
		},
		fa: {
			title: "شفافیت داده‌ها",
			subtitle: "واقعاً با داده‌های شما چه اتفاقی می‌افتد؟",
			fileName: "data-transparency",
		},
	},
} as const;

/**
 * Get document metadata for a slug
 */
export function getDocMeta(
	slug: DocSlug,
	language: "de" | "en",
	_country?: string,
): { title: string; subtitle: string; fileName: string } | null {
	const docKey = SLUG_TO_DOC[slug];
	if (!docKey) return null;

	const doc = docMeta[docKey];
	if (!doc) return null;

	// Use English for CA country if German not available
	const meta = doc[language] || doc.en || doc.de;
	return meta as { title: string; subtitle: string; fileName: string };
}

/**
 * Get footer links for a specific language and country
 */
export function getFooterLinks(
	language: ContentLanguage,
	country: string,
): Array<{ href: string; label: string }> {
	const prefix = `/${country}`;

	// Helper for trilingual labels (de, en, fr)
	const label = (de: string, en: string, fr: string) => {
		if (language === "de") return de;
		if (language === "fr") return fr;
		return en;
	};

	if (country === "ca" || country === "uk") {
		// Canadian/UK links (English routes)
		return [
			{
				href: `${prefix}/daten-transparenz`,
				label: label(
					"Daten-Transparenz",
					"Data Transparency",
					"Transparence des données",
				),
			},
			{
				href: `${prefix}/privacy`,
				label: label(
					"Datenschutz",
					"Privacy Policy",
					"Politique de confidentialité",
				),
			},
			{
				href: `${prefix}/legal`,
				label: label("Impressum", "Legal Notice", "Mentions légales"),
			},
			{ href: prefix, label: label("Startseite", "Home", "Accueil") },
		];
	}

	// German links (default)
	if (language === "fa") {
		return [
			{ href: `${prefix}/daten-transparenz?lang=fa`, label: "شفافیت داده‌ها" },
			{ href: `${prefix}/daten-transparenz?lang=de`, label: "Deutsch" },
			{ href: `${prefix}/daten-transparenz?lang=en`, label: "English" },
			{ href: prefix, label: "صفحه اصلی" },
		];
	}

	return [
		{
			href: `${prefix}/daten-transparenz`,
			label: label(
				"Daten-Transparenz",
				"Data Transparency",
				"Transparence des données",
			),
		},
		{
			href: `${prefix}/datenschutz`,
			label: label(
				"Datenschutzerklärung",
				"Privacy Policy",
				"Politique de confidentialité",
			),
		},
		{
			href: `${prefix}/impressum`,
			label: label("Impressum", "Legal Notice", "Mentions légales"),
		},
		{ href: prefix, label: label("Startseite", "Home", "Accueil") },
	];
}

// Legacy export for backwards compatibility
export const footerLinks: Record<
	ContentLanguage,
	Array<{ href: string; label: string }>
> = {
	de: getFooterLinks("de", "de"),
	en: getFooterLinks("en", "de"),
	fr: getFooterLinks("fr", "ca"),
	fa: getFooterLinks("fa", "de"),
};
