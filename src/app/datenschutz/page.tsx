import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import {
	docMeta,
	footerLinks,
	getPreferredLanguage,
	loadDocContent,
} from "@/lib/content";

export const metadata: Metadata = {
	title: "Datenschutzerklärung | Stimme für Iran",
	description:
		"Datenschutzerklärung gemäß DSGVO - Informationen zur Verarbeitung personenbezogener Daten",
};

export default async function DatenschutzPage() {
	const language = await getPreferredLanguage();
	const meta = docMeta.datenschutz[language];
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
