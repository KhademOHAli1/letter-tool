/**
 * Generate French Postal Code → Circonscription Mapping
 *
 * Data sources:
 * 1. La Poste: code_postal → code_commune_insee
 * 2. data.gouv.fr: code_commune_insee → code_circonscription
 *
 * Output: JSON mapping of postal codes to circonscription(s)
 */

import { statSync, writeFileSync } from "node:fs";

const LAPOSTE_BASE_URL =
	"https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/lines?size=10000&format=json&select=code_postal,code_commune_insee";

const BUREAUX_URL =
	"https://static.data.gouv.fr/resources/liste-des-bureaux-de-vote-associes-a-leur-circonscription-legislative/20240612-133914/bureaux-de-vote-circonscriptions.csv";

interface LaPosteEntry {
	code_postal: string;
	code_commune_insee: string;
}

async function main() {
	console.log("Fetching La Poste postal code data...");
	
	// Paginate through all results
	const allEntries: LaPosteEntry[] = [];
	let url: string | null = LAPOSTE_BASE_URL;
	
	while (url) {
		const res = await fetch(url);
		const data = (await res.json()) as { results: LaPosteEntry[]; next?: string };
		allEntries.push(...data.results);
		url = data.next || null;
		process.stdout.write(`\r  Fetched ${allEntries.length} entries...`);
	}
	console.log("");

	// Build postal code → commune(s) mapping
	const plzToCommunes = new Map<string, Set<string>>();
	for (const entry of allEntries) {
		const plz = entry.code_postal.padStart(5, "0");
		const commune = entry.code_commune_insee;
		if (!plzToCommunes.has(plz)) {
			plzToCommunes.set(plz, new Set());
		}
		plzToCommunes.get(plz)!.add(commune);
	}
	console.log(`  ${plzToCommunes.size} unique postal codes`);

	console.log("Fetching bureaux de vote → circonscription data...");
	const bureauxRes = await fetch(BUREAUX_URL);
	const bureauxCsv = await bureauxRes.text();

	// Build commune → circonscription(s) mapping
	const communeToCirc = new Map<string, Set<string>>();
	const lines = bureauxCsv.trim().split("\n");
	for (let i = 1; i < lines.length; i++) {
		const parts = lines[i].split(",");
		// codeDepartement,nomDepartement,codeCirconscription,nomCirconscription,codeCommune,nomCommune,...
		const codeCirc = parts[2]; // e.g., "0104"
		const commune = parts[4]; // e.g., "01001"

		if (!communeToCirc.has(commune)) {
			communeToCirc.set(commune, new Set());
		}
		communeToCirc.get(commune)!.add(codeCirc);
	}
	console.log(`  ${communeToCirc.size} unique communes with circonscription`);

	// Build postal code → circonscription(s) mapping
	const plzToCirc = new Map<string, Set<string>>();
	let unmatchedPlz = 0;

	for (const [plz, communes] of plzToCommunes) {
		const circs = new Set<string>();
		for (const commune of communes) {
			const communeCircs = communeToCirc.get(commune);
			if (communeCircs) {
				for (const c of communeCircs) {
					circs.add(c);
				}
			}
		}
		if (circs.size > 0) {
			plzToCirc.set(plz, circs);
		} else {
			unmatchedPlz++;
		}
	}
	console.log(`  ${plzToCirc.size} postal codes with circonscription mapping`);
	console.log(`  ${unmatchedPlz} postal codes could not be matched`);

	// Analyze: how many PLZs map to exactly 1 circonscription?
	let singleCirc = 0;
	let multiCirc = 0;
	const multiCircStats: Record<number, number> = {};

	for (const [, circs] of plzToCirc) {
		if (circs.size === 1) {
			singleCirc++;
		} else {
			multiCirc++;
			multiCircStats[circs.size] = (multiCircStats[circs.size] || 0) + 1;
		}
	}

	console.log("\nAnalysis:");
	console.log(`  ${singleCirc} postal codes → 1 circonscription (${((singleCirc / plzToCirc.size) * 100).toFixed(1)}%)`);
	console.log(`  ${multiCirc} postal codes → multiple circonscriptions (${((multiCirc / plzToCirc.size) * 100).toFixed(1)}%)`);
	console.log("  Multi-circ breakdown:", multiCircStats);

	// Convert to JSON output (array format for smaller size)
	const output: Record<string, string[]> = {};
	for (const [plz, circs] of plzToCirc) {
		output[plz] = Array.from(circs).sort();
	}

	const outputPath = new URL("../src/lib/data/fr/plz-circonscription.json", import.meta.url).pathname;
	writeFileSync(outputPath, JSON.stringify(output, null, 0));
	console.log(`\nWritten to ${outputPath}`);

	// Check file size
	const stats = statSync(outputPath);
	console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
