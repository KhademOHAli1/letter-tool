/**
 * Campaigns Directory - Client Component
 * Premium design matching the main letter form pages
 */

"use client";

import { ArrowRight, Megaphone, Users, Vote } from "lucide-react";
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

// Country labels for elegant display
const COUNTRY_LABELS: Record<string, string> = {
	de: "Germany",
	ca: "Canada",
	uk: "United Kingdom",
	us: "United States",
	fr: "France",
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
						<p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed break-normal">
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
											relative p-6 rounded-2xl
											bg-linear-to-br from-card to-card/80
											border border-border/40
											shadow-sm
											transition-all duration-300 ease-out
											hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5
											hover:-translate-y-0.5
											active:scale-[0.995]
										"
									>
										{/* Subtle gradient overlay on hover */}
										<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

										<div className="relative flex flex-col gap-4">
											{/* Header: Title and Arrow */}
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
														{name}
													</h3>
													<p className="text-sm text-muted-foreground/80 mt-1.5 line-clamp-2 leading-relaxed">
														{description}
													</p>
												</div>
												<div className="shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
													<ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
												</div>
											</div>

											{/* Progress section */}
											{progress !== null && (
												<div className="space-y-2">
													<Progress
														value={progress}
														className="h-1 bg-muted/50"
													/>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
															<Users className="h-3 w-3" />
															<span>
																{(campaign.letterCount || 0).toLocaleString()}{" "}
																letters
															</span>
														</div>
														<span className="text-xs font-medium text-muted-foreground/70">
															{progress}%
														</span>
													</div>
												</div>
											)}

											{/* Footer: Country tags */}
											<div className="flex items-center gap-2 pt-1">
												{campaign.countryCodes.slice(0, 3).map((code) => (
													<span
														key={code}
														className="
															inline-flex px-2.5 py-1 
															text-[11px] font-medium uppercase tracking-wider
															text-muted-foreground/60
															bg-muted/40 rounded-md
															border border-border/30
														"
														title={COUNTRY_LABELS[code] || code.toUpperCase()}
													>
														{code}
													</span>
												))}
												{campaign.countryCodes.length > 3 && (
													<span className="text-[11px] text-muted-foreground/50">
														+{campaign.countryCodes.length - 3} more
													</span>
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
