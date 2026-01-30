/**
 * Campaigns Directory Page
 * Lists all active campaigns with filtering and search
 * Phase 6: Frontend Public Campaign Experience
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { FooterSettings } from "@/components/footer-settings";
import { HeaderSettings } from "@/components/header-settings";
import { listActiveCampaigns } from "@/lib/campaigns";
import { CampaignsClientContent } from "./campaigns-client";

export const metadata: Metadata = {
	title: "Active Campaigns | Voice for Change",
	description:
		"Browse active letter-writing campaigns and make your voice heard. Write to your representatives on issues that matter.",
	openGraph: {
		title: "Active Campaigns | Voice for Change",
		description:
			"Browse active letter-writing campaigns and make your voice heard.",
		type: "website",
	},
};

// Revalidate every 5 minutes
export const revalidate = 300;

interface CampaignsPageProps {
	searchParams: Promise<{ country?: string; q?: string }>;
}

export default async function CampaignsPage({
	searchParams,
}: CampaignsPageProps) {
	const params = await searchParams;
	const countryFilter = params.country;

	// Fetch all active campaigns (filtered by country if specified)
	const campaigns = await listActiveCampaigns(countryFilter);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold">Campaigns</h1>
						<p className="text-sm text-muted-foreground">
							Make your voice heard
						</p>
					</div>
					<HeaderSettings />
				</div>
			</header>

			<main className="container mx-auto max-w-6xl px-4 py-8">
				{/* Hero section */}
				<div className="text-center mb-10">
					<h2 className="text-3xl font-bold tracking-tight mb-3">
						Active Campaigns
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Join thousands of people making their voices heard. Choose a
						campaign and write a personal letter to your representative in
						minutes.
					</p>
				</div>

				{/* Filters and Campaign Grid */}
				<Suspense
					fallback={
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="h-64 animate-pulse rounded-xl bg-muted"
								/>
							))}
						</div>
					}
				>
					<CampaignsClientContent
						campaigns={campaigns}
						initialCountry={countryFilter}
						initialSearch={params.q}
					/>
				</Suspense>

				{/* Empty state */}
				{campaigns.length === 0 && (
					<div className="text-center py-16">
						<p className="text-lg text-muted-foreground">
							No active campaigns found.
						</p>
						{countryFilter && (
							<p className="text-sm text-muted-foreground mt-2">
								Try removing the country filter to see all campaigns.
							</p>
						)}
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="border-t py-6">
				<div className="container mx-auto max-w-6xl px-4 flex justify-center">
					<FooterSettings />
				</div>
			</footer>
		</div>
	);
}
