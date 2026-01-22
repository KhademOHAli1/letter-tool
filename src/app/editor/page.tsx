"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FooterSettings } from "@/components/footer-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n/context";
import { markMdBAsEmailed } from "@/lib/letter-cache";

interface MdBData {
	id: string;
	name: string;
	email: string;
	party: string;
	imageUrl?: string;
}

interface FormData {
	senderName: string;
	senderPlz: string;
	wahlkreis: string;
	mdb: MdBData;
	forderungen: string[];
	personalNote: string;
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
}

// Wortzählung
function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

// Wort-Status bestimmen
function getWordCountStatus(
	count: number,
	language: "de" | "en",
): {
	color: string;
	bg: string;
	message: string;
} {
	if (count < 250) {
		return {
			color: "text-amber-700",
			bg: "bg-amber-50",
			message: language === "de" ? "Etwas kurz" : "A bit short",
		};
	}
	if (count <= 700) {
		return {
			color: "text-green-700",
			bg: "bg-green-50",
			message: language === "de" ? "Optimal" : "Optimal",
		};
	}
	if (count <= 900) {
		return {
			color: "text-amber-700",
			bg: "bg-amber-50",
			message: language === "de" ? "Etwas lang" : "A bit long",
		};
	}
	return {
		color: "text-red-700",
		bg: "bg-red-50",
		message: language === "de" ? "Zu lang" : "Too long",
	};
}

// Partei-Farben für Badge
const PARTY_COLORS: Record<string, string> = {
	"CDU/CSU": "bg-black text-white",
	SPD: "bg-red-600 text-white",
	GRÜNE: "bg-green-600 text-white",
	"DIE LINKE": "bg-purple-600 text-white",
	BSW: "bg-orange-600 text-white",
	Fraktionslos: "bg-gray-500 text-white",
};

