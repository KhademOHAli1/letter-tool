// @ts-nocheck - This script runs with Bun and uses Bun-specific APIs
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

// Common postal code suffixes to try (LDU patterns)
const LDU_SUFFIXES = ['1A1', '2A1', '0A1', '1B1', '1C1', '3A1', '4A1'];

// Fetch a single FSA and return the mapping if valid
// Tries multiple LDU suffixes to maximize hit rate
async function fetchSingleFSA(fsa: string): Promise<{ fsa: string; mapping: PostalCodeMapping } | null> {
	for (const suffix of LDU_SUFFIXES) {
		const postalCode = `${fsa}${suffix}`;
		
		try {
			const response = await fetch(`${API_BASE}/postcodes/${postalCode}/`);
			
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
					return {
						fsa,
						mapping: {
							ridingId: fedDistrict.external_id,
							ridingName: fedDistrict.name,
							province: data.province,
						}
					};
				}
			}
		} catch {
			// Ignore errors, try next suffix
		}
	}
	
	return null;
}

// Fetch postal code to riding mapping - PARALLEL VERSION
async function fetchPostalCodeMapping(): Promise<Record<string, PostalCodeMapping>> {
	const fsasToCheck = QUICK_MODE ? SAMPLE_FSAS : generateAllFSAs();
	const mode = QUICK_MODE ? "QUICK (sample)" : "FULL";
	
	// Parallel config: 10 concurrent requests with 200ms stagger = ~50 req/sec burst, but we batch
	const BATCH_SIZE = 10;
	const BATCH_DELAY = 1000; // 1 second between batches = 10 req/sec = 600 req/min (within reason)
	const timeEstimate = QUICK_MODE ? "~1 minute" : "~6-8 minutes";

	console.log(`\n📥 Building ${mode} FSA to riding mapping (PARALLEL)...`);
	console.log(`   Batch size: ${BATCH_SIZE} | Batch delay: ${BATCH_DELAY}ms`);
	console.log(`   Estimated time: ${timeEstimate}`);
	console.log(`   FSAs to check: ${fsasToCheck.length}\n`);

	const mapping: Record<string, PostalCodeMapping> = {};
	let checked = 0;
	let found = 0;
	const startTime = Date.now();

	// Process in batches
	for (let i = 0; i < fsasToCheck.length; i += BATCH_SIZE) {
		const batch = fsasToCheck.slice(i, i + BATCH_SIZE);
		
		// Run batch in parallel
		const results = await Promise.all(batch.map(fsa => fetchSingleFSA(fsa)));
		
		// Collect results
		for (const result of results) {
			checked++;
			if (result) {
				mapping[result.fsa] = result.mapping;
				found++;
			}
		}

		// Progress update every 10 batches (100 FSAs)
		if ((i / BATCH_SIZE) % 10 === 0 && i > 0) {
			const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
			const rate = (checked / Number(elapsed)).toFixed(1);
			const eta = ((fsasToCheck.length - checked) / Number(rate)).toFixed(0);
			console.log(`   ${checked}/${fsasToCheck.length} FSAs | Found: ${found} | ${rate} req/s | ${elapsed}s elapsed | ~${eta}s remaining`);
			
			// Incremental save every 500 FSAs
			if (checked % 500 === 0) {
				const postalPath = join(OUTPUT_DIR, "postal-code-riding.json");
				writeFileSync(postalPath, JSON.stringify(mapping, null, "\t"));
				console.log(`   💾 Saved ${found} FSAs to disk`);
			}
		}

		// Rate limiting between batches
		await Bun.sleep(BATCH_DELAY);
	}

	const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
	console.log(`\n   ✅ Completed! Checked ${checked} FSAs in ${totalTime}s.`);
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
