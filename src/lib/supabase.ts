/**
 * Supabase client configuration.
 * Uses service role key for server-side operations (letter tracking).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "./env";

// Types for our database tables
export interface LetterGeneration {
	id?: string;
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
		const supabase = createServerSupabaseClient();

		const { error } = await supabase.from("letter_generations").insert({
			mdb_id: data.mdb_id,
			mdb_name: data.mdb_name,
			mdb_party: data.mdb_party,
			wahlkreis_id: data.wahlkreis_id,
			wahlkreis_name: data.wahlkreis_name,
			forderung_ids: data.forderung_ids,
			user_hash: data.user_hash,
		});

		if (error) {
			console.error("[SUPABASE] Failed to track letter:", error.message);
			return { success: false, error: error.message };
		}

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
 */
export async function getLetterStats(): Promise<LetterStats | null> {
	try {
		const supabase = createServerSupabaseClient();

		// Total letters
		const { count: totalLetters } = await supabase
			.from("letter_generations")
			.select("*", { count: "exact", head: true });

		// Unique MdBs contacted
		const { data: uniqueMdbs } = await supabase
			.from("letter_generations")
			.select("mdb_id")
			.limit(1000);

		const mdbIds = (uniqueMdbs as { mdb_id: string }[] | null) || [];
		const uniqueMdbCount = new Set(mdbIds.map((r) => r.mdb_id)).size;

		// Letters by party
		const { data: partyData } = await supabase
			.from("letter_generations")
			.select("mdb_party")
			.limit(10000);

		const partyRows =
			(partyData as { mdb_party: string | null }[] | null) || [];
		const partyCount: Record<string, number> = {};
		for (const row of partyRows) {
			if (row.mdb_party) {
				partyCount[row.mdb_party] = (partyCount[row.mdb_party] || 0) + 1;
			}
		}

		return {
			total_letters: totalLetters || 0,
			unique_mdbs: uniqueMdbCount,
			top_forderungen: [], // TODO: Implement when needed
			letters_by_party: Object.entries(partyCount).map(([party, count]) => ({
				party,
				count,
			})),
		};
	} catch (err) {
		console.error("[SUPABASE] Stats error:", err);
		return null;
	}
}
