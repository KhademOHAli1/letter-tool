/**
 * Fetch Canadian MP and riding data from Represent API (Open North)
 * 
 * Usage:
 *   bun scripts/fetch-canada-data.ts          # Full fetch (~60 min, ~1600 FSAs)
 *   bun scripts/fetch-canada-data.ts --quick  # Quick test (~1 min, 50 sample FSAs)
 *   bun scripts/fetch-canada-data.ts --mps    # Only fetch MPs and ridings (skip FSAs)
 *
 * Data sources:
 * - MPs: https://represent.opennorth.ca/representatives/house-of-commons/
 * - Ridings: https://represent.opennorth.ca/boundaries/federal-electoral-districts/
 * - Postal codes: https://represent.opennorth.ca/postcodes/
 *
 * Rate limit: 60 requests/minute
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const API_BASE = "https://represent.opennorth.ca";
const OUTPUT_DIR = join(import.meta.dir, "../src/lib/data/ca");

// Parse CLI arguments
const args = process.argv.slice(2);
const QUICK_MODE = args.includes("--quick");
const MPS_ONLY = args.includes("--mps");

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

interface RepresentMP {
	name: string;
	first_name: string;
	last_name: string;
	party_name: string;
	email: string;
	photo_url: string;
	url: string;
	personal_url: string;
	district_name: string;
	elected_office: string;
	source_url: string;
	offices: Array<{
		type: string;
		postal: string;
		tel: string;
		fax: string;
	}>;
	extra: Record<string, string>;
	related: {
		boundary_url: string;
		representative_set_url: string;
	};
}

interface RepresentBoundary {
	url: string;
	name: string;
	boundary_set_name: string;
	external_id: string;
	metadata: {
		PROVCODE?: string;
		FEDENAME?: string;
		FEDFNAME?: string;
		[key: string]: string | undefined;
	};
	extent: [number, number, number, number];
	centroid: {
		type: string;
		coordinates: [number, number];
	};
	related: {
		boundary_set_url: string;
		representatives_url: string;
	};
}

interface RepresentPostalCode {
	code: string;
	city: string;
	province: string;
	centroid: {
		type: string;
		coordinates: [number, number];
	};
	boundaries_centroid: Array<{
		url: string;
		name: string;
		boundary_set_name: string;
		external_id: string;
	}>;
	boundaries_concordance: Array<{
		url: string;
		name: string;
		boundary_set_name: string;
		external_id: string;
	}>;
}

// Output types matching our schema
interface MP {
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

interface Riding {
	id: string;
	name: string;
	nameFr: string;
	province: string;
	provinceCode: string;
	postalCodes: string[];
}

interface PostalCodeMapping {
	ridingId: string;
	ridingName: string;
	province: string;
}

// Province code (first 2 digits of riding ID) to province name
const PROVINCE_CODE_TO_NAME: Record<string, string> = {
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

// Province name to code mapping
const PROVINCE_NAME_TO_CODE: Record<string, string> = {
	"Newfoundland and Labrador": "10",
	"Prince Edward Island": "11",
	"Nova Scotia": "12",
	"New Brunswick": "13",
	Quebec: "24",
	Ontario: "35",
	Manitoba: "46",
	Saskatchewan: "47",
	Alberta: "48",
	"British Columbia": "59",
	Yukon: "60",
	"Northwest Territories": "61",
	Nunavut: "62",
};

// Normalize party names
function normalizeParty(partyName: string): string {
	const partyMap: Record<string, string> = {
		Liberal: "Liberal",
		"Liberal Party of Canada": "Liberal",
		Conservative: "Conservative",
		"Conservative Party of Canada": "Conservative",
		NDP: "NDP",
		"New Democratic Party": "NDP",
		"Bloc Québécois": "Bloc Québécois",
		"Green Party": "Green",
		"Green Party of Canada": "Green",
		Independent: "Independent",
	};
	return partyMap[partyName] || partyName;
}

// Fetch all pages from a paginated API endpoint
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
	const results: T[] = [];
	let url = `${API_BASE}${endpoint}`;
	let page = 1;

	while (url) {
		console.log(`  Fetching page ${page}...`);
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		results.push(...(data.objects as T[]));

		url = data.meta?.next ? `${API_BASE}${data.meta.next}` : "";
		page++;

		// Rate limiting: wait 100ms between requests
		if (url) await Bun.sleep(100);
	}

	return results;
}

// Fetch MP data from Represent API
async function fetchMPs(): Promise<MP[]> {
	console.log("\n📥 Fetching MPs from Represent API...");

	const rawMPs = await fetchAllPages<RepresentMP>(
		"/representatives/house-of-commons/?limit=100",
	);

	console.log(`  Found ${rawMPs.length} MPs`);

	// Also fetch riding boundaries to get proper IDs
	const boundaries = await fetchAllPages<RepresentBoundary>(
		"/boundaries/federal-electoral-districts/?limit=100",
	);

	// Create riding name to ID mapping
	const ridingNameToId = new Map<string, string>();
	for (const b of boundaries) {
		ridingNameToId.set(b.name.toLowerCase(), b.external_id);
	}

	const mps: MP[] = rawMPs.map((mp, index) => {
		// Find riding ID from boundaries
		const ridingId =
			ridingNameToId.get(mp.district_name.toLowerCase()) ||
			String(index + 1).padStart(5, "0");

		// Derive province from riding ID (first 2 digits)
		const provinceCode = ridingId.slice(0, 2);
		const province = PROVINCE_CODE_TO_NAME[provinceCode] || "";

		return {
			id: String(index + 1),
			name: mp.name,
			firstName: mp.first_name,
			lastName: mp.last_name,
			email: mp.email || "",
			party: normalizeParty(mp.party_name),
			ridingId,
			ridingName: mp.district_name,
			province,
			imageUrl: mp.photo_url || "",
		};
	});

	return mps;
}

// Fetch riding/boundary data from Represent API
async function fetchRidings(): Promise<Riding[]> {
	console.log("\n📥 Fetching ridings from Represent API...");

	const rawBoundaries = await fetchAllPages<RepresentBoundary>(
		"/boundaries/federal-electoral-districts/?limit=100",
	);

	console.log(`  Found ${rawBoundaries.length} ridings`);

	const ridings: Riding[] = rawBoundaries.map((b) => {
		// Derive province from riding ID (first 2 digits)
		const provinceCode = b.external_id.slice(0, 2);
		const province = PROVINCE_CODE_TO_NAME[provinceCode] || b.metadata?.PROVCODE || "";

		return {
			id: b.external_id,
			name: b.metadata?.FEDENAME || b.name,
			nameFr: b.metadata?.FEDFNAME || b.name,
			province,
			provinceCode,
			postalCodes: [], // Will be populated from postal code data
		};
	});

	return ridings;
}

/**
 * Generate all valid Canadian FSA (Forward Sortation Area) codes.
 * 
 * FSA format: [Letter][Digit][Letter]
 * - First letter: Province indicator (some letters unused)
 * - Second: 0-9 (0 = rural, 1-9 = urban)
 * - Third: A-Z (excluding D, F, I, O, Q, U)
 * 
 * Valid first letters by province:
 * A = Newfoundland and Labrador
 * B = Nova Scotia
 * C = Prince Edward Island
 * E = New Brunswick
 * G, H, J = Quebec
 * K, L, M, N, P = Ontario
 * R = Manitoba
 * S = Saskatchewan
 * T = Alberta
 * V = British Columbia
 * X = Northwest Territories, Nunavut
 * Y = Yukon
 */
