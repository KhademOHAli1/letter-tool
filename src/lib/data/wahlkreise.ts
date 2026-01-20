/**
 * Wahlkreis und MdB Daten für Deutschland
 *
 * Wahlkreis-Daten: Bundeswahlleiter (BTW 2025)
 * PLZ→WK Mapping: Geodaten aus OSM (yetzt/postleitzahlen) + Bundeswahlleiterin Wahlkreise
 * MdB-Daten: Bundestag Open Data (bundestag.de)
 */

import plzWahlkreisGeo from "./plz-wahlkreis-geo.json";
import wahlkreiseJson from "./wahlkreise-data.json";

export interface MdB {
	id: string;
	name: string;
	email: string;
	party: string;
	wahlkreisId: string;
	imageUrl: string;
}

export interface Wahlkreis {
	id: string;
	name: string;
	land: string;
	plzList: string[];
}

/**
 * PLZ → Wahlkreis Geodaten-Mapping (8150 PLZs)
 * Generiert aus OpenStreetMap PLZ-Polygonen und offiziellen Wahlkreis-Grenzen
 */
interface PlzGeoMapping {
	wahlkreisId: string;
	wahlkreisName: string;
	land: string;
}
const PLZ_GEO_DATA = plzWahlkreisGeo as Record<string, PlzGeoMapping>;

/**
 * Alle 299 Wahlkreise
 * Importiert vom Bundeswahlleiter
 */
export const WAHLKREISE: Wahlkreis[] = (() => {
	const base = wahlkreiseJson as Wahlkreis[];

	// Ergänze PLZs aus Geodaten-Mapping
	for (const [plz, data] of Object.entries(PLZ_GEO_DATA)) {
		const wk = base.find((w) => w.id === data.wahlkreisId);
		if (wk) {
			// Normalisiere PLZ auf 5 Stellen
			const normalizedPlz = plz.padStart(5, "0");
			if (!wk.plzList.includes(normalizedPlz)) {
				wk.plzList.push(normalizedPlz);
			}
		}
	}

	return base;
})();

/**
 * PLZ → Wahlkreis Lookup-Map für schnellen Zugriff
 */
const PLZ_TO_WAHLKREIS: Map<string, Wahlkreis[]> = (() => {
	const map = new Map<string, Wahlkreis[]>();
	for (const wk of WAHLKREISE) {
		for (const plz of wk.plzList) {
			const existing = map.get(plz) || [];
			existing.push(wk);
			map.set(plz, existing);
		}
	}
	return map;
})();

/**
 * Finde Wahlkreis(e) anhand der PLZ
 * Kann mehrere zurückgeben, da manche PLZ mehrere Wahlkreise überspannen
 */
export function findWahlkreisByPlz(plz: string): Wahlkreis | undefined {
	const normalized = plz.padStart(5, "0");
	const results = PLZ_TO_WAHLKREIS.get(normalized);
	return results?.[0]; // Rückwärtskompatibel: nur ersten zurückgeben
}

/**
 * Finde ALLE Wahlkreise für eine PLZ
 */
export function findWahlkreiseByPlz(plz: string): Wahlkreis[] {
	const normalized = plz.padStart(5, "0");
	return PLZ_TO_WAHLKREIS.get(normalized) || [];
}

/**
 * MdB-Daten aus Bundestag Open Data (21. Wahlperiode)
 */
import mdbJson from "./mdb-data.json";

interface MdBRaw {
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

/**
 * Alle MdBs der 21. Wahlperiode
 * - Gefiltert auf MdBs mit Wahlkreiszuordnung
 * - AfD wird ausgeschlossen
 */
export const MDBS: MdB[] = (mdbJson as MdBRaw[])
	.filter((m) => m.wahlkreisId !== "000") // Nur mit Wahlkreis
	.filter((m) => m.party !== "AfD") // AfD ausschließen
	.map((m) => ({
		id: m.id,
		name: m.name,
		email: m.email,
		party: m.party,
		wahlkreisId: m.wahlkreisId,
		imageUrl: m.imageUrl,
	}));

/**
 * Finde alle MdBs für einen Wahlkreis
 */
export function findMdBsByWahlkreis(wahlkreisId: string): MdB[] {
	const normalized = wahlkreisId.padStart(3, "0");
	return MDBS.filter((mdb) => mdb.wahlkreisId === normalized).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
}
