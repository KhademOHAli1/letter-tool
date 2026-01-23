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
};

/**
 * Server layout for [country] routes.
 * Wraps children with correct default language for the country.
 */
export default async function CountryLayout({
	children,
	params,
}: CountryLayoutProps) {
	const { country } = await params;
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
