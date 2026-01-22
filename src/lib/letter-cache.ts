/**
 * Letter Cache & Multi-MP Management
 *
 * Enables users to reuse generated letters for multiple MPs in their Wahlkreis,
 * reducing token usage and improving UX.
 *
 * Storage:
 * - letterCache: The most recent generated letter with form data
 * - emailedMdbs: Array of MdB IDs that have been emailed
 * - letterHistory: Full history of all generated letters (for local viewing)
 * - formDraft: Auto-saved form state for recovery
 */

import type { MdB } from "./data/wahlkreise";

const LETTER_CACHE_KEY = "letter-cache";
const EMAILED_MDBS_KEY = "emailed-mdbs";
const LETTER_HISTORY_KEY = "letter-history";
const FORM_DRAFT_KEY = "form-draft";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const HISTORY_MAX_ITEMS = 50; // Keep last 50 letters

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

// ===== LETTER HISTORY =====

export interface HistoryLetter {
	id: string;
	content: string;
	subject: string;
	wordCount: number;
	mdbName: string;
	mdbParty: string;
	mdbEmail: string;
	wahlkreisName: string;
	createdAt: number;
	emailSent: boolean;
	emailSentAt?: number;
	trackingId?: string;
}

/**
 * Add a letter to history
 */
export function addToLetterHistory(
	letter: Omit<HistoryLetter, "id" | "createdAt">,
): string {
	if (typeof localStorage === "undefined") return "";

	const history = getLetterHistory();
	const id = `letter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

	const newLetter: HistoryLetter = {
		...letter,
		id,
		createdAt: Date.now(),
	};

	// Add to beginning of array
	history.unshift(newLetter);

	// Keep only last N items
	const trimmed = history.slice(0, HISTORY_MAX_ITEMS);

	try {
		localStorage.setItem(LETTER_HISTORY_KEY, JSON.stringify(trimmed));
	} catch {
		// Storage full - try removing oldest items
		try {
			const reduced = trimmed.slice(0, 20);
			localStorage.setItem(LETTER_HISTORY_KEY, JSON.stringify(reduced));
		} catch {
			// Give up
		}
	}

	return id;
}

/**
 * Get all letters from history
 */
export function getLetterHistory(): HistoryLetter[] {
	if (typeof localStorage === "undefined") return [];

	try {
		const raw = localStorage.getItem(LETTER_HISTORY_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

/**
 * Get a specific letter from history
 */
export function getHistoryLetter(id: string): HistoryLetter | null {
	const history = getLetterHistory();
	return history.find((l) => l.id === id) || null;
}

/**
 * Mark a letter as sent
 */
export function markLetterAsSent(id: string): void {
	if (typeof localStorage === "undefined") return;

	const history = getLetterHistory();
	const letter = history.find((l) => l.id === id);
	if (letter) {
		letter.emailSent = true;
		letter.emailSentAt = Date.now();
		try {
			localStorage.setItem(LETTER_HISTORY_KEY, JSON.stringify(history));
		} catch {
			// Ignore
		}
	}
}

/**
 * Delete a letter from history
 */
export function deleteFromHistory(id: string): void {
	if (typeof localStorage === "undefined") return;

	const history = getLetterHistory();
	const filtered = history.filter((l) => l.id !== id);
	try {
		localStorage.setItem(LETTER_HISTORY_KEY, JSON.stringify(filtered));
	} catch {
		// Ignore
	}
}

/**
 * Clear all letter history
 */
export function clearLetterHistory(): void {
	if (typeof localStorage === "undefined") return;
	localStorage.removeItem(LETTER_HISTORY_KEY);
}

// ===== FORM DRAFT AUTO-SAVE =====

export interface FormDraft {
	name: string;
	plz: string;
	personalNote: string;
	selectedForderungen: string[];
	selectedMdBId?: string;
	savedAt: number;
}

/**
 * Save form draft
 */
export function saveFormDraft(draft: Omit<FormDraft, "savedAt">): void {
	if (typeof localStorage === "undefined") return;

	const saved: FormDraft = {
		...draft,
		savedAt: Date.now(),
	};

	try {
		localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(saved));
	} catch {
		// Ignore
	}
}

/**
 * Get saved form draft
 */
export function getFormDraft(): FormDraft | null {
	if (typeof localStorage === "undefined") return null;

	try {
		const raw = localStorage.getItem(FORM_DRAFT_KEY);
		if (!raw) return null;

		const draft: FormDraft = JSON.parse(raw);

		// Expire drafts older than 24 hours
		if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
			clearFormDraft();
			return null;
		}

		return draft;
	} catch {
		return null;
	}
}

/**
 * Clear form draft
 */
export function clearFormDraft(): void {
	if (typeof localStorage === "undefined") return;
	localStorage.removeItem(FORM_DRAFT_KEY);
}

/**
 * Check if there's a saved draft
 */
export function hasSavedDraft(): boolean {
	return getFormDraft() !== null;
}

/**
 * Generate a tracking ID for email open tracking
 */
export function generateTrackingId(): string {
	return `t-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get the tracking pixel URL
 */
export function getTrackingPixelUrl(trackingId: string): string {
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
	return `${baseUrl}/api/track?id=${encodeURIComponent(trackingId)}`;
}
