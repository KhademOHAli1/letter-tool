/**
 * Cookie Utilities for Theme and Language Preferences
 *
 * Uses only "strictly necessary" functional cookies that don't require
 * consent under GDPR (ePrivacy Directive Art. 5(3) exemption).
 *
 * These cookies are used to remember user preferences for a better experience.
 */

// Cookie Store API type (not yet in all TypeScript libs)
interface CookieStore {
	set(options: {
		name: string;
		value: string;
		path?: string;
		maxAge?: number;
		sameSite?: "strict" | "lax" | "none";
		secure?: boolean;
	}): Promise<void>;
	delete(name: string): Promise<void>;
}

// Cookie names
export const COOKIE_THEME = "theme";
export const COOKIE_LANGUAGE = "lang";

// Cookie max age: 1 year in seconds
const MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Set a cookie using Cookie Store API with fallback
 */
export async function setCookie(name: string, value: string): Promise<void> {
	if (typeof window === "undefined") return;

	// Use Cookie Store API if available (modern browsers)
	if ("cookieStore" in window) {
		try {
			await (window as Window & { cookieStore: CookieStore }).cookieStore.set({
				name,
				value: encodeURIComponent(value),
				path: "/",
				maxAge: MAX_AGE,
				sameSite: "lax",
				secure: true,
			});
			return;
		} catch {
			// Fall through to legacy method
		}
	}

	// Fallback for older browsers
	// biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax; Secure`;
}

/**
 * Get a cookie value (client-side)
 */
export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.trim().split("=");
		if (cookieName === name) {
			return decodeURIComponent(cookieValue);
		}
	}
	return null;
}

/**
 * Delete a cookie using Cookie Store API with fallback
 */
export async function deleteCookie(name: string): Promise<void> {
	if (typeof window === "undefined") return;

	// Use Cookie Store API if available (modern browsers)
	if ("cookieStore" in window) {
		try {
			await (
				window as Window & { cookieStore: CookieStore }
			).cookieStore.delete(name);
			return;
		} catch {
			// Fall through to legacy method
		}
	}

	// Fallback for older browsers
	// biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API
	document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

/**
 * Get cookie value from server-side cookie header
 */
export function getCookieFromHeader(
	cookieHeader: string | null,
	name: string,
): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(";");
	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.trim().split("=");
		if (cookieName === name) {
			return decodeURIComponent(cookieValue);
		}
	}
	return null;
}
