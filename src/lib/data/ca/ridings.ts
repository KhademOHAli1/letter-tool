/**
 * Canadian Federal Electoral Districts (Ridings) and MP Data
 *
 * Ridings: 343 federal electoral districts (2024 Representation Order)
 * Postal Code → Riding: Forward Sortation Area (FSA) mapping
 * MP Data: House of Commons Open Data (ourcommons.ca)
 *
 * Note: Canada has 343 ridings as of the 2023 Representation Order
 * (increased from 338 due to population growth)
 */

import postalCodeRidingData from "./postal-code-riding.json";
import ridingsJson from "./ridings-data.json";

export interface MP {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	party: string;
	ridingId: string;
	ridingName: string;
	province: string;
	imageUrl: string;
}

export interface Riding {
	id: string; // 5-digit FED code (first 2 = province)
	name: string;
	nameFr: string;
	province: string;
	provinceCode: string;
	postalCodes: string[]; // FSA codes (first 3 chars of postal code)
}

/**
 * Province codes used in riding IDs
 */
export const PROVINCE_CODES: Record<string, string> = {
	"10": "Newfoundland and Labrador",
	"11": "Prince Edward Island",
	"12": "Nova Scotia",
	"13": "New Brunswick",
	"24": "Quebec",
	"35": "Ontario",
	"46": "Manitoba",
	"47": "Saskatchewan",
	"48": "Alberta",
	"59": "British Columbia",
	"60": "Yukon",
	"61": "Northwest Territories",
	"62": "Nunavut",
};

export const PROVINCE_ABBREV: Record<string, string> = {
	"Newfoundland and Labrador": "NL",
	"Prince Edward Island": "PE",
	"Nova Scotia": "NS",
	"New Brunswick": "NB",
	Quebec: "QC",
	Ontario: "ON",
	Manitoba: "MB",
	Saskatchewan: "SK",
	Alberta: "AB",
	"British Columbia": "BC",
	Yukon: "YT",
	"Northwest Territories": "NT",
	Nunavut: "NU",
};

/**
 * FSA → Riding mapping
 * FSA = Forward Sortation Area (first 3 characters of Canadian postal code)
 */
interface FsaRidingMapping {
	ridingId: string;
	ridingName: string;
	province: string;
}
const FSA_RIDING_DATA = postalCodeRidingData as Record<string, FsaRidingMapping>;

/**
 * All 343 federal electoral districts
 */
export const RIDINGS: Riding[] = (() => {
	const base = ridingsJson as Riding[];

	// Enhance with postal codes from FSA mapping
	for (const [fsa, data] of Object.entries(FSA_RIDING_DATA)) {
		const riding = base.find((r) => r.id === data.ridingId);
		if (riding && !riding.postalCodes.includes(fsa)) {
			riding.postalCodes.push(fsa);
		}
	}

	return base;
})();

/**
 * FSA → Riding lookup map for fast access
 */
const FSA_TO_RIDING: Map<string, Riding[]> = (() => {
	const map = new Map<string, Riding[]>();
	for (const riding of RIDINGS) {
		for (const fsa of riding.postalCodes) {
			const existing = map.get(fsa) || [];
			existing.push(riding);
			map.set(fsa, existing);
		}
	}
	return map;
})();

/**
 * Find riding by postal code
 * Canadian postal codes are 6 characters (e.g., "M5V 2H1")
 * We use the FSA (first 3 chars) for lookup
 */
export function findRidingByPostalCode(postalCode: string): Riding | undefined {
	// Normalize: remove spaces, uppercase, take first 3 chars (FSA)
	const fsa = postalCode.replace(/\s/g, "").toUpperCase().slice(0, 3);
	const results = FSA_TO_RIDING.get(fsa);
	return results?.[0];
}

/**
 * Find ALL ridings for a postal code (some FSAs span multiple ridings)
 */
export function findRidingsByPostalCode(postalCode: string): Riding[] {
	const fsa = postalCode.replace(/\s/g, "").toUpperCase().slice(0, 3);
	return FSA_TO_RIDING.get(fsa) || [];
}

/**
 * MP data from House of Commons Open Data
 */
import mpJson from "./mp-data.json";

/**
 * All current MPs
 * MPs without riding assignment are filtered out
 */
export const MPS: MP[] = (mpJson as MP[]).filter((m) => m.ridingId !== "");

/**
 * Find MP(s) for a riding
 * Should return exactly 1 MP per riding (Canada has single-member constituencies)
 */
export function findMPsByRiding(ridingId: string): MP[] {
	return MPS.filter((mp) => mp.ridingId === ridingId);
}

/**
 * Find MP by postal code
 */
export function findMPByPostalCode(postalCode: string): MP | undefined {
	const riding = findRidingByPostalCode(postalCode);
	if (!riding) return undefined;
	const mps = findMPsByRiding(riding.id);
	return mps[0];
}

/**
 * Party display names and colors
 */
export const PARTY_INFO: Record<
	string,
	{ name: string; nameFr: string; color: string }
> = {
	Liberal: {
		name: "Liberal Party",
		nameFr: "Parti libéral",
		color: "#D71920",
	},
	Conservative: {
		name: "Conservative Party",
		nameFr: "Parti conservateur",
		color: "#1A4782",
	},
	NDP: {
		name: "New Democratic Party",
		nameFr: "Nouveau Parti démocratique",
		color: "#F37021",
	},
	"Bloc Québécois": {
		name: "Bloc Québécois",
		nameFr: "Bloc Québécois",
		color: "#33B2CC",
	},
	Green: {
		name: "Green Party",
		nameFr: "Parti vert",
		color: "#3D9B35",
	},
	Independent: {
		name: "Independent",
		nameFr: "Indépendant",
		color: "#808080",
	},
};
