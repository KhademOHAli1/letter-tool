/**
 * Process ZIP code to Congressional District mapping
 *
 * Source: OpenSourceActivismTech/us-zipcodes-congress
 * (Updated for 119th Congress as of July 2024)
 *
 * Run: bun run scripts/process-us-zipcodes.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface ZipDistrictEntry {
	state_fips: string;
	state_abbr: string;
	zcta: string;
	cd: string;
}

interface ZipMapping {
	zipCode: string;
	state: string;
	districts: string[];
}

async function processZipCodes() {
	console.log("📥 Reading ZIP-CD CSV...");

	const csv = readFileSync("/tmp/zccd.csv", "utf-8");
	const lines = csv.trim().split("\n");

	// Skip header
	const header = lines[0];
	console.log(`   Header: ${header}`);

	// Parse entries
	const entries: ZipDistrictEntry[] = [];
	for (let i = 1; i < lines.length; i++) {
		const [state_fips, state_abbr, zcta, cd] = lines[i].split(",");
		entries.push({ state_fips, state_abbr, zcta, cd });
	}

	console.log(`📊 Parsed ${entries.length} raw entries`);

	// Group by ZIP code - some ZIPs span multiple districts
	const zipMap = new Map<string, ZipMapping>();

	for (const entry of entries) {
		const zipCode = entry.zcta.padStart(5, "0");
		const districtNum = Number.parseInt(entry.cd);

		// Format district as STATE-XX
		const district = `${entry.state_abbr}-${String(districtNum).padStart(2, "0")}`;

		if (zipMap.has(zipCode)) {
			const existing = zipMap.get(zipCode)!;
			if (!existing.districts.includes(district)) {
				existing.districts.push(district);
			}
		} else {
			zipMap.set(zipCode, {
				zipCode,
				state: entry.state_abbr,
				districts: [district],
			});
		}
	}

	console.log(`📊 Unique ZIP codes: ${zipMap.size}`);

	// Convert to our JSON format: { "12345": "CA-12" } or { "12345": ["CA-12", "CA-13"] }
	const zipDistrict: Record<string, string | string[]> = {};

	let singleDistrict = 0;
	let multiDistrict = 0;

	for (const [zip, mapping] of zipMap) {
		if (mapping.districts.length === 1) {
			zipDistrict[zip] = mapping.districts[0];
			singleDistrict++;
		} else {
			// Sort districts and store as array
			zipDistrict[zip] = mapping.districts.sort();
			multiDistrict++;
		}
	}

	console.log(
		`   Single-district ZIPs: ${singleDistrict} (${((singleDistrict / zipMap.size) * 100).toFixed(1)}%)`,
	);
	console.log(
		`   Multi-district ZIPs: ${multiDistrict} (${((multiDistrict / zipMap.size) * 100).toFixed(1)}%)`,
	);

	// Write output file
	const outputPath = resolve(
		import.meta.dir,
		"../src/lib/data/us/zip-district.json",
	);

	writeFileSync(outputPath, JSON.stringify(zipDistrict, null, 2));

	console.log("\n✅ Successfully wrote zip-district.json");

	// Stats by state
	const stateCounts = new Map<string, number>();
	for (const mapping of zipMap.values()) {
		stateCounts.set(
			mapping.state,
			(stateCounts.get(mapping.state) || 0) + 1,
		);
	}

	console.log("\n📍 ZIP codes by state (top 10):");
	const sorted = [...stateCounts.entries()].sort((a, b) => b[1] - a[1]);
	for (const [state, count] of sorted.slice(0, 10)) {
		console.log(`   ${state}: ${count}`);
	}

	// Sample multi-district ZIPs
	console.log("\n🔀 Sample multi-district ZIPs:");
	let count = 0;
	for (const [zip, value] of Object.entries(zipDistrict)) {
		if (Array.isArray(value) && count < 5) {
			console.log(`   ${zip}: ${value.join(", ")}`);
			count++;
		}
	}
}

processZipCodes().catch(console.error);
