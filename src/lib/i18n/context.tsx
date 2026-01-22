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

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Language>("de");
	const [mounted, setMounted] = useState(false);

	// Load language preference on mount (check cookie first, then localStorage)
	useEffect(() => {
		setMounted(true);
		// Check cookie first
		const cookieLang = getCookie(COOKIE_LANGUAGE) as Language | null;
		if (cookieLang && (cookieLang === "de" || cookieLang === "en")) {
			setLanguageState(cookieLang);
			return;
		}
		// Fall back to localStorage
		const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
		if (stored && (stored === "de" || stored === "en")) {
			setLanguageState(stored);
			// Migrate to cookie
			void setCookie(COOKIE_LANGUAGE, stored);
		} else {
			// Detect system/browser language: German if system is German, else English
			const browserLang = navigator.language.toLowerCase();
			if (browserLang.startsWith("de")) {
				setLanguageState("de");
			} else {
				// Default to English for all non-German languages
				setLanguageState("en");
			}
		}
	}, []);

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

	// Prevent hydration mismatch by rendering children only after mount
	if (!mounted) {
		return (
			<LanguageContext.Provider
				value={{ language: "de", setLanguage, t: () => "" }}
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