function generateAllFSAs(): string[] {
	// Valid first letters (province codes)
	const firstLetters = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'];
	
	// Digits 0-9
	const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	
	// Valid third letters (D, F, I, O, Q, U are never used)
	const thirdLetters = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
	
	const fsas: string[] = [];
	
	for (const first of firstLetters) {
		for (const digit of digits) {
			for (const third of thirdLetters) {
				fsas.push(`${first}${digit}${third}`);
			}
		}
	}
	
	return fsas;
}

// Sample FSAs for quick mode - representative coverage across all provinces
const SAMPLE_FSAS = [
	// Newfoundland and Labrador (A)
	"A1A", "A1C", "A1E", "A0A", "A0B",
	// Nova Scotia (B)
	"B3H", "B3K", "B3L", "B0J", "B0N",
	// Prince Edward Island (C)
	"C1A", "C1E", "C0A", "C0B",
	// New Brunswick (E)
	"E1A", "E1C", "E3B", "E3A", "E0A",
	// Quebec (G, H, J)
	"G1A", "G1R", "G1V", "G2B", "G0A",
	"H1A", "H2X", "H3A", "H4A", "H9X",
	"J1H", "J4B", "J7H", "J0A", "J0B",
	// Ontario (K, L, M, N, P)
	"K1A", "K2P", "K7A", "K0A", "K0B",
	"L1A", "L3R", "L4S", "L5B", "L8P", "L0A",
	"M1C", "M4W", "M5V", "M6K", "M9W",
	"N1A", "N2L", "N9A", "N0A", "N0B",
	"P1A", "P3E", "P0A", "P0B",
	// Manitoba (R)
	"R2C", "R3C", "R0A", "R0B",
	// Saskatchewan (S)
	"S4P", "S7K", "S0A", "S0C",
	// Alberta (T)
	"T2P", "T3C", "T5J", "T6G", "T0A", "T0B",
	// British Columbia (V)
	"V1V", "V3N", "V5K", "V6B", "V8W", "V9A", "V0A",
	// Yukon (Y)
	"Y1A", "Y0A", "Y0B",
	// Northwest Territories (X)
	"X1A", "X0A", "X0B", "X0C", "X0E", "X0G",
];

