/**
 * Script to fetch MdB data with image URLs from Bundestag XML API
 * Run with: bun run scripts/fetch-mdb-images.ts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const MDB_INDEX_URL = "https://www.bundestag.de/xml/v2/mdb/index.xml";
const OUTPUT_PATH = join(import.meta.dir, "../src/lib/data/mdb-data.json");

interface MdBOutput {
	id: string;
	name: string;
	vorname: string;
	nachname: string;
	party: string;
	wahlkreisId: string;
	wahlkreisName: string;
	email: string;
	imageUrl: string;
}

function generateEmail(name: string): string {
	// Generate Wahlkreisbüro email: vorname.nachname.wk@bundestag.de
	// Format ist besser für direkten Bürgerkontakt als Berlin-Büro
	
	// Extract vorname and nachname from full name
	// Name format: "Nachname, Vorname" or "Nachname, Dr. Vorname"
	const parts = name.split(",").map((s) => s.trim());
	if (parts.length < 2) return "";

	const nachname = parts[0];
	let vorname = parts[1];

	// Remove titles from vorname
	vorname = vorname
		.replace(/^Dr\.\s*/i, "")
		.replace(/^Prof\.\s*/i, "")
		.replace(/^Dr\.\s*jur\.\s*/i, "")
		.trim();

	// Take only first name if multiple
	vorname = vorname.split(" ")[0];

	const normalize = (s: string) =>
		s
			.toLowerCase()
			.replace(/ä/g, "ae")
			.replace(/ö/g, "oe")
			.replace(/ü/g, "ue")
			.replace(/ß/g, "ss")
			.replace(/é/g, "e")
			.replace(/è/g, "e")
			.replace(/ê/g, "e")
			.replace(/á/g, "a")
			.replace(/à/g, "a")
			.replace(/ô/g, "o")
			.replace(/ç/g, "c")
			.replace(/[^a-z-]/g, "")
			.replace(/-+/g, "-");

	// .wk = Wahlkreisbüro (direkter Kontakt für Bürger)
	return `${normalize(vorname)}.${normalize(nachname)}.wk@bundestag.de`;
}

function mapFraktionToParty(fraktion: string): string {
	if (fraktion.includes("CDU") || fraktion.includes("CSU")) return "CDU/CSU";
	if (fraktion === "SPD") return "SPD";
	if (fraktion.includes("Grünen") || fraktion.includes("Bündnis 90"))
		return "GRÜNE";
	if (fraktion === "AfD") return "AfD";
	if (fraktion.includes("Linke")) return "DIE LINKE";
	if (fraktion.includes("BSW") || fraktion.includes("Wagenknecht"))
		return "BSW";
	if (fraktion.includes("FDP")) return "FDP";
	return fraktion;
}

async function main() {
	console.log("Fetching MdB index from:", MDB_INDEX_URL);

	const response = await fetch(MDB_INDEX_URL);
	const xml = await response.text();

	// Parse XML manually (simple regex approach for this specific format)
	const mdbs: MdBOutput[] = [];

	// Match each <mdb> block
	const mdbRegex = /<mdb\s+fraktion="([^"]*)">([\s\S]*?)<\/mdb>/g;
	let match: RegExpExecArray | null;

	while ((match = mdbRegex.exec(xml)) !== null) {
		const fraktion = match[1];
		const content = match[2];

		// Extract fields
		const getId = (tag: string) => {
			const m = content.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
			return m ? m[1].trim() : "";
		};

		const id = getId("mdbID");
		const name = getId("mdbName");
		const wkNummer = getId("mdbWahlkreisNummer");
		const wkName = getId("mdbWahlkreisName");
		const imageUrl = getId("mdbFotoURL");

		// Skip inactive MdBs
		if (!id || !name) continue;

		// Extract vorname/nachname from name (format: "Nachname, Vorname")
		const nameParts = name.split(",").map((s) => s.trim());
		const nachname = nameParts[0] || "";
		const vorname = nameParts[1] || "";

		// Format wahlkreisId with leading zeros
		const wahlkreisId = wkNummer ? wkNummer.padStart(3, "0") : "000";

		mdbs.push({
			id,
			name: `${vorname} ${nachname}`.trim(),
			vorname,
			nachname,
			party: mapFraktionToParty(fraktion),
			wahlkreisId,
			wahlkreisName: wkName,
			email: generateEmail(name),
			imageUrl,
		});
	}

	// Sort by wahlkreisId then by name
	mdbs.sort(
		(a, b) =>
			a.wahlkreisId.localeCompare(b.wahlkreisId) ||
			a.nachname.localeCompare(b.nachname),
	);

	console.log(`Found ${mdbs.length} MdBs`);

	// Statistics
	const byParty: Record<string, number> = {};
	for (const mdb of mdbs) {
		byParty[mdb.party] = (byParty[mdb.party] || 0) + 1;
	}
	console.log("\nNach Partei:");
	for (const [party, count] of Object.entries(byParty).sort(
		(a, b) => b[1] - a[1],
	)) {
		console.log(`  ${party}: ${count}`);
	}

	const withWk = mdbs.filter((m) => m.wahlkreisId !== "000");
	console.log(`\nMit Wahlkreis: ${withWk.length}`);
	console.log(`Ohne Wahlkreis: ${mdbs.length - withWk.length}`);

	const withImage = mdbs.filter((m) => m.imageUrl);
	console.log(`Mit Bild: ${withImage.length}`);

	// Write JSON
	writeFileSync(OUTPUT_PATH, JSON.stringify(mdbs, null, "\t"));
	console.log(`\nWritten to: ${OUTPUT_PATH}`);

	// Examples
	console.log("\nBeispiele (erste 5 mit WK):");
	for (const mdb of withWk.slice(0, 5)) {
		console.log(
			`  WK ${mdb.wahlkreisId}: ${mdb.name} (${mdb.party}) - ${mdb.imageUrl.substring(0, 60)}...`,
		);
	}
}

main().catch(console.error);
