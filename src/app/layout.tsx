import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { clientEnv } from "@/lib/env";
import { LanguageProvider } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n/translations";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(clientEnv.NEXT_PUBLIC_BASE_URL),
	title: {
		default: "Stimme für Iran",
		template: "%s",
	},
	description:
		"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
	keywords: [
		"Iran",
		"human rights",
		"Menschenrechte",
		"droits humains",
		"Member of Parliament",
		"Bundestag",
		"letter",
		"advocacy",
	],
	icons: {
		icon: "/favicon.svg",
		apple: "/favicon.svg",
	},
	openGraph: {
		title: "Stimme für Iran",
		description:
			"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament.",
		type: "website",
		locale: "de_DE",
		images: [
			{
				url: "/api/og?country=de&lang=de",
				width: 1200,
				height: 630,
				alt: "Stimme für Iran",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Stimme für Iran",
		description: "Write to your representative for human rights in Iran",
		images: [
			{
				url: "/api/og?country=de&lang=de",
				alt: "Stimme für Iran",
			},
		],
	},
};

// Viewport configuration for iOS Safari
export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: "cover" as const,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Get language from cookie for initial HTML lang attribute
	const cookieStore = await cookies();
	const langCookie = cookieStore.get("language")?.value as Language | undefined;
	const htmlLang =
		langCookie && ["de", "en", "fr", "es"].includes(langCookie)
			? langCookie
			: "de";

	return (
		<html
			lang={htmlLang}
			suppressHydrationWarning
			className="overflow-x-hidden"
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full`}
			>
				<LanguageProvider>
					<SiteHeader />
					{children}
				</LanguageProvider>
				<Toaster position="top-center" richColors />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
