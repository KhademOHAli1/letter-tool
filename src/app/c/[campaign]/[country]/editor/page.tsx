"use client";

/**
 * Campaign editor page
 * Re-uses the main editor logic but is campaign-aware
 * Phase 3, Epic 3.1
 */

import { ArrowRight, Download, Mail } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FooterSettings } from "@/components/footer-settings";
import { downloadLetterPdf } from "@/components/letter-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCampaign } from "@/lib/campaigns/context";
import { useLanguage } from "@/lib/i18n/context";
import { markMdBAsEmailed } from "@/lib/letter-cache";

interface MdBData {
	id: string;
	name: string;
	email: string;
	party: string;
	wahlkreisId?: string;
	imageUrl?: string;
	office?: string;
	state?: string;
}

interface FormData {
	senderName: string;
	senderPlz: string;
	wahlkreis: string;
	mdb: MdBData;
	forderungen: string[];
	personalNote: string;
	language?: string;
	country?: string;
	campaignSlug?: string;
	_timing: number;
}

interface LetterData {
	content: string;
	subject: string;
	wordCount: number;
	mdb: MdBData;
	senderName: string;
	isAdapted?: boolean;
	originalMdbName?: string;
	senderPlz?: string;
	wahlkreis?: string;
	forderungen?: string[];
	personalNote?: string;
}

function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

function getWordCountStatus(
	count: number,
	language: "de" | "en" | "fr" | "es",
): {
	color: string;
	bg: string;
	message: string;
} {
	const messages: Record<
		string,
		{ short: string; optimal: string; long: string; tooLong: string }
	> = {
		de: {
			short: "Etwas kurz",
			optimal: "Optimal",
			long: "Etwas lang",
			tooLong: "Zu lang",
		},
		en: {
			short: "A bit short",
			optimal: "Optimal",
			long: "A bit long",
			tooLong: "Too long",
		},
		fr: {
			short: "Un peu court",
			optimal: "Optimal",
			long: "Un peu long",
			tooLong: "Trop long",
		},
		es: {
			short: "Un poco corto",
			optimal: "Óptimo",
			long: "Un poco largo",
			tooLong: "Demasiado largo",
		},
	};
	const t = messages[language] || messages.en;

	if (count < 250) {
		return { color: "text-amber-700", bg: "bg-amber-50", message: t.short };
	}
	if (count <= 700) {
		return { color: "text-green-700", bg: "bg-green-50", message: t.optimal };
	}
	if (count <= 900) {
		return { color: "text-amber-700", bg: "bg-amber-50", message: t.long };
	}
	return { color: "text-red-700", bg: "bg-red-50", message: t.tooLong };
}

function getDefaultSubject(country: string): string {
	if (country === "ca" || country === "uk" || country === "us") {
		return "Urgent: Call for Action on Iran";
	}
	if (country === "fr") {
		return "Urgent : Appel à l'action sur l'Iran";
	}
	return "Dringende Bitte um Unterstützung: Menschenrechtslage im Iran";
}

