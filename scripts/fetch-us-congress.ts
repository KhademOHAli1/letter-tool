/**
 * Fetch US Congress data from official APIs
 *
 * Usage:
 *   bun scripts/fetch-us-congress.ts
 *
 * Data sources:
 * - Congress.gov API: https://api.congress.gov/
 * - ProPublica Congress API: https://projects.propublica.org/api-docs/congress-api/
 * - House Clerk: https://clerk.house.gov/members
 * - Senate: https://www.senate.gov/senators/
 *
 * Note: For ZIP code → Congressional District mapping, we use:
 * - Census Bureau's Congressional District database
 * - Or HUD's ZIP-CD crosswalk file
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(import.meta.dir, "../src/lib/data/us");

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

interface Representative {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	party: string;
	state: string;
	stateCode: string;
	district: string;
	districtNumber: number;
	imageUrl: string;
	phone: string;
	office: string;
	website: string;
}

interface Senator {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	party: string;
	state: string;
	stateCode: string;
	class: number;
	imageUrl: string;
	phone: string;
	office: string;
	website: string;
}

// Fetch from House Clerk XML
async function fetchHouseMembers(): Promise<Representative[]> {
	console.log("Fetching House members from clerk.house.gov...");

	// The House Clerk provides an XML file with all current members
	const url = "https://clerk.house.gov/xml/lists/MemberData.xml";

	try {
		const response = await fetch(url);
		const xml = await response.text();

		// Parse XML - extract member data
		const members: Representative[] = [];

		// Regex to extract member elements
		const memberRegex =
			/<member>[\s\S]*?<bioguide-id>(.*?)<\/bioguide-id>[\s\S]*?<firstname>(.*?)<\/firstname>[\s\S]*?<lastname>(.*?)<\/lastname>[\s\S]*?<party>(.*?)<\/party>[\s\S]*?<state postal-code="(.*?)">(.*?)<\/state>[\s\S]*?<district>(.*?)<\/district>[\s\S]*?<phone>(.*?)<\/phone>[\s\S]*?<office-building>(.*?)<\/office-building>[\s\S]*?<office-room>(.*?)<\/office-room>[\s\S]*?<\/member>/g;

		let match: RegExpExecArray | null;
		while ((match = memberRegex.exec(xml)) !== null) {
			const [
				,
				bioguideId,
				firstName,
				lastName,
				party,
				stateCode,
				state,
				district,
				phone,
				officeBuilding,
				officeRoom,
			] = match;

			const partyFull =
				party === "D"
					? "Democratic"
					: party === "R"
						? "Republican"
						: "Independent";
			const districtNum = Number.parseInt(district, 10) || 0;

			members.push({
				id: bioguideId,
				name: `${firstName} ${lastName}`,
				firstName,
				lastName,
				email: "", // Not in XML, would need to scrape
				party: partyFull,
				state,
				stateCode,
				district: districtNum === 0 ? `${stateCode}-AL` : `${stateCode}-${district.padStart(2, "0")}`,
				districtNumber: districtNum,
				imageUrl: `https://bioguide.congress.gov/bioguide/photo/${bioguideId.charAt(0)}/${bioguideId}.jpg`,
				phone: phone || "",
				office: `${officeRoom} ${officeBuilding}`,
				website: `https://${lastName.toLowerCase()}.house.gov`,
			});
		}

		console.log(`Found ${members.length} House members from XML`);
		return members;
	} catch (error) {
		console.error("Failed to fetch from House Clerk, using backup method...");
		return fetchHouseMembersBackup();
	}
}

// Backup: Fetch from ProPublica API (requires API key)
async function fetchHouseMembersBackup(): Promise<Representative[]> {
	console.log("Using backup data fetch...");

	// ProPublica API endpoint (free tier available)
	// const apiKey = process.env.PROPUBLICA_API_KEY;
	// if (!apiKey) {
	//   console.log("No ProPublica API key found, fetching from Congress.gov...");
	// }

	// Fallback to scraping congress.gov member listing
	const url =
		"https://www.congress.gov/members?q=%7B%22congress%22%3A%22119%22%2C%22chamber%22%3A%22House%22%7D&pageSize=250&page=1";

	console.log("Fetching from congress.gov...");
	const members: Representative[] = [];

	// This would need proper HTML parsing - placeholder for now
	console.log(
		"Note: Backup method requires manual data entry or API key setup",
	);

	return members;
}

// Fetch Senate members
async function fetchSenateMembers(): Promise<Senator[]> {
	console.log("Fetching Senate members...");

	// Senate provides XML at https://www.senate.gov/general/contact_information/senators_cfm.xml
	const url =
		"https://www.senate.gov/general/contact_information/senators_cfm.xml";

	try {
		const response = await fetch(url);
		const xml = await response.text();

		const senators: Senator[] = [];

		// Parse XML - Senate format
		const memberRegex =
			/<member>[\s\S]*?<bioguide_id>(.*?)<\/bioguide_id>[\s\S]*?<first_name>(.*?)<\/first_name>[\s\S]*?<last_name>(.*?)<\/last_name>[\s\S]*?<party>(.*?)<\/party>[\s\S]*?<state>(.*?)<\/state>[\s\S]*?<class>(.*?)<\/class>[\s\S]*?<phone>(.*?)<\/phone>[\s\S]*?<office>(.*?)<\/office>[\s\S]*?<website>(.*?)<\/website>[\s\S]*?<\/member>/g;

		let match: RegExpExecArray | null;
		while ((match = memberRegex.exec(xml)) !== null) {
			const [
				,
				bioguideId,
				firstName,
				lastName,
				party,
				state,
				senateClass,
				phone,
				office,
				website,
			] = match;

			const partyFull =
				party === "D"
					? "Democratic"
					: party === "R"
						? "Republican"
						: "Independent";

			// Get state code from state name
			const stateCode = getStateCode(state);

			senators.push({
				id: bioguideId,
				name: `${firstName} ${lastName}`,
				firstName,
				lastName,
				email: "", // Contact forms typically used
				party: partyFull,
				state,
				stateCode,
				class: Number.parseInt(senateClass, 10),
				imageUrl: `https://bioguide.congress.gov/bioguide/photo/${bioguideId.charAt(0)}/${bioguideId}.jpg`,
				phone: phone || "",
				office: office || "",
				website: website || "",
			});
		}

		console.log(`Found ${senators.length} senators from XML`);
		return senators;
	} catch (error) {
		console.error("Failed to fetch Senate data:", error);
		return [];
	}
}

// State name to code mapping
function getStateCode(stateName: string): string {
	const stateMap: Record<string, string> = {
		Alabama: "AL",
		Alaska: "AK",
		Arizona: "AZ",
		Arkansas: "AR",
		California: "CA",
		Colorado: "CO",
		Connecticut: "CT",
		Delaware: "DE",
		Florida: "FL",
		Georgia: "GA",
		Hawaii: "HI",
		Idaho: "ID",
		Illinois: "IL",
		Indiana: "IN",
		Iowa: "IA",
		Kansas: "KS",
		Kentucky: "KY",
		Louisiana: "LA",
		Maine: "ME",
		Maryland: "MD",
		Massachusetts: "MA",
		Michigan: "MI",
		Minnesota: "MN",
		Mississippi: "MS",
		Missouri: "MO",
		Montana: "MT",
		Nebraska: "NE",
		Nevada: "NV",
		"New Hampshire": "NH",
		"New Jersey": "NJ",
		"New Mexico": "NM",
		"New York": "NY",
		"North Carolina": "NC",
		"North Dakota": "ND",
		Ohio: "OH",
		Oklahoma: "OK",
		Oregon: "OR",
		Pennsylvania: "PA",
		"Rhode Island": "RI",
		"South Carolina": "SC",
		"South Dakota": "SD",
		Tennessee: "TN",
		Texas: "TX",
		Utah: "UT",
		Vermont: "VT",
		Virginia: "VA",
		Washington: "WA",
		"West Virginia": "WV",
		Wisconsin: "WI",
		Wyoming: "WY",
	};
	return stateMap[stateName] || stateName;
}

// Fetch ZIP to Congressional District mapping
// This uses the Census Bureau's relationship files
async function fetchZipDistrictMapping(): Promise<
	Record<
		string,
		{ districtId: string; state: string; stateCode: string; districtNumber: number }
	>
> {
	console.log("Fetching ZIP to Congressional District mapping...");

	// Census Bureau provides ZCTA to CD relationship files
	// For 119th Congress (2025-2027), we need the 2023 redistricting data
	// Source: https://www.census.gov/geographies/mapping-files/time-series/geo/relationship-files.html

	const mapping: Record<
		string,
		{ districtId: string; state: string; stateCode: string; districtNumber: number }
	> = {};

	// HUD also provides crosswalk files: https://www.huduser.gov/portal/datasets/usps_crosswalk.html
	// For now, we'll provide a script that can be run with the downloaded file

	console.log(`
============================================================
ZIP to Congressional District Mapping
============================================================

To get complete ZIP-CD mapping, download one of these files:

1. Census Bureau ZCTA-CD Relationship File:
   https://www.census.gov/geographies/mapping-files/time-series/geo/relationship-files.html

2. HUD ZIP-CD Crosswalk:
   https://www.huduser.gov/portal/datasets/usps_crosswalk.html

3. Or use the Google Civic Information API (requires API key):
   https://developers.google.com/civic-information

For now, generating a basic mapping from district data...
============================================================
`);

	// Generate a basic mapping with common ZIP codes
	// In practice, you'd parse the Census file

	return mapping;
}

async function main() {
	console.log("=== US Congress Data Fetch ===\n");
	console.log("Current Congress: 119th (2025-2027)\n");

	// Fetch representatives
	const representatives = await fetchHouseMembers();

	// Fetch senators
	const senators = await fetchSenateMembers();

	// Write representative data
	if (representatives.length > 0) {
		const repPath = join(OUTPUT_DIR, "representative-data.json");
		writeFileSync(repPath, JSON.stringify(representatives, null, "\t"));
		console.log(`\nWrote ${representatives.length} representatives to ${repPath}`);
	} else {
		console.log("\nNo representatives fetched - manual data entry required");
	}

	// Write senator data
	if (senators.length > 0) {
		const senPath = join(OUTPUT_DIR, "senator-data.json");
		writeFileSync(senPath, JSON.stringify(senators, null, "\t"));
		console.log(`Wrote ${senators.length} senators to ${senPath}`);
	} else {
		console.log("No senators fetched - manual data entry required");
	}

	// Summary
	console.log("\n=== Summary ===");
	console.log(`Representatives: ${representatives.length}/435 (${((representatives.length / 435) * 100).toFixed(1)}%)`);
	console.log(`Senators: ${senators.length}/100 (${((senators.length / 100) * 100).toFixed(1)}%)`);

	if (representatives.length < 400 || senators.length < 90) {
		console.log(`
============================================================
⚠️  INCOMPLETE DATA - Manual Steps Required
============================================================

The XML endpoints may have changed or be blocked. To get complete data:

OPTION 1: Use theunitedstates.io (recommended)
  git clone https://github.com/unitedstates/congress-legislators
  Then parse the YAML files:
  - legislators-current.yaml (all current members)
  - legislators-social-media.yaml (contact info)

OPTION 2: ProPublica Congress API (requires free API key)
  1. Sign up at: https://www.propublica.org/datastore/api/propublica-congress-api
  2. Set: export PROPUBLICA_API_KEY=your-key
  3. Re-run this script

OPTION 3: Civic Information API (requires Google API key)
  1. Enable at: https://console.developers.google.com
  2. Provides ZIP → representative lookup

============================================================
`);
	}
}

main().catch(console.error);
