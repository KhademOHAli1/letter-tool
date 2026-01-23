"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { COOKIE_LANGUAGE, getCookie, setCookie } from "@/lib/cookies";
import {
	type Language,
	t as translate,
	type translations,
} from "./translations";

// Re-export Language type for use by other modules
export type { Language };

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (
		section: keyof typeof translations,
		key: string,
		replacements?: Record<string, string | number>,
	) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "preferred-language";

interface LanguageProviderProps {
	children: ReactNode;
	/** Initial language hint from server (based on country). Defaults to "de". */
	initialLanguage?: Language;
	/** Available languages for this country. Used to validate stored preference. */
	availableLanguages?: Language[];
}

export function LanguageProvider({
	children,
	initialLanguage = "de",
	availableLanguages = ["de", "en"],
}: LanguageProviderProps) {
	const [language, setLanguageState] = useState<Language>(initialLanguage);
	const [mounted, setMounted] = useState(false);

	// Load language preference on mount (check cookie first, then localStorage)
	// Only use stored language if it's valid for this country
	useEffect(() => {
		setMounted(true);

		// Check cookie first
		const cookieLang = getCookie(COOKIE_LANGUAGE) as Language | null;
		if (
			cookieLang &&
			(cookieLang === "de" || cookieLang === "en" || cookieLang === "fr") &&
			availableLanguages.includes(cookieLang)
		) {
			setLanguageState(cookieLang);
			return;
		}
		// Fall back to localStorage
		const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
		if (
			stored &&
			(stored === "de" || stored === "en" || stored === "fr") &&
			availableLanguages.includes(stored)
		) {
			setLanguageState(stored);
			// Migrate to cookie
			void setCookie(COOKIE_LANGUAGE, stored);
		}
		// If no valid stored preference, keep the initialLanguage from server
	}, [availableLanguages]);

	const setLanguage = useCallback((lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem(STORAGE_KEY, lang);
		void setCookie(COOKIE_LANGUAGE, lang);
	}, []);

	// Translation helper bound to current language
	const t = useCallback(
		(
			section: keyof typeof translations,
			key: string,
			replacements?: Record<string, string | number>,
		): string => {
			return translate(section, key, language, replacements);
		},
		[language],
	);

	// Prevent hydration mismatch - use initialLanguage for first render
	// The server renders with initialLanguage, client will update if stored preference differs
	if (!mounted) {
		return (
			<LanguageContext.Provider
				value={{ language: initialLanguage, setLanguage, t }}
			>
				{children}
			</LanguageContext.Provider>
		);
	}

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
