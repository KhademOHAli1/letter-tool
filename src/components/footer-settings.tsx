"use client";

import { Github, Globe, Instagram, MapPin, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setCookie } from "@/lib/cookies";
import { useLanguage } from "@/lib/i18n/context";

type Theme = "light" | "dark" | "system";

export function FooterSettings() {
	const { language, setLanguage } = useLanguage();
	const router = useRouter();
	const pathname = usePathname();
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);

	// Determine current country from pathname
	const currentCountry = pathname.startsWith("/ca")
		? "ca"
		: pathname.startsWith("/uk")
			? "uk"
			: pathname.startsWith("/fr")
				? "fr"
				: pathname.startsWith("/de")
					? "de"
					: "de";

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

	const toggleCountry = () => {
		// Cycle through countries: de -> ca -> uk -> fr -> de
		const countryOrder = ["de", "ca", "uk", "fr"] as const;
		const currentIndex = countryOrder.indexOf(
			currentCountry as (typeof countryOrder)[number],
		);
		const nextIndex = (currentIndex + 1) % countryOrder.length;
		const newCountry = countryOrder[nextIndex];
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
		router.push(newPath);
	};

	return (
		<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
			{/* Country Toggle */}
			<button
				type="button"
				onClick={toggleCountry}
				className="inline-flex items-center gap-1.5 py-2 hover:text-foreground transition-colors"
				aria-label={
					currentCountry === "de"
						? "Switch to Canada"
						: currentCountry === "ca"
							? "Switch to UK"
							: currentCountry === "uk"
								? "Switch to France"
								: "Zu Deutschland wechseln"
				}
			>
				<MapPin className="h-4 w-4" />
				<span>
					{currentCountry === "de"
						? "Switch to Canada"
						: currentCountry === "ca"
							? "Switch to UK"
							: currentCountry === "uk"
								? "Switch to France"
								: "Auf Deutsch wechseln"}
				</span>
			</button>

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
