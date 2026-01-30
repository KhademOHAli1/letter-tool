import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaignWithDemands } from "@/lib/campaigns";
import { EmbedLetterForm } from "./embed-letter-form";

interface PageProps {
	params: Promise<{ campaign: string }>;
	searchParams: Promise<{
		country?: string;
		theme?: "light" | "dark" | "auto";
		hideHeader?: string;
		hideStats?: string;
		primaryColor?: string;
	}>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { campaign: slug } = await params;
	const campaign = await getCampaignWithDemands(slug);

	if (!campaign) {
		return { title: "Campaign Not Found" };
	}

	// Get localized name
	const name =
		campaign.name?.en || Object.values(campaign.name || {})[0] || slug;

	return {
		title: `Write a Letter | ${name}`,
		description: `Join the ${name} campaign - write a letter to your representative`,
		// Prevent iframe from being indexed
		robots: { index: false, follow: false },
	};
}

export default async function EmbedCampaignPage({
	params,
	searchParams,
}: PageProps) {
	const { campaign: slug } = await params;
	const options = await searchParams;

	const campaign = await getCampaignWithDemands(slug);

	if (!campaign) {
		notFound();
	}

	// Extract demands from campaign (CampaignWithDemands has demands property)
	const { demands, ...campaignData } = campaign;

	// Default country from campaign or fallback to 'de'
	const country = options.country || campaignData.countryCodes?.[0] || "de";

	return (
		<EmbedLetterForm
			campaign={campaignData}
			demands={demands}
			country={country}
			options={{
				theme: options.theme || "auto",
				hideHeader: options.hideHeader === "true",
				hideStats: options.hideStats === "true",
				primaryColor: options.primaryColor,
			}}
		/>
	);
}
