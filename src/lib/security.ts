/**
 * Security utilities for API protection
 * Provides origin validation, bot detection, and request fingerprinting
 */

/**
 * Validate that the request origin matches allowed domains
 * Protects against CSRF attacks
 */
export function validateOrigin(request: Request): {
	valid: boolean;
	origin: string | null;
} {
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");

	// In production, require origin header
	const isProduction = process.env.NODE_ENV === "production";

	// Allowed origins
	const allowedOrigins = [
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.NEXT_PUBLIC_BASE_URL,
		"https://letter-tool.vercel.app",
		// Add your custom domains here if needed
	].filter(Boolean);

	// Also allow localhost in development
	if (!isProduction) {
		allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
	}

	// Check origin header
	if (origin) {
		const isValid = allowedOrigins.some(
			(allowed) => allowed && origin.startsWith(allowed),
		);
		return { valid: isValid, origin };
	}

	// Fallback to referer if no origin (some browsers)
	if (referer) {
		const refererOrigin = new URL(referer).origin;
		const isValid = allowedOrigins.some(
			(allowed) => allowed && refererOrigin.startsWith(allowed),
		);
		return { valid: isValid, origin: refererOrigin };
	}

	// No origin or referer - reject in production
	return { valid: !isProduction, origin: null };
}

/**
 * Bot detection patterns
 * Returns true if request appears to be from a bot
 */
export function detectBot(request: Request): {
	isBot: boolean;
	reason?: string;
} {
	const userAgent = request.headers.get("user-agent") || "";
	const acceptLanguage = request.headers.get("accept-language");
	const accept = request.headers.get("accept");

	// Known bot patterns
	const botPatterns = [
		/bot/i,
		/crawl/i,
		/spider/i,
		/scrape/i,
		/headless/i,
		/phantom/i,
		/selenium/i,
		/puppeteer/i,
		/playwright/i,
		/wget/i,
		/curl/i,
		/httpie/i,
		/python-requests/i,
		/axios/i,
		/node-fetch/i,
		/go-http-client/i,
		/java\//i,
		/libwww/i,
		/mechanize/i,
	];

	// Check user agent
	if (!userAgent) {
		return { isBot: true, reason: "missing-user-agent" };
	}

	for (const pattern of botPatterns) {
		if (pattern.test(userAgent)) {
			return { isBot: true, reason: `bot-pattern: ${pattern.source}` };
		}
	}

	// Real browsers send accept-language
	if (!acceptLanguage) {
		return { isBot: true, reason: "missing-accept-language" };
	}

	// Real browsers send accept header with specific content types
	if (!accept || accept === "*/*") {
		// Some legitimate requests use */*, so just flag it
		// return { isBot: true, reason: 'suspicious-accept-header' };
	}

	// Check for suspiciously short user agent
	if (userAgent.length < 20) {
		return { isBot: true, reason: "short-user-agent" };
	}

	return { isBot: false };
}

/**
 * Generate a request fingerprint for abuse detection
 * NOT for tracking users - only for detecting attack patterns
 */
export function generateFingerprint(request: Request): string {
	const ip = getClientIPForFingerprint(request);
	const userAgent = request.headers.get("user-agent") || "";
	const acceptLanguage = request.headers.get("accept-language") || "";

	// Create a simple hash
	const data = `${ip}:${userAgent.slice(0, 50)}:${acceptLanguage.slice(0, 20)}`;
	return simpleHash(data);
}

function getClientIPForFingerprint(request: Request): string {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
		request.headers.get("x-real-ip") ||
		request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
		"unknown"
	);
}

function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36);
}

/**
 * Timing attack protection - constant time string comparison
 */
export function secureCompare(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

/**
 * Detect abnormal request patterns that might indicate abuse
 */
export function detectAbusePatterns(body: Record<string, unknown>): {
	suspicious: boolean;
	reason?: string;
} {
	// Check for excessively long inputs
	const personalNote = body.personalNote;
	if (typeof personalNote === "string" && personalNote.length > 5000) {
		return { suspicious: true, reason: "excessive-input-length" };
	}

	// Check for repeated characters (spam pattern)
	if (typeof personalNote === "string") {
		const repeatedPattern = /(.)\1{20,}/;
		if (repeatedPattern.test(personalNote)) {
			return { suspicious: true, reason: "repeated-characters" };
		}
	}

	// Check for too many forderungen (should be max 10)
	const forderungen = body.forderungen;
	if (Array.isArray(forderungen) && forderungen.length > 20) {
		return { suspicious: true, reason: "excessive-forderungen" };
	}

	// Check for script tags or other HTML injection attempts
	const htmlPattern = /<(script|iframe|object|embed|form|input)/i;
	for (const [key, value] of Object.entries(body)) {
		if (typeof value === "string" && htmlPattern.test(value)) {
			return { suspicious: true, reason: `html-injection-in-${key}` };
		}
	}

	return { suspicious: false };
}

/**
 * Content-based rate limiting
 * Detects users trying to generate many similar letters
 */
const contentHashes = new Map<string, { count: number; firstSeen: number }>();

export function checkContentSimilarity(
	fingerprint: string,
	contentHash: string,
): { allowed: boolean; reason?: string } {
	const key = `${fingerprint}:${contentHash}`;
	const now = Date.now();
	const windowMs = 3600000; // 1 hour

	const entry = contentHashes.get(key);

	// Clean old entries
	if (contentHashes.size > 10000) {
		for (const [k, v] of contentHashes.entries()) {
			if (now - v.firstSeen > windowMs) {
				contentHashes.delete(k);
			}
		}
	}

	if (!entry || now - entry.firstSeen > windowMs) {
		contentHashes.set(key, { count: 1, firstSeen: now });
		return { allowed: true };
	}

	// Allow max 3 identical requests per hour
	if (entry.count >= 3) {
		return { allowed: false, reason: "duplicate-content" };
	}

	entry.count++;
	return { allowed: true };
}
