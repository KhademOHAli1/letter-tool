import type { NextConfig } from "next";

// Content Security Policy - strict but allows necessary resources
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://www.bundestag.de https://www.ourcommons.ca https://members-api.parliament.uk data: blob:;
  font-src 'self';
  connect-src 'self' https://api.openai.com https://api.postcodes.io;
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
