/**
 * UK Parliamentary Constituencies and MP Data
 *
 * Unlike Germany (5-digit PLZ) or Canada (FSA), UK postcodes are too granular
 * for a static mapping. We use the postcodes.io API for real-time lookup.
 *
 * Data sources:
 * - MPs: UK Parliament Members API (members-api.parliament.uk)
 * - Postcodes: postcodes.io (free, open source, uses ONS data)
 */

import mpDataJson from "./mp-data.json";

export interface UKMP {
	id: string;
	name: string;
	fullTitle: string;
	email: string;
	party: string;
	partyAbbrev: string;
	constituencyId: string;
	constituencyName: string;
	imageUrl: string;
}

export interface Constituency {
	id: string;
	name: string;
}

/**
 * All 650 UK MPs
 */
export const UK_MPS: UKMP[] = mpDataJson as UKMP[];

/**
 * Party display colors (based on official party colors)
 */
export const UK_PARTY_COLORS: Record<string, string> = {
	Labour: "#d50000",
	"Labour (Co-op)": "#d50000",
	Conservative: "#0063ba",
	"Liberal Democrat": "#fc7d0b",
	"Scottish National Party": "#fff95d",
	"Green Party": "#6ab023",
	"Reform UK": "#12b6cf",
	"Plaid Cymru": "#008142",
	"Sinn Féin": "#326760",
	"Democratic Unionist Party": "#d46a4c",
	"Social Democratic & Labour Party": "#2aa82c",
	Alliance: "#f6cb2f",
	"Ulster Unionist Party": "#48a5ee",
	"Traditional Unionist Voice": "#0c3a6a",
	Independent: "#909090",
	Speaker: "#666666",
};

/**
 * Validate UK postcode format
 * Accepts formats like: SW1A 1AA, SW1A1AA, sw1a 1aa, etc.
 */
export function isValidUKPostcode(postcode: string): boolean {
	// UK postcode regex (simplified, allows most valid formats)
	const pattern = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
	return pattern.test(postcode.trim());
}

/**
 * Normalize UK postcode to uppercase with space
 */
export function normalizePostcode(postcode: string): string {
	const cleaned = postcode.toUpperCase().replace(/\s+/g, "");
	// Insert space before last 3 characters
	if (cleaned.length >= 5) {
		return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
	}
	return cleaned;
}

/**
 * Look up constituency from postcode using postcodes.io API
 * Returns constituency name or null if not found
 */
export async function lookupConstituencyByPostcode(
	postcode: string,
): Promise<string | null> {
	try {
		const normalized = normalizePostcode(postcode).replace(" ", "");
		const response = await fetch(
			`https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`,
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		// Use 2024 constituencies (post-boundary review)
		const constituency = data.result?.parliamentary_constituency_2024;
		return constituency || null;
	} catch {
		return null;
	}
}

/**
 * Find MP by constituency name
 * Returns the MP or null if not found
 */
export function findMPByConstituency(constituencyName: string): UKMP | null {
	// Normalize for comparison
	const normalized = constituencyName.toLowerCase().trim();

	return (
		UK_MPS.find(
			(mp) => mp.constituencyName.toLowerCase().trim() === normalized,
		) || null
	);
}

/**
 * Find MP by postcode (async, uses API)
 */
export async function findMPByPostcode(postcode: string): Promise<UKMP | null> {
	const constituency = await lookupConstituencyByPostcode(postcode);
	if (!constituency) {
		return null;
	}
	return findMPByConstituency(constituency);
}

/**
 * Find all MPs in a constituency (for multi-member lookup)
 * UK constituencies only have 1 MP each, so this returns an array of 0 or 1
 */
export function findMPsByConstituency(constituencyName: string): UKMP[] {
	const mp = findMPByConstituency(constituencyName);
	return mp ? [mp] : [];
}

/**
 * Get MP by their ID
 */
export function getMPById(id: string): UKMP | null {
	return UK_MPS.find((mp) => mp.id === id) || null;
}

/**
 * Search MPs by name (for autocomplete)
 */
export function searchMPsByName(query: string): UKMP[] {
	const normalized = query.toLowerCase().trim();
	if (normalized.length < 2) return [];

	return UK_MPS.filter(
		(mp) =>
			mp.name.toLowerCase().includes(normalized) ||
			mp.constituencyName.toLowerCase().includes(normalized),
	).slice(0, 10);
}