// Fetch postal code to riding mapping
async function fetchPostalCodeMapping(): Promise<
	Record<string, PostalCodeMapping>
> {
	const fsasToCheck = QUICK_MODE ? SAMPLE_FSAS : generateAllFSAs();
	const mode = QUICK_MODE ? "QUICK (sample)" : "FULL";
	const timeEstimate = QUICK_MODE ? "~1 minute" : "~60 minutes";

	console.log(`\n📥 Building ${mode} FSA to riding mapping...`);
	console.log(`   Estimated time: ${timeEstimate}`);
	console.log(`   FSAs to check: ${fsasToCheck.length}\n`);

	const mapping: Record<string, PostalCodeMapping> = {};
	let checked = 0;
	let found = 0;
	let errors = 0;
	const startTime = Date.now();

	// Process FSAs with rate limiting (60 req/min = 1 req/sec to be safe)
	for (const fsa of fsasToCheck) {
		checked++;
		
		// Construct a sample postal code: FSA + "1A1" (common pattern)
		const postalCode = `${fsa}1A1`;

		try {
			const response = await fetch(
				`${API_BASE}/postcodes/${postalCode}/`,
			);

			if (response.ok) {
				const data: RepresentPostalCode = await response.json();

				// Find the federal electoral district in the boundaries
				// Priority: 2023 representation order (latest redistribution)
				const fedDistrict = 
					data.boundaries_centroid?.find(
						(b) => b.url.includes("federal-electoral-districts-2023"),
					) ||
					data.boundaries_centroid?.find(
						(b) => b.boundary_set_name === "Federal electoral district" && 
						       !b.url.includes("representation-order"),
					) ||
					data.boundaries_centroid?.find(
						(b) => b.boundary_set_name.toLowerCase().includes("federal electoral district"),
					) ||
					data.boundaries_concordance?.find(
						(b) => b.boundary_set_name.toLowerCase().includes("federal electoral district"),
					);

				if (fedDistrict) {
					mapping[fsa] = {
						ridingId: fedDistrict.external_id,
						ridingName: fedDistrict.name,
						province: data.province,
					};
					found++;
				}
			}
			// 404 = FSA doesn't exist, which is expected for many combinations
		} catch (error) {
			errors++;
			// Only log if we get repeated errors
			if (errors <= 5 || errors % 50 === 0) {
				console.error(`  ⚠️ Error fetching ${postalCode}:`, error);
			}
		}

		// Progress update every 100 FSAs (or every 10 in quick mode)
		const updateInterval = QUICK_MODE ? 10 : 100;
		if (checked % updateInterval === 0) {
			const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
			const eta = ((Date.now() - startTime) / checked * (fsasToCheck.length - checked) / 1000 / 60).toFixed(1);
			console.log(`   Checked ${checked}/${fsasToCheck.length} FSAs | Found: ${found} | Errors: ${errors} | Elapsed: ${elapsed}m | ETA: ${eta}m`);
		}

		// Rate limiting: 1 request per second to stay well under 60/min limit
		await Bun.sleep(1000);
	}

	const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
	console.log(`\n   ✅ Completed! Checked ${checked} FSAs in ${totalTime} minutes.`);
	console.log(`   Found ${found} valid FSA→riding mappings.`);

	return mapping;
}

