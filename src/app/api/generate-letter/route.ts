import { type NextRequest, NextResponse } from "next/server";
import {
	buildPrompt,
	createPromptVariables,
	getCampaignPrompt,
	getCampaignTargetById,
	getCampaignWithDemands,
} from "@/lib/campaigns";
import { DEMANDS_CA, type DemandCA } from "@/lib/data/ca/forderungen-ca";
import { FORDERUNGEN, type Forderung } from "@/lib/data/forderungen";
import { DEMANDS_FR, type DemandFR } from "@/lib/data/fr/forderungen-fr";
import { DEMANDS_UK, type DemandUK } from "@/lib/data/uk/forderungen-uk";
import { DEMANDS_US, type DemandUS } from "@/lib/data/us/forderungen-us";
import { serverEnv, validateServerEnv } from "@/lib/env";
import { LETTER_SYSTEM_PROMPT } from "@/lib/prompts/letter-prompt";
import { LETTER_SYSTEM_PROMPT_CA } from "@/lib/prompts/letter-prompt-ca";
import { LETTER_SYSTEM_PROMPT_FR } from "@/lib/prompts/letter-prompt-fr";
import { LETTER_SYSTEM_PROMPT_UK } from "@/lib/prompts/letter-prompt-uk";
import { LETTER_SYSTEM_PROMPT_US } from "@/lib/prompts/letter-prompt-us";
import { LETTER_SYSTEM_PROMPT_US_ES } from "@/lib/prompts/letter-prompt-us-es";
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
import { trackLetterGeneration } from "@/lib/supabase";

// Country-specific configuration
type CountryCode = "de" | "ca" | "uk" | "fr" | "us";

