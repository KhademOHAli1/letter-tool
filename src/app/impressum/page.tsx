import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import {
	docMeta,
	footerLinks,
	getPreferredLanguage,
	loadDocContent,
} from "@/lib/content";

export const metadata: Metadata = {
	title: "Impressum | Stimme für Iran",
	description: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG",
};

export default async function ImpressumPage() {
	const language = await getPreferredLanguage();
	const meta = docMeta.impressum[language];
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
