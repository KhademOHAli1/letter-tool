import { type NextRequest, NextResponse } from "next/server";
import { FORDERUNGEN } from "@/lib/data/forderungen";
import { serverEnv, validateServerEnv } from "@/lib/env";
import { LETTER_SYSTEM_PROMPT } from "@/lib/prompts/letter-prompt";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import {
	detectSuspiciousContent,
	sanitizeForderungen,
	sanitizeName,
	sanitizePersonalNote,
	sanitizePLZ,
	validateMdB,
} from "@/lib/sanitize";
import {
	checkContentSimilarity,
	detectAbusePatterns,
	detectBot,
	generateFingerprint,
	validateOrigin,
} from "@/lib/security";

// Request size limit (50KB should be more than enough)
const MAX_BODY_SIZE = 50 * 1024;

export async function POST(request: NextRequest) {
	const clientIP = getClientIP(request);

	// Emergency kill switch - can be enabled via Vercel env vars without redeploy
	if (serverEnv.API_DISABLED) {
		console.warn(
			`[SECURITY] API disabled, rejecting request from IP: ${clientIP}`,
		);
		return NextResponse.json(
			{ error: "Der Service ist vorübergehend nicht verfügbar." },
			{ status: 503 },
		);
	}

	// Rate limit config from environment (allows quick adjustment during attacks)
	const RATE_LIMIT_CONFIG = {
		maxRequests: serverEnv.RATE_LIMIT_MAX,
		windowSeconds: serverEnv.RATE_LIMIT_WINDOW_SECONDS,
	};

	try {
		// 0. Check content-length before parsing
		const contentLength = request.headers.get("content-length");
		if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
			console.warn(`[SECURITY] Oversized request from IP: ${clientIP}`);
			return NextResponse.json({ error: "Anfrage zu groß" }, { status: 413 });
		}

		// 1. Origin validation (CSRF protection)
		const originCheck = validateOrigin(request);
		if (!originCheck.valid) {
			console.warn(
				`[SECURITY] Invalid origin from IP: ${clientIP}, origin: ${originCheck.origin}`,
			);
			return NextResponse.json(
				{ error: "Ungültige Anfragequelle" },
				{ status: 403 },
			);
		}

		// 2. Bot detection
		const botCheck = detectBot(request);
		if (botCheck.isBot) {
			console.warn(
				`[SECURITY] Bot detected from IP: ${clientIP}, reason: ${botCheck.reason}`,
			);
			return NextResponse.json(
				{ error: "Automatisierte Anfragen nicht erlaubt" },
				{ status: 403 },
			);
		}

		// 3. Rate limiting
		const rateLimit = checkRateLimit(clientIP, RATE_LIMIT_CONFIG);

		if (!rateLimit.success) {
			console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
			return NextResponse.json(
				{
					error: `Zu viele Anfragen. Bitte warte ${rateLimit.resetIn} Sekunden.`,
				},
				{
					status: 429,
					headers: {
						"Retry-After": rateLimit.resetIn.toString(),
						"X-RateLimit-Remaining": "0",
						"X-RateLimit-Reset": rateLimit.resetIn.toString(),
					},
				},
			);
		}

		// 4. Validate environment
		validateServerEnv();

		// 5. Parse and validate request body
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "Ungültiges Anfrageformat" },
				{ status: 400 },
			);
		}

		if (typeof body !== "object" || body === null) {
			return NextResponse.json(
				{ error: "Ungültige Anfragedaten" },
				{ status: 400 },
			);
		}

		const rawBody = body as Record<string, unknown>;

		// 6. Timing-based bot detection (form must be open for at least 2 seconds)
		const timing = rawBody._timing;
		if (typeof timing === "number" && timing < 2000) {
			console.warn(
				`[SECURITY] Suspiciously fast submission from IP: ${clientIP}, timing: ${timing}ms`,
			);
			return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
		}

		// 7. Detect abuse patterns (before sanitization to see raw input)
		const abuseCheck = detectAbusePatterns(rawBody);
		if (abuseCheck.suspicious) {
			console.warn(
				`[SECURITY] Abuse pattern detected from IP: ${clientIP}, reason: ${abuseCheck.reason}`,
			);
			return NextResponse.json(
				{ error: "Ungültige Eingabe erkannt" },
				{ status: 400 },
			);
		}

		// 8. Sanitize all inputs
		const senderName = sanitizeName(rawBody.senderName);
		const senderPlz = sanitizePLZ(rawBody.senderPlz);
		const wahlkreis = sanitizeName(rawBody.wahlkreis);
		const personalNote = sanitizePersonalNote(rawBody.personalNote);
		const validForderungIds = FORDERUNGEN.map((f) => f.id);
		const forderungen = sanitizeForderungen(
			rawBody.forderungen,
			validForderungIds,
		);

		// 9. Validate MdB
		if (!validateMdB(rawBody.mdb)) {
			return NextResponse.json(
				{ error: "Ungültige MdB-Daten" },
				{ status: 400 },
			);
		}
		const mdb = rawBody.mdb;

		// 10. Check required fields
		if (!senderName || forderungen.length === 0) {
			return NextResponse.json(
				{ error: "Bitte fülle alle Pflichtfelder aus" },
				{ status: 400 },
			);
		}

		// 11. Check for suspicious content (prompt injection attempts)
		if (
			detectSuspiciousContent(personalNote) ||
			detectSuspiciousContent(senderName)
		) {
			console.warn(
				`[SECURITY] Suspicious content detected from IP: ${clientIP}`,
			);
			return NextResponse.json(
				{ error: "Ungültige Eingabe erkannt" },
				{ status: 400 },
			);
		}

		// 12. Content similarity check (prevent duplicate abuse)
		const fingerprint = generateFingerprint(request);
		const contentKey = `${senderName}:${forderungen.sort().join(",")}`;
		const similarityCheck = checkContentSimilarity(fingerprint, contentKey);
		if (!similarityCheck.allowed) {
			console.warn(
				`[SECURITY] Duplicate content detected from IP: ${clientIP}, reason: ${similarityCheck.reason}`,
			);
			return NextResponse.json(
				{ error: "Zu viele ähnliche Anfragen. Bitte warte eine Stunde." },
				{ status: 429 },
			);
		}

		// 13. Build safe user prompt with detailed Forderungen
		const selectedForderungen = forderungen
			.map((id: string) => FORDERUNGEN.find((f) => f.id === id))
			.filter(
				(
					f,
				): f is {
					id: string;
					title: string;
					description: string;
					briefText: string;
					zustaendigkeit: string;
				} => f !== undefined,
			);

		const forderungenTexte = selectedForderungen
			.map(
				(f) => `- ${f.title}\n  Formulierung für den Brief: "${f.briefText}"`,
			)
			.join("\n\n");

		const userPrompt = `Schreibe einen Brief mit folgenden Angaben:

ABSENDER:
Name: ${senderName}
PLZ/Wahlkreis: ${senderPlz} (${wahlkreis})

EMPFÄNGER:
${mdb.name} (${mdb.party})
Mitglied des Deutschen Bundestages

FORDERUNGEN DIE ICH UNTERSTÜTZE (nutze die Formulierungen als Basis, aber passe sie an den Briefstil an):
${forderungenTexte}

${personalNote ? `PERSÖNLICHE ERGÄNZUNG (dies ist die emotionale Geschichte des Absenders - nutze sie für den SELF-Teil):\n${personalNote}` : "HINWEIS: Keine persönliche Ergänzung angegeben. Erfinde eine passende, authentisch wirkende persönliche Verbindung zum Thema Iran."}

Bitte erstelle nun den Brief.`;

		// 9. Call LLM API
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${serverEnv.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: serverEnv.LLM_MODEL,
				messages: [
					{ role: "system", content: LETTER_SYSTEM_PROMPT },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.7,
				max_completion_tokens: 1000,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("LLM API error:", error);
			return NextResponse.json(
				{ error: "Fehler bei der Generierung" },
				{ status: 500 },
			);
		}

		const data = await response.json();
		const rawContent = data.choices[0]?.message?.content || "";

		// Post-processing: Replace en-dashes with normal hyphens (LLM tendency)
		const content = rawContent.replace(/–/g, "-");

		const wordCount = content.split(/\s+/).filter(Boolean).length;

		// Generate subject line
		const subject = "Bitte um Unterstützung: Menschenrechte im Iran";

		return NextResponse.json(
			{
				content,
				subject,
				wordCount,
			},
			{
				headers: {
					"X-RateLimit-Remaining": rateLimit.remaining.toString(),
				},
			},
		);
	} catch (error) {
		console.error("Letter generation error:", error);
		return NextResponse.json(
			{ error: "Ein Fehler ist aufgetreten" },
			{ status: 500 },
		);
	}
}
