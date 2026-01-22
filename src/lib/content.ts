import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";

export type ContentLanguage = "de" | "en" | "fa";

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
 * @param docName - The document name (e.g., "datenschutz", "impressum")
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
		// Fallback to German if the file doesn't exist
		const fallbackPath = path.join(
			process.cwd(),
			"content",
			"de",
			`${docName}.md`,
		);
		return fs.readFile(fallbackPath, "utf-8");
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
 * Footer links for each language
 */
export const footerLinks: Record<
	ContentLanguage,
	Array<{ href: string; label: string }>
> = {
	de: [
		{ href: "/daten-transparenz", label: "Daten-Transparenz" },
		{ href: "/datenschutz", label: "Datenschutzerklärung" },
		{ href: "/impressum", label: "Impressum" },
		{ href: "/", label: "Startseite" },
	],
	en: [
		{ href: "/daten-transparenz", label: "Data Transparency" },
		{ href: "/datenschutz", label: "Privacy Policy" },
		{ href: "/impressum", label: "Legal Notice" },
		{ href: "/", label: "Home" },
	],
	fa: [
		{ href: "/daten-transparenz?lang=fa", label: "شفافیت داده‌ها" },
		{ href: "/daten-transparenz?lang=de", label: "Deutsch" },
		{ href: "/daten-transparenz?lang=en", label: "English" },
		{ href: "/", label: "صفحه اصلی" },
	],
};
