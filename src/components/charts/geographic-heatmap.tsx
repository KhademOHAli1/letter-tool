"use client";

/**
 * Geographic Heat Map Component
 * Phase 8: Frontend Analytics Dashboard
 *
 * Displays letter activity by geographic area
 * Supports multiple aggregation levels: country, region, district, postal
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HeatMapLevel = "country" | "region" | "district" | "postal";

interface HeatMapDataPoint {
	letterCount: number;
	uniqueReps: number;
	country: string;
	postalCode?: string;
	districtId?: string;
	districtName?: string;
	regionCode?: string;
	uniqueDistricts?: number;
	uniquePostcodes?: number;
}

interface GeographicHeatMapProps {
	/** Heat map data points */
	data: HeatMapDataPoint[];
	/** Current aggregation level */
	level: HeatMapLevel;
	/** Country being viewed (for filtering) */
	selectedCountry?: string;
	/** Callback when level changes */
	onLevelChange?: (level: HeatMapLevel) => void;
	/** Callback when a region is clicked (for drill-down) */
	onRegionClick?: (region: HeatMapDataPoint) => void;
	/** Maximum letter count (for color scaling) */
	maxLetters?: number;
}

// Level labels by language
const LEVEL_LABELS: Record<HeatMapLevel, Record<string, string>> = {
	country: { en: "Country", de: "Land", fr: "Pays" },
	region: { en: "Region", de: "Region", fr: "Région" },
	district: { en: "District", de: "Wahlkreis", fr: "Circonscription" },
	postal: { en: "Postal Code", de: "PLZ", fr: "Code postal" },
};

