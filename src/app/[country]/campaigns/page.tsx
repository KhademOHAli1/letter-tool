/**
 * Country-specific Campaigns Directory Page
 * Lists all active campaigns for a specific country
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listActiveCampaigns } from "@/lib/campaigns";
import { isValidCountry } from "@/lib/country-config";
import { CampaignsPageClient } from "../../campaigns/campaigns-client";

export const metadata: Metadata = {
	title: "Campaigns | Voice for Change",
	description:
		"Browse active letter-writing campaigns and make your voice heard. Write to your representatives on issues that matter.",
};

// Revalidate every 5 minutes
export const revalidate = 300;

interface CountryCampaignsPageProps {
	params: Promise<{ country: string }>;
}

export default async function CountryCampaignsPage({
	params,
}: CountryCampaignsPageProps) {
	const { country } = await params;

	// Validate country
	if (!isValidCountry(country)) {
		notFound();
	}

	// Fetch campaigns for this country
	const campaigns = await listActiveCampaigns(country);

	return <CampaignsPageClient campaigns={campaigns} initialCountry={country} />;
}
