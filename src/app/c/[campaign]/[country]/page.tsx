"use client";

/**
 * Campaign country page - main letter form
 * Phase 3, Epic 3.1
 */

import { Vote } from "lucide-react";
import { useParams } from "next/navigation";
import { CampaignGoal } from "@/components/campaign-goal";
import { FooterSettings } from "@/components/footer-settings";
import { ImpactStats } from "@/components/impact-stats";
import { LetterForm } from "@/components/letter-form";
import { LetterHistory } from "@/components/letter-history";
import { useCampaign } from "@/lib/campaigns/context";
import { type CountryCode, getCountryConfig } from "@/lib/country-config";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

export default function CampaignCountryPage() {
	const params = useParams<{ campaign: string; country: string }>();
	const { campaign, getLocalizedText } = useCampaign();
	const { language } = useLanguage();

	const country = params.country as CountryCode;
	const config = getCountryConfig(country);

	// Get campaign name
	const campaignName = getLocalizedText(campaign.name);

	// Get representative label based on language
	const getRepresentativeLabel = () => {
		if (!config) return "";
		if (language === "de") return config.representativeLabel.native;
		if (language === "fr" && config.representativeLabel.fr)
			return config.representativeLabel.fr;
		return config.representativeLabel.en;
	};

	// Get footer text based on language
	const getFooterText = (field: "diaspora" | "mission") => {
		if (!config) return "";
		const text = config.footer[field];
		if (language === "de") return text.native;
		if (language === "fr" && text.fr) return text.fr;
		return text.en;
	};

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			{/* Hero Section */}
			<header className="relative heritage-gradient heritage-sun safe-area-top overflow-hidden">
				<div className="container mx-auto max-w-3xl px-6 pt-8 pb-10 md:pt-12 md:pb-14">
					<div className="text-center space-y-4 md:space-y-6">
						{/* Badge with campaign name */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
							<Vote className="h-4 w-4 shrink-0" />
							<span>{campaignName}</span>
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

			{/* Campaign Goal */}
			<section className="container mx-auto max-w-2xl px-4 pt-8">
				<CampaignGoal country={country} campaignSlug={campaign.slug} />
			</section>

			{/* Letter History */}
			<section className="container mx-auto max-w-2xl px-4 pt-6">
				<LetterHistory />
			</section>

			{/* Main Form */}
			<main className="container mx-auto max-w-2xl px-4 py-10 md:py-12">
				<LetterForm campaignSlug={campaign.slug} />
			</main>

			{/* Impact Stats */}
			<ImpactStats campaignId={campaign.id} />

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
						{/* Legal Links */}
						{config &&
							(config.legalPages.impressum || config.legalPages.privacy) && (
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
