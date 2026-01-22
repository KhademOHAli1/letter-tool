/**
 * Quality control script: Generate 10 sample letters and save for review
 * Run with: bun scripts/test-letter-quality.ts
 */

const TEST_CASES = [
	{
		senderName: "Sara Ahmadi",
		senderPlz: "10115",
		wahlkreis: "Berlin-Mitte",
		mdb: {
			id: "test-mdb-1",
			name: "Johannes Fechner",
			email: "johannes.fechner@bundestag.de",
			party: "SPD",
		},
		personalNote:
			"Ich bin 2015 aus dem Iran nach Deutschland geflohen. Meine Schwester ist immer noch dort und ich mache mir jeden Tag Sorgen um sie. Sie wurde letztes Jahr bei einer Demonstration verhaftet und drei Wochen festgehalten.",
		forderungen: ["irgc-terrorliste", "botschafter"],
	},
	{
		senderName: "Mehdi Hosseini",
		senderPlz: "80331",
		wahlkreis: "München-Süd",
		mdb: {
			id: "test-mdb-2",
			name: "Claudia Roth",
			email: "claudia.roth@bundestag.de",
			party: "Grüne",
		},
		personalNote:
			"من یک دانشجوی ایرانی هستم که در مونیخ درس می‌خوانم. پسرعمویم در آبان ۹۸ کشته شد. او فقط ۱۹ سال داشت.",
		forderungen: ["regime-delegitimierung", "r2p"],
	},
	{
		senderName: "Anna Müller",
		senderPlz: "50667",
		wahlkreis: "Köln I",
		mdb: {
			id: "test-mdb-3",
			name: "Sven Lehmann",
			email: "sven.lehmann@bundestag.de",
			party: "Grüne",
		},
		personalNote:
			"Ich habe iranische Freunde hier in Köln, die mir von der Situation ihrer Familien erzählen. Eine Freundin hat ihren Bruder verloren - er wurde auf dem Weg zur Uni erschossen.",
		forderungen: ["gba-ermittlung", "icc"],
	},
	{
		senderName: "Reza Karimi",
		senderPlz: "60311",
		wahlkreis: "Frankfurt am Main I",
		mdb: {
			id: "test-mdb-4",
			name: "Armand Zorn",
			email: "armand.zorn@bundestag.de",
			party: "SPD",
		},
		personalNote:
			"As a German-Iranian entrepreneur, I follow the news from Iran every day. My uncle was a judge who refused to sign death sentences - he lost his job and is now under house arrest.",
		forderungen: ["irgc-terrorliste", "interpol"],
	},
	{
		senderName: "Leila Rahimi",
		senderPlz: "20095",
		wahlkreis: "Hamburg-Mitte",
		mdb: {
			id: "test-mdb-5",
			name: "Aydan Özoğuz",
			email: "aydan.oezoguz@bundestag.de",
			party: "SPD",
		},
		personalNote:
			"Ich bin Ärztin und behandle hier in Hamburg iranische Geflüchtete. Viele haben Folter erlebt. Ich höre ihre Geschichten jeden Tag. Es bricht mir das Herz.",
		forderungen: ["r2p", "starlink"],
	},
	{
		senderName: "Darius Tehrani",
		senderPlz: "70173",
		wahlkreis: "Stuttgart I",
		mdb: {
			id: "test-mdb-6",
			name: "Cem Özdemir",
			email: "cem.oezdemir@bundestag.de",
			party: "Grüne",
		},
		personalNote:
			"مادربزرگ من هنوز در ایران زندگی می‌کند. او ۸۵ سال دارد و نمی‌تواند به خاطر شرایط سلامتی‌اش فرار کند. هر بار که زنگ می‌زنم، می‌ترسم که آخرین بار باشد.",
		forderungen: ["regime-delegitimierung", "botschafter"],
	},
	{
		senderName: "Marie Schmidt",
		senderPlz: "04109",
		wahlkreis: "Leipzig I",
		mdb: {
			id: "test-mdb-7",
			name: "Paula Piechotta",
			email: "paula.piechotta@bundestag.de",
			party: "Grüne",
		},
		personalNote:
			"Ich bin Journalistin und recherchiere seit Jahren zur Menschenrechtslage im Iran. Was dort passiert, ist ein Verbrechen gegen die Menschlichkeit. Deutschland muss handeln.",
		forderungen: ["gba-ermittlung", "icc"],
	},
	{
		senderName: "Omid Farhadi",
		senderPlz: "30159",
		wahlkreis: "Hannover-Stadt I",
		mdb: {
			id: "test-mdb-8",
			name: "Yasmin Fahimi",
			email: "yasmin.fahimi@bundestag.de",
			party: "SPD",
		},
		personalNote:
			"Ich bin vor 10 Jahren nach Deutschland gekommen. Mein bester Freund aus der Schulzeit ist vor zwei Jahren im Evin-Gefängnis gestorben. Die offizielle Todesursache war 'Herzversagen'. Er war 32 und kerngesund.",
		forderungen: ["gba-ermittlung", "irgc-terrorliste"],
	},
	{
		senderName: "Katarina Hoffmann",
		senderPlz: "01067",
		wahlkreis: "Dresden I",
		mdb: {
			id: "test-mdb-9",
			name: "Katja Kipping",
			email: "katja.kipping@bundestag.de",
			party: "Die Linke",
		},
		personalNote:
			"Mein Mann ist Iraner. Seine Cousine wurde letztes Jahr verhaftet, weil sie ihr Kopftuch abgenommen hat. Sie ist jetzt 20 und sitzt seit 8 Monaten im Gefängnis.",
		forderungen: ["r2p", "interpol"],
	},
	{
		senderName: "Arash Mohammadi",
		senderPlz: "90402",
		wahlkreis: "Nürnberg-Nord",
		mdb: {
			id: "test-mdb-10",
			name: "Gabriela Heinrich",
			email: "gabriela.heinrich@bundestag.de",
			party: "SPD",
		},
		personalNote:
			"I came to Germany as a student 5 years ago. Last month, my father was arrested for attending a memorial service for the victims of the November 2019 protests. He is 67 years old with heart problems.",
		forderungen: ["r2p", "starlink"],
	},
];

