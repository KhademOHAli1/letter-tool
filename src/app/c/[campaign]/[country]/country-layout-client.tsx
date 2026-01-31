"use client";

/**
 * Client wrapper for country-specific layout
 * Provides country context to child components
 * Phase 3, Epic 3.1
 */

import { createContext, type ReactNode, useContext } from "react";
import type { Language } from "@/lib/i18n/context";

interface CountryContextType {
	/** Country code (de, ca, uk, fr, us) */
	country: string;
	/** Current language */
	language: Language;
	/** Available languages for this country */
	availableLanguages: Language[];
}

const CountryContext = createContext<CountryContextType | null>(null);

interface CountryLayoutClientProps {
	children: ReactNode;
	country: string;
	defaultLanguage: Language;
	availableLanguages: Language[];
	currentLanguage: Language;
}

export function CountryLayoutClient({
	children,
	country,
	currentLanguage,
	availableLanguages,
}: CountryLayoutClientProps) {
	return (
		<CountryContext.Provider
			value={{
				country,
				language: currentLanguage,
				availableLanguages,
			}}
		>
			{children}
		</CountryContext.Provider>
	);
}

/**
 * Hook to access country context within campaign routes
 */
export function useCountry(): CountryContextType {
	const context = useContext(CountryContext);
	if (!context) {
		throw new Error("useCountry must be used within a CountryLayoutClient");
	}
	return context;
}

/**
 * Optional hook - returns null if not in country context
 */
export function useCountryOptional(): CountryContextType | null {
	return useContext(CountryContext);
}
