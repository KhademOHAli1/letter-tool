import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import {
	type ContentLanguage,
	docMeta,
	footerLinks,
	getPreferredLanguage,
	loadDocContent,
} from "@/lib/content";

export const metadata: Metadata = {
	title: "Daten-Transparenz | Stimme für Iran",
	description:
		"Vollständige Transparenz über Ihre Daten - Was wir speichern und was nicht",
};

interface PageProps {
	searchParams: Promise<{ lang?: string }>;
}

export default async function DatenTransparenzPage({
	searchParams,
}: PageProps) {
	const params = await searchParams;

	// Allow explicit lang query param, including Farsi
	let language: ContentLanguage;
	if (params.lang === "fa") {
		language = "fa";
	} else if (params.lang === "en") {
		language = "en";
	} else if (params.lang === "de") {
		language = "de";
	} else {
		// Fall back to user preference (de or en only)
		language = await getPreferredLanguage();
	}

	const meta = docMeta["daten-transparenz"][language];
	const content = await loadDocContent(meta.fileName, language);

	return (
		<DocPage
			title={meta.title}
			subtitle={meta.subtitle}
			content={content}
			language={language}
			footerLinks={footerLinks[language]}
		/>
	);
}
