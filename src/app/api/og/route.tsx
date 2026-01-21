import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
						Deine Stimme zählt
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
					Stimme für Iran
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
					Schreib deinem Bundestagsabgeordneten für Menschenrechte im Iran
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
						In 5 Minuten deinen Brief schreiben →
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
				<span>stimme-fuer-iran.de</span>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
