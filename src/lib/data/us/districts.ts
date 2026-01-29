/**
 * US Congressional Districts and Representatives Data
 *
 * Congress: 435 Representatives (House)
 * Senate: 100 Senators (2 per state)
 * ZIP Code → Congressional District mapping
 *
 * Note: ZIP codes can span multiple congressional districts.
 * For accurate lookup, we use the Census Bureau's ZCTA-to-CD mapping.
 */

import representativeJson from "./representative-data.json";
import senatorJson from "./senator-data.json";
import zipDistrictData from "./zip-district.json";

export interface Representative {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string | null;
	party: string;
	state: string;
	stateCode: string;
	district: string; // e.g., "CA-12" or "TX-22"
	districtNumber: number; // 0 for at-large
	imageUrl: string;
	phone: string | null;
	office: string | null;
	website: string | null;
	contactForm: string | null;
}

export interface Senator {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string | null;
	party: string;
	state: string;
	stateCode: string;
	senateClass: 1 | 2 | 3; // Senate class (1, 2, or 3)
	stateRank: "junior" | "senior";
	imageUrl: string;
	phone: string | null;
	office: string | null;
	website: string | null;
	contactForm: string | null;
}

export interface CongressionalDistrict {
	id: string; // e.g., "CA-12"
	state: string;
	stateCode: string;
	districtNumber: number;
	zipCodes: string[];
}

/**
 * State codes and names
 */
export const STATE_CODES: Record<string, string> = {
	AL: "Alabama",
	AK: "Alaska",
	AZ: "Arizona",
	AR: "Arkansas",
	CA: "California",
	CO: "Colorado",
	CT: "Connecticut",
	DE: "Delaware",
	FL: "Florida",
	GA: "Georgia",
	HI: "Hawaii",
	ID: "Idaho",
	IL: "Illinois",
	IN: "Indiana",
	IA: "Iowa",
	KS: "Kansas",
	KY: "Kentucky",
	LA: "Louisiana",
	ME: "Maine",
	MD: "Maryland",
	MA: "Massachusetts",
	MI: "Michigan",
	MN: "Minnesota",
	MS: "Mississippi",
	MO: "Missouri",
	MT: "Montana",
	NE: "Nebraska",
	NV: "Nevada",
	NH: "New Hampshire",
	NJ: "New Jersey",
	NM: "New Mexico",
	NY: "New York",
	NC: "North Carolina",
	ND: "North Dakota",
	OH: "Ohio",
	OK: "Oklahoma",
	OR: "Oregon",
	PA: "Pennsylvania",
	RI: "Rhode Island",
	SC: "South Carolina",
	SD: "South Dakota",
	TN: "Tennessee",
	TX: "Texas",
	UT: "Utah",
	VT: "Vermont",
	VA: "Virginia",
	WA: "Washington",
	WV: "West Virginia",
	WI: "Wisconsin",
	WY: "Wyoming",
	DC: "District of Columbia",
	PR: "Puerto Rico",
	GU: "Guam",
	VI: "Virgin Islands",
	AS: "American Samoa",
	MP: "Northern Mariana Islands",
};

/**
 * ZIP → Congressional District mapping
 * ZIP codes can map to one or multiple districts
 */
type ZipDistrictData = Record<string, string | string[]>;

const ZIP_DISTRICT_DATA = zipDistrictData as ZipDistrictData;

/**
 * Result from ZIP code lookup
 */
export interface DistrictLookupResult {
	districtId: string; // e.g., "CA-12"
	stateCode: string;
	districtNumber: number;
	isMultiDistrict: boolean;
	allDistricts: string[]; // All districts if ZIP spans multiple
}

/**
 * All Representatives in the House
 * Note: Fields may be null (use contactForm instead of email for most members)
 */
export const REPRESENTATIVES = representativeJson as Representative[];

/**
 * All Senators
 * Note: Fields may be null (use contactForm instead of email for most members)
 */
export const SENATORS = senatorJson as Senator[];

/**
 * Parse district ID into components
 */
function parseDistrictId(districtId: string): {
	stateCode: string;
	districtNumber: number;
} {
	const [stateCode, distNum] = districtId.split("-");
	return { stateCode, districtNumber: Number.parseInt(distNum, 10) };
}

