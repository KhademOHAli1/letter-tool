"use client";

import { Vote } from "lucide-react";
import { CampaignGoal } from "@/components/campaign-goal";
import { ImpactStats } from "@/components/impact-stats";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LetterForm } from "@/components/letter-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/i18n/context";

export default function Home() {
	const { language } = useLanguage();

	return (
		<div className="min-h-screen bg-background">
			{/* Controls - fixed position */}
			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				<LanguageSwitcher />
				<ThemeToggle />
			</div>

			{/* Hero Section */}
			<header className="border-b border-border/50 bg-linear-to-b from-accent/20 to-background">
				<div className="container mx-auto max-w-4xl px-4 py-8 md:py-16 safe-area-top">
					<div className="text-center space-y-4">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
							<Vote className="h-4 w-4 shrink-0" />
							<span className="whitespace-nowrap">
								{language === "de"
									? "Deine Stimme zählt"
									: "Your Voice Matters"}
							</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-foreground hyphenate">
							{language === "de" ? (
								<>
									Schreib deinem{" "}
									<span className="text-primary wrap-break-word">
										Bundestags&shy;abgeordneten
									</span>
								</>
							) : (
								<>
									Write to Your{" "}
									<span className="text-primary">Member of Parliament</span>
								</>
							)}
						</h1>

						{/* Subheading */}
						<p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
							{language === "de"
								? "Ein persönlicher Brief kann mehr bewirken als tausend Tweets. Fordere deine Abgeordneten auf, sich für Menschenrechte im Iran einzusetzen."
								: "A personal letter can achieve more than a thousand tweets. Ask your MP to stand up for human rights in Iran."}
						</p>
					</div>
				</div>
			</header>

			{/* Trust Indicators */}
			<section className="border-b border-border/30 bg-muted/30">
				<div className="container mx-auto max-w-4xl px-4 py-6">
					<div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<svg
								className="h-5 w-5 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
							<span>
								{language === "de" ? "Datenschutzkonform" : "Privacy Compliant"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<svg
								className="h-5 w-5 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								{language === "de"
									? "In 5 Minuten fertig"
									: "Done in 5 Minutes"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<svg
								className="h-5 w-5 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<span>
								{language === "de"
									? "Direkt an das Wahlkreisbüro"
									: "Direct to Constituency Office"}
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Campaign Goal */}
			<section className="container mx-auto max-w-2xl px-4 pt-8">
				<CampaignGoal goal={1000} />
			</section>

			{/* Main Form */}
			<main className="container mx-auto max-w-2xl px-4 py-10 md:py-12">
				<LetterForm />
			</main>

			{/* Impact Stats - shows after first letter is sent */}
			<ImpactStats />

			{/* Footer */}
			<footer className="border-t border-border/50 bg-muted/20">
				<div className="container mx-auto max-w-4xl px-4 py-8">
					<div className="text-center space-y-4">
						<p className="text-sm text-muted-foreground">
							{language === "de" ? (
								<>
									Ein Projekt der iranischen Diaspora in Deutschland.
									<br />
									Für Freiheit, Würde und Menschenrechte.
								</>
							) : (
								<>
									A project by the Iranian diaspora in Germany.
									<br />
									For freedom, dignity and human rights.
								</>
							)}
						</p>
						<p className="text-xs text-muted-foreground/70">
							{language === "de"
								? "Der generierte Brief wird nicht auf unseren Servern gespeichert. Zur Generierung werden deine Eingaben an OpenAI übermittelt."
								: "The generated letter is not stored on our servers. Your inputs are sent to OpenAI for generation."}
						</p>
						{/* Legal Links */}
						<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
							<a
								href="/impressum"
								className="hover:text-primary transition-colors"
							>
								{language === "de" ? "Impressum" : "Legal Notice"}
							</a>
							<span className="text-border">·</span>
							<a
								href="/datenschutz"
								className="hover:text-primary transition-colors"
							>
								{language === "de" ? "Datenschutz" : "Privacy Policy"}
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