// Country-specific region names
const REGION_NAMES: Record<string, Record<string, string>> = {
	// German PLZ first digit regions
	de: {
		"0": "Sachsen, Sachsen-Anhalt, Thüringen",
		"1": "Berlin, Brandenburg",
		"2": "Hamburg, Schleswig-Holstein, Mecklenburg-Vorpommern",
		"3": "Niedersachsen (Ost), Bremen",
		"4": "Niedersachsen (West), Nordrhein-Westfalen (Nord)",
		"5": "Nordrhein-Westfalen (Süd)",
		"6": "Hessen, Rheinland-Pfalz (Nord)",
		"7": "Baden-Württemberg (Nord)",
		"8": "Bayern (Süd), Baden-Württemberg (Süd)",
		"9": "Bayern (Nord)",
	},
	// Canadian FSA first letter (province)
	ca: {
		A: "Newfoundland and Labrador",
		B: "Nova Scotia",
		C: "Prince Edward Island",
		E: "New Brunswick",
		G: "Eastern Quebec",
		H: "Montreal",
		J: "Western Quebec",
		K: "Eastern Ontario",
		L: "Central Ontario",
		M: "Toronto",
		N: "Southwestern Ontario",
		P: "Northern Ontario",
		R: "Manitoba",
		S: "Saskatchewan",
		T: "Alberta",
		V: "British Columbia",
		X: "NWT and Nunavut",
		Y: "Yukon",
	},
	// UK postcode areas (simplified)
	uk: {
		AB: "Aberdeen",
		B: "Birmingham",
		BA: "Bath",
		BB: "Blackburn",
		BD: "Bradford",
		BH: "Bournemouth",
		BL: "Bolton",
		BN: "Brighton",
		BR: "Bromley",
		BS: "Bristol",
		CA: "Carlisle",
		CB: "Cambridge",
		CF: "Cardiff",
		CH: "Chester",
		CM: "Chelmsford",
		CO: "Colchester",
		CR: "Croydon",
		CT: "Canterbury",
		CV: "Coventry",
		CW: "Crewe",
		DA: "Dartford",
		DD: "Dundee",
		DE: "Derby",
		DG: "Dumfries",
		DH: "Durham",
		DL: "Darlington",
		DN: "Doncaster",
		DT: "Dorchester",
		DY: "Dudley",
		E: "East London",
		EC: "Central London (East)",
		EH: "Edinburgh",
		EN: "Enfield",
		EX: "Exeter",
		FK: "Falkirk",
		FY: "Blackpool",
		G: "Glasgow",
		GL: "Gloucester",
		GU: "Guildford",
		HA: "Harrow",
		HD: "Huddersfield",
		HG: "Harrogate",
		HP: "Hemel Hempstead",
		HR: "Hereford",
		HS: "Outer Hebrides",
		HU: "Hull",
		HX: "Halifax",
		IG: "Ilford",
		IP: "Ipswich",
		IV: "Inverness",
		KA: "Kilmarnock",
		KT: "Kingston",
		KW: "Kirkwall",
		KY: "Kirkcaldy",
		L: "Liverpool",
		LA: "Lancaster",
		LD: "Llandrindod Wells",
		LE: "Leicester",
		LL: "Llandudno",
		LN: "Lincoln",
		LS: "Leeds",
		LU: "Luton",
		M: "Manchester",
		ME: "Rochester",
		MK: "Milton Keynes",
		N: "North London",
		NE: "Newcastle",
		NG: "Nottingham",
		NN: "Northampton",
		NP: "Newport",
		NR: "Norwich",
		NW: "Northwest London",
		OL: "Oldham",
		OX: "Oxford",
		PA: "Paisley",
		PE: "Peterborough",
		PH: "Perth",
		PL: "Plymouth",
		PO: "Portsmouth",
		PR: "Preston",
		RG: "Reading",
		RH: "Redhill",
		RM: "Romford",
		S: "Sheffield",
		SA: "Swansea",
		SE: "Southeast London",
		SG: "Stevenage",
		SK: "Stockport",
		SL: "Slough",
		SM: "Sutton",
		SN: "Swindon",
		SO: "Southampton",
		SP: "Salisbury",
		SR: "Sunderland",
		SS: "Southend",
		ST: "Stoke",
		SW: "Southwest London",
		SY: "Shrewsbury",
		TA: "Taunton",
		TD: "Galashiels",
		TF: "Telford",
		TN: "Tunbridge Wells",
		TQ: "Torquay",
		TR: "Truro",
		TS: "Cleveland",
		TW: "Twickenham",
		UB: "Southall",
		W: "West London",
		WA: "Warrington",
		WC: "Central London (West)",
		WD: "Watford",
		WF: "Wakefield",
		WN: "Wigan",
		WR: "Worcester",
		WS: "Walsall",
		WV: "Wolverhampton",
		YO: "York",
		ZE: "Lerwick",
	},
	// French départements
	fr: {
		"01": "Ain",
		"02": "Aisne",
		"03": "Allier",
		"04": "Alpes-de-Haute-Provence",
		"05": "Hautes-Alpes",
		"06": "Alpes-Maritimes",
		"07": "Ardèche",
		"08": "Ardennes",
		"09": "Ariège",
		"10": "Aube",
		"11": "Aude",
		"12": "Aveyron",
		"13": "Bouches-du-Rhône",
		"14": "Calvados",
		"15": "Cantal",
		"16": "Charente",
		"17": "Charente-Maritime",
		"18": "Cher",
		"19": "Corrèze",
		"21": "Côte-d'Or",
		"22": "Côtes-d'Armor",
		"23": "Creuse",
		"24": "Dordogne",
		"25": "Doubs",
		"26": "Drôme",
		"27": "Eure",
		"28": "Eure-et-Loir",
		"29": "Finistère",
		"2A": "Corse-du-Sud",
		"2B": "Haute-Corse",
		"30": "Gard",
		"31": "Haute-Garonne",
		"32": "Gers",
		"33": "Gironde",
		"34": "Hérault",
		"35": "Ille-et-Vilaine",
		"36": "Indre",
		"37": "Indre-et-Loire",
		"38": "Isère",
		"39": "Jura",
		"40": "Landes",
		"41": "Loir-et-Cher",
		"42": "Loire",
		"43": "Haute-Loire",
		"44": "Loire-Atlantique",
		"45": "Loiret",
		"46": "Lot",
		"47": "Lot-et-Garonne",
		"48": "Lozère",
		"49": "Maine-et-Loire",
		"50": "Manche",
		"51": "Marne",
		"52": "Haute-Marne",
		"53": "Mayenne",
		"54": "Meurthe-et-Moselle",
		"55": "Meuse",
		"56": "Morbihan",
		"57": "Moselle",
		"58": "Nièvre",
		"59": "Nord",
		"60": "Oise",
		"61": "Orne",
		"62": "Pas-de-Calais",
		"63": "Puy-de-Dôme",
		"64": "Pyrénées-Atlantiques",
		"65": "Hautes-Pyrénées",
		"66": "Pyrénées-Orientales",
		"67": "Bas-Rhin",
		"68": "Haut-Rhin",
		"69": "Rhône",
		"70": "Haute-Saône",
		"71": "Saône-et-Loire",
		"72": "Sarthe",
		"73": "Savoie",
		"74": "Haute-Savoie",
		"75": "Paris",
		"76": "Seine-Maritime",
		"77": "Seine-et-Marne",
		"78": "Yvelines",
		"79": "Deux-Sèvres",
		"80": "Somme",
		"81": "Tarn",
		"82": "Tarn-et-Garonne",
		"83": "Var",
		"84": "Vaucluse",
		"85": "Vendée",
		"86": "Vienne",
		"87": "Haute-Vienne",
		"88": "Vosges",
		"89": "Yonne",
		"90": "Territoire de Belfort",
		"91": "Essonne",
		"92": "Hauts-de-Seine",
		"93": "Seine-Saint-Denis",
		"94": "Val-de-Marne",
		"95": "Val-d'Oise",
	},
};

