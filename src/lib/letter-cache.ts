/**
 * Letter Cache & Multi-MP Management
 *
 * Enables users to reuse generated letters for multiple MPs in their Wahlkreis,
 * reducing token usage and improving UX.
 *
 * Storage:
 * - letterCache: The most recent generated letter with form data
 * - emailedMdbs: Array of MdB IDs that have been emailed
 */

import type { MdB } from "./data/wahlkreise";

const LETTER_CACHE_KEY = "letter-cache";
const EMAILED_MDBS_KEY = "emailed-mdbs";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CachedLetter {
	// Letter content
	content: string;
	subject: string;
	wordCount: number;

	// Original form data for regeneration
	senderName: string;
	senderPlz: string;
	wahlkreisId: string;
	wahlkreisName: string;
	forderungen: string[];
	personalNote: string;

	// Current MdB this letter was written for
	mdb: MdB;

	// Metadata
	createdAt: number;
	lastUsedAt: number;
}

export interface EmailedMdB {
	mdbId: string;
	mdbName: string;
	party: string;
	emailedAt: number;
}

/**
 * Save a generated letter to cache
 */
export function cacheGeneratedLetter(
	letter: Omit<CachedLetter, "createdAt" | "lastUsedAt">,
): void {
	if (typeof localStorage === "undefined") return;

	const cached: CachedLetter = {
		...letter,
		createdAt: Date.now(),
		lastUsedAt: Date.now(),
	};

	try {
		localStorage.setItem(LETTER_CACHE_KEY, JSON.stringify(cached));
	} catch {
		// Storage full or unavailable - fail silently
	}
}

/**
 * Get the cached letter if still valid
 */
export function getCachedLetter(): CachedLetter | null {
	if (typeof localStorage === "undefined") return null;

	try {
		const raw = localStorage.getItem(LETTER_CACHE_KEY);
		if (!raw) return null;

		const cached: CachedLetter = JSON.parse(raw);

		// Check if expired
		if (Date.now() - cached.createdAt > CACHE_EXPIRY_MS) {
			localStorage.removeItem(LETTER_CACHE_KEY);
			return null;
		}

		return cached;
	} catch {
		return null;
	}
}

/**
 * Update the last used timestamp
 */
export function touchCachedLetter(): void {
	const cached = getCachedLetter();
	if (!cached) return;

	cached.lastUsedAt = Date.now();
	try {
		localStorage.setItem(LETTER_CACHE_KEY, JSON.stringify(cached));
	} catch {
		// Ignore
	}
}

/**
 * Clear the cached letter
 */
export function clearCachedLetter(): void {
	if (typeof localStorage === "undefined") return;
	localStorage.removeItem(LETTER_CACHE_KEY);
}

/**
 * Mark an MdB as emailed
 * Accepts either a full MdB object or minimal info
 */
export function markMdBAsEmailed(
	mdb: MdB | { id: string; name: string; party: string },
): void {
	if (typeof localStorage === "undefined") return;

	const emailed = getEmailedMdBs();

	// Don't duplicate
	if (emailed.some((e) => e.mdbId === mdb.id)) return;

	emailed.push({
		mdbId: mdb.id,
		mdbName: mdb.name,
		party: mdb.party,
		emailedAt: Date.now(),
	});

	try {
		localStorage.setItem(EMAILED_MDBS_KEY, JSON.stringify(emailed));
	} catch {
		// Ignore
	}
}

/**
 * Get all emailed MdBs
 */
export function getEmailedMdBs(): EmailedMdB[] {
	if (typeof localStorage === "undefined") return [];

	try {
		const raw = localStorage.getItem(EMAILED_MDBS_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

/**
 * Check if an MdB has been emailed
 */
export function hasMdBBeenEmailed(mdbId: string): boolean {
	return getEmailedMdBs().some((e) => e.mdbId === mdbId);
}

/**
 * Get remaining MdBs in a Wahlkreis that haven't been emailed
 */
export function getRemainingMdBs(allMdBs: MdB[]): MdB[] {
	const emailedIds = new Set(getEmailedMdBs().map((e) => e.mdbId));
	return allMdBs.filter((mdb) => !emailedIds.has(mdb.id));
}

/**
 * Clear emailed MdBs history
 */
export function clearEmailedMdBs(): void {
	if (typeof localStorage === "undefined") return;
	localStorage.removeItem(EMAILED_MDBS_KEY);
}

/**
 * Adapt letter content for a different MdB
 * This is a simple find-replace for the MdB name.
 * For more complex adaptation, regeneration is recommended.
 */
export function adaptLetterForMdB(
	content: string,
	originalMdb: MdB,
	newMdb: MdB,
): string {
	// Replace the original MdB name with the new one
	// Also handle common variations like "Sehr geehrte/r Herr/Frau Name"
	let adapted = content;

	// Replace full name
	adapted = adapted.replace(new RegExp(originalMdb.name, "g"), newMdb.name);

	// Replace last name (if it appears separately)
	const originalLastName = originalMdb.name.split(" ").pop() || "";
	const newLastName = newMdb.name.split(" ").pop() || "";
	if (originalLastName && newLastName && originalLastName !== newMdb.name) {
		// Be careful not to replace partial matches - use word boundaries
		adapted = adapted.replace(
			new RegExp(`\\b${originalLastName}\\b`, "g"),
			newLastName,
		);
	}

	return adapted;
}

/**
 * Get statistics about the user's letter activity
 */
export function getLetterStats(): {
	totalEmailed: number;
	lastEmailedAt: number | null;
	cachedLetterAge: number | null;
} {
	const emailed = getEmailedMdBs();
	const cached = getCachedLetter();

	return {
		totalEmailed: emailed.length,
		lastEmailedAt:
			emailed.length > 0 ? Math.max(...emailed.map((e) => e.emailedAt)) : null,
		cachedLetterAge: cached ? Date.now() - cached.createdAt : null,
	};
}
