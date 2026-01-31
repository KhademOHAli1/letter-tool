"use client";

/**
 * Campaign landing page
 * Shows campaign info, stats, and country selection
 * Phase 3, Epic 3.1
 */

import { ArrowRight, Target, Users } from "lucide-react";
import Link from "next/link";
import { CampaignHeader } from "@/components/campaign-header";
import { FooterSettings } from "@/components/footer-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCampaign } from "@/lib/campaigns/context";
import { useLanguage } from "@/lib/i18n/context";

// Country flags and names for selection
const COUNTRY_INFO: Record<
	string,
	{ flag: string; name: Record<string, string> }
> = {
	de: {
		flag: "🇩🇪",
		name: { de: "Deutschland", en: "Germany", fr: "Allemagne" },
	},
	ca: {
		flag: "🇨🇦",
		name: { de: "Kanada", en: "Canada", fr: "Canada" },
	},
	uk: {
		flag: "🇬🇧",
		name: { de: "Großbritannien", en: "United Kingdom", fr: "Royaume-Uni" },
	},
	fr: {
		flag: "🇫🇷",
		name: { de: "Frankreich", en: "France", fr: "France" },
	},
	us: {
		flag: "🇺🇸",
		name: { de: "USA", en: "United States", fr: "États-Unis" },
	},
};

export default function CampaignLandingPage() {
	const { campaign, demands, stats, getLocalizedText } = useCampaign();
	const { language } = useLanguage();

	// Get localized campaign info
	const campaignName = getLocalizedText(campaign.name);
	const campaignDescription = getLocalizedText(campaign.description);

	// Get active (not completed) demands
	const activeDemands = demands.filter((d) => !d.completed);
	const completedDemands = demands.filter((d) => d.completed);

	// Progress percentage
	const goalProgress = campaign.goalLetters
		? Math.min(
				100,
				Math.round(((stats?.totalLetters ?? 0) / campaign.goalLetters) * 100),
			)
		: null;

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			{/* Header with campaign branding */}
			<header className="relative heritage-gradient heritage-sun safe-area-top overflow-hidden">
				<CampaignHeader
					name={campaignName}
					description={campaignDescription}
					goalLetters={campaign.goalLetters}
					currentLetters={stats?.totalLetters ?? 0}
				/>
			</header>

			<main className="container mx-auto max-w-4xl px-6 py-8">
				{/* Quick stats */}
				{stats && (stats.totalLetters > 0 || campaign.goalLetters) && (
					<div className="flex flex-wrap justify-center gap-6 mb-8">
						<div className="text-center">
							<div className="text-3xl font-bold text-primary">
								{stats.totalLetters.toLocaleString()}
							</div>
							<div className="text-sm text-muted-foreground">
								{language === "de"
									? "Briefe geschrieben"
									: language === "fr"
										? "Lettres écrites"
										: "Letters written"}
							</div>
						</div>
						{stats.uniqueRepresentatives > 0 && (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary">
									{stats.uniqueRepresentatives}
								</div>
								<div className="text-sm text-muted-foreground">
									{language === "de"
										? "Abgeordnete erreicht"
										: language === "fr"
											? "Députés contactés"
											: "Representatives reached"}
								</div>
							</div>
						)}
						{goalProgress !== null && (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary">
									{goalProgress}%
								</div>
								<div className="text-sm text-muted-foreground">
									{language === "de"
										? "Ziel erreicht"
										: language === "fr"
											? "Objectif atteint"
											: "Goal reached"}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Country selection */}
				<section className="mb-12">
					<h2 className="text-xl font-semibold text-center mb-6">
						{language === "de"
							? "Wähle dein Land"
							: language === "fr"
								? "Choisissez votre pays"
								: "Select your country"}
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
						{campaign.countryCodes.map((countryCode) => {
							const info = COUNTRY_INFO[countryCode];
							if (!info) return null;

							return (
								<Link
									key={countryCode}
									href={`/c/${campaign.slug}/${countryCode}`}
									className="block"
								>
									<Card className="text-center hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
										<CardContent className="pt-6 pb-4">
											<div className="text-4xl mb-2">{info.flag}</div>
											<div className="font-medium text-sm">
												{info.name[language] ?? info.name.en}
											</div>
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</div>
				</section>

				{/* Campaign demands */}
				{activeDemands.length > 0 && (
					<section className="mb-12">
						<div className="flex items-center gap-2 mb-4">
							<Target className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold">
								{language === "de"
									? "Unsere Forderungen"
									: language === "fr"
										? "Nos demandes"
										: "Our Demands"}
							</h2>
						</div>
						<div className="space-y-3">
							{activeDemands.map((demand) => (
								<Card key={demand.id}>
									<CardContent className="pt-4 pb-4">
										<h3 className="font-medium">
											{getLocalizedText(demand.title)}
										</h3>
										{demand.description && (
											<p className="text-sm text-muted-foreground mt-1">
												{getLocalizedText(demand.description)}
											</p>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				)}

				{/* Completed demands (wins) */}
				{completedDemands.length > 0 && (
					<section className="mb-12">
						<div className="flex items-center gap-2 mb-4">
							<Users className="h-5 w-5 text-green-600" />
							<h2 className="text-xl font-semibold text-green-700 dark:text-green-500">
								{language === "de"
									? "Bereits erreicht"
									: language === "fr"
										? "Déjà atteint"
										: "Already Achieved"}
							</h2>
						</div>
						<div className="space-y-3">
							{completedDemands.map((demand) => (
								<Card
									key={demand.id}
									className="border-green-200 bg-green-50/50 dark:bg-green-950/20"
								>
									<CardContent className="pt-4 pb-4">
										<h3 className="font-medium text-green-700 dark:text-green-500 flex items-center gap-2">
											<span className="text-green-500">✓</span>
											{getLocalizedText(demand.title)}
										</h3>
										{demand.completedDate && (
											<p className="text-xs text-muted-foreground mt-1">
												{new Date(demand.completedDate).toLocaleDateString(
													language === "de"
														? "de-DE"
														: language === "fr"
															? "fr-FR"
															: "en-US",
												)}
											</p>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				)}

				{/* CTA */}
				{campaign.countryCodes.length === 1 && (
					<div className="text-center">
						<Button size="lg" asChild>
							<Link href={`/c/${campaign.slug}/${campaign.countryCodes[0]}`}>
								{language === "de"
									? "Brief schreiben"
									: language === "fr"
										? "Écrire une lettre"
										: "Write a letter"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				)}
			</main>

			<footer className="mt-auto border-t border-border/30 bg-muted/30">
				<div className="container mx-auto max-w-4xl px-6 py-6">
					<FooterSettings />
				</div>
			</footer>
		</div>
	);
}
