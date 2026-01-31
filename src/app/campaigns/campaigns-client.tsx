/**
 * Campaigns Directory - Client Component
 * Premium design matching the main letter form pages
 */

"use client";

import { ArrowRight, Megaphone, Vote } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FooterSettings } from "@/components/footer-settings";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignDemand } from "@/lib/types";

interface CampaignWithStats extends Campaign {
	demands?: CampaignDemand[];
	letterCount?: number;
}

interface CampaignsPageClientProps {
	campaigns: CampaignWithStats[];
	initialCountry?: string;
	initialSearch?: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
	de: "🇩🇪",
	ca: "🇨🇦",
	uk: "🇬🇧",
	us: "🇺🇸",
	fr: "🇫🇷",
};

export function CampaignsPageClient({
	campaigns,
	initialCountry,
	initialSearch,
}: CampaignsPageClientProps) {
	const [searchQuery, setSearchQuery] = useState(initialSearch || "");

	// Use the country from the URL path (passed via initialCountry prop)
	const selectedCountry = initialCountry || "de";

	// Show search only if more than 10 campaigns
	const showSearch = campaigns.length > 10;

	const filteredCampaigns = useMemo(() => {
		return campaigns.filter((campaign) => {
			// Campaigns are already filtered by country on the server
			// Only apply search filter here

			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const nameMatch = Object.values(campaign.name).some((n) =>
					n.toLowerCase().includes(query),
				);
				const descMatch = Object.values(campaign.description || {}).some((d) =>
					d.toLowerCase().includes(query),
				);
				if (!nameMatch && !descMatch) {
					return false;
				}
			}

			return true;
		});
	}, [campaigns, searchQuery]);

	const getLocalizedText = (
		content: Record<string, string> | undefined,
	): string => {
		if (!content) return "";
		return content.en || content.de || Object.values(content)[0] || "";
	};

	// Calculate totals for stats
	const totalLetters = campaigns.reduce(
		(sum, c) => sum + (c.letterCount || 0),
		0,
	);

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			{/* Hero Section - matching country page style */}
			<header className="relative heritage-gradient heritage-sun safe-area-top overflow-hidden">
				<div className="container mx-auto max-w-3xl px-6 pt-8 pb-10 md:pt-12 md:pb-14">
					<div className="text-center space-y-4 md:space-y-6">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
							<Vote className="h-4 w-4 shrink-0" />
							<span>Campaigns</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
							Make Your Voice Heard
						</h1>

						{/* Subheading */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							Join thousands writing to their representatives. Choose a campaign
							and take action in minutes.
						</p>

						{/* Stats pill */}
						{totalLetters > 0 && (
							<div className="pt-2">
								<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
									<span className="font-semibold text-primary">
										{totalLetters.toLocaleString()}
									</span>
									<span>letters sent across all campaigns</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Campaigns Section */}
			<main className="container mx-auto max-w-2xl px-4 py-10 md:py-12">
				{/* Search - only if >10 campaigns */}
				{showSearch && (
					<div className="mb-8">
						<input
							type="text"
							placeholder="Search campaigns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="
								w-full h-12 px-4 
								text-base bg-muted/50 border border-border/50
								rounded-xl outline-none
								placeholder:text-muted-foreground/50
								focus:border-primary/30 focus:ring-2 focus:ring-primary/10
								transition-all duration-200
							"
						/>
					</div>
				)}

				{filteredCampaigns.length === 0 ? (
					/* Empty state */
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
							<Megaphone className="h-7 w-7 text-muted-foreground/50" />
						</div>
						<h2 className="text-xl font-medium text-foreground mb-2">
							No campaigns yet
						</h2>
						<p className="text-muted-foreground max-w-sm mx-auto">
							New campaigns are coming soon. Check back later or visit the main
							letter tool to write to your representative.
						</p>
						<Link
							href={`/${selectedCountry}`}
							className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
						>
							Write a letter now
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					/* Campaign cards */
					<div className="space-y-4">
						{filteredCampaigns.map((campaign) => {
							const name = getLocalizedText(campaign.name);
							const description = getLocalizedText(campaign.description);
							const progress = campaign.goalLetters
								? Math.min(
										100,
										Math.round(
											((campaign.letterCount || 0) / campaign.goalLetters) *
												100,
										),
									)
								: null;

							// Use selected country if campaign supports it, otherwise use first available country
							const targetCountry = campaign.countryCodes.includes(
								selectedCountry,
							)
								? selectedCountry
								: campaign.countryCodes[0] || "de";

							return (
								<Link
									key={campaign.id}
									href={`/c/${campaign.slug}/${targetCountry}`}
									className="group block"
								>
									<div
										className="
											relative p-5 sm:p-6 rounded-xl
											bg-card border border-border/60
											transition-all duration-200 ease-out
											hover:border-primary/30 hover:shadow-md
											active:scale-[0.99]
										"
									>
										<div className="flex items-start gap-4">
											{/* Country flags */}
											<div className="flex flex-col items-center gap-0.5 pt-0.5">
												{campaign.countryCodes.slice(0, 3).map((code) => (
													<span key={code} className="text-lg leading-none">
														{COUNTRY_FLAGS[code] || "🌍"}
													</span>
												))}
												{campaign.countryCodes.length > 3 && (
													<span className="text-xs text-muted-foreground">
														+{campaign.countryCodes.length - 3}
													</span>
												)}
											</div>

											{/* Content */}
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
															{name}
														</h3>
														<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
															{description}
														</p>
													</div>
													<ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 shrink-0 transition-colors mt-0.5" />
												</div>

												{/* Progress */}
												{progress !== null && (
													<div className="mt-4 space-y-1.5">
														<Progress value={progress} className="h-1.5" />
														<div className="flex items-center justify-between text-xs text-muted-foreground">
															<span>
																{(campaign.letterCount || 0).toLocaleString()}{" "}
																letters
															</span>
															<span>{progress}% of goal</span>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="border-t border-border/50 bg-muted/20">
				<div className="container mx-auto max-w-4xl px-4 py-8">
					<FooterSettings />
				</div>
			</footer>
		</div>
	);
}
