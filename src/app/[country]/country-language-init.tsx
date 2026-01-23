"use client";

import type { ReactNode } from "react";
import { type Language, LanguageProvider } from "@/lib/i18n/context";

interface CountryLanguageWrapperProps {
	children: ReactNode;
	defaultLanguage: Language;
	availableLanguages: Language[];
}

/**
 * Client wrapper that provides a LanguageProvider with the correct
 * default language for the country. This overrides the root provider.
 */
export function CountryLanguageWrapper({
	children,
	defaultLanguage,
	availableLanguages,
}: CountryLanguageWrapperProps) {
	return (
		<LanguageProvider
			initialLanguage={defaultLanguage}
			availableLanguages={availableLanguages}
		>
			{children}
		</LanguageProvider>
	);
}
