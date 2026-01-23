import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/context";
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
	title: {
		default: "Stimme für Iran | Voice for Iran",
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
		title: "Stimme für Iran | Voice for Iran",
		description:
			"Advocate for human rights in Iran. Write a personal letter to your Member of Parliament.",
		type: "website",
		locale: "de_DE",
		images: [
			{
				url: "/api/og",
				width: 1200,
				height: 630,
				alt: "Voice for Iran - Write to Your Representative",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Stimme für Iran | Voice for Iran",
		description: "Write to your representative for human rights in Iran",
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<LanguageProvider>{children}</LanguageProvider>
				<Toaster position="top-center" richColors />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
