import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ?? "https://stimme-fuer-iran.de";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/preview/"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
