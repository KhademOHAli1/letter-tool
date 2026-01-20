/**
 * Script to import MdB data from Bundestag XML
 * Run with: bun run scripts/import-mdb.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseStringPromise } from "xml2js";

const XML_PATH = "/Users/ali/Downloads/mdb-stammdaten/MDB_STAMMDATEN.XML";
const OUTPUT_PATH = join(import.meta.dir, "../src/lib/data/mdb-data.json");

interface MdBOutput {
	id: string;
	name: string;
	vorname: string;
	nachname: string;
	titel: string;
	party: string;
	fraktion: string;
	wahlkreisId: string;
	wahlkreisName: string;
	mandatsart: string;
	email: string;
}

function generateEmail(vorname: string, nachname: string): string {
	// Standard Bundestag Email-Format: vorname.nachname@bundestag.de
	// Umlaute und Sonderzeichen normalisieren
	const normalize = (s: string) =>
		s.toLowerCase()
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

	return `${normalize(vorname)}.${normalize(nachname)}@bundestag.de`;
}

function mapFraktionToParty(fraktion: string): string {
	if (fraktion.includes("Christlich Demokrat") || fraktion.includes("Christlich - Sozial")) {
		return "CDU/CSU";
	}
	if (fraktion.includes("Sozialdemokrat")) {
		return "SPD";
	}
	if (fraktion.includes("Grünen") || fraktion.includes("BÜNDNIS 90")) {
		return "GRÜNE";
	}
	if (fraktion.includes("Freien Demokrat")) {
		return "FDP";
	}
	if (fraktion.includes("Alternative für Deutschland") || fraktion === "AfD") {
		return "AfD";
	}
	if (fraktion.includes("Linke")) {
		return "DIE LINKE";
	}
	if (fraktion.includes("BSW") || fraktion.includes("Sahra Wagenknecht")) {
		return "BSW";
	}
	if (fraktion.includes("fraktionslos")) {
		return "fraktionslos";
	}
	return fraktion;
}

async function main() {
	console.log("Reading XML from:", XML_PATH);
	const xmlContent = readFileSync(XML_PATH, "utf-8");

	console.log("Parsing XML...");
	const result = await parseStringPromise(xmlContent);

	const mdbs: MdBOutput[] = [];
	const allMdbs = result.DOCUMENT.MDB;

	console.log(`Found ${allMdbs.length} MdBs in total`);

	for (const mdb of allMdbs) {
		// Finde 21. Wahlperiode
		const wahlperioden = mdb.WAHLPERIODEN?.[0]?.WAHLPERIODE || [];
		const wp21 = wahlperioden.find((wp: any) => wp.WP?.[0] === "21");

		if (!wp21) continue;

		// Nur aktive MdBs (kein Enddatum)
		if (wp21.MDBWP_BIS?.[0]) continue;

		// Name extrahieren
		const namen = mdb.NAMEN?.[0]?.NAME || [];
		const currentName = namen[namen.length - 1]; // Letzter Name ist aktuell

		const nachname = currentName?.NACHNAME?.[0] || "";
		const vorname = currentName?.VORNAME?.[0] || "";
		const titel = currentName?.ANREDE_TITEL?.[0] || "";

		// Partei aus biografischen Angaben
		const bio = mdb.BIOGRAFISCHE_ANGABEN?.[0];
		const parteiKurz = bio?.PARTEI_KURZ?.[0] || "";

		// Fraktion aus Institutionen der 21. WP
		const institutionen = wp21.INSTITUTIONEN?.[0]?.INSTITUTION || [];
		const fraktionInst = institutionen.find((i: any) => i.INSART_LANG?.[0] === "Fraktion/Gruppe");
		const fraktion = fraktionInst?.INS_LANG?.[0] || "";

		// Wahlkreis
		const wkNummer = wp21.WKR_NUMMER?.[0] || "";
		const wkName = wp21.WKR_NAME?.[0] || "";
		const mandatsart = wp21.MANDATSART?.[0] || "";

		// Nur MdBs mit Wahlkreis (Direktmandat oder Listenmandat mit WK-Zuordnung)
		// Für unsere Zwecke nehmen wir alle, die einem WK zugeordnet sind
		const wahlkreisId = wkNummer.padStart(3, "0");

		const fullName = titel ? `${titel} ${vorname} ${nachname}` : `${vorname} ${nachname}`;

		mdbs.push({
			id: mdb.ID?.[0] || "",
			name: fullName.trim(),
			vorname,
			nachname,
			titel,
			party: mapFraktionToParty(fraktion) || parteiKurz,
			fraktion,
			wahlkreisId,
			wahlkreisName: wkName,
			mandatsart,
			email: generateEmail(vorname, nachname),
		});
	}

	// Sortiere nach Wahlkreis
	mdbs.sort((a, b) => a.wahlkreisId.localeCompare(b.wahlkreisId) || a.nachname.localeCompare(b.nachname));

	console.log(`Extracted ${mdbs.length} MdBs for 21. Wahlperiode`);

	// Statistik
	const byParty: Record<string, number> = {};
	for (const mdb of mdbs) {
		byParty[mdb.party] = (byParty[mdb.party] || 0) + 1;
	}
	console.log("\nNach Partei:");
	for (const [party, count] of Object.entries(byParty).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${party}: ${count}`);
	}

	// Schreibe JSON
	writeFileSync(OUTPUT_PATH, JSON.stringify(mdbs, null, "\t"));
	console.log(`\nWritten to: ${OUTPUT_PATH}`);

	// Beispiele
	console.log("\nBeispiele (erste 5):");
	for (const mdb of mdbs.slice(0, 5)) {
		console.log(`  WK ${mdb.wahlkreisId}: ${mdb.name} (${mdb.party}) - ${mdb.email}`);
	}
}

main().catch(console.error);
