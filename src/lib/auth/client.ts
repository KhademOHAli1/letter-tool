/**
 * Client-side authentication utilities
 * Phase 4: Backend Authentication & Authorization
 *
 * Uses @supabase/ssr for Next.js App Router compatibility.
 * These functions should only be used in Client Components.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { clientEnv } from "../env";

// Singleton browser client
let browserClient: SupabaseClient | null = null;

/**
 * Get the Supabase browser client (singleton).
 * Use this for client-side auth operations.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
	if (browserClient) {
		return browserClient;
	}

	browserClient = createBrowserClient(
		clientEnv.NEXT_PUBLIC_SUPABASE_URL,
		clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);

	return browserClient;
}

/**
 * Sign in with email and password.
 */
export async function signIn(
	email: string,
	password: string,
): Promise<{ user: User | null; error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return { user: null, error: error.message };
	}

	return { user: data.user, error: null };
}

/**
 * Sign up with email and password.
 */
export async function signUp(
	email: string,
	password: string,
	displayName?: string,
): Promise<{ user: User | null; error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				display_name: displayName,
			},
		},
	});

	if (error) {
		return { user: null, error: error.message };
	}

	return { user: data.user, error: null };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return { error: error.message };
	}

	return { error: null };
}

/**
 * Sign in with Google OAuth.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
		},
	});

	if (error) {
		return { error: error.message };
	}

	return { error: null };
}

/**
 * Send a password reset email.
 */
export async function resetPassword(
	email: string,
): Promise<{ error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/auth/reset-password`,
	});

	if (error) {
		return { error: error.message };
	}

	return { error: null };
}

/**
 * Update user password (when user has reset token).
 */
export async function updatePassword(
	newPassword: string,
): Promise<{ error: string | null }> {
	const supabase = getSupabaseBrowserClient();

	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
		return { error: error.message };
	}

	return { error: null };
}

/**
 * Get the current user from the client.
 */
export async function getCurrentUser(): Promise<User | null> {
	const supabase = getSupabaseBrowserClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
	callback: (user: User | null) => void,
): () => void {
	const supabase = getSupabaseBrowserClient();

	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange((_event, session) => {
		callback(session?.user ?? null);
	});

	return () => subscription.unsubscribe();
}