/**
 * Find congressional district(s) by ZIP code
 * US ZIP codes are 5 digits (e.g., "90210")
 * Returns the first/primary district if ZIP spans multiple
 */
export function findDistrictByZipCode(
	zipCode: string,
): DistrictLookupResult | undefined {
	// Normalize: take first 5 digits
	const zip5 = zipCode.replace(/\D/g, "").slice(0, 5).padStart(5, "0");
	const data = ZIP_DISTRICT_DATA[zip5];

	if (!data) return undefined;

	const allDistricts = Array.isArray(data) ? data : [data];
	const primaryDistrict = allDistricts[0];
	const { stateCode, districtNumber } = parseDistrictId(primaryDistrict);

	return {
		districtId: primaryDistrict,
		stateCode,
		districtNumber,
		isMultiDistrict: allDistricts.length > 1,
		allDistricts,
	};
}

/**
 * Find Representative by ZIP code
 */
export function findRepresentativeByZipCode(
	zipCode: string,
): Representative | undefined {
	const district = findDistrictByZipCode(zipCode);
	if (!district) return undefined;

	return REPRESENTATIVES.find((rep) => rep.district === district.districtId);
}

/**
 * Find Senators by ZIP code (returns 2 senators for the state)
 */
export function findSenatorsByZipCode(zipCode: string): Senator[] {
	const district = findDistrictByZipCode(zipCode);
	if (!district) return [];

	return SENATORS.filter((sen) => sen.stateCode === district.stateCode);
}

/**
 * Find all representatives (1+ Reps + 2 Senators) by ZIP code
 * Handles multi-district ZIPs by returning all matching representatives
 */
export function findAllRepresentativesByZipCode(zipCode: string): {
	representative: Representative | undefined;
	representatives: Representative[]; // All reps if multi-district
	senators: Senator[];
	district: DistrictLookupResult | undefined;
} {
	const district = findDistrictByZipCode(zipCode);

	if (!district) {
		return {
			representative: undefined,
			representatives: [],
			senators: [],
			district: undefined,
		};
	}

	// Find all representatives for all districts in this ZIP
	const representatives = district.allDistricts
		.map((d) => REPRESENTATIVES.find((rep) => rep.district === d))
		.filter((rep): rep is Representative => rep !== undefined);

	const senators = SENATORS.filter(
		(sen) => sen.stateCode === district.stateCode,
	);

	return {
		representative: representatives[0],
		representatives,
		senators,
		district,
	};
}

/**
 * Find Representative by district ID (e.g., "CA-12")
 */
export function findRepresentativeByDistrict(
	districtId: string,
): Representative | undefined {
	return REPRESENTATIVES.find((rep) => rep.district === districtId);
}

/**
 * Find Senators by state code (e.g., "CA")
 */
export function findSenatorsByState(stateCode: string): Senator[] {
	return SENATORS.filter((sen) => sen.stateCode === stateCode.toUpperCase());
}

/**
 * Party display names and colors
 */
export const PARTY_INFO: Record<
	string,
	{ name: string; color: string; abbrev: string }
> = {
	Democratic: {
		name: "Democratic Party",
		color: "#0015BC",
		abbrev: "D",
	},
	Republican: {
		name: "Republican Party",
		color: "#E9141D",
		abbrev: "R",
	},
	Independent: {
		name: "Independent",
		color: "#808080",
		abbrev: "I",
	},
	Libertarian: {
		name: "Libertarian Party",
		color: "#FED105",
		abbrev: "L",
	},
};

/**
 * Get party color for display
 */
export function getPartyColor(party: string): string {
	return PARTY_INFO[party]?.color || "#808080";
}

/**
 * Format district display name
 */
export function formatDistrictName(districtId: string): string {
	const [stateCode, districtNum] = districtId.split("-");
	const stateName = STATE_CODES[stateCode] || stateCode;

	if (districtNum === "0" || districtNum === "AL") {
		return `${stateName} At-Large`;
	}

	return `${stateName}'s ${districtNum}${getOrdinalSuffix(Number.parseInt(districtNum, 10))} Congressional District`;
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return s[(v - 20) % 10] || s[v] || s[0];
}