export default function EditorPage() {
	const router = useRouter();
	const { t, language } = useLanguage();
	const [mdb, setMdb] = useState<MdBData | null>(null);
	const [senderName, setSenderName] = useState("");
	const [content, setContent] = useState("");
	const [subject, setSubject] = useState(
		"Bitte um Unterstützung: Menschenrechte im Iran",
	);
	const [isModified, setIsModified] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isAdapted, setIsAdapted] = useState(false);
	const [originalMdbName, setOriginalMdbName] = useState<string | null>(null);

	// Streaming state
	const [isGenerating, setIsGenerating] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const hasStartedGeneration = useRef(false);

	// Generate letter with streaming
	const generateLetter = useCallback(
		async (formData: FormData) => {
			setIsGenerating(true);
			setError(null);
			setMdb(formData.mdb);
			setSenderName(formData.senderName);

			try {
				const response = await fetch("/api/generate-letter", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						senderName: formData.senderName,
						senderPlz: formData.senderPlz,
						wahlkreis: formData.wahlkreis,
						mdb: formData.mdb,
						forderungen: formData.forderungen,
						personalNote: formData.personalNote,
						_timing: formData._timing,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Fehler beim Generieren");
				}

				// Check if streaming is supported
				if (
					response.headers.get("content-type")?.includes("text/event-stream")
				) {
					// Handle streaming response
					const reader = response.body?.getReader();
					const decoder = new TextDecoder();
					let accumulatedContent = "";

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
									} catch {
										// Ignore parse errors
									}
								}
							}
						}
					}

					// Save to sessionStorage
					sessionStorage.setItem(
						"letterData",
						JSON.stringify({
							content: accumulatedContent,
							subject: "Bitte um Unterstützung: Menschenrechte im Iran",
							wordCount: countWords(accumulatedContent),
							mdb: formData.mdb,
							senderName: formData.senderName,
						}),
					);
				} else {
					// Handle regular JSON response
					const result = await response.json();
					setContent(result.content);
					setSubject(
						result.subject || "Bitte um Unterstützung: Menschenrechte im Iran",
					);

					// Save to sessionStorage
					sessionStorage.setItem(
						"letterData",
						JSON.stringify({
							content: result.content,
							subject:
								result.subject ||
								"Bitte um Unterstützung: Menschenrechte im Iran",
							wordCount: countWords(result.content),
							mdb: formData.mdb,
							senderName: formData.senderName,
						}),
					);
				}

				// Clean up form data
				sessionStorage.removeItem("formData");
				setIsComplete(true);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: language === "de"
							? "Ein Fehler ist aufgetreten"
							: "An error occurred",
				);
			} finally {
				setIsGenerating(false);
			}
		},
		[language],
	);

	useEffect(() => {
		// Prevent double generation in StrictMode
		if (hasStartedGeneration.current) return;

		// Check for form data (new generation) first
		const storedFormData = sessionStorage.getItem("formData");
		if (storedFormData) {
			hasStartedGeneration.current = true;
			const formData = JSON.parse(storedFormData) as FormData;
			generateLetter(formData);
			return;
		}

		// Check for existing letter data (returning user)
		const storedLetterData = sessionStorage.getItem("letterData");
		if (storedLetterData) {
			const letterData = JSON.parse(storedLetterData) as LetterData;
			setMdb(letterData.mdb);
			setSenderName(letterData.senderName);
			setContent(letterData.content);
			setSubject(letterData.subject);
			setIsComplete(true);
			// Check if this is an adapted letter
			if (letterData.isAdapted) {
				setIsAdapted(true);
				setOriginalMdbName(letterData.originalMdbName || null);
			}
			return;
		}

		// No data found, redirect to home
		router.push("/");
	}, [router, generateLetter]);

	// Update sessionStorage when content/subject changes
	useEffect(() => {
		if (isComplete && mdb && senderName && content) {
			sessionStorage.setItem(
				"letterData",
				JSON.stringify({
					content,
					subject,
					wordCount: countWords(content),
					mdb,
					senderName,
				}),
			);
		}
	}, [content, subject, isComplete, mdb, senderName]);

	const handleContentChange = useCallback((value: string) => {
		setContent(value);
		setIsModified(true);
	}, []);

	const handleSubjectChange = useCallback((value: string) => {
		setSubject(value);
		setIsModified(true);
	}, []);

	const handleSendEmail = () => {
		if (!mdb) return;

		const mailtoUrl = `mailto:${mdb.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;

		// Mark this MdB as emailed for the multi-MP feature
		markMdBAsEmailed({ id: mdb.id, name: mdb.name, party: mdb.party });

		// Open mailto in a new tab so user can return to this page
		window.open(mailtoUrl, "_blank");
		// Navigate to success page
		router.push("/success");
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleBack = () => {
		router.push("/");
	};

	const handleRetry = () => {
		const storedFormData = sessionStorage.getItem("formData");
		if (storedFormData) {
			hasStartedGeneration.current = false;
			setError(null);
			setContent("");
			const formData = JSON.parse(storedFormData) as FormData;
			generateLetter(formData);
		} else {
			router.push("/");
		}
	};

	const wordCount = countWords(content);
	const wordStatus = getWordCountStatus(wordCount, language);

	// Error state
	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4 p-8 max-w-md text-center">
					<div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
						<svg
							className="h-6 w-6 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold">{t("editor", "errorTitle")}</h2>
					<p className="text-muted-foreground">{error}</p>
					<div className="flex gap-3">
						<Button variant="outline" onClick={handleBack}>
							{t("common", "back")}
						</Button>
						<Button onClick={handleRetry}>{t("common", "retry")}</Button>
					</div>
				</div>
			</div>
		);
	}

	// Loading state with MdB info
	if (!mdb) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-3">
					<svg
						className="h-8 w-8 animate-spin text-primary"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<p className="text-muted-foreground">{t("common", "loading")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border/50 bg-linear-to-b from-accent/10 to-background safe-area-top">
				<div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
					<button
						type="button"
						onClick={handleBack}
						className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						{t("common", "back")}
					</button>
					<h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
						{isGenerating
							? t("editor", "titleGenerating")
							: t("editor", "titleReady")}
					</h1>
					<p className="mt-1 text-sm md:text-base text-muted-foreground">
						{isGenerating
							? t("editor", "subtitleGenerating")
							: t("editor", "subtitleReady")}
					</p>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-6 md:py-8">
				{/* Empfänger Info Card */}
				<div className="mb-6 md:mb-8 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm">
					<div className="flex items-start gap-3 md:gap-4">
						{mdb.imageUrl && (
							<div className="h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-full bg-muted shrink-0 ring-2 ring-border">
								<Image
									src={mdb.imageUrl}
									alt={mdb.name}
									width={64}
									height={64}
									className="object-cover object-top w-full h-full"
									unoptimized
								/>
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="flex flex-wrap items-center gap-2 mb-1">
								<h2 className="font-semibold text-base md:text-lg wrap-break-word">
									{mdb.name}
								</h2>
								<span
									className={`inline-block px-2 py-0.5 rounded text-xs ${
										PARTY_COLORS[mdb.party] || "bg-gray-200"
									}`}
								>
									{mdb.party}
								</span>
							</div>
							<p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5">
								<svg
									className="h-4 w-4 shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<span className="truncate">{mdb.email}</span>
							</p>
							<p className="text-xs md:text-sm text-muted-foreground mt-1">
								{t("editor", "senderLabel")}:{" "}
								<span className="font-medium wrap-break-word">
									{senderName}
								</span>
							</p>
						</div>
					</div>
				</div>

				{/* Adapted letter notice */}
				{isAdapted && (
					<div className="mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary flex items-center gap-2">
						<svg
							className="h-4 w-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						<span>
							{language === "de"
								? `Brief angepasst${originalMdbName ? ` (basierend auf Brief an ${originalMdbName})` : ""}`
								: `Letter adapted${originalMdbName ? ` (based on letter to ${originalMdbName})` : ""}`}
						</span>
					</div>
				)}

				{/* Betreff Editor */}
				<div className="mb-6 space-y-2">
					<Label htmlFor="subject" className="text-sm font-medium">
						{t("editor", "subjectLabel")}
					</Label>
					<Input
						id="subject"
						value={subject}
						onChange={(e) => handleSubjectChange(e.target.value)}
						className="font-medium text-base"
						disabled={isGenerating}
					/>
				</div>

				{/* Brief Editor */}
				<div className="mb-6 space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="content" className="text-sm font-medium">
							{t("editor", "contentLabel")}
						</Label>
						<div className="flex items-center gap-2">
							{isGenerating ? (
								<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-primary bg-primary/10">
									<svg
										className="h-3 w-3 animate-spin"
										viewBox="0 0 24 24"
										fill="none"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									{t("editor", "writing")}
								</span>
							) : (
								<>
									<span
										className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${wordStatus.color} ${wordStatus.bg}`}
									>
										{wordStatus.message}
									</span>
									<span className="text-xs text-muted-foreground font-mono">
										{wordCount} {t("common", "words")}
									</span>
								</>
							)}
						</div>
					</div>
					<div className="relative">
						{isGenerating && !content ? (
							// Skeleton loader
							<div className="min-h-112.5 p-4 rounded-xl border border-input bg-background space-y-3">
								<div className="h-4 bg-muted rounded animate-pulse w-2/3" />
								<div className="h-4 bg-muted rounded animate-pulse w-full" />
								<div className="h-4 bg-muted rounded animate-pulse w-5/6" />
								<div className="h-4 bg-muted rounded animate-pulse w-full" />
								<div className="h-4 bg-muted rounded animate-pulse w-3/4" />
								<div className="h-4 bg-muted rounded animate-pulse w-full" />
								<div className="h-4 bg-muted rounded animate-pulse w-4/5" />
								<div className="h-4 bg-muted rounded animate-pulse w-full" />
								<div className="h-4 bg-muted rounded animate-pulse w-2/3" />
								<div className="h-4 bg-muted rounded animate-pulse w-full" />
								<div className="h-4 bg-muted rounded animate-pulse w-5/6" />
							</div>
						) : (
							<Textarea
								id="content"
								value={content}
								onChange={(e) => handleContentChange(e.target.value)}
								className="min-h-112.5 text-base leading-relaxed resize-y p-4 rounded-xl"
								placeholder="Dein Brief..."
								disabled={isGenerating}
							/>
						)}
					</div>
				</div>

				{/* Modifikations-Hinweis */}
				{isModified && !isGenerating && (
					<div className="mb-6 flex items-center gap-2 text-sm">
						<span className="flex h-2 w-2 rounded-full bg-amber-500" />
						<span className="text-muted-foreground">
							{t("editor", "modified")}
						</span>
					</div>
				)}

				{/* Aktionen */}
				<div className="space-y-4">
					<Button
						onClick={handleSendEmail}
						size="lg"
						className="w-full h-14 text-base font-medium shadow-md gap-2"
						disabled={isGenerating || !content}
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						{t("editor", "sendButton")}
					</Button>

					<Button
						onClick={handleCopy}
						variant="outline"
						className="w-full gap-2"
						disabled={isGenerating || !content}
					>
						{copied ? (
							<>
								<svg
									className="h-4 w-4 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								{t("common", "copied")}
							</>
						) : (
							<>
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
								{t("editor", "copyButton")}
							</>
						)}
					</Button>
				</div>

				{/* Hinweis */}
				<div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
					<p className="text-sm text-muted-foreground text-center">
						{t("editor", "hint")}
					</p>
				</div>
			</main>

			{/* Footer */}
			<footer className="container max-w-3xl mx-auto px-4 py-8 text-center">
				<FooterSettings />
			</footer>
		</div>
	);
}
