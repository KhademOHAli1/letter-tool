/**
 * Process US Congress data from unitedstates/congress-legislators YAML files
 *
 * Downloads and processes:
 * - legislators-current.yaml -> Representatives and Senators
 * - legislators-social-media.yaml -> Contact info
 *
 * Run: bun run scripts/process-us-congress.ts
 */

import { parse } from "yaml";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface Legislator {
	id: {
		bioguide: string;
		govtrack?: number;
		wikipedia?: string;
	};
	name: {
		first: string;
		middle?: string;
		last: string;
		official_full?: string;
	};
	bio: {
		birthday?: string;
		gender?: string;
	};
	terms: Array<{
		type: "rep" | "sen";
		start: string;
		end: string;
		state: string;
		district?: number;
		party: string;
		class?: 1 | 2 | 3;
		url?: string;
		address?: string;
		phone?: string;
		office?: string;
		contact_form?: string;
		state_rank?: "junior" | "senior";
	}>;
}

interface SocialMedia {
	id: {
		bioguide: string;
	};
	social: {
		twitter?: string;
		facebook?: string;
		youtube?: string;
		instagram?: string;
	};
}

interface Representative {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string | null;
	party: string;
	state: string;
	stateCode: string;
	district: string;
	districtNumber: number;
	imageUrl: string;
	phone: string | null;
	office: string | null;
	website: string | null;
	contactForm: string | null;
}

interface Senator {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string | null;
	party: string;
	state: string;
	stateCode: string;
	senateClass: 1 | 2 | 3;
	stateRank: "junior" | "senior";
	imageUrl: string;
	phone: string | null;
	office: string | null;
	website: string | null;
	contactForm: string | null;
}

const STATE_NAMES: Record<string, string> = {
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
	AS: "American Samoa",
	GU: "Guam",
	MP: "Northern Mariana Islands",
	PR: "Puerto Rico",
	VI: "Virgin Islands",
};

function normalizeParty(party: string): string {
	const lower = party.toLowerCase();
	if (lower === "democrat" || lower === "democratic") return "Democratic";
	if (lower === "republican") return "Republican";
	if (lower === "independent") return "Independent";
	return party;
}

function getBioguideImageUrl(bioguideId: string): string {
	// Congress.gov provides official photos
	return `https://bioguide.congress.gov/bioguide/photo/${bioguideId.charAt(0)}/${bioguideId}.jpg`;
}

async function fetchAndProcess() {
	console.log("📥 Reading YAML files...");

	// Read from /tmp where we downloaded them
	const legislatorsYaml = readFileSync("/tmp/legislators.yaml", "utf-8");
	const socialYaml = readFileSync("/tmp/legislators-social.yaml", "utf-8");

	console.log("🔄 Parsing YAML...");
	const legislators: Legislator[] = parse(legislatorsYaml);
	const socialMedia: SocialMedia[] = parse(socialYaml);

	// Create social media lookup by bioguide ID
	const socialMap = new Map<string, SocialMedia["social"]>();
	for (const s of socialMedia) {
		socialMap.set(s.id.bioguide, s.social);
	}

	const representatives: Representative[] = [];
	const senators: Senator[] = [];

	for (const leg of legislators) {
		// Get current term (last one in the list)
		const currentTerm = leg.terms[leg.terms.length - 1];

		// Skip if term has ended
		const termEnd = new Date(currentTerm.end);
		if (termEnd < new Date()) {
			continue;
		}

		const bioguideId = leg.id.bioguide;
		const social = socialMap.get(bioguideId);

		if (currentTerm.type === "rep") {
			const rep: Representative = {
				id: bioguideId,
				name: leg.name.official_full || `${leg.name.first} ${leg.name.last}`,
				firstName: leg.name.first,
				lastName: leg.name.last,
				email: null, // Congress members don't publish emails, use contact forms
				party: normalizeParty(currentTerm.party),
				state: STATE_NAMES[currentTerm.state] || currentTerm.state,
				stateCode: currentTerm.state,
				district: `${currentTerm.state}-${String(currentTerm.district ?? 0).padStart(2, "0")}`,
				districtNumber: currentTerm.district ?? 0,
				imageUrl: getBioguideImageUrl(bioguideId),
				phone: currentTerm.phone || null,
				office: currentTerm.office || null,
				website: currentTerm.url || null,
				contactForm: currentTerm.contact_form || null,
			};
			representatives.push(rep);
		} else if (currentTerm.type === "sen") {
			const sen: Senator = {
				id: bioguideId,
				name: leg.name.official_full || `${leg.name.first} ${leg.name.last}`,
				firstName: leg.name.first,
				lastName: leg.name.last,
				email: null, // Senators don't publish emails, use contact forms
				party: normalizeParty(currentTerm.party),
				state: STATE_NAMES[currentTerm.state] || currentTerm.state,
				stateCode: currentTerm.state,
				senateClass: currentTerm.class || 1,
				stateRank: currentTerm.state_rank || "junior",
				imageUrl: getBioguideImageUrl(bioguideId),
				phone: currentTerm.phone || null,
				office: currentTerm.office || null,
				website: currentTerm.url || null,
				contactForm: currentTerm.contact_form || null,
			};
			senators.push(sen);
		}
	}

	// Sort representatives by state, then district
	representatives.sort((a, b) => {
		if (a.stateCode !== b.stateCode) {
			return a.stateCode.localeCompare(b.stateCode);
		}
		return a.districtNumber - b.districtNumber;
	});

	// Sort senators by state, then rank (senior first)
	senators.sort((a, b) => {
		if (a.stateCode !== b.stateCode) {
			return a.stateCode.localeCompare(b.stateCode);
		}
		return a.stateRank === "senior" ? -1 : 1;
	});

	// Write output files
	const outputDir = resolve(import.meta.dir, "../src/lib/data/us");

	writeFileSync(
		resolve(outputDir, "representative-data.json"),
		JSON.stringify(representatives, null, 2),
	);

	writeFileSync(
		resolve(outputDir, "senator-data.json"),
		JSON.stringify(senators, null, 2),
	);

	// Print stats
	console.log("\n✅ Processing complete!\n");
	console.log(`📊 Representatives: ${representatives.length}`);
	console.log(`📊 Senators: ${senators.length}`);

	// Party breakdown
	const repParties = new Map<string, number>();
	for (const r of representatives) {
		repParties.set(r.party, (repParties.get(r.party) || 0) + 1);
	}
	console.log("\n🏛️  House party breakdown:");
	for (const [party, count] of repParties) {
		console.log(`   ${party}: ${count}`);
	}

	const senParties = new Map<string, number>();
	for (const s of senators) {
		senParties.set(s.party, (senParties.get(s.party) || 0) + 1);
	}
	console.log("\n🏛️  Senate party breakdown:");
	for (const [party, count] of senParties) {
		console.log(`   ${party}: ${count}`);
	}

	// States with at-large districts
	const atLarge = representatives.filter((r) => r.districtNumber === 0);
	if (atLarge.length > 0) {
		console.log("\n📍 At-large districts:");
		for (const r of atLarge) {
			console.log(`   ${r.stateCode}: ${r.name}`);
		}
	}
}

fetchAndProcess().catch(console.error);
