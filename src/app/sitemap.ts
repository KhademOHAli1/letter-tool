import type { MetadataRoute } from "next";
import { listActiveCampaigns } from "@/lib/campaigns";
import { clientEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = clientEnv.NEXT_PUBLIC_BASE_URL;
	const lastModified = new Date();

	// All supported countries
	const countries = ["de", "ca", "uk", "fr", "us"];

	// Languages per country
	const countryLanguages: Record<string, string[]> = {
		de: ["de", "en"],
		ca: ["en", "fr"],
		uk: ["en"],
		fr: ["fr", "en"],
		us: ["en"],
	};

	// Document slugs per country
	const countryDocs: Record<string, string[]> = {
		de: ["datenschutz", "impressum", "daten-transparenz"],
		ca: ["privacy-policy", "legal-notice", "data-transparency"],
		uk: ["privacy-policy", "legal-notice", "data-transparency"],
		fr: ["privacy-policy", "legal-notice", "data-transparency"],
		us: ["privacy-policy", "legal-notice", "data-transparency"],
	};

	const urls: MetadataRoute.Sitemap = [];

	// Homepage
	urls.push({
		url: baseUrl,
		lastModified,
		changeFrequency: "weekly",
		priority: 1,
	});

	// Country pages and their sub-pages
	for (const country of countries) {
		const langs = countryLanguages[country] ?? ["en"];
		const docs = countryDocs[country] ?? [];

		// Main country page
		urls.push({
			url: `${baseUrl}/${country}`,
			lastModified,
			changeFrequency: "weekly",
			priority: 0.9,
			alternates: {
				languages: Object.fromEntries(
					langs.map((lang) => [lang, `${baseUrl}/${country}?lang=${lang}`]),
				),
			},
		});

		// Editor page
		urls.push({
			url: `${baseUrl}/${country}/editor`,
			lastModified,
			changeFrequency: "weekly",
			priority: 0.8,
		});

		// Success page (lower priority, mainly for sharing)
		urls.push({
			url: `${baseUrl}/${country}/success`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.3,
		});

		// Document pages (privacy, legal, etc.)
		for (const doc of docs) {
			urls.push({
				url: `${baseUrl}/${country}/${doc}`,
				lastModified,
				changeFrequency: "monthly",
				priority: 0.4,
			});
		}
	}

	// Campaigns directory page
	urls.push({
		url: `${baseUrl}/campaigns`,
		lastModified,
		changeFrequency: "daily",
		priority: 0.9,
	});

	// Dynamic campaign pages
	try {
		const campaigns = await listActiveCampaigns();
		for (const campaign of campaigns) {
			// Campaign landing page
			urls.push({
				url: `${baseUrl}/c/${campaign.slug}`,
				lastModified: campaign.updatedAt
					? new Date(campaign.updatedAt)
					: lastModified,
				changeFrequency: "weekly",
				priority: 0.8,
			});

			// Campaign country pages
			for (const country of campaign.countryCodes) {
				urls.push({
					url: `${baseUrl}/c/${campaign.slug}/${country}`,
					lastModified: campaign.updatedAt
						? new Date(campaign.updatedAt)
						: lastModified,
					changeFrequency: "weekly",
					priority: 0.7,
				});

				// Campaign editor page
				urls.push({
					url: `${baseUrl}/c/${campaign.slug}/${country}/editor`,
					lastModified,
					changeFrequency: "weekly",
					priority: 0.6,
				});
			}
		}
	} catch (error) {
		// If campaigns fetch fails, continue without them
		console.error("Failed to fetch campaigns for sitemap:", error);
	}

	return urls;
}
