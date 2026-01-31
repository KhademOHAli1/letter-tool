"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSettings } from "@/components/header-settings";
import { useLanguage } from "@/lib/i18n/context";

/**
 * Minimalistic site-wide header
 * Ultra clean - just logo on left, settings on right
 */
export function SiteHeader() {
	const pathname = usePathname();
	const { language } = useLanguage();
	const [scrolled, setScrolled] = useState(false);

	// Detect scroll for subtle background effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Don't show on admin, auth, or embed pages
	if (
		pathname.startsWith("/admin") ||
		pathname.startsWith("/auth") ||
		pathname.startsWith("/embed")
	) {
		return null;
	}

	// Check if we're on a page that should show country/language switcher
	const showSettings =
		/^\/[a-z]{2}(\/|$)/.test(pathname) ||
		pathname.startsWith("/c/") ||
		pathname.startsWith("/campaigns");

	return (
		<>
			{/* Fixed header - ultra subtle */}
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled
						? "bg-background/80 backdrop-blur-md border-b border-border/30"
						: "bg-transparent"
				}`}
			>
				<div className="flex h-12 items-center justify-between px-4 md:px-6">
					{/* Logo / Home link - very subtle */}
					<Link
						href="/"
						className="text-sm font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
					>
						{language === "de" ? "Stimme für Iran" : "Voice for Iran"}
					</Link>

					{/* Country/Language switcher - positioned to the right edge */}
					{showSettings && <HeaderSettings />}
				</div>
			</header>

			{/* Spacer to prevent content from going under fixed header */}
			<div className="h-12" />
		</>
	);
}
