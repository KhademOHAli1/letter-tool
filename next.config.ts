import type { NextConfig } from "next";

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Content Security Policy - stricter in production
// In dev, we need unsafe-eval for hot reload
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://www.bundestag.de https://www.ourcommons.ca https://members-api.parliament.uk https://bioguide.congress.gov data: blob:;
  font-src 'self';
  connect-src 'self' https://api.openai.com https://api.postcodes.io https://*.supabase.co https://challenges.cloudflare.com;
  frame-src 'self' https://challenges.cloudflare.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`.replace(/\n/g, " ").trim();

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.bundestag.de",
				pathname: "/resource/image/**",
			},
			{
				protocol: "https",
				hostname: "www.ourcommons.ca",
				pathname: "/Content/Parliamentarians/Images/**",
			},
			{
				protocol: "https",
				hostname: "members-api.parliament.uk",
				pathname: "/api/Members/*/Thumbnail",
			},
			{
				protocol: "https",
				hostname: "bioguide.congress.gov",
				pathname: "/bioguide/photo/**",
			},
		],
	},
	// Security headers (additional to vercel.json)
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value: cspHeader,
					},
				],
			},
		];
	},
	// Disable powered by header
	poweredByHeader: false,
};

export default nextConfig;
