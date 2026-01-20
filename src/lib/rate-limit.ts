/**
 * Simple in-memory rate limiter for Vercel Edge/Serverless
 * Limits requests per IP address to prevent abuse
 */

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

// In-memory store (resets on cold start, but good enough for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
	/** Maximum requests allowed in the time window */
	maxRequests: number;
	/** Time window in seconds */
	windowSeconds: number;
}

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetIn: number;
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 },
): RateLimitResult {
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	// Clean up expired entries periodically
	if (rateLimitStore.size > 10000) {
		for (const [key, value] of rateLimitStore.entries()) {
			if (value.resetTime < now) {
				rateLimitStore.delete(key);
			}
		}
	}

	// No existing entry or expired
	if (!entry || entry.resetTime < now) {
		const newEntry: RateLimitEntry = {
			count: 1,
			resetTime: now + config.windowSeconds * 1000,
		};
		rateLimitStore.set(identifier, newEntry);
		return {
			success: true,
			remaining: config.maxRequests - 1,
			resetIn: config.windowSeconds,
		};
	}

	// Existing entry, check limit
	if (entry.count >= config.maxRequests) {
		return {
			success: false,
			remaining: 0,
			resetIn: Math.ceil((entry.resetTime - now) / 1000),
		};
	}

	// Increment count
	entry.count++;
	return {
		success: true,
		remaining: config.maxRequests - entry.count,
		resetIn: Math.ceil((entry.resetTime - now) / 1000),
	};
}

/**
 * Get client IP from request headers (works with Vercel)
 */
export function getClientIP(request: Request): string {
	// Vercel provides the real IP in x-forwarded-for
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	// Fallback headers
	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	// Vercel-specific header
	const vercelIP = request.headers.get("x-vercel-forwarded-for");
	if (vercelIP) {
		return vercelIP.split(",")[0].trim();
	}

	return "unknown";
}
