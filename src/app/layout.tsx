import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
	title: "Stimme für Iran | Schreib deinem MdB",
	description:
		"Setze dich für Menschenrechte im Iran ein. Schreibe einen persönlichen Brief an deinen Bundestagsabgeordneten – schnell, einfach und wirkungsvoll.",
	keywords: [
		"Iran",
		"Menschenrechte",
		"Bundestag",
		"MdB",
		"Brief schreiben",
		"Solidarität",
		"Diaspora",
	],
	icons: {
		icon: "/favicon.svg",
		apple: "/favicon.svg",
	},
	openGraph: {
		title: "Stimme für Iran | Schreib deinem MdB",
		description:
			"Setze dich für Menschenrechte im Iran ein. Schreibe einen persönlichen Brief an deinen Bundestagsabgeordneten.",
		type: "website",
		locale: "de_DE",
		images: [
			{
				url: "/api/og",
				width: 1200,
				height: 630,
				alt: "Stimme für Iran - Schreib deinem Bundestagsabgeordneten",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Stimme für Iran",
		description: "Schreibe deinem MdB für Menschenrechte im Iran",
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
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
