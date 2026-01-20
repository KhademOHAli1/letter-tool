import {
	WAHLKREISE,
	MDBS,
	findWahlkreisByPlz,
	findMdBsByWahlkreis,
} from "../src/lib/data/wahlkreise";

console.log("=== Datenbank-Status (ohne AfD) ===");
console.log("Wahlkreise:", WAHLKREISE.length);
console.log("MdBs (ohne AfD):", MDBS.length);

// Parteien
const parteien: Record<string, number> = {};
for (const m of MDBS) {
	parteien[m.party] = (parteien[m.party] || 0) + 1;
}
console.log("\nMdBs nach Partei:");
Object.entries(parteien)
	.sort((a, b) => b[1] - a[1])
	.forEach(([p, n]) => console.log(`  ${p}: ${n}`));

// WKs ohne MdB (jetzt mehr weil AfD fehlt)
const wkOhne = WAHLKREISE.filter(
	(wk) => findMdBsByWahlkreis(wk.id).length === 0,
);
console.log(`\nWahlkreise ohne MdB (${wkOhne.length}):`);
for (const wk of wkOhne.slice(0, 10)) {
	console.log(`  ${wk.id}: ${wk.name}`);
}
if (wkOhne.length > 10) {
	console.log(`  ... und ${wkOhne.length - 10} weitere`);
}

// Test-Lookups
console.log("\n=== Test-Lookups ===");
const testPlzs = ["10115", "80331", "50667", "20095", "70173"];
for (const plz of testPlzs) {
	const wk = findWahlkreisByPlz(plz);
	if (wk) {
		const mdbs = findMdBsByWahlkreis(wk.id);
		console.log(`${plz} → WK ${wk.id} (${wk.name}) → ${mdbs.length} MdBs`);
		for (const m of mdbs) {
			console.log(`    - ${m.name} (${m.party})`);
		}
	}
}
