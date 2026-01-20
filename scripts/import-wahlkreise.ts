/**
 * Script to import Wahlkreis data from Bundeswahlleiter CSV
 * Run with: bun run scripts/import-wahlkreise.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface WahlkreisData {
	id: string;
	name: string;
	land: string;
	plzSet: Set<string>;
}

const CSV_PATH = "/Users/ali/Downloads/btw25_wkr_gemeinden_20241130_utf8.csv";
const OUTPUT_PATH = join(import.meta.dir, "../src/lib/data/wahlkreise-data.json");

function parseCSV() {
	const content = readFileSync(CSV_PATH, "utf-8");
	const lines = content.split("\n");

	const wahlkreise = new Map<string, WahlkreisData>();

	for (const line of lines) {
		// Skip comments and header
		if (line.startsWith("#") || line.startsWith("Wahlkreis-Nr") || !line.trim()) {
			continue;
		}

		const parts = line.split(";");
		if (parts.length < 16) continue;

		const [
			wahlkreisNr,
			wahlkreisBez,
			_rgsLand,
			_rgsRegBez,
			_rgsKreis,
			_rgsGemVerband,
			_rgsGemeinde,
			landname,
			_regBezName,
			_kreisname,
			_gemVerbandName,
			_gemeindename,
			_gemeindeteil,
			_wahlkreisVon,
			_wahlkreisBis,
			plzGemVerwaltung,
			_plzMehrere,
		] = parts;

		if (!wahlkreisNr || !wahlkreisBez) continue;

		const id = wahlkreisNr.padStart(3, "0");

		if (!wahlkreise.has(id)) {
			wahlkreise.set(id, {
				id,
				name: wahlkreisBez.trim(),
				land: landname?.trim() || "",
				plzSet: new Set(),
			});
		}

		// Add PLZ (can be 4 or 5 digits)
		const plz = plzGemVerwaltung?.trim();
		if (plz && /^\d{4,5}$/.test(plz)) {
			const normalizedPlz = plz.padStart(5, "0");
			wahlkreise.get(id)!.plzSet.add(normalizedPlz);
		}
	}

	// Convert to array and sort
	const result = Array.from(wahlkreise.values())
		.map((wk) => ({
			id: wk.id,
			name: wk.name,
			land: wk.land,
			plzList: Array.from(wk.plzSet).sort(),
		}))
		.sort((a, b) => a.id.localeCompare(b.id));

	return result;
}

function main() {
	console.log("Importing Wahlkreis data from:", CSV_PATH);

	const wahlkreise = parseCSV();

	console.log(`Found ${wahlkreise.length} Wahlkreise`);
	console.log(`Total unique PLZ: ${wahlkreise.reduce((sum, wk) => sum + wk.plzList.length, 0)}`);

	// Write JSON
	writeFileSync(OUTPUT_PATH, JSON.stringify(wahlkreise, null, "\t"));
	console.log(`Written to: ${OUTPUT_PATH}`);

	// Sample output
	console.log("\nSample (first 3):");
	for (const wk of wahlkreise.slice(0, 3)) {
		console.log(`  ${wk.id}: ${wk.name} (${wk.land}) - ${wk.plzList.length} PLZ`);
	}
}

main();
