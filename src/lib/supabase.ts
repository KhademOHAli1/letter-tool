/**
 * Supabase client configuration.
 * Uses service role key for server-side operations (letter tracking).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "./env";

// Types for our database tables
export interface LetterGeneration {
	id?: string;
	country: "de" | "ca" | "uk" | "fr"; // Campaign country
	mdb_id: string;
	mdb_name: string;
	mdb_party: string | null;
	wahlkreis_id: string | null;
	wahlkreis_name: string | null;
	forderung_ids: string[];
	created_at?: string;
	user_hash?: string | null;
}

export interface LetterStats {
	total_letters: number;
	unique_mdbs: number;
	top_forderungen: { id: string; count: number }[];
	letters_by_party: { party: string; count: number }[];
	top_mdbs: { name: string; party: string | null; count: number }[];
	top_wahlkreise: { name: string; count: number }[];
}

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client with service role key.
 * Use this for tracking letter generations (write operations).
 * NEVER expose this client to the browser!
 */
export function createServerSupabaseClient(): SupabaseClient {
	if (supabaseClient) {
		return supabaseClient;
	}

	const supabaseUrl = serverEnv.SUPABASE_URL;
	const supabaseKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase configuration");
	}

	supabaseClient = createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	return supabaseClient;
}

/**
 * Track a letter generation in the database.
 * Called after successful LLM generation.
 */
export async function trackLetterGeneration(
	data: Omit<LetterGeneration, "id" | "created_at">,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Check if Supabase is configured
		if (!serverEnv.SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
			console.warn("[SUPABASE] Skipping tracking - not configured");
			return { success: true };
		}
		const supabase = createServerSupabaseClient();

		const { error } = await supabase.from("letter_generations").insert({
			country: data.country,
			mdb_id: data.mdb_id,
			mdb_name: data.mdb_name,
			mdb_party: data.mdb_party,
			wahlkreis_id: data.wahlkreis_id,
			wahlkreis_name: data.wahlkreis_name,
			forderung_ids: data.forderung_ids,
			user_hash: data.user_hash,
		});

		if (error) {
			console.error("[SUPABASE] Failed to track letter:", error.message, error);
			return { success: false, error: error.message };
		}

		console.log(
			"[SUPABASE] Letter tracked successfully for MdB:",
			data.mdb_name,
		);
		return { success: true };
	} catch (err) {
		console.error("[SUPABASE] Tracking error:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
}

/**
 * Get aggregated statistics about letter generations.
 * Useful for public dashboard / impact metrics.
 * @param country - Filter by country (default: "de" for backwards compatibility)
 */
export async function getLetterStats(
	country: "de" | "ca" | "uk" = "de",
): Promise<LetterStats | null> {
	try {
		const supabase = createServerSupabaseClient();

		// Total letters
		const { count: totalLetters } = await supabase
			.from("letter_generations")
			.select("*", { count: "exact", head: true })
			.eq("country", country);

		// Unique MdBs contacted
		const { data: uniqueMdbs } = await supabase
			.from("letter_generations")
			.select("mdb_id")
			.eq("country", country)
			.limit(1000);

		const mdbIds = (uniqueMdbs as { mdb_id: string }[] | null) || [];
		const uniqueMdbCount = new Set(mdbIds.map((r) => r.mdb_id)).size;

		// Letters by party (normalize case to handle legacy data inconsistencies)
		const { data: partyData } = await supabase
			.from("letter_generations")
			.select("mdb_party")
			.eq("country", country)
			.limit(10000);

		const partyRows =
			(partyData as { mdb_party: string | null }[] | null) || [];
		const partyCount: Record<string, number> = {};

		// Canonical party name mapping for normalization
		const normalizeParty = (party: string): string => {
			const upper = party.toUpperCase();
			// Map common variations to canonical names
			if (upper === "GRÜNE" || upper === "BÜNDNIS 90/DIE GRÜNEN")
				return "GRÜNE";
			if (upper === "DIE LINKE" || upper === "LINKE") return "DIE LINKE";
			return party; // Keep original for others (SPD, CDU/CSU, FDP, AfD, BSW)
		};

		for (const row of partyRows) {
			if (row.mdb_party) {
				const normalized = normalizeParty(row.mdb_party);
				partyCount[normalized] = (partyCount[normalized] || 0) + 1;
			}
		}

		// Top MdBs contacted
		const { data: mdbData } = await supabase
			.from("letter_generations")
			.select("mdb_name, mdb_party")
			.eq("country", country)
			.limit(10000);

		const mdbRows =
			(mdbData as { mdb_name: string; mdb_party: string | null }[] | null) ||
			[];
		const mdbCount: Record<string, { party: string | null; count: number }> =
			{};
		for (const row of mdbRows) {
			if (row.mdb_name) {
				if (!mdbCount[row.mdb_name]) {
					mdbCount[row.mdb_name] = {
						party: row.mdb_party ? normalizeParty(row.mdb_party) : null,
						count: 0,
					};
				}
				mdbCount[row.mdb_name].count++;
			}
		}

		const topMdbs = Object.entries(mdbCount)
			.map(([name, { party, count }]) => ({ name, party, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		// Top Wahlkreise
		const { data: wahlkreisData } = await supabase
			.from("letter_generations")
			.select("wahlkreis_name")
			.eq("country", country)
			.limit(10000);

		const wahlkreisRows =
			(wahlkreisData as { wahlkreis_name: string | null }[] | null) || [];
		const wahlkreisCount: Record<string, number> = {};
		for (const row of wahlkreisRows) {
			if (row.wahlkreis_name) {
				wahlkreisCount[row.wahlkreis_name] =
					(wahlkreisCount[row.wahlkreis_name] || 0) + 1;
			}
		}

		const topWahlkreise = Object.entries(wahlkreisCount)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return {
			total_letters: totalLetters || 0,
			unique_mdbs: uniqueMdbCount,
			top_forderungen: [], // TODO: Implement when needed
			letters_by_party: Object.entries(partyCount).map(([party, count]) => ({
				party,
				count,
			})),
			top_mdbs: topMdbs,
			top_wahlkreise: topWahlkreise,
		};
	} catch (err) {
		console.error("[SUPABASE] Stats error:", err);
		return null;
	}
}
