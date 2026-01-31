/**
 * Auth callback route handler
 * Phase 4: Backend Authentication & Authorization
 *
 * Handles OAuth callbacks from Supabase Auth.
 * This route is called after a user authenticates with Google or
 * confirms their email address.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { clientEnv, serverEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") ?? "/admin";

	if (code) {
		const cookieStore = await cookies();

		const supabase = createServerClient(
			clientEnv.NEXT_PUBLIC_SUPABASE_URL || serverEnv.SUPABASE_URL || "",
			clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					},
				},
			},
		);

		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// Successful authentication - redirect to requested page
			return NextResponse.redirect(new URL(next, requestUrl.origin));
		}
	}

	// Return the user to an error page with instructions
	return NextResponse.redirect(
		new URL("/auth/error?message=Could not authenticate", requestUrl.origin),
	);
}
