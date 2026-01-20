import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
	openGraph: {
		title: "Stimme für Iran | Schreib deinem MdB",
		description:
			"Setze dich für Menschenrechte im Iran ein. Schreibe einen persönlichen Brief an deinen Bundestagsabgeordneten.",
		type: "website",
		locale: "de_DE",
	},
	twitter: {
		card: "summary_large_image",
		title: "Stimme für Iran",
		description: "Schreibe deinem MdB für Menschenrechte im Iran",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
