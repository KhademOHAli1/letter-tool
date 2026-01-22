import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

/**
 * GET /api/debug-env
 * Debug endpoint to check if Supabase is configured (without exposing secrets)
 * REMOVE THIS IN PRODUCTION!
 */
export async function GET(request: NextRequest) {
	const hasSupabaseUrl = !!serverEnv.SUPABASE_URL;
	const hasSupabaseKey = !!serverEnv.SUPABASE_SERVICE_ROLE_KEY;
	const keyPrefix = serverEnv.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || "not-set";

	return NextResponse.json({
		supabase_url_set: hasSupabaseUrl,
		supabase_key_set: hasSupabaseKey,
		key_prefix: keyPrefix,
		node_env: process.env.NODE_ENV,
	});
}
