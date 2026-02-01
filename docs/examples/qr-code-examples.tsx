/**
 * QR Code Component - Usage Examples
 * 
 * This file demonstrates various ways to use the QRCodeDisplay component
 * in your application.
 */

import { QRCodeDisplay, type QRCodeProps } from "@/components";

// Example 1: Basic usage with default settings
export function BasicQRCode() {
	return (
		<QRCodeDisplay 
			value="https://letter-tool.vercel.app" 
		/>
	);
}

// Example 2: Large QR code with custom label
export function LargeQRCode() {
	return (
		<QRCodeDisplay 
			value="https://letter-tool.vercel.app/de" 
			size={400}
			label="Germany Campaign - Scan to Write a Letter"
		/>
	);
}

// Example 3: Small compact QR code without actions
export function CompactQRCode() {
	return (
		<QRCodeDisplay 
			value="https://letter-tool.vercel.app" 
			size={150}
			includeMargin={false}
			showDownload={false}
			showCopy={false}
		/>
	);
}

// Example 4: QR code with download only
export function DownloadOnlyQRCode() {
	return (
		<QRCodeDisplay 
			value="https://letter-tool.vercel.app/ca" 
			showCopy={false}
			label="Canada"
		/>
	);
}

// Example 5: Grid of country QR codes
export function CountryQRCodeGrid() {
	const countries = [
		{ code: "de", name: "Germany" },
		{ code: "ca", name: "Canada" },
		{ code: "uk", name: "United Kingdom" },
		{ code: "fr", name: "France" },
		{ code: "us", name: "United States" },
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
			{countries.map((country) => (
				<div key={country.code} className="space-y-2">
					<h3 className="text-center font-medium">{country.name}</h3>
					<QRCodeDisplay
						value={`https://letter-tool.vercel.app/${country.code}`}
						size={200}
						label={country.code.toUpperCase()}
					/>
				</div>
			))}
		</div>
	);
}

// Example 6: Dynamic campaign QR code
export function CampaignQRCode({ 
	campaignSlug, 
	country 
}: { 
	campaignSlug: string; 
	country: string; 
}) {
	const url = `https://letter-tool.vercel.app/c/${campaignSlug}/${country}`;
	
	return (
		<QRCodeDisplay 
			value={url}
			size={300}
			label={`${campaignSlug} - ${country.toUpperCase()}`}
		/>
	);
}

// Example 7: Responsive QR code with conditional sizing
export function ResponsiveQRCode({ isMobile }: { isMobile: boolean }) {
	return (
		<QRCodeDisplay 
			value="https://letter-tool.vercel.app" 
			size={isMobile ? 200 : 400}
			label="Letter Tool"
		/>
	);
}

// Example 8: QR code with custom configuration
export function CustomQRCode() {
	const config: QRCodeProps = {
		value: "https://letter-tool.vercel.app/embed/iran-2026",
		size: 350,
		includeMargin: true,
		showDownload: true,
		showCopy: true,
		label: "Embeddable Widget",
	};

	return <QRCodeDisplay {...config} />;
}

// Example 9: QR code for sharing
export function ShareableQRCode({ 
	url, 
	title 
}: { 
	url: string; 
	title: string; 
}) {
	return (
		<div className="max-w-md mx-auto p-6 border rounded-lg">
			<h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
			<QRCodeDisplay 
				value={url}
				size={250}
				label="Scan to share"
			/>
			<p className="text-sm text-muted-foreground text-center mt-4">
				Share this QR code on social media or print materials
			</p>
		</div>
	);
}
