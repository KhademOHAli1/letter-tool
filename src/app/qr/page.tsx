import type { Metadata } from "next";
import { QRCodeDisplay } from "@/components/qr-code";

export const metadata: Metadata = {
	title: "QR Code - Letter Tool",
	description: "QR code for letter-tool.vercel.app",
	robots: {
		index: false,
		follow: false,
	},
};

export default function QRPage() {
	const deploymentUrl = "https://letter-tool.vercel.app";

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4">QR Code for Letter Tool</h1>
					<p className="text-lg text-muted-foreground mb-2">
						Scan to visit the platform
					</p>
					<p className="text-sm text-muted-foreground">
						<a
							href={deploymentUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							{deploymentUrl}
						</a>
					</p>
				</div>

				<div className="flex justify-center">
					<QRCodeDisplay
						value={deploymentUrl}
						size={400}
						label="letter-tool.vercel.app"
						showDownload={true}
						showCopy={true}
					/>
				</div>

				<div className="mt-12 space-y-4 text-sm text-muted-foreground">
					<h2 className="text-lg font-semibold text-foreground">
						Country-Specific QR Codes
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<h3 className="font-medium text-foreground">Germany</h3>
							<QRCodeDisplay
								value={`${deploymentUrl}/de`}
								size={200}
								label="Germany"
							/>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium text-foreground">Canada</h3>
							<QRCodeDisplay
								value={`${deploymentUrl}/ca`}
								size={200}
								label="Canada"
							/>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium text-foreground">United Kingdom</h3>
							<QRCodeDisplay
								value={`${deploymentUrl}/uk`}
								size={200}
								label="UK"
							/>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium text-foreground">France</h3>
							<QRCodeDisplay
								value={`${deploymentUrl}/fr`}
								size={200}
								label="France"
							/>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium text-foreground">United States</h3>
							<QRCodeDisplay
								value={`${deploymentUrl}/us`}
								size={200}
								label="US"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
