import { Vote } from "lucide-react";
import { CampaignGoal } from "@/components/campaign-goal";
import { ImpactStats } from "@/components/impact-stats";
import { LetterForm } from "@/components/letter-form";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<header className="border-b border-border/50 bg-gradient-to-b from-accent/20 to-background">
				<div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
					<div className="text-center space-y-4">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
							<Vote className="h-4 w-4" />
							Deine Stimme zählt
						</div>

						{/* Main Heading */}
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
							Schreib deinem{" "}
							<span className="text-primary">Bundestagsabgeordneten</span>
						</h1>

						{/* Subheading */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
							Ein persönlicher Brief kann mehr bewirken als tausend Tweets.
							Fordere deine Abgeordneten auf, sich für Menschenrechte im Iran
							einzusetzen.
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
							<span>Datenschutzkonform</span>
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
							<span>In 5 Minuten fertig</span>
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
							<span>Direkt an das Wahlkreisbüro</span>
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
							Ein Projekt der iranischen Diaspora in Deutschland.
							<br />
							Für Freiheit, Würde und Menschenrechte.
						</p>
						<p className="text-xs text-muted-foreground/70">
							Der generierte Brief wird nicht auf unseren Servern gespeichert.
							Zur Generierung werden deine Eingaben an OpenAI übermittelt.
						</p>
						{/* Legal Links */}
						<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
							<a
								href="/impressum"
								className="hover:text-primary transition-colors"
							>
								Impressum
							</a>
							<span className="text-border">·</span>
							<a
								href="/datenschutz"
								className="hover:text-primary transition-colors"
							>
								Datenschutz
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
