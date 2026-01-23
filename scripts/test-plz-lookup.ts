/**
 * Test script for postal code → deputy lookup
 */
import {
	findDeputesByPostalCode,
	hasCirconscriptionMapping,
	findDeputesByDepartment,
} from "../src/lib/data/fr/circonscriptions.ts";
import plzMapping from "../src/lib/data/fr/plz-circonscription.json";

// Test postal codes
const testCases = [
	{ plz: "75001", city: "Paris 1er" },
	{ plz: "75016", city: "Paris 16e" },
	{ plz: "69001", city: "Lyon 1er" },
	{ plz: "13001", city: "Marseille" },
	{ plz: "33000", city: "Bordeaux" },
	{ plz: "31000", city: "Toulouse" },
	{ plz: "59000", city: "Lille" },
	{ plz: "67000", city: "Strasbourg" },
];

console.log("Testing postal code → deputy lookup:\n");

for (const { plz, city } of testCases) {
	const hasPrecise = hasCirconscriptionMapping(plz);
	const deputes = findDeputesByPostalCode(plz);
	const deptDeputes = findDeputesByDepartment(plz.slice(0, 2));

	console.log(`📍 ${plz} (${city}):`);
	console.log(`   Has precise mapping: ${hasPrecise}`);
	console.log(
		`   Deputies found: ${deputes.length} (vs ${deptDeputes.length} from dept fallback)`,
	);
	console.log(
		`   Reduction: ${deptDeputes.length > 0 ? ((1 - deputes.length / deptDeputes.length) * 100).toFixed(0) : 0}%`,
	);
	for (const d of deputes.slice(0, 5)) {
		console.log(`   - ${d.name} (${d.constituency}e circ.)`);
	}
	if (deputes.length > 5) {
		console.log(`   ... and ${deputes.length - 5} more`);
	}
	console.log();
}

// Show stats
const entries = Object.entries(plzMapping as Record<string, string[]>);
const singleCirc = entries.filter(([_, v]) => v.length === 1).length;
const multiCirc = entries.filter(([_, v]) => v.length > 1).length;

console.log("📊 Mapping statistics:");
console.log(`   Total postal codes mapped: ${entries.length}`);
console.log(
	`   Single circonscription: ${singleCirc} (${((singleCirc / entries.length) * 100).toFixed(1)}%)`,
);
console.log(
	`   Multiple circonscriptions: ${multiCirc} (${((multiCirc / entries.length) * 100).toFixed(1)}%)`,
);