export default function CampaignEditorPage() {
	const router = useRouter();
	const params = useParams<{ campaign: string; country: string }>();
	const { language } = useLanguage();
	const { campaign, getLocalizedText } = useCampaign();

	const country = params.country;
	const campaignSlug = params.campaign;
	const campaignName = getLocalizedText(campaign.name);

	const [content, setContent] = useState("");
	const [subject, setSubject] = useState(getDefaultSubject(country));
	const [mdb, setMdb] = useState<MdBData | null>(null);
	const [senderName, setSenderName] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hasGenerated = useRef(false);

	const generateLetter = useCallback(
		async (formData: FormData) => {
			setIsGenerating(true);
			setError(null);
			setMdb(formData.mdb);
			setSenderName(formData.senderName);

			try {
				const response = await fetch("/api/generate-letter", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "text/event-stream",
					},
					body: JSON.stringify({
						senderName: formData.senderName,
						senderPlz: formData.senderPlz,
						wahlkreis: formData.wahlkreis,
						mdb: formData.mdb,
						forderungen: formData.forderungen,
						personalNote: formData.personalNote,
						language: formData.language || language,
						country: formData.country || country,
						campaignSlug: campaignSlug, // Pass campaign slug
						_timing: formData._timing,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Fehler beim Generieren");
				}

				// Check if streaming
				if (
					response.headers.get("content-type")?.includes("text/event-stream")
				) {
					const reader = response.body?.getReader();
					const decoder = new TextDecoder();
					let accumulatedContent = "";
					let finalSubject = getDefaultSubject(country);

					if (reader) {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const chunk = decoder.decode(value, { stream: true });
							const lines = chunk.split("\n");

							for (const line of lines) {
								if (line.startsWith("data: ")) {
									const data = line.slice(6);
									if (data === "[DONE]") continue;
									try {
										const parsed = JSON.parse(data);
										if (parsed.content) {
											accumulatedContent += parsed.content;
											setContent(accumulatedContent);
										}
										if (parsed.done && parsed.subject) {
											finalSubject = parsed.subject;
											setSubject(finalSubject);
										}
									} catch {
										// Ignore parse errors
									}
								}
							}
						}
					}

					sessionStorage.setItem(
						"letterData",
						JSON.stringify({
							content: accumulatedContent,
							subject: finalSubject,
							wordCount: countWords(accumulatedContent),
							mdb: formData.mdb,
							senderName: formData.senderName,
							senderPlz: formData.senderPlz,
							wahlkreis: formData.wahlkreis,
							forderungen: formData.forderungen,
							personalNote: formData.personalNote,
						}),
					);
				} else {
					const result = await response.json();
					setContent(result.content);
					setSubject(result.subject || getDefaultSubject(country));

					sessionStorage.setItem(
						"letterData",
						JSON.stringify({
							content: result.content,
							subject: result.subject || getDefaultSubject(country),
							wordCount: countWords(result.content),
							mdb: formData.mdb,
							senderName: formData.senderName,
							senderPlz: formData.senderPlz,
							wahlkreis: formData.wahlkreis,
							forderungen: formData.forderungen,
							personalNote: formData.personalNote,
						}),
					);
				}
			} catch (err) {
				console.error("Generation error:", err);
				setError(
					err instanceof Error
						? err.message
						: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
				);
			} finally {
				setIsGenerating(false);
			}
		},
		[country, campaignSlug, language],
	);

	useEffect(() => {
		if (hasGenerated.current) return;

		const stored = sessionStorage.getItem("formData");
		if (stored) {
			try {
				const formData = JSON.parse(stored) as FormData;
				hasGenerated.current = true;
				generateLetter(formData);
			} catch {
				router.push(`/c/${campaignSlug}/${country}`);
			}
		} else {
			router.push(`/c/${campaignSlug}/${country}`);
		}
	}, [generateLetter, router, campaignSlug, country]);

	const handleContinue = () => {
		sessionStorage.setItem(
			"letterData",
			JSON.stringify({
				content,
				subject,
				wordCount: countWords(content),
				mdb,
				senderName,
			} as LetterData),
		);
		router.push(`/c/${campaignSlug}/${country}/preview`);
	};

	const handleDownloadPDF = async () => {
		if (!mdb) return;
		await downloadLetterPdf({
			content,
			subject,
			senderName,
			recipientName: mdb.name,
			recipientEmail: mdb.email,
			recipientParty: mdb.party,
			recipientOffice: mdb.office,
			recipientState: mdb.state,
			country,
			language,
		});
	};

	const handleOpenMail = () => {
		if (!mdb) return;
		const mailtoLink = `mailto:${mdb.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
		markMdBAsEmailed(mdb);
		window.location.href = mailtoLink;
	};

	const wordCount = countWords(content);
	const wordStatus = getWordCountStatus(wordCount, language);

	if (error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center px-4">
				<div className="text-center space-y-4 max-w-md">
					<p className="text-lg text-destructive">{error}</p>
					<Button onClick={() => router.push(`/c/${campaignSlug}/${country}`)}>
						{language === "de" ? "Zurück" : "Go back"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="container mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold">{campaignName}</h1>
						{mdb && (
							<p className="text-sm text-muted-foreground">
								{language === "de" ? "Brief an" : "Letter to"} {mdb.name}
							</p>
						)}
					</div>
					{mdb?.imageUrl && (
						<Image
							src={mdb.imageUrl}
							alt={mdb.name}
							width={40}
							height={40}
							className="rounded-full"
						/>
					)}
				</div>
			</header>

			{/* Main content */}
			<main className="container mx-auto max-w-3xl px-4 py-6">
				{isGenerating && !content && (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
						<p className="mt-4 text-muted-foreground">
							{language === "de"
								? "Dein Brief wird erstellt..."
								: "Creating your letter..."}
						</p>
					</div>
				)}

				{content && (
					<div className="space-y-6">
						{/* Subject line */}
						<div className="space-y-2">
							<Label htmlFor="subject">
								{language === "de" ? "Betreff" : "Subject"}
							</Label>
							<Input
								id="subject"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
							/>
						</div>

						{/* Letter content */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="content">
									{language === "de" ? "Brief" : "Letter"}
								</Label>
								<span
									className={`text-xs px-2 py-1 rounded ${wordStatus.bg} ${wordStatus.color}`}
								>
									{wordCount} {language === "de" ? "Wörter" : "words"} ·{" "}
									{wordStatus.message}
								</span>
							</div>
							<Textarea
								ref={textareaRef}
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="min-h-100 font-mono text-sm"
							/>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row gap-3">
							<Button onClick={handleContinue} className="flex-1">
								{language === "de" ? "Weiter" : "Continue"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							<Button variant="outline" onClick={handleOpenMail}>
								<Mail className="mr-2 h-4 w-4" />
								{language === "de" ? "In E-Mail öffnen" : "Open in email"}
							</Button>
							<Button variant="outline" onClick={handleDownloadPDF}>
								<Download className="mr-2 h-4 w-4" />
								PDF
							</Button>
						</div>
					</div>
				)}
			</main>

			<footer className="border-t mt-auto">
				<div className="container mx-auto max-w-3xl px-4 py-4">
					<FooterSettings />
				</div>
			</footer>
		</div>
	);
}
