"use client";

import { ChevronUp, Github, Globe, Instagram, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setCookie } from "@/lib/cookies";
import { useLanguage } from "@/lib/i18n/context";

type Theme = "light" | "dark" | "system";
type CountryCode = "de" | "ca" | "uk" | "fr";

const COUNTRIES: { code: CountryCode; flag: string; name: string }[] = [
	{ code: "de", flag: "🇩🇪", name: "Deutschland" },
	{ code: "ca", flag: "🇨🇦", name: "Canada" },
	{ code: "uk", flag: "🇬🇧", name: "United Kingdom" },
	{ code: "fr", flag: "🇫🇷", name: "France" },
];

export function FooterSettings() {
	const { language, setLanguage } = useLanguage();
	const router = useRouter();
	const pathname = usePathname();
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);
	const [countryMenuOpen, setCountryMenuOpen] = useState(false);
	const countryMenuRef = useRef<HTMLDivElement>(null);

	// Determine current country from pathname
	const currentCountry: CountryCode = pathname.startsWith("/ca")
		? "ca"
		: pathname.startsWith("/uk")
			? "uk"
			: pathname.startsWith("/fr")
				? "fr"
				: pathname.startsWith("/de")
					? "de"
					: "de";

	const currentCountryData = COUNTRIES.find((c) => c.code === currentCountry);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				countryMenuRef.current &&
				!countryMenuRef.current.contains(event.target as Node)
			) {
				setCountryMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setTheme(stored);
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		const systemDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;

		if (theme === "dark" || (theme === "system" && systemDark)) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	// Listen for system theme changes
	useEffect(() => {
		if (!mounted) return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				const root = document.documentElement;
				if (mediaQuery.matches) {
					root.classList.add("dark");
				} else {
					root.classList.remove("dark");
				}
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, mounted]);

	if (!mounted) {
		return null;
	}

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	const toggleTheme = () => {
		if (theme === "system") {
			setTheme(isDark ? "light" : "dark");
		} else if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	const toggleLanguage = () => {
		// Country-specific language toggle
		// Germany: de <-> en
		// Canada: en <-> fr
		// France: fr <-> en
		if (currentCountry === "ca") {
			setLanguage(language === "en" ? "fr" : "en");
		} else if (currentCountry === "fr") {
			setLanguage(language === "fr" ? "en" : "fr");
		} else {
			setLanguage(language === "de" ? "en" : "de");
		}
	};

	const selectCountry = (newCountry: CountryCode) => {
		if (newCountry === currentCountry) {
			setCountryMenuOpen(false);
			return;
		}
		// Set cookie to remember preference (30 days)
		void setCookie("country", newCountry);

		// Navigate to the new country route
		let newPath: string;
		if (pathname.startsWith("/de")) {
			newPath = `/${newCountry}${pathname.slice(3) || ""}`;
		} else if (pathname.startsWith("/ca")) {
			newPath = `/${newCountry}${pathname.slice(3) || ""}`;
		} else if (pathname.startsWith("/uk")) {
			newPath = `/${newCountry}${pathname.slice(3) || ""}`;
		} else if (pathname.startsWith("/fr")) {
			newPath = `/${newCountry}${pathname.slice(3) || ""}`;
		} else {
			newPath = `/${newCountry}`;
		}
		setCountryMenuOpen(false);
		router.push(newPath);
	};

	return (
		<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
			{/* Country Selector - Dropup Menu */}
			<div className="relative" ref={countryMenuRef}>
				<button
					type="button"
					onClick={() => setCountryMenuOpen(!countryMenuOpen)}
					className="inline-flex items-center gap-1.5 py-2 hover:text-foreground transition-colors"
					aria-label="Select country"
					aria-expanded={countryMenuOpen}
					aria-haspopup="listbox"
				>
					<span className="text-base">{currentCountryData?.flag}</span>
					<span>{currentCountryData?.name}</span>
					<ChevronUp
						className={`h-3.5 w-3.5 transition-transform ${countryMenuOpen ? "" : "rotate-180"}`}
					/>
				</button>

				{/* Dropup menu */}
				{countryMenuOpen && (
					<div
						className="absolute bottom-full left-0 mb-1 min-w-40 rounded-md border border-border bg-popover shadow-lg py-1 z-50"
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
								className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
									country.code === currentCountry
										? "bg-primary/10 text-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								<span className="text-base">{country.flag}</span>
								<span>{country.name}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<span className="text-border">·</span>

			{/* Language Toggle */}
			<button
				type="button"
				onClick={toggleLanguage}
				className="inline-flex items-center gap-1.5 py-2 hover:text-foreground transition-colors"
				aria-label={
					currentCountry === "ca"
						? language === "en"
							? "Passer au français"
							: "Switch to English"
						: currentCountry === "uk"
							? "English only"
							: currentCountry === "fr"
								? language === "fr"
									? "Switch to English"
									: "Passer au français"
								: language === "de"
									? "Switch to English"
									: "Auf Deutsch wechseln"
				}
			>
				<Globe className="h-4 w-4" />
				<span>
					{currentCountry === "ca"
						? language === "en"
							? "Français"
							: "English"
						: currentCountry === "fr"
							? language === "fr"
								? "English"
								: "Français"
							: language === "de"
								? "English"
								: "Deutsch"}
				</span>
			</button>

			<span className="text-border">·</span>

			{/* Theme Toggle */}
			<button
				type="button"
				onClick={toggleTheme}
				className="inline-flex items-center gap-1.5 py-2 hover:text-foreground transition-colors"
				aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			>
				{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
				<span>
					{isDark
						? language === "de"
							? "Hell"
							: "Light"
						: language === "de"
							? "Dunkel"
							: "Dark"}
				</span>
			</button>

			{/* Social Links - subtle */}
			<span className="text-border/50">·</span>
			<div className="flex items-center gap-3">
				<a
					href="https://github.com/KhademOHAli1/letter-tool"
					target="_blank"
					rel="noopener noreferrer"
					className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
					aria-label="GitHub"
				>
					<Github className="h-3.5 w-3.5" />
				</a>
				<a
					href="https://instagram.com/khademohali"
					target="_blank"
					rel="noopener noreferrer"
					className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
					aria-label="Instagram"
				>
					<Instagram className="h-3.5 w-3.5" />
				</a>
			</div>
		</div>
	);
}
