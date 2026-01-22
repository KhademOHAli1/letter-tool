"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { COOKIE_THEME, getCookie, setCookie } from "@/lib/cookies";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check cookie first
		const cookieTheme = getCookie(COOKIE_THEME) as Theme | null;
		if (cookieTheme && ["light", "dark", "system"].includes(cookieTheme)) {
			setTheme(cookieTheme);
			return;
		}
		// Fall back to localStorage
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setTheme(stored);
			// Migrate to cookie
			void setCookie(COOKIE_THEME, stored);
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
		void setCookie(COOKIE_THEME, theme);
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
		return (
			<Button variant="ghost" size="icon" className="h-9 w-9" disabled>
				<Sun className="h-4 w-4" />
			</Button>
		);
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

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-9 w-9"
			onClick={toggleTheme}
			aria-label={
				isDark ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"
			}
		>
			{isDark ? (
				<Sun className="h-4 w-4 text-yellow-500" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	);
}
