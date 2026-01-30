"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSettings } from "@/components/header-settings";
import { useLanguage } from "@/lib/i18n/context";

/**
 * Minimalistic site-wide header with subtle navigation
 * Premium, clean, and almost unnoticeable design
 */
export function SiteHeader() {
	const pathname = usePathname();
	const { language } = useLanguage();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Detect scroll for subtle background effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close mobile menu on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally close menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	// Don't show on admin, auth, or embed pages
	if (
		pathname.startsWith("/admin") ||
		pathname.startsWith("/auth") ||
		pathname.startsWith("/embed")
	) {
		return null;
	}

	// Check if we're on a country page (show country/language switcher)
	const isCountryPage =
		/^\/[a-z]{2}(\/|$)/.test(pathname) || pathname.startsWith("/c/");

	// Navigation items - subtle and minimal
	const navItems = [
		{
			label: language === "de" ? "Kampagnen" : "Campaigns",
			href: "/campaigns",
			show: true,
		},
	];

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
				<nav className="container mx-auto max-w-5xl px-4">
					<div className="flex h-12 items-center justify-between">
						{/* Logo / Home link - very subtle */}
						<Link
							href="/"
							className="text-sm font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
						>
							{language === "de" ? "Stimme für Iran" : "Voice for Iran"}
						</Link>

						{/* Desktop Navigation - minimal links + settings */}
						<div className="hidden md:flex items-center gap-6">
							{navItems
								.filter((item) => item.show)
								.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={`text-xs font-medium tracking-wide uppercase transition-colors ${
											pathname === item.href ||
											pathname.startsWith(`${item.href}/`)
												? "text-foreground"
												: "text-muted-foreground/60 hover:text-muted-foreground"
										}`}
									>
										{item.label}
									</Link>
								))}

							{/* Country/Language switcher - only on relevant pages */}
							{isCountryPage && (
								<div className="pl-4 border-l border-border/30">
									<HeaderSettings />
								</div>
							)}
						</div>

						{/* Mobile: Settings + Menu Button */}
						<div className="flex md:hidden items-center gap-2">
							{isCountryPage && <HeaderSettings />}
							<button
								type="button"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
								aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							>
								{mobileMenuOpen ? (
									<X className="h-4 w-4" />
								) : (
									<Menu className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>
				</nav>

				{/* Mobile Menu - slide down */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/30">
						<div className="container mx-auto px-4 py-4 space-y-3">
							{navItems
								.filter((item) => item.show)
								.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={`block text-sm transition-colors ${
											pathname === item.href ||
											pathname.startsWith(`${item.href}/`)
												? "text-foreground font-medium"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{item.label}
									</Link>
								))}
						</div>
					</div>
				)}
			</header>

			{/* Spacer to prevent content from going under fixed header */}
			<div className="h-12" />
		</>
	);
}