// Color scale for heat map
function getHeatColor(value: number, max: number): string {
	if (max === 0) return "hsl(var(--muted))";
	const ratio = Math.min(value / max, 1);
	// Gradient from light to dark primary
	const _lightness = 90 - ratio * 50; // 90% (light) to 40% (dark)
	return `hsl(var(--primary) / ${0.3 + ratio * 0.7})`;
}

export function GeographicHeatMap({
	data,
	level,
	selectedCountry,
	onLevelChange,
	onRegionClick,
	maxLetters,
}: GeographicHeatMapProps) {
	const [_hoveredRegion, setHoveredRegion] = useState<HeatMapDataPoint | null>(
		null,
	);

	// Calculate max for color scaling
	const max = maxLetters ?? Math.max(...data.map((d) => d.letterCount), 1);

	// Get display name for a region
	const getRegionName = (point: HeatMapDataPoint): string => {
		if (level === "country") {
			const names: Record<string, string> = {
				de: "Germany",
				ca: "Canada",
				uk: "United Kingdom",
				fr: "France",
				us: "United States",
			};
			return names[point.country] || point.country.toUpperCase();
		}
		if (level === "region" && point.regionCode) {
			const countryRegions = REGION_NAMES[point.country];
			return countryRegions?.[point.regionCode] || `Region ${point.regionCode}`;
		}
		if (level === "district") {
			return point.districtName || point.districtId || "Unknown District";
		}
		if (level === "postal") {
			return point.postalCode || "Unknown";
		}
		return "Unknown";
	};

	// Sort data by letter count descending
	const sortedData = [...data].sort((a, b) => b.letterCount - a.letterCount);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Geographic Breakdown</CardTitle>
					{onLevelChange && (
						<div className="flex gap-1">
							{(["country", "region", "district", "postal"] as const).map(
								(lvl) => (
									<button
										type="button"
										key={lvl}
										onClick={() => onLevelChange(lvl)}
										className={`px-3 py-1 text-xs rounded-full transition-colors ${
											level === lvl
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{LEVEL_LABELS[lvl].en}
									</button>
								),
							)}
						</div>
					)}
				</div>
				{selectedCountry && (
					<p className="text-sm text-muted-foreground">
						Showing data for {selectedCountry.toUpperCase()}
					</p>
				)}
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="flex items-center justify-center h-40 text-muted-foreground">
						No geographic data available
					</div>
				) : (
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{sortedData.slice(0, 50).map((point, idx) => {
							const name = getRegionName(point);
							const intensity = point.letterCount / max;

							return (
								<button
									type="button"
									key={`${point.country}-${point.regionCode || point.districtId || point.postalCode || idx}`}
									className="w-full text-left"
									onClick={() => onRegionClick?.(point)}
									onMouseEnter={() => setHoveredRegion(point)}
									onMouseLeave={() => setHoveredRegion(null)}
								>
									<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
										{/* Heat indicator */}
										<div
											className="w-3 h-8 rounded-sm"
											style={{
												backgroundColor: getHeatColor(point.letterCount, max),
											}}
										/>

										{/* Region info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-2">
												<span className="font-medium truncate">{name}</span>
												<span className="text-sm font-bold tabular-nums">
													{point.letterCount.toLocaleString()}
												</span>
											</div>
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<span>
													{point.uniqueReps} rep
													{point.uniqueReps !== 1 ? "s" : ""}
													{point.uniquePostcodes && level !== "postal"
														? ` · ${point.uniquePostcodes} postcodes`
														: ""}
													{point.uniqueDistricts && level === "region"
														? ` · ${point.uniqueDistricts} districts`
														: ""}
												</span>
												<span>{Math.round(intensity * 100)}%</span>
											</div>

											{/* Progress bar */}
											<div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-primary rounded-full transition-all"
													style={{ width: `${intensity * 100}%` }}
												/>
											</div>
										</div>
									</div>
								</button>
							);
						})}

						{sortedData.length > 50 && (
							<p className="text-center text-sm text-muted-foreground py-2">
								Showing top 50 of {sortedData.length} areas
							</p>
						)}
					</div>
				)}

				{/* Legend */}
				<div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="w-16 h-2 rounded-sm bg-linear-to-r from-primary/30 to-primary" />
						<span>Activity level</span>
					</div>
					<span>Max: {max.toLocaleString()} letters</span>
				</div>
			</CardContent>
		</Card>
	);
}
