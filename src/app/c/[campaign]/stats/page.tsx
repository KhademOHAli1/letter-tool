import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/campaigns/queries";
import { CampaignStatsClient } from "./campaign-stats-client";

// Helper function to get localized text
function getLocalizedText(
	text: Record<string, string> | null | undefined,
	lang = "en",
): string {
	if (!text) return "";
	if (text[lang]) return text[lang];
	const values = Object.values(text);
	return values[0] ?? "";
}

interface PageProps {
	params: Promise<{ campaign: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { campaign: slug } = await params;
	const campaign = await getCampaignBySlug(slug);

	if (!campaign) {
		return { title: "Campaign Not Found" };
	}

	const name = getLocalizedText(campaign.name, "en");
	return {
		title: `Stats | ${name}`,
		description: `View the impact and progress of the ${name} campaign`,
	};
}

export default async function CampaignStatsPage({ params }: PageProps) {
	const { campaign: slug } = await params;
	const campaign = await getCampaignBySlug(slug);

	if (!campaign) {
		notFound();
	}

	return <CampaignStatsClient campaign={campaign} />;
}
