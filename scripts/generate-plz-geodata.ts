/**
 * Script to generate complete PLZ→Wahlkreis mapping using geodata
 *
 * Strategy:
 * 1. Download PLZ polygons from yetzt/postleitzahlen (OpenStreetMap data)
 * 2. Download Wahlkreis GeoJSON from Bundeswahlleiterin WFS
 * 3. Use @turf/turf for point-in-polygon (PLZ centroid → Wahlkreis)
 *
 * Run with: bun run scripts/generate-plz-geodata.ts
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as turf from "@turf/turf";
import { execSync } from "node:child_process";

const DATA_DIR = join(import.meta.dir, "../data/geo");
const OUTPUT_PATH = join(
	import.meta.dir,
	"../src/lib/data/plz-wahlkreis-geo.json",
);

// PLZ GeoJSON from yetzt/postleitzahlen (OpenStreetMap)
const PLZ_GEOJSON_BR_URL =
	"https://github.com/yetzt/postleitzahlen/releases/download/2025.12/postleitzahlen.geojson.br";

// Wahlkreis GeoJSON from Esri/ArcGIS (official Bundeswahlleiterin data)
const WAHLKREIS_ARCGIS_URL =
	"https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Wahlkreise_25/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson";

interface GeoJSONFeature {
	type: "Feature";
	properties: Record<string, string>;
	geometry: {
		type: "Polygon" | "MultiPolygon";
		coordinates: number[][][] | number[][][][];
	};
}

interface GeoJSONFeatureCollection {
	type: "FeatureCollection";
	features: GeoJSONFeature[];
}

interface PlzWahlkreisMapping {
	[plz: string]: {
		wahlkreisId: string;
		wahlkreisName: string;
		land: string;
	};
}

async function downloadFile(url: string, destPath: string): Promise<void> {
	console.log(`Downloading: ${url}`);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	writeFileSync(destPath, Buffer.from(buffer));
	console.log(`Saved to: ${destPath}`);
}

async function fetchWahlkreiseFromArcGIS(): Promise<GeoJSONFeatureCollection> {
	console.log("Fetching Wahlkreise from ArcGIS...");

	const response = await fetch(WAHLKREIS_ARCGIS_URL);
	if (!response.ok) {
		throw new Error(`ArcGIS request failed: ${response.status}`);
	}

	const data = (await response.json()) as GeoJSONFeatureCollection;
	console.log(`Loaded ${data.features.length} Wahlkreise from ArcGIS`);
	return data;
}

async function loadPlzGeoJSON(): Promise<GeoJSONFeatureCollection> {
	// Create data directory
	if (!existsSync(DATA_DIR)) {
		mkdirSync(DATA_DIR, { recursive: true });
	}

	const plzPath = join(DATA_DIR, "postleitzahlen.geojson");
	const brPath = join(DATA_DIR, "postleitzahlen.geojson.br");

	if (!existsSync(plzPath)) {
		// Download the brotli compressed version
		await downloadFile(PLZ_GEOJSON_BR_URL, brPath);
		
		// Decompress with brotli
		console.log("Decompressing with brotli...");
		execSync(`brotli -d "${brPath}" -o "${plzPath}"`, { stdio: "inherit" });
	}

	console.log("Reading PLZ GeoJSON...");
	const content = readFileSync(plzPath, "utf-8");
	const data = JSON.parse(content) as GeoJSONFeatureCollection;
	console.log(`Loaded ${data.features.length} PLZ polygons`);
	return data;
}

function getCentroid(feature: GeoJSONFeature): [number, number] {
	const geometry =
		feature.geometry.type === "MultiPolygon"
			? turf.multiPolygon(feature.geometry.coordinates as number[][][][])
			: turf.polygon(feature.geometry.coordinates as number[][][]);

	const centroid = turf.centroid(geometry);
	return centroid.geometry.coordinates as [number, number];
}

function findWahlkreisForPoint(
	lon: number,
	lat: number,
	wahlkreise: GeoJSONFeature[],
): GeoJSONFeature | null {
	const point = turf.point([lon, lat]);

	for (const wk of wahlkreise) {
		try {
			const polygon =
				wk.geometry.type === "MultiPolygon"
					? turf.multiPolygon(wk.geometry.coordinates as number[][][][])
					: turf.polygon(wk.geometry.coordinates as number[][][]);

			if (turf.booleanPointInPolygon(point, polygon)) {
				return wk;
			}
		} catch (e) {
			// Skip invalid geometries
		}
	}

	return null;
}

async function main() {
	console.log("=== PLZ→Wahlkreis Geodata Generator ===\n");

	// Load data
	let wahlkreiseData: GeoJSONFeatureCollection;
	try {
		wahlkreiseData = await fetchWahlkreiseFromArcGIS();
	} catch (e) {
		console.error("ArcGIS failed, please check network or try again later");
		throw e;
	}

	const plzData = await loadPlzGeoJSON();

	// Create mapping
	console.log("\nMapping PLZ to Wahlkreise (using centroids)...");
	const mapping: PlzWahlkreisMapping = {};
	let matched = 0;
	let unmatched = 0;
	const unmatchedPlzs: string[] = [];

	for (let i = 0; i < plzData.features.length; i++) {
		const plzFeature = plzData.features[i];
		const plzCode = plzFeature.properties.postcode || plzFeature.properties.plz;

		if (!plzCode) {
			continue;
		}

		try {
			const [lon, lat] = getCentroid(plzFeature);
			const wk = findWahlkreisForPoint(lon, lat, wahlkreiseData.features);

			if (wk) {
				// WFS uses different property names
				const wkId = (wk.properties.WKR_NR || wk.properties.wkr_nr || "").toString().padStart(3, "0");
				const wkName = wk.properties.WKR_NAME || wk.properties.wkr_name || "";
				const land = wk.properties.LAND_NAME || wk.properties.land_name || "";

				mapping[plzCode] = {
					wahlkreisId: wkId,
					wahlkreisName: wkName,
					land: land,
				};
				matched++;
			} else {
				unmatchedPlzs.push(plzCode);
				unmatched++;
			}
		} catch (e) {
			// Invalid geometry
			unmatched++;
		}

		// Progress
		if ((i + 1) % 500 === 0) {
			console.log(`  Processed ${i + 1}/${plzData.features.length}...`);
		}
	}

	console.log(`\nMatched: ${matched}`);
	console.log(`Unmatched: ${unmatched}`);

	if (unmatchedPlzs.length > 0 && unmatchedPlzs.length <= 50) {
		console.log(`\nUnmatched PLZ codes: ${unmatchedPlzs.join(", ")}`);
	}

	// Write output
	writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, "\t"));
	console.log(`\nWritten to: ${OUTPUT_PATH}`);

	// Statistics by Wahlkreis
	const byWk: Record<string, number> = {};
	for (const data of Object.values(mapping)) {
		byWk[data.wahlkreisId] = (byWk[data.wahlkreisId] || 0) + 1;
	}

	console.log(`\nWahlkreise with PLZ mappings: ${Object.keys(byWk).length}`);

	// Show some sample mappings
	console.log("\nSample mappings:");
	const samplePlz = ["10115", "80331", "50667", "20095", "60311", "91058"];
	for (const plz of samplePlz) {
		if (mapping[plz]) {
			console.log(`  ${plz} → ${mapping[plz].wahlkreisId} (${mapping[plz].wahlkreisName})`);
		}
	}
}

main().catch(console.error);
