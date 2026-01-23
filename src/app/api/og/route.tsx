import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Localized content for OG image
const OG_CONTENT = {
	de: {
		badge: "Deine Stimme zählt",
		title: "Stimme für Iran",
		subtitle:
			"Schreib deinem Bundestagsabgeordneten für Menschenrechte im Iran",
		cta: "In 5 Minuten deinen Brief schreiben →",
		domain: "stimme-fuer-iran.de",
	},
	ca: {
		badge: "Your Voice Matters",
		title: "Voice for Iran",
		subtitle: "Write to your Member of Parliament for human rights in Iran",
		cta: "Write your letter in 5 minutes →",
		domain: "voiceforiran.ca",
	},
	uk: {
		badge: "Your Voice Matters",
		title: "Voice for Iran",
		subtitle: "Write to your Member of Parliament for human rights in Iran",
		cta: "Write your letter in 5 minutes →",
		domain: "voiceforiran.uk",
	},
} as const;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const country = searchParams.get("country") || "de";
	const content =
		OG_CONTENT[country as keyof typeof OG_CONTENT] || OG_CONTENT.de;

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#0a0a0a",
				backgroundImage:
					"radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)",
				backgroundSize: "100% 100%",
				backgroundBlendMode: "overlay",
			}}
		>
			{/* Main content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "60px",
					textAlign: "center",
				}}
			>
				{/* Badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						backgroundColor: "rgba(16, 185, 129, 0.2)",
						padding: "8px 20px",
						borderRadius: "50px",
						marginBottom: "32px",
					}}
				>
					<span
						style={{
							fontSize: "20px",
							color: "#10b981",
							fontWeight: "600",
						}}
					>
						{content.badge}
					</span>
				</div>

				{/* Title */}
				<h1
					style={{
						fontSize: "72px",
						fontWeight: "bold",
						color: "#ffffff",
						marginBottom: "16px",
						lineHeight: 1.1,
					}}
				>
					{content.title}
				</h1>

				{/* Subtitle */}
				<p
					style={{
						fontSize: "28px",
						color: "#a1a1aa",
						maxWidth: "700px",
						lineHeight: 1.4,
					}}
				>
					{content.subtitle}
				</p>

				{/* CTA hint */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginTop: "48px",
						padding: "16px 32px",
						backgroundColor: "#10b981",
						borderRadius: "12px",
					}}
				>
					<span
						style={{
							fontSize: "24px",
							fontWeight: "600",
							color: "#ffffff",
						}}
					>
						{content.cta}
					</span>
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					position: "absolute",
					bottom: "40px",
					display: "flex",
					alignItems: "center",
					gap: "8px",
					color: "#71717a",
					fontSize: "18px",
				}}
			>
				<span>{content.domain}</span>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
