"use client";

import { Github, Globe, Instagram, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

type Theme = "light" | "dark" | "system";

export function FooterSettings() {
	const { language, setLanguage } = useLanguage();
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);

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
		setLanguage(language === "de" ? "en" : "de");
	};

	return (
		<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
			{/* Language Toggle */}
			<button
				type="button"
				onClick={toggleLanguage}
				className="inline-flex items-center gap-1.5 py-2 hover:text-foreground transition-colors"
				aria-label={
					language === "de" ? "Switch to English" : "Auf Deutsch wechseln"
				}
			>
				<Globe className="h-4 w-4" />
				<span>{language === "de" ? "English" : "Deutsch"}</span>
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