// Main execution
async function main() {
	console.log("🇨🇦 Fetching Canadian Parliamentary Data");
	console.log("=========================================");
	console.log(`Mode: ${QUICK_MODE ? "Quick (sample)" : MPS_ONLY ? "MPs only" : "Full"}`);
	console.log(`Source: ${API_BASE}`);
	console.log(`Output: ${OUTPUT_DIR}`);

	try {
		// Fetch all data
		const [mps, ridings] = await Promise.all([fetchMPs(), fetchRidings()]);

		// Build postal code mapping (skip if --mps flag)
		let postalMapping: Record<string, PostalCodeMapping> = {};
		
		if (MPS_ONLY) {
			// Load existing postal code mapping if available
			const postalPath = join(OUTPUT_DIR, "postal-code-riding.json");
			if (existsSync(postalPath)) {
				postalMapping = JSON.parse(readFileSync(postalPath, "utf-8"));
				console.log(`\n📂 Loaded existing ${Object.keys(postalMapping).length} FSA mappings`);
			}
		} else {
			postalMapping = await fetchPostalCodeMapping();
		}

		// Update ridings with postal codes from mapping
		for (const [fsa, data] of Object.entries(postalMapping)) {
			const riding = ridings.find((r) => r.id === data.ridingId);
			if (riding && !riding.postalCodes.includes(fsa)) {
				riding.postalCodes.push(fsa);
			}
		}

		// Write MP data
		const mpPath = join(OUTPUT_DIR, "mp-data.json");
		writeFileSync(mpPath, JSON.stringify(mps, null, "\t"));
		console.log(`\n✅ Wrote ${mps.length} MPs to ${mpPath}`);

		// Write ridings data
		const ridingsPath = join(OUTPUT_DIR, "ridings-data.json");
		writeFileSync(ridingsPath, JSON.stringify(ridings, null, "\t"));
		console.log(`✅ Wrote ${ridings.length} ridings to ${ridingsPath}`);

		// Write postal code mapping (only if we fetched new ones)
		if (!MPS_ONLY) {
			const postalPath = join(OUTPUT_DIR, "postal-code-riding.json");
			writeFileSync(postalPath, JSON.stringify(postalMapping, null, "\t"));
			console.log(
				`✅ Wrote ${Object.keys(postalMapping).length} FSA mappings to ${postalPath}`,
			);
		}

		// Print summary statistics
		console.log("\n📊 Summary:");
		console.log(`   MPs: ${mps.length}`);
		console.log(`   Ridings: ${ridings.length}`);
		console.log(`   FSA mappings: ${Object.keys(postalMapping).length}`);

		// Party breakdown
		const partyCount = mps.reduce(
			(acc, mp) => {
				acc[mp.party] = (acc[mp.party] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);
		console.log("\n   Party breakdown:");
		for (const [party, count] of Object.entries(partyCount).sort(
			(a, b) => b[1] - a[1],
		)) {
			console.log(`     ${party}: ${count}`);
		}

		console.log("\n🎉 Done! Data files created successfully.");
		
		if (QUICK_MODE) {
			console.log("\n💡 Tip: Run without --quick for full FSA coverage (~1,600 FSAs).");
		}
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

main();
