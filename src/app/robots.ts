import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = clientEnv.NEXT_PUBLIC_BASE_URL;

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
