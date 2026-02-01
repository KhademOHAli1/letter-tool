import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js Proxy (replaces middleware in Next.js 16+)
 *
 * Handles:
 * 1. Supabase auth session refresh on admin/auth routes
 * 2. Geo-based country routing based on IP location
 *
 * Routes:
 * - /de → German version (default)
 * - /ca → Canadian version
 * - /uk → UK version
 * - /fr → French version
 * - /us → US version
 *
 * Uses Vercel's geo detection via x-vercel-ip-country header
 */

// Countries that should route to US version
const US_COUNTRIES = ["US"];

// Countries that should route to Canadian version
const CANADA_COUNTRIES = ["CA"];

// Countries that should route to UK version
const UK_COUNTRIES = ["GB", "UK"];

// Countries that should route to French version
const FRANCE_COUNTRIES = ["FR"];

// Paths that should not be redirected (static assets, API routes, etc.)
const EXCLUDED_PATHS = [
	"/api",
	"/favicon.ico",
	"/_next",
	"/og",
	"/robots.txt",
	"/sitemap.xml",
	"/admin",
	"/auth",
	"/campaigns",
	"/embed",
	"/c",
	"/qr",
];

// Routes that need auth session refresh
const AUTH_ROUTES = ["/admin", "/auth", "/api/campaigns"];

/**
 * Refresh Supabase auth session if on protected routes
 */
async function refreshAuthSession(
	request: NextRequest,
): Promise<NextResponse | null> {
	const { pathname } = request.nextUrl;

	// Only process auth routes
	const needsAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
	if (!needsAuth) {
		return null;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// Skip if Supabase is not configured
	if (!supabaseUrl || !supabaseAnonKey) {
		return null;
	}

	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				supabaseResponse = NextResponse.next({ request });
				for (const { name, value, options } of cookiesToSet) {
					supabaseResponse.cookies.set(name, value, options);
				}
			},
		},
	});

	// Refresh session if expired
	await supabase.auth.getUser();

	return supabaseResponse;
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip excluded paths FIRST before any other logic
	if (EXCLUDED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
		return NextResponse.next();
	}

	// First, handle auth session refresh for protected routes
	const authResponse = await refreshAuthSession(request);
	if (authResponse && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
		// For auth routes, return the auth response (with refreshed cookies)
		return authResponse;
	}

	// Skip if already on a country route
	if (
		pathname.startsWith("/de") ||
		pathname.startsWith("/ca") ||
		pathname.startsWith("/uk") ||
		pathname.startsWith("/fr") ||
		pathname.startsWith("/us")
	) {
		return NextResponse.next();
	}

	// Check for manual country override cookie
	const countryCookie = request.cookies.get("country")?.value;
	if (countryCookie && ["de", "ca", "uk", "fr", "us"].includes(countryCookie)) {
		const url = request.nextUrl.clone();
		url.pathname = `/${countryCookie}${pathname}`;
		return NextResponse.redirect(url);
	}

	// Detect country from Vercel's geo headers
	// https://vercel.com/docs/edge-network/headers#x-vercel-ip-country
	// In development, header is undefined - default to 'DE'
	const detectedCountry = request.headers.get("x-vercel-ip-country") || "DE";

	// Determine target country route
	let targetCountry: "de" | "ca" | "uk" | "fr" | "us" = "de";
	if (US_COUNTRIES.includes(detectedCountry)) {
		targetCountry = "us";
	} else if (CANADA_COUNTRIES.includes(detectedCountry)) {
		targetCountry = "ca";
	} else if (UK_COUNTRIES.includes(detectedCountry)) {
		targetCountry = "uk";
	} else if (FRANCE_COUNTRIES.includes(detectedCountry)) {
		targetCountry = "fr";
	}

	// Redirect to country-specific route
	const url = request.nextUrl.clone();
	url.pathname = `/${targetCountry}${pathname === "/" ? "" : pathname}`;

	// Set cookie to remember the detected country (can be overridden by user)
	const response = NextResponse.redirect(url);
	response.cookies.set("detected_country", targetCountry, {
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: false, // Allow JS access for country switcher
		sameSite: "lax",
	});

	return response;
}

export const config = {
	// Match all routes except static files
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
