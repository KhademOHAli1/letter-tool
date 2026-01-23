/**
 * Script to add manual postal code → circonscription mappings for Paris, Lyon, and Marseille
 * These cities have complex postal codes that span multiple communes or arrondissements,
 * so they weren't covered by the automated mapping from government data sources.
 *
 * Sources:
 * - Paris: https://fr.wikipedia.org/wiki/Liste_des_circonscriptions_législatives_de_Paris
 * - Lyon: https://fr.wikipedia.org/wiki/Liste_des_circonscriptions_législatives_du_Rhône
 * - Marseille: https://fr.wikipedia.org/wiki/Liste_des_circonscriptions_législatives_des_Bouches-du-Rhône
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(
	__dirname,
	"../src/lib/data/fr/plz-circonscription.json",
);

// Read current mappings
const currentData = JSON.parse(readFileSync(filePath, "utf-8")) as Record<
	string,
	string[]
>;

/**
 * PARIS - 18 circonscriptions since 2012
 *
 * The Paris arrondissements are split across multiple circonscriptions.
 * Based on the 2010 redistricting (effective 2012):
 *
 * 1re circ (7501): 1er, 2e, 8e arr, partie 9e arr
 * 2e circ (7502): 5e arr, partie 6e arr, partie 7e arr
 * 3e circ (7503): partie 17e arr, partie 18e arr
 * 4e circ (7504): partie 17e arr, partie 16e arr
 * 5e circ (7505): 3e, 10e arr
 * 6e circ (7506): partie 11e arr (est)
 * 7e circ (7507): 4e arr, partie 11e arr (ouest)
 * 8e circ (7508): partie 12e arr, partie 20e arr
 * 9e circ (7509): partie 13e arr
 * 10e circ (7510): partie 13e arr, partie 14e arr
 * 11e circ (7511): partie 6e arr, partie 14e arr
 * 12e circ (7512): partie 7e arr, partie 15e arr
 * 13e circ (7513): partie 15e arr
 * 14e circ (7514): partie 16e arr
 * 15e circ (7515): partie 20e arr
 * 16e circ (7516): partie 19e arr
 * 17e circ (7517): partie 18e arr, partie 19e arr
 * 18e circ (7518): partie 9e arr, partie 18e arr
 */
const parisMappings: Record<string, string[]> = {
	"75001": ["7501"], // 1er arr → 1re circ
	"75002": ["7501"], // 2e arr → 1re circ
	"75003": ["7505"], // 3e arr → 5e circ
	"75004": ["7507"], // 4e arr → 7e circ
	"75005": ["7502"], // 5e arr → 2e circ
	"75006": ["7502", "7511"], // 6e arr → 2e et 11e circ (split)
	"75007": ["7502", "7512"], // 7e arr → 2e et 12e circ (split)
	"75008": ["7501"], // 8e arr → 1re circ
	"75009": ["7501", "7518"], // 9e arr → 1re et 18e circ (split)
	"75010": ["7505"], // 10e arr → 5e circ
	"75011": ["7506", "7507"], // 11e arr → 6e et 7e circ (split)
	"75012": ["7508"], // 12e arr → 8e circ
	"75013": ["7509", "7510"], // 13e arr → 9e et 10e circ (split)
	"75014": ["7510", "7511"], // 14e arr → 10e et 11e circ (split)
	"75015": ["7512", "7513"], // 15e arr → 12e et 13e circ (split)
	"75016": ["7504", "7514"], // 16e arr → 4e et 14e circ (split)
	"75017": ["7503", "7504"], // 17e arr → 3e et 4e circ (split)
	"75018": ["7503", "7517", "7518"], // 18e arr → 3e, 17e et 18e circ (split)
	"75019": ["7516", "7517"], // 19e arr → 16e et 17e circ (split)
	"75020": ["7508", "7515"], // 20e arr → 8e et 15e circ (split)
};

/**
 * LYON - City of Lyon has 9 arrondissements covered by 4 circonscriptions
 *
 * The Lyon arrondissements (1-9) are split across circonscriptions 1-4 of the Rhône.
 * Based on the 2010 redistricting:
 *
 * 1re circ (6901): Parts of Lyon 2e, 5e, 7e arr (mainly south/east parts)
 * 2e circ (6902): Lyon 1er, 2e (north), 3e, 4e, 5e (north), 9e arr
 * 3e circ (6903): Lyon 3e (east), 6e, 7e (north), 8e arr
 * 4e circ (6904): Lyon 6e, 7e, 8e arr (parts)
 *
 * Since postal codes correspond to arrondissements, we map each to the relevant circonscription(s):
 */