async function generateLetter(testCase: (typeof TEST_CASES)[0]) {
	const response = await fetch("http://localhost:3000/api/generate-letter", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: "http://localhost:3000",
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
			"Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
			Accept: "application/json",
		},
		body: JSON.stringify({
			senderName: testCase.senderName,
			senderPlz: testCase.senderPlz,
			wahlkreis: testCase.wahlkreis,
			mdb: testCase.mdb,
			personalNote: testCase.personalNote,
			forderungen: testCase.forderungen,
			_timing: 5000, // Simulate 5 seconds of form interaction
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API error: ${response.status} - ${error}`);
	}

	return response.json();
}

async function main() {
	console.log("🔬 Quality Control Test: Generating 10 sample letters\n");
	console.log("Model: gpt-5.2\n");
	console.log("=".repeat(80) + "\n");

	const results: { name: string; letter: string; error?: string }[] = [];

	for (let i = 0; i < TEST_CASES.length; i++) {
		const testCase = TEST_CASES[i];
		console.log(`[${i + 1}/10] Generating letter for ${testCase.senderName}...`);

		try {
			const start = Date.now();
			const result = await generateLetter(testCase);
			const duration = ((Date.now() - start) / 1000).toFixed(1);

			console.log(`   ✅ Done in ${duration}s\n`);
			results.push({ name: testCase.senderName, letter: result.letter });
		} catch (error) {
			console.log(`   ❌ Error: ${error}\n`);
			results.push({
				name: testCase.senderName,
				letter: "",
				error: String(error),
			});
		}

		// Small delay between requests
		await new Promise((r) => setTimeout(r, 500));
	}

	// Write results to file
	const output = results
		.map((r, i) => {
			const header = `\n${"=".repeat(80)}\nLETTER ${i + 1}: ${r.name}\n${"=".repeat(80)}\n`;
			if (r.error) {
				return `${header}\n❌ ERROR: ${r.error}\n`;
			}
			return `${header}\n${r.letter}\n`;
		})
		.join("\n");

	const outputPath = "./scripts/quality-test-results.txt";
	const fs = await import("node:fs");
	fs.writeFileSync(outputPath, output);

	console.log("\n" + "=".repeat(80));
	console.log(`\n✅ Results saved to: ${outputPath}`);
	console.log(
		`\nSuccessful: ${results.filter((r) => !r.error).length}/${results.length}`,
	);
}

main().catch(console.error);