// Helper to get demand title/brief text
function getDemandInfo(
	demand: Forderung | DemandCA | DemandUK | DemandFR | DemandUS,
	country: CountryCode,
	language = "en",
): { title: string; briefText: string } {
	if (country === "ca") {
		const d = demand as DemandCA;
		return { title: d.title.en, briefText: d.briefText.en };
	}
	if (country === "uk") {
		const d = demand as DemandUK;
		return { title: d.title.en, briefText: d.briefText.en };
	}
	if (country === "fr") {
		const d = demand as DemandFR;
		// Use French for letter content
		return { title: d.title.fr, briefText: d.briefText.fr };
	}
	if (country === "us") {
		const d = demand as DemandUS;
		// Use Spanish if available and requested
		if (language === "es" && d.title.es && d.briefText.es) {
			return { title: d.title.es, briefText: d.briefText.es };
		}
		return { title: d.title.en, briefText: d.briefText.en };
	}
	const d = demand as Forderung;
	return { title: d.title.de, briefText: d.briefText.de };
}

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

		// 5.5 Determine country and get country-specific data
		const country: CountryCode =
			rawBody.country === "ca"
				? "ca"
				: rawBody.country === "uk"
					? "uk"
					: rawBody.country === "fr"
						? "fr"
						: rawBody.country === "us"
							? "us"
							: "de";
		const userLanguage: string =
			typeof rawBody.language === "string" ? rawBody.language : "en";

		// 5.6 Check for campaign-based generation
		const campaignSlug =
			typeof rawBody.campaignSlug === "string" ? rawBody.campaignSlug : null;
		let campaignId: string | null = null;
		let campaignData: Awaited<
			ReturnType<typeof getCampaignWithDemands>
		> | null = null;
		let systemPrompt: string;
		let demands:
			| typeof FORDERUNGEN
			| typeof DEMANDS_CA
			| typeof DEMANDS_UK
			| typeof DEMANDS_FR
			| typeof DEMANDS_US;

		if (campaignSlug) {
			// Campaign-based generation: fetch campaign and prompt from database
			campaignData = await getCampaignWithDemands(campaignSlug);
			if (!campaignData) {
				return NextResponse.json(
					{ error: "Campaign not found" },
					{ status: 404 },
				);
			}
			if (campaignData.status !== "active") {
				return NextResponse.json(
					{ error: "Campaign is not active" },
					{ status: 400 },
				);
			}

			campaignId = campaignData.id;
			// Note: campaign.demands can be used for validation in the future

			// Fetch the campaign prompt
			const prompt = await getCampaignPrompt(
				campaignData.id,
				country,
				userLanguage,
			);
			if (prompt) {
				// Build dynamic prompt with campaign variables
				const promptVariables = createPromptVariables(
					campaignData,
					campaignData.demands,
					(rawBody.forderungen as string[]) || [],
					country,
					userLanguage,
				);
				systemPrompt = buildPrompt(prompt.systemPrompt, promptVariables);
			} else {
				// Fall back to legacy prompts if no campaign prompt defined
				systemPrompt =
					country === "ca"
						? LETTER_SYSTEM_PROMPT_CA
						: country === "uk"
							? LETTER_SYSTEM_PROMPT_UK
							: country === "fr"
								? LETTER_SYSTEM_PROMPT_FR
								: country === "us"
									? userLanguage === "es"
										? LETTER_SYSTEM_PROMPT_US_ES
										: LETTER_SYSTEM_PROMPT_US
									: LETTER_SYSTEM_PROMPT;
			}

			// Use legacy demands for validation (campaign demands handled separately)
			demands =
				country === "ca"
					? DEMANDS_CA
					: country === "uk"
						? DEMANDS_UK
						: country === "fr"
							? DEMANDS_FR
							: country === "us"
								? DEMANDS_US
								: FORDERUNGEN;
		} else {
			// Legacy generation: use static prompts and demands
			demands =
				country === "ca"
					? DEMANDS_CA
					: country === "uk"
						? DEMANDS_UK
						: country === "fr"
							? DEMANDS_FR
							: country === "us"
								? DEMANDS_US
								: FORDERUNGEN;
			systemPrompt =
				country === "ca"
					? LETTER_SYSTEM_PROMPT_CA
					: country === "uk"
						? LETTER_SYSTEM_PROMPT_UK
						: country === "fr"
							? LETTER_SYSTEM_PROMPT_FR
							: country === "us"
								? userLanguage === "es"
									? LETTER_SYSTEM_PROMPT_US_ES
									: LETTER_SYSTEM_PROMPT_US
								: LETTER_SYSTEM_PROMPT;
		}

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

		// Use country-specific demands for validation
		const validDemandIds = demands.map((f) => f.id);
		const forderungen = sanitizeForderungen(
			rawBody.forderungen,
			validDemandIds,
		);

		// 9. Validate recipient (representative or custom target)
		let mdb: {
			id: string;
			name: string;
			email: string;
			party: string;
		};

		if (campaignData?.useCustomTargets) {
			const mdbInput = rawBody.mdb as Record<string, unknown> | undefined;
			const targetId =
				typeof mdbInput?.id === "string" ? (mdbInput.id as string) : null;

			if (!targetId) {
				return NextResponse.json(
					{ error: "Ungültige Ziel-Daten" },
					{ status: 400 },
				);
			}

			const target = await getCampaignTargetById(campaignData.id, targetId);
			if (!target) {
				return NextResponse.json(
					{ error: "Ziel nicht gefunden" },
					{ status: 400 },
				);
			}

			mdb = {
				id: target.id,
				name: target.name,
				email: target.email,
				party: target.category || "Target",
			};
		} else {
			if (!validateMdB(rawBody.mdb)) {
				return NextResponse.json(
					{ error: "Ungültige MdB-Daten" },
					{ status: 400 },
				);
			}
			mdb = rawBody.mdb as {
				id: string;
				name: string;
				email: string;
				party: string;
			};
		}

		// 10. Check required fields - personalNote is now REQUIRED
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

		// 13. Build safe user prompt with detailed demands
		const selectedDemands = forderungen
			.map((id: string) => demands.find((f) => f.id === id))
			.filter((f): f is (typeof demands)[number] => f !== undefined);

		// Build prompt based on country
		let userPrompt: string;

		if (country === "uk") {
			const demandsText = selectedDemands
				.map((d, index) => {
					const info = getDemandInfo(d, country, userLanguage);
					return `${index + 1}. ${info.title}\n   Phrasing for letter: "${info.briefText}"`;
				})
				.join("\n\n");

			userPrompt = `Write a letter with the following details:

SENDER:
Name: ${senderName}
Postcode/Constituency: ${senderPlz} (${wahlkreis})

RECIPIENT:
${mdb.name} (${mdb.party})
Member of the UK Parliament

DEMANDS (COUNT: ${selectedDemands.length} - ALL MUST APPEAR IN THE LETTER!):
${demandsText}

PERSONAL STORY OF THE SENDER:
${personalNote}

CRITICAL: The letter MUST include all ${selectedDemands.length} demands as a numbered list! Not just one!

Please write the letter now.`;
		} else if (country === "ca") {
			const demandsText = selectedDemands
				.map((d, index) => {
					const info = getDemandInfo(d, country, userLanguage);
					return `${index + 1}. ${info.title}\n   Phrasing for letter: "${info.briefText}"`;
				})
				.join("\n\n");

			userPrompt = `Write a letter with the following details:

SENDER:
Name: ${senderName}
Postal Code/Riding: ${senderPlz} (${wahlkreis})

RECIPIENT:
${mdb.name} (${mdb.party})
Member of the Canadian Parliament

DEMANDS (COUNT: ${selectedDemands.length} - ALL MUST APPEAR IN THE LETTER!):
${demandsText}

PERSONAL STORY OF THE SENDER:
${personalNote}

CRITICAL: The letter MUST include all ${selectedDemands.length} demands as a numbered list! Not just one!

Please write the letter now.`;
		} else if (country === "fr") {
			const demandsText = selectedDemands
				.map((d, index) => {
					const info = getDemandInfo(d, country, userLanguage);
					return `${index + 1}. ${info.title}\n   Formulation pour la lettre : "${info.briefText}"`;
				})
				.join("\n\n");

			userPrompt = `Rédigez une lettre avec les informations suivantes :

EXPÉDITEUR :
Nom : ${senderName}
Code postal / Circonscription : ${senderPlz} (${wahlkreis})

DESTINATAIRE :
${mdb.name} (${mdb.party})
Député(e) à l'Assemblée nationale

DEMANDES (NOMBRE : ${selectedDemands.length} - TOUTES DOIVENT APPARAÎTRE DANS LA LETTRE !) :
${demandsText}

HISTOIRE PERSONNELLE DE L'EXPÉDITEUR :
${personalNote}

CRITIQUE : La lettre DOIT inclure les ${selectedDemands.length} demandes en liste numérotée ! Pas seulement une !

Veuillez rédiger la lettre maintenant.`;
		} else if (country === "us") {
			const demandsText = selectedDemands
				.map((d, index) => {
					const info = getDemandInfo(d, country, userLanguage);
					const phrasingLabel =
						userLanguage === "es"
							? "Formulación para la carta"
							: "Phrasing for letter";
					return `${index + 1}. ${info.title}\n   ${phrasingLabel}: "${info.briefText}"`;
				})
				.join("\n\n");

			if (userLanguage === "es") {
				userPrompt = `Escribe una carta con los siguientes datos:

REMITENTE:
Nombre: ${senderName}
Código Postal/Distrito: ${senderPlz} (${wahlkreis})

DESTINATARIO:
${mdb.name} (${mdb.party})
Miembro del Congreso de los Estados Unidos

DEMANDAS (CANTIDAD: ${selectedDemands.length} - ¡TODAS DEBEN APARECER EN LA CARTA!):
${demandsText}

HISTORIA PERSONAL DEL REMITENTE:
${personalNote}

CRÍTICO: ¡La carta DEBE incluir las ${selectedDemands.length} demandas como una lista numerada! ¡No solo una!

Por favor escribe la carta ahora.`;
			} else {
				userPrompt = `Write a letter with the following details:

SENDER:
Name: ${senderName}
ZIP Code/District: ${senderPlz} (${wahlkreis})

RECIPIENT:
${mdb.name} (${mdb.party})
Member of the United States Congress

DEMANDS (COUNT: ${selectedDemands.length} - ALL MUST APPEAR IN THE LETTER!):
${demandsText}

PERSONAL STORY OF THE SENDER:
${personalNote}

CRITICAL: The letter MUST include all ${selectedDemands.length} demands as a numbered list! Not just one!

Please write the letter now.`;
			}
		} else {
			const forderungenTexte = selectedDemands
				.map((f, index) => {
					const info = getDemandInfo(f, country, userLanguage);
					return `${index + 1}. ${info.title}\n   Formulierung für den Brief: "${info.briefText}"`;
				})
				.join("\n\n");

			userPrompt = `Schreibe einen Brief mit folgenden Angaben:

ABSENDER:
Name: ${senderName}
PLZ/Wahlkreis: ${senderPlz} (${wahlkreis})

EMPFÄNGER:
${mdb.name} (${mdb.party})
Mitglied des Deutschen Bundestages

FORDERUNGEN (ANZAHL: ${selectedDemands.length} - ALLE MÜSSEN IM BRIEF ERSCHEINEN!):
${forderungenTexte}

PERSÖNLICHE GESCHICHTE DES ABSENDERS:
${personalNote}

KRITISCH: Der Brief MUSS alle ${selectedDemands.length} Forderungen als nummerierte Liste enthalten! Nicht nur eine!

Bitte erstelle nun den Brief.`;
		}

		// Check if client wants streaming
		const wantsStream = request.headers
			.get("accept")
			?.includes("text/event-stream");

		// 14. Call LLM API
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${serverEnv.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: serverEnv.LLM_MODEL,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.7,
				max_completion_tokens: 2000,
				stream: wantsStream,
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

		// Handle streaming response
		if (wantsStream && response.body) {
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let fullContent = "";

			const stream = new ReadableStream({
				async start(controller) {
					const encoder = new TextEncoder();

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const chunk = decoder.decode(value, { stream: true });
							const lines = chunk
								.split("\n")
								.filter((line) => line.trim() !== "");

							for (const line of lines) {
								if (line.startsWith("data: ")) {
									const data = line.slice(6);
									if (data === "[DONE]") {
										// Send final message with subject and word count
										const wordCount = fullContent
											.split(/\s+/)
											.filter(Boolean).length;
										const emailSubject =
											country === "ca" || country === "uk"
												? "Request for Support: Human Rights in Iran"
												: country === "fr"
													? "Demande de soutien : Droits de l'Homme en Iran"
													: "Bitte um Unterstützung: Menschenrechte im Iran";
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													done: true,
													subject: emailSubject,
													wordCount,
												})}\n\n`,
											),
										);

										// Track letter generation
										try {
											await trackLetterGeneration({
												country,
												mdb_id: mdb.id,
												mdb_name: mdb.name,
												mdb_party: mdb.party || null,
												wahlkreis_id: null,
												wahlkreis_name: wahlkreis || null,
												postal_code: senderPlz || null,
												forderung_ids: forderungen,
												user_hash: fingerprint,
												campaign_id: campaignId,
											});
										} catch (err) {
											console.error("[TRACKING] Failed to track letter:", err);
										}

										controller.close();
										return;
									}

									try {
										const parsed = JSON.parse(data);
										const delta = parsed.choices?.[0]?.delta?.content;
										if (delta) {
											// Replace en-dashes with hyphens
											const cleanDelta = delta.replace(/–/g, "-");
											fullContent += cleanDelta;
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({ content: cleanDelta })}\n\n`,
												),
											);
										}
									} catch {
										// Ignore parse errors
									}
								}
							}
						}
					} catch (err) {
						console.error("Streaming error:", err);
						controller.error(err);
					}
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"X-RateLimit-Remaining": rateLimit.remaining.toString(),
				},
			});
		}

		// Handle non-streaming response
		const data = await response.json();
		const rawContent = data.choices[0]?.message?.content || "";

		// Post-processing: Replace en-dashes with normal hyphens (LLM tendency)
		const content = rawContent.replace(/–/g, "-");

		const wordCount = content.split(/\s+/).filter(Boolean).length;

		// Generate subject line
		const subject =
			country === "ca" || country === "uk" || country === "us"
				? "Request for Support: Human Rights in Iran"
				: country === "fr"
					? "Demande de soutien : Droits de l'Homme en Iran"
					: "Bitte um Unterstützung: Menschenrechte im Iran";

		// Track letter generation in Supabase (await to ensure it completes before function exits)
		try {
			await trackLetterGeneration({
				country,
				mdb_id: mdb.id,
				mdb_name: mdb.name,
				mdb_party: mdb.party || null,
				wahlkreis_id: null, // Could add if available
				wahlkreis_name: wahlkreis || null,
				postal_code: senderPlz || null,
				forderung_ids: forderungen,
				user_hash: fingerprint,
				campaign_id: campaignId,
			});
		} catch (err) {
			// Don't fail the request if tracking fails
			console.error("[TRACKING] Failed to track letter:", err);
		}

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
