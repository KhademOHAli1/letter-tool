"use client";

import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Flag } from "@/components/flags";
import { setCookie } from "@/lib/cookies";
import { useLanguage } from "@/lib/i18n/context";

type CountryCode = "de" | "ca" | "uk" | "fr" | "us";

const COUNTRIES: { code: CountryCode; name: string }[] = [
	{ code: "de", name: "Deutschland" },
	{ code: "ca", name: "Canada" },
	{ code: "uk", name: "United Kingdom" },
	{ code: "fr", name: "France" },
	{ code: "us", name: "United States" },
];

const LANGUAGES: { code: string; name: string; nativeName: string }[] = [
	{ code: "de", name: "German", nativeName: "Deutsch" },
	{ code: "en", name: "English", nativeName: "English" },
	{ code: "fr", name: "French", nativeName: "Français" },
	{ code: "es", name: "Spanish", nativeName: "Español" },
];

// Languages available per country
const COUNTRY_LANGUAGES: Record<CountryCode, string[]> = {
	de: ["de", "en"], // Germany: German, English
	ca: ["en", "fr"], // Canada: English, French
	uk: ["en"], // UK: English only
	fr: ["fr", "en"], // France: French, English
	us: ["en", "es"], // US: English, Spanish
};

export function HeaderSettings() {
	const { language, setLanguage } = useLanguage();
	const router = useRouter();
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	const [countryMenuOpen, setCountryMenuOpen] = useState(false);
	const [langMenuOpen, setLangMenuOpen] = useState(false);
	const countryMenuRef = useRef<HTMLDivElement>(null);
	const langMenuRef = useRef<HTMLDivElement>(null);

	// Determine current country from pathname
	const currentCountry: CountryCode = pathname.startsWith("/ca")
		? "ca"
		: pathname.startsWith("/uk")
			? "uk"
			: pathname.startsWith("/fr")
				? "fr"
				: pathname.startsWith("/us")
					? "us"
					: "de";

	// Filter languages available for current country
	const availableLanguages = LANGUAGES.filter((lang) =>
		COUNTRY_LANGUAGES[currentCountry].includes(lang.code),
	);

	// Close menus when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				countryMenuRef.current &&
				!countryMenuRef.current.contains(event.target as Node)
			) {
				setCountryMenuOpen(false);
			}
			if (
				langMenuRef.current &&
				!langMenuRef.current.contains(event.target as Node)
			) {
				setLangMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const selectCountry = (newCountry: CountryCode) => {
		if (newCountry === currentCountry) {
			setCountryMenuOpen(false);
			return;
		}
		void setCookie("country", newCountry);

		let newPath: string;
		// Check if pathname starts with a country code
		const countryPrefixMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
		if (countryPrefixMatch) {
			// Replace the country prefix, keep the rest of the path
			newPath = `/${newCountry}${pathname.slice(3) || ""}`;
		} else if (pathname === "/campaigns" || pathname.startsWith("/campaigns")) {
			// Redirect to country-specific campaigns page
			newPath = `/${newCountry}/campaigns`;
		} else {
			// No country prefix, go to country home page
			newPath = `/${newCountry}`;
		}
		setCountryMenuOpen(false);
		router.push(newPath);
	};

	const selectLanguage = (newLang: string) => {
		if (newLang === language) {
			setLangMenuOpen(false);
			return;
		}
		setLanguage(newLang as "de" | "en" | "fr");
		setLangMenuOpen(false);
	};

	return (
		<div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground/70">
			{/* Country Selector */}
			<div className="relative" ref={countryMenuRef}>
				<button
					type="button"
					onClick={() => {
						setCountryMenuOpen(!countryMenuOpen);
						setLangMenuOpen(false);
					}}
					className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 hover:text-foreground/80 transition-colors"
					aria-label="Select country"
					aria-expanded={countryMenuOpen}
					aria-haspopup="listbox"
				>
					<Flag country={currentCountry} className="h-3.5 w-4" />
					<ChevronDown
						className={`h-3 w-3 transition-transform ${countryMenuOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{countryMenuOpen && (
					<div
						className="absolute top-full right-0 mt-1 min-w-36 rounded-md border border-border bg-popover shadow-lg py-1 z-50"
						role="listbox"
						aria-label="Select country"
					>
						{COUNTRIES.map((country) => (
							<button
								key={country.code}
								type="button"
								role="option"
								aria-selected={country.code === currentCountry}
								onClick={() => selectCountry(country.code)}
								className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
									country.code === currentCountry
										? "bg-primary/10 text-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								<Flag country={country.code} className="h-3.5 w-4" />
								<span>{country.name}</span>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Language Selector */}
			<div className="relative" ref={langMenuRef}>
				<button
					type="button"
					onClick={() => {
						setLangMenuOpen(!langMenuOpen);
						setCountryMenuOpen(false);
					}}
					className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 hover:text-foreground/80 transition-colors"
					aria-label="Select language"
					aria-expanded={langMenuOpen}
					aria-haspopup="listbox"
				>
					<Globe className="h-3 w-3" />
					<span className="uppercase">{language}</span>
					<ChevronDown
						className={`h-3 w-3 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{langMenuOpen && (
					<div
						className="absolute top-full right-0 mt-1 min-w-32 rounded-md border border-border bg-popover shadow-lg py-1 z-50"
						role="listbox"
						aria-label="Select language"
					>
						{availableLanguages.map((lang) => (
							<button
								key={lang.code}
								type="button"
								role="option"
								aria-selected={lang.code === language}
								onClick={() => selectLanguage(lang.code)}
								className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
									lang.code === language
										? "bg-primary/10 text-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								<span>{lang.nativeName}</span>
								<span className="text-muted-foreground/50 uppercase">
									{lang.code}
								</span>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
