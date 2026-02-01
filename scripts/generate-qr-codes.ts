/**
 * QR Code PNG Generator Script
 * Generates QR code PNG files for the deployment URL and all country-specific URLs
 * 
 * Usage: bun run scripts/generate-qr-codes.ts
 */

import QRCode from "qrcode";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUTPUT_DIR = join(process.cwd(), "qr-codes");
const DEPLOYMENT_URL = "https://letter-tool.vercel.app";

const QR_CONFIGS = [
	{
		name: "main",
		url: DEPLOYMENT_URL,
		size: 400,
		label: "Letter Tool - Main",
	},
	{
		name: "germany",
		url: `${DEPLOYMENT_URL}/de`,
		size: 300,
		label: "Germany (DE)",
	},
	{
		name: "canada",
		url: `${DEPLOYMENT_URL}/ca`,
		size: 300,
		label: "Canada (CA)",
	},
	{
		name: "uk",
		url: `${DEPLOYMENT_URL}/uk`,
		size: 300,
		label: "United Kingdom (UK)",
	},
	{
		name: "france",
		url: `${DEPLOYMENT_URL}/fr`,
		size: 300,
		label: "France (FR)",
	},
	{
		name: "usa",
		url: `${DEPLOYMENT_URL}/us`,
		size: 300,
		label: "United States (US)",
	},
];

async function generateQRCode(
	url: string,
	outputPath: string,
	size: number,
): Promise<void> {
	try {
		await QRCode.toFile(outputPath, url, {
			width: size,
			margin: 2,
			color: {
				dark: "#000000",
				light: "#FFFFFF",
			},
			type: "png",
		});
		console.log(`✅ Generated: ${outputPath}`);
	} catch (error) {
		console.error(`❌ Failed to generate ${outputPath}:`, error);
		throw error;
	}
}

async function main() {
	console.log("🎨 Generating QR Codes...\n");

	// Create output directory if it doesn't exist
	try {
		await mkdir(OUTPUT_DIR, { recursive: true });
		console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
	} catch (error) {
		console.error("❌ Failed to create output directory:", error);
		process.exit(1);
	}

	// Generate all QR codes
	for (const config of QR_CONFIGS) {
		const filename = `${config.name}-qr-${config.size}px.png`;
		const outputPath = join(OUTPUT_DIR, filename);

		console.log(`🔨 Generating: ${config.label}`);
		console.log(`   URL: ${config.url}`);
		console.log(`   Size: ${config.size}x${config.size}px`);

		await generateQRCode(config.url, outputPath, config.size);
		console.log();
	}

	// Create README in output directory
	const readmeContent = `# Generated QR Codes

Generated on: ${new Date().toISOString()}
Deployment URL: ${DEPLOYMENT_URL}

## Files

${QR_CONFIGS.map(
	(config) =>
		`- **${config.name}-qr-${config.size}px.png** - ${config.label}\n  URL: ${config.url}`,
).join("\n\n")}

## Usage

These QR codes can be used in:
- Print materials (flyers, posters)
- Social media graphics
- Presentation slides
- Marketing campaigns
- Event materials

## Regeneration

To regenerate these QR codes, run:
\`\`\`bash
bun run scripts/generate-qr-codes.ts
\`\`\`
`;

	const readmePath = join(OUTPUT_DIR, "README.md");
	await writeFile(readmePath, readmeContent);
	console.log(`📄 Created: ${readmePath}`);

	console.log("\n✨ All QR codes generated successfully!");
	console.log(`📂 Check the ${OUTPUT_DIR} directory`);
}

main().catch((error) => {
	console.error("❌ Script failed:", error);
	process.exit(1);
});
