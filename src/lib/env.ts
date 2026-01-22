/**
 * Environment configuration with type safety.
 * All env vars should be accessed through this module.
 */

// Server-side only env vars (never exposed to client)
export const serverEnv = {
	// LLM API configuration
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	LLM_MODEL: process.env.LLM_MODEL || "gpt-4o-mini", // Fast & cost-effective

	// Supabase configuration
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

	// Security: Rate limiting (configurable without redeploy)
	RATE_LIMIT_MAX: Number.parseInt(process.env.RATE_LIMIT_MAX || "10", 10),
	RATE_LIMIT_WINDOW_SECONDS: Number.parseInt(
		process.env.RATE_LIMIT_WINDOW_SECONDS || "60",
		10,
	),

	// Security: Emergency kill switch (set to "true" to disable API)
	API_DISABLED: process.env.API_DISABLED === "true",

	// Future: Database connection
	DATABASE_URL: process.env.DATABASE_URL,
} as const;

// Client-side env vars (prefixed with NEXT_PUBLIC_)
export const clientEnv = {
	NEXT_PUBLIC_APP_URL:
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

/**
 * Validate required server environment variables.
 * Call this at app startup to fail fast.
 */
export function validateServerEnv() {
	const required = ["OPENAI_API_KEY"] as const;
	const missing = required.filter((key) => !serverEnv[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
}
