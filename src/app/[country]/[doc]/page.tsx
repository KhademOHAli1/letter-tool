import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/doc-page";
import {
	type DocSlug,
	getDocMeta,
	getFooterLinks,
	getPreferredLanguage,
	isValidDocSlug,
	loadDocContent,
} from "@/lib/content";
import { isValidCountry } from "@/lib/country-config";

interface DocPageProps {
	params: Promise<{
		country: string;
		doc: string;
	}>;
}

export async function generateMetadata({
	params,
}: DocPageProps): Promise<Metadata> {
	const { country, doc } = await params;

	if (!isValidCountry(country) || !isValidDocSlug(doc)) {
		return { title: "Not Found" };
	}

	const language = await getPreferredLanguage();
	const meta = getDocMeta(doc as DocSlug, language, country);

	if (!meta) {
		return { title: "Not Found" };
	}

	return {
		title: `${meta.title} | Stimme für Iran`,
		description: meta.subtitle,
	};
}

export default async function DocumentPage({ params }: DocPageProps) {
	const { country, doc } = await params;

	// Validate country
	if (!isValidCountry(country)) {
		notFound();
	}

	// Validate document slug
	if (!isValidDocSlug(doc)) {
		notFound();
	}

	const language = await getPreferredLanguage();
	const meta = getDocMeta(doc as DocSlug, language, country);

	if (!meta) {
		notFound();
	}

	const content = await loadDocContent(meta.fileName, language);
	const footerLinks = getFooterLinks(language, country);

	return (
		<DocPage
			title={meta.title}
			subtitle={meta.subtitle}
			content={content}
			language={language}
			footerLinks={footerLinks}
		/>
	);
}

/**
 * Generate static params for all valid country/doc combinations
 */
export function generateStaticParams() {
	const countries = ["de", "ca", "uk", "fr"];
	const docs = [
		"impressum",
		"datenschutz",
		"daten-transparenz",
		"privacy",
		"legal",
	];

	return countries.flatMap((country) => docs.map((doc) => ({ country, doc })));
}
