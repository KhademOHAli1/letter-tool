/**
 * French Legislative Constituencies (Circonscriptions) and Deputy Data
 *
 * Data sources:
 * - Deputies: Assemblée Nationale Open Data (data.assemblee-nationale.fr)
 * - 17th Legislature (since July 2024)
 *
 * Lookup Strategy:
 * French postal codes (5 digits) start with département code (2 digits for métropole).
 * Since we don't have a reliable postal code → circonscription mapping,
 * we use département-based lookup: show all deputies in the département,
 * let user select their circonscription.
 *
 * Special cases:
 * - 75xxx = Paris (75)
 * - 97xxx = Overseas départements (971=Guadeloupe, 972=Martinique, etc.)
 * - 20xxx = Corsica (2A=Corse-du-Sud, 2B=Haute-Corse)
 */

import deputeDataJson from "./depute-data.json";

export interface Depute {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	department: string;
	departmentCode: string;
	constituency: number;
	party: string;
	partyShort: string;
}

export interface Circonscription {
	code: string; // departmentCode + constituency number, e.g., "75-01"
	name: string; // e.g., "1ère circonscription de Paris"
	department: string;
	departmentCode: string;
	constituency: number;
}

/**
 * Department name lookup
 */
export const DEPARTMENTS: Record<string, string> = {
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
	// DOM-TOM
	"971": "Guadeloupe",
	"972": "Martinique",
	"973": "Guyane",
	"974": "La Réunion",
	"976": "Mayotte",
	// Collectivités d'outre-mer (electoral circonscriptions)
	"975": "Saint-Pierre-et-Miquelon",
	"977": "Saint-Barthélemy & Saint-Martin",
	"986": "Wallis-et-Futuna",
	"987": "Polynésie française",
	"988": "Nouvelle-Calédonie",
	// Français établis hors de France
	FE1: "Europe du Nord",
	FE2: "Péninsule ibérique",
	FE3: "Europe centrale & du Sud",
	FE4: "Europe de l'Est",
	FE5: "Afrique du Nord & de l'Ouest",
	FE6: "Afrique & Moyen-Orient",
	FE7: "Asie & Océanie",
	FE8: "Amérique du Nord",
	FE9: "Amérique latine Nord",
	FE10: "Amérique latine Sud",
	FE11: "Asie centrale & Inde",
};

/**
 * Party display colors (based on official party colors)
 */
export const FR_PARTY_COLORS: Record<string, string> = {
	// Majorité présidentielle
	EPR: "#FFEB00", // Renaissance/Ensemble pour la République
	Dem: "#FFC000", // MoDem/Démocrates
	HOR: "#0066CC", // Horizons

	// Gauche
	"LFI-NFP": "#CC2443", // La France Insoumise
	SOC: "#FF69B4", // Socialistes
	EcoS: "#00A86B", // Écologistes
	GDR: "#DD0000", // Gauche Démocrate et Républicaine (PCF)

	// Droite
	DR: "#0066CC", // Droite Républicaine (LR)
	UDR: "#8B0000", // Union des Droites pour la République

	// Extrême droite
	RN: "#0D378A", // Rassemblement National

	// Autres
	LIOT: "#9ACD32", // Libertés, Indépendants, Outre-mer et Territoires
	NI: "#808080", // Non-inscrit
};

/**
 * All deputies from the 17th Legislature
 */
export const DEPUTES: Depute[] = deputeDataJson as Depute[];

/**
 * Build département → deputies lookup map
 */
const DEPT_TO_DEPUTES: Map<string, Depute[]> = (() => {
	const map = new Map<string, Depute[]>();
	for (const dep of DEPUTES) {
		const existing = map.get(dep.departmentCode) || [];
		existing.push(dep);
		map.set(dep.departmentCode, existing);
	}
	// Sort each list by constituency number
	for (const [key, list] of map) {
		map.set(
			key,
			list.sort((a, b) => a.constituency - b.constituency),
		);
	}
	return map;
})();

/**
 * Extract département code from postal code
 *
 * Rules:
 * - 01-19: first 2 digits = département code
 * - 20xxx: Corse (20 → 2A or 2B, need additional info)
 * - 21-95: first 2 digits = département code
 * - 97xxx: DOM-TOM (first 3 digits = département code)
 */
export function getDepartmentFromPostalCode(postalCode: string): string | null {
	const normalized = postalCode.replace(/\s/g, "").trim();

	// Validate: French postal codes are exactly 5 digits
	if (!/^\d{5}$/.test(normalized)) {
		return null;
	}

	const prefix2 = normalized.slice(0, 2);
	const prefix3 = normalized.slice(0, 3);

	// DOM-TOM: 97x
	if (prefix2 === "97") {
		if (["971", "972", "973", "974", "976"].includes(prefix3)) {
			return prefix3;
		}
		// Unknown DOM-TOM
		return null;
	}

	// Corsica: 20xxx
	// 20000-20199 = Corse-du-Sud (2A), 20200+ = Haute-Corse (2B)
	// Simplified: we'll return both options and let user choose
	if (prefix2 === "20") {
		const num = Number.parseInt(normalized, 10);
		if (num < 20200) {
			return "2A";
		}
		return "2B";
	}

	// Metropolitan France: 01-95
	const deptNum = Number.parseInt(prefix2, 10);
	if (deptNum >= 1 && deptNum <= 95) {
		return prefix2.padStart(2, "0");
	}

	return null;
}

/**
 * Validate French postal code format
 */
export function isValidFrenchPostalCode(postalCode: string): boolean {
	const normalized = postalCode.replace(/\s/g, "").trim();
	return /^\d{5}$/.test(normalized);
}

/**
 * Find all deputies for a département
 */
export function findDeputesByDepartment(departmentCode: string): Depute[] {
	return DEPT_TO_DEPUTES.get(departmentCode) || [];
}

/**
 * Find deputy by département and circonscription number
 */
export function findDeputeByCirconscription(
	departmentCode: string,
	constituency: number,
): Depute | null {
	const deputes = DEPT_TO_DEPUTES.get(departmentCode) || [];
	return deputes.find((d) => d.constituency === constituency) || null;
}

/**
 * Find deputies by postal code (returns all from the département)
 */
export function findDeputesByPostalCode(postalCode: string): Depute[] {
	const deptCode = getDepartmentFromPostalCode(postalCode);
	if (!deptCode) {
		return [];
	}
	return findDeputesByDepartment(deptCode);
}

/**
 * Get circonscription display name
 * e.g., "1ère circonscription de Paris" or "3e circonscription du Rhône"
 */
export function getCirconscriptionName(depute: Depute): string {
	const ordinal =
		depute.constituency === 1 ? "1ère" : `${depute.constituency}e`;
	return `${ordinal} circonscription – ${depute.department}`;
}

/**
 * Get department name from code
 */
export function getDepartmentName(code: string): string | undefined {
	return DEPARTMENTS[code];
}

/**
 * Get the number of circonscriptions in a département
 */
export function getCirconscriptionCount(departmentCode: string): number {
	return DEPT_TO_DEPUTES.get(departmentCode)?.length || 0;
}