const lyonMappings: Record<string, string[]> = {
	"69001": ["6902"], // Lyon 1er arr → 2e circ
	"69002": ["6901", "6902"], // Lyon 2e arr → 1re et 2e circ (split)
	"69003": ["6902", "6903"], // Lyon 3e arr → 2e et 3e circ (split)
	"69004": ["6902"], // Lyon 4e arr → 2e circ
	"69005": ["6901", "6902"], // Lyon 5e arr → 1re et 2e circ (split)
	"69006": ["6903", "6904"], // Lyon 6e arr → 3e et 4e circ (split)
	"69007": ["6901", "6903", "6904"], // Lyon 7e arr → 1re, 3e et 4e circ (split)
	"69008": ["6903", "6904"], // Lyon 8e arr → 3e et 4e circ (split)
	"69009": ["6902"], // Lyon 9e arr → 2e circ
};

/**
 * MARSEILLE - City of Marseille has 16 arrondissements covered by 7 circonscriptions
 *
 * Based on the 2010 redistricting (Bouches-du-Rhône):
 *
 * 1re circ (1301): 10e arr (partie nord), 11e arr, 12e arr (partie sud)
 * 2e circ (1302): 7e et 8e arr
 * 3e circ (1303): 12e arr (partie nord), 13e arr, 14e arr (partie est)
 * 4e circ (1304): 1er, 2e, 3e arr, partie 5e et 6e arr
 * 5e circ (1305): 4e arr, partie 5e et 6e arr
 * 6e circ (1306): 9e arr, 10e arr (partie sud)
 * 7e circ (1307): 14e arr (partie ouest), 15e et 16e arr
 */
const marseilleMappings: Record<string, string[]> = {
	"13001": ["1304"], // 1er arr → 4e circ
	"13002": ["1304"], // 2e arr → 4e circ
	"13003": ["1304"], // 3e arr → 4e circ
	"13004": ["1305"], // 4e arr → 5e circ
	"13005": ["1304", "1305"], // 5e arr → 4e et 5e circ (split)
	"13006": ["1304", "1305"], // 6e arr → 4e et 5e circ (split)
	"13007": ["1302"], // 7e arr → 2e circ
	"13008": ["1302"], // 8e arr → 2e circ
	"13009": ["1306"], // 9e arr → 6e circ
	"13010": ["1301", "1306"], // 10e arr → 1re et 6e circ (split)
	"13011": ["1301"], // 11e arr → 1re circ
	"13012": ["1301", "1303"], // 12e arr → 1re et 3e circ (split)
	"13013": ["1303"], // 13e arr → 3e circ
	"13014": ["1303", "1307"], // 14e arr → 3e et 7e circ (split)
	"13015": ["1307"], // 15e arr → 7e circ
	"13016": ["1307"], // 16e arr → 7e circ
};

// Merge all manual mappings
const manualMappings = {
	...parisMappings,
	...lyonMappings,
	...marseilleMappings,
};

// Add manual mappings to the current data
let addedCount = 0;
let updatedCount = 0;

for (const [postalCode, circonscriptions] of Object.entries(manualMappings)) {
	if (currentData[postalCode]) {
		// Entry already exists - check if different
		const existing = currentData[postalCode].sort().join(",");
		const newValue = circonscriptions.sort().join(",");
		if (existing !== newValue) {
			console.log(
				`Updating ${postalCode}: ${existing} → ${newValue}`,
			);
			currentData[postalCode] = circonscriptions;
			updatedCount++;
		}
	} else {
		console.log(`Adding ${postalCode}: ${circonscriptions.join(", ")}`);
		currentData[postalCode] = circonscriptions;
		addedCount++;
	}
}

// Sort the keys for consistent output
const sortedData: Record<string, string[]> = {};
for (const key of Object.keys(currentData).sort()) {
	sortedData[key] = currentData[key];
}

// Write back to file
writeFileSync(filePath, JSON.stringify(sortedData));

console.log(`\nDone!`);
console.log(`  Added: ${addedCount} new entries`);
console.log(`  Updated: ${updatedCount} existing entries`);
console.log(`  Total entries: ${Object.keys(sortedData).length}`);
