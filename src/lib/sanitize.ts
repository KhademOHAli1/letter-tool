/**
 * Input sanitization utilities to prevent prompt injection and XSS
 */

/** Maximum allowed lengths for user inputs */
export const INPUT_LIMITS = {
	name: 100,
	plz: 5,
	wahlkreis: 100,
	personalNote: 2000,
	forderungen: 10,
} as const;

/**
 * Sanitize user name input
 * - Removes HTML tags
 * - Limits length
 * - Removes control characters
 */
/**
 * Regex for control characters
 * Using RegExp constructor to avoid biome's noControlCharactersInRegex rule
 * while still detecting and removing potentially dangerous control characters
 */
// biome-ignore lint/complexity/useRegexLiterals: Control chars cause noControlCharactersInRegex error as literal
const CONTROL_CHARS_REGEX = new RegExp("[\\x00-\\x1F\\x7F]", "g");

export function sanitizeName(input: unknown): string {
	if (typeof input !== "string") return "";

	return input
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(CONTROL_CHARS_REGEX, "") // Remove control characters
		.trim()
		.slice(0, INPUT_LIMITS.name);
}

/**
 * Sanitize PLZ (German postal code)
 * - Only allows 5 digits
 */
export function sanitizePLZ(input: unknown): string {
	if (typeof input !== "string") return "";

	return input.replace(/\D/g, "").slice(0, INPUT_LIMITS.plz);
}

/**
 * Sanitize personal note / story
 * - Removes potentially dangerous content
 * - Limits length
 * - Preserves legitimate text
 */
export function sanitizePersonalNote(input: unknown): string {
	if (typeof input !== "string") return "";

	return (
		input
			.replace(/<[^>]*>/g, "") // Remove HTML tags
			.replace(CONTROL_CHARS_REGEX, "") // Remove control characters
			// Remove potential prompt injection patterns
			.replace(
				/\b(ignore|forget|disregard)\s+(previous|above|all)\s+(instructions?|prompts?|rules?)/gi,
				"",
			)
			.replace(/\b(system|assistant|user)\s*:/gi, "")
			.replace(/```/g, "") // Remove code blocks
			.trim()
			.slice(0, INPUT_LIMITS.personalNote)
	);
}

/**
 * Validate and sanitize forderungen (demands) array
 * - Only allows known IDs
 * - Limits count
 */
export function sanitizeForderungen(
	input: unknown,
	validIds: string[],
): string[] {
	if (!Array.isArray(input)) return [];

	return input
		.filter((id): id is string => typeof id === "string")
		.filter((id) => validIds.includes(id))
		.slice(0, INPUT_LIMITS.forderungen);
}

/**
 * Validate MdB/MP object structure
 * Supports both German Bundestag and Canadian Parliament emails
 */
export function validateMdB(input: unknown): input is {
	id: string;
	name: string;
	email: string;
	party: string;
} {
	if (typeof input !== "object" || input === null) return false;

	const mdb = input as Record<string, unknown>;

	return (
		typeof mdb.id === "string" &&
		typeof mdb.name === "string" &&
		typeof mdb.email === "string" &&
		typeof mdb.party === "string" &&
		// Basic email validation
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mdb.email) &&
		// Must be bundestag.de (Germany) or parl.gc.ca (Canada)
		(mdb.email.endsWith("@bundestag.de") || mdb.email.endsWith("@parl.gc.ca"))
	);
}

/**
 * Check for suspicious content that might indicate abuse
 */
export function detectSuspiciousContent(text: string): boolean {
	const suspiciousPatterns = [
		// Prompt injection attempts
		/ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
		/disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
		/forget\s+(everything|all)/i,
		/you\s+are\s+now\s+(a|an)/i,
		/act\s+as\s+(a|an)/i,
		/pretend\s+(to\s+be|you\s+are)/i,
		/jailbreak/i,
		/DAN\s+mode/i,
		// Excessive special characters (potential injection)
		/[{}[\]<>]{5,}/,
	];

	return suspiciousPatterns.some((pattern) => pattern.test(text));
}
