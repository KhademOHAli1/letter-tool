"use client";

import { Vote } from "lucide-react";
import { CampaignGoal } from "@/components/campaign-goal";
import { FooterSettings } from "@/components/footer-settings";
import { ImpactStats } from "@/components/impact-stats";
import { LetterForm } from "@/components/letter-form";
import { useLanguage } from "@/lib/i18n/context";

export default function Home() {
	const { language } = useLanguage();

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<header className="bg-linear-to-b from-accent/30 via-accent/10 to-background safe-area-top">
				<div className="container mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-16 md:pb-14">
					<div className="text-center space-y-4 md:space-y-6">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
							<Vote className="h-4 w-4 shrink-0" />
							<span>
								{language === "de"
									? "Deine Stimme zählt"
									: "Your Voice Matters"}
							</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
							{language === "de" ? (
								<>
									<span className="block">Schreib deinem</span>
									<span className="text-primary block">
										Bundestagsabgeordneten
									</span>
								</>
							) : (
								<>
									{"Write to Your "}
									<span className="text-primary block sm:inline">
										Member of Parliament
									</span>
								</>
							)}
						</h1>

						{/* Subheading */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							{language === "de"
								? "Ein persönlicher Brief kann mehr bewirken als tausend Tweets. Fordere deine Abgeordneten auf, sich für Menschenrechte im Iran einzusetzen."
								: "A personal letter can achieve more than a thousand tweets. Ask your MP to stand up for human rights in Iran."}
						</p>
					</div>
				</div>
			</header>

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
						<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
							<a
								href="/impressum"
								className="py-2 hover:text-primary transition-colors"
							>
								{language === "de" ? "Impressum" : "Legal Notice"}
							</a>
							<span className="text-border">·</span>
							<a
								href="/datenschutz"
								className="py-2 hover:text-primary transition-colors"
							>
								{language === "de" ? "Datenschutz" : "Privacy Policy"}
							</a>
						</div>
						{/* Settings */}
						<div className="pt-2">
							<FooterSettings />
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
