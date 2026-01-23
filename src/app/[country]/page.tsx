"use client";

import { Clock, Vote } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { CampaignGoal } from "@/components/campaign-goal";
import { FooterSettings } from "@/components/footer-settings";
import { HeaderSettings } from "@/components/header-settings";
import { ImpactStats } from "@/components/impact-stats";
import { LetterForm } from "@/components/letter-form";
import { LetterHistory } from "@/components/letter-history";
import {
	type CountryCode,
	getCountryConfig,
	isValidCountry,
} from "@/lib/country-config";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

export default function CountryHome() {
	const params = useParams<{ country: string }>();
	const { language } = useLanguage();

	// Validate country param
	if (!isValidCountry(params.country)) {
		notFound();
	}

	const country = params.country as CountryCode;
	const config = getCountryConfig(country);

	if (!config) {
		notFound();
	}

	// Show "Coming Soon" for countries not yet ready
	if (!config.isReady) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-6 px-6">
					<div className="text-6xl">{config.flag}</div>
					<h1 className="text-3xl font-bold text-foreground">
						{config.name.native}
					</h1>
					<div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
						<Clock className="h-4 w-4" />
						<span>Coming Soon</span>
					</div>
					<p className="text-muted-foreground max-w-md">
						We're working on bringing the letter tool to {config.name.en}.
						<br />
						In the meantime, check out the German version.
					</p>
					<a
						href="/de"
						className="inline-flex items-center gap-2 text-primary hover:underline"
					>
						🇩🇪 Go to Germany version
					</a>
					<div className="pt-8">
						<FooterSettings />
					</div>
				</div>
			</div>
		);
	}

	// Get representative label based on language
	const getRepresentativeLabel = () => {
		if (language === "de") return config.representativeLabel.native;
		if (language === "fr" && config.representativeLabel.fr)
			return config.representativeLabel.fr;
		return config.representativeLabel.en;
	};

	// Get footer text based on language
	const getFooterText = (field: "diaspora" | "mission") => {
		const text = config.footer[field];
		if (language === "de") return text.native;
		if (language === "fr" && text.fr) return text.fr;
		return text.en;
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section - with subtle heritage gradient */}
			<header className="relative heritage-gradient heritage-sun safe-area-top">
				{/* Desktop Settings - top right corner */}
				<div className="absolute top-4 right-4 z-10">
					<HeaderSettings />
				</div>

				<div className="container mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-16 md:pb-14">
					<div className="text-center space-y-4 md:space-y-6">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
							<Vote className="h-4 w-4 shrink-0" />
							<span>{t("header", "badge", language)}</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
							<span className="block">
								{t("header", "writeToPrefix", language)}
							</span>
							<span className="text-primary block">
								{getRepresentativeLabel()}
							</span>
						</h1>

						{/* Subheading */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							{t("header", "subheading", language)}
						</p>
					</div>
				</div>
			</header>

			{/* Campaign Goal - show for all countries */}
			<section className="container mx-auto max-w-2xl px-4 pt-8">
				<CampaignGoal country={country} />
			</section>

			{/* Letter History - show if user has previous letters */}
			<section className="container mx-auto max-w-2xl px-4 pt-6">
				<LetterHistory />
			</section>

			{/* Main Form */}
			<main className="container mx-auto max-w-2xl px-4 py-10 md:py-12">
				<LetterForm />
			</main>

			{/* Impact Stats - shows after first letter is sent (Germany only for now) */}
			{country === "de" && <ImpactStats />}

			{/* Footer */}
			<footer className="border-t border-border/50 bg-muted/20">
				<div className="container mx-auto max-w-4xl px-4 py-8">
					<div className="text-center space-y-4">
						<p className="text-sm text-muted-foreground">
							{getFooterText("diaspora")}
							<br />
							{getFooterText("mission")}
						</p>
						<p className="text-xs text-muted-foreground/70">
							{t("footer", "openaiNotice", language)}
						</p>
						{/* Legal Links - only show if available for this country */}
						{(config.legalPages.impressum || config.legalPages.privacy) && (
							<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
								{config.legalPages.impressum && (
									<a
										href={config.legalPages.impressum}
										className="py-2 hover:text-primary transition-colors"
									>
										{t("footer", "impressum", language)}
									</a>
								)}
								{config.legalPages.impressum && config.legalPages.privacy && (
									<span className="text-border">·</span>
								)}
								{config.legalPages.privacy && (
									<a
										href={config.legalPages.privacy}
										className="py-2 hover:text-primary transition-colors"
									>
										{t("footer", "privacy", language)}
									</a>
								)}
							</div>
						)}
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
