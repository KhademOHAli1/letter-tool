/**
 * Fetch UK MP data from UK Parliament API
 * Run with: bun run scripts/fetch-uk-mps.ts
 */

interface ParliamentMember {
	id: number;
	nameDisplayAs: string;
	nameFullTitle: string;
	latestParty: {
		id: number;
		name: string;
		abbreviation: string;
		backgroundColour: string;
	};
	gender: string;
	latestHouseMembership: {
		membershipFrom: string;
		membershipFromId: number;
	};
	thumbnailUrl: string;
}

interface ParliamentContact {
	type: string;
	email: string | null;
	postcode: string | null;
}

interface UKMPData {
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

async function fetchAllMPs(): Promise<ParliamentMember[]> {
	const allMPs: ParliamentMember[] = [];
	let skip = 0;
	const take = 20; // API caps at 20 per request
	let totalResults = 650;

	console.log("Fetching MPs from UK Parliament API...");

	while (skip < totalResults) {
		const url = `https://members-api.parliament.uk/api/Members/Search?House=1&IsCurrentMember=true&skip=${skip}&take=${take}`;
		const response = await fetch(url);
		const data = await response.json();

		totalResults = data.totalResults;
		const members = data.items.map((item: { value: ParliamentMember }) => item.value);
		allMPs.push(...members);

		console.log(`Fetched ${allMPs.length}/${totalResults} MPs...`);
		skip += take;

		// Small delay to be nice to the API
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	return allMPs;
}

async function fetchMPContact(memberId: number): Promise<string | null> {
	try {
		const url = `https://members-api.parliament.uk/api/Members/${memberId}/Contact`;
		const response = await fetch(url);
		const data = await response.json();

		// Find Parliamentary office email
		const contacts = data.value as ParliamentContact[];
		const parliamentaryOffice = contacts.find(
			(c) => c.type === "Parliamentary office" && c.email
		);

		return parliamentaryOffice?.email || null;
	} catch {
		return null;
	}
}

async function main() {
	// Fetch all MPs
	const mps = await fetchAllMPs();
	console.log(`Total MPs found: ${mps.length}`);

	// Fetch contact info for each MP (with rate limiting)
	const mpData: UKMPData[] = [];
	let processed = 0;

	for (const mp of mps) {
		const email = await fetchMPContact(mp.id);

		// If no email found, construct a likely one based on pattern
		const fallbackEmail = email || `${mp.nameDisplayAs.toLowerCase().replace(/[^a-z ]/g, "").replace(/ /g, ".")}@parliament.uk`;

		mpData.push({
			id: mp.id.toString(),
			name: mp.nameDisplayAs,
			fullTitle: mp.nameFullTitle,
			email: fallbackEmail,
			party: mp.latestParty.name,
			partyAbbrev: mp.latestParty.abbreviation,
			constituencyId: mp.latestHouseMembership.membershipFromId.toString(),
			constituencyName: mp.latestHouseMembership.membershipFrom,
			imageUrl: mp.thumbnailUrl,
		});

		processed++;
		if (processed % 50 === 0) {
			console.log(`Processed ${processed}/${mps.length} contacts...`);
			// Small delay to be nice to the API
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	// Build constituency data
	const constituencies = new Map<string, { id: string; name: string }>();
	for (const mp of mpData) {
		constituencies.set(mp.constituencyId, {
			id: mp.constituencyId,
			name: mp.constituencyName,
		});
	}

	// Write MP data
	const mpDataPath = "./src/lib/data/uk/mp-data.json";
	await Bun.write(mpDataPath, JSON.stringify(mpData, null, "\t"));
	console.log(`Wrote ${mpData.length} MPs to ${mpDataPath}`);

	// Write constituency data
	const constituencyData = Array.from(constituencies.values());
	const constituencyPath = "./src/lib/data/uk/constituencies-data.json";
	await Bun.write(constituencyPath, JSON.stringify(constituencyData, null, "\t"));
	console.log(`Wrote ${constituencyData.length} constituencies to ${constituencyPath}`);

	// Summary
	console.log("\n=== Summary ===");
	console.log(`Total MPs: ${mpData.length}`);
	console.log(`Total Constituencies: ${constituencyData.length}`);

	// Party breakdown
	const partyCount = new Map<string, number>();
	for (const mp of mpData) {
		partyCount.set(mp.party, (partyCount.get(mp.party) || 0) + 1);
	}
	console.log("\nParty breakdown:");
	for (const [party, count] of [...partyCount.entries()].sort((a, b) => b[1] - a[1])) {
		console.log(`  ${party}: ${count}`);
	}
}

main().catch(console.error);
