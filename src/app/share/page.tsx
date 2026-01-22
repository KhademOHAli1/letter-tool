"use client";

import {
	ArrowLeft,
	ArrowRight,
	Check,
	Copy,
	Loader2,
	Mail,
	MessageCircle,
	RefreshCw,
	Share2,
	WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CampaignGoal } from "@/components/campaign-goal";
import { Button } from "@/components/ui/button";

// Progress steps for letter generation
const PROGRESS_STEPS = [
	"Verbindung wird hergestellt...",
	"Brief wird geschrieben...",
	"Fast fertig...",
];

interface FormData {
	senderName: string;
	senderPlz: string;
	wahlkreis: string;
	mdb: {
		id: string;
		name: string;
		party: string;
		email: string;
		imageUrl?: string;
	};
	forderungen: string[];
	personalNote: string;
	_timing: number;
}

export default function SharePage() {
	const router = useRouter();
	const [copiedMessage, setCopiedMessage] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);
	const [formData, setFormData] = useState<FormData | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [letterReady, setLetterReady] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [progressStep, setProgressStep] = useState(0);
	const [isOffline, setIsOffline] = useState(false);

	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareMessage = `Ich habe gerade einen Brief an meine*n Bundestagsabgeordnete*n geschrieben - für Menschenrechte im Iran.

Warum das wichtig ist: Abgeordnete zählen Briefe aus ihrem Wahlkreis. Persönliche Nachrichten haben echten Einfluss auf politische Entscheidungen. Je mehr Menschen schreiben, desto lauter wird unsere Stimme.

Du kannst in 5 Minuten auch einen Brief schreiben - das Tool hilft dir dabei:

${shareUrl}`;

	// Generate letter in background
	const generateLetter = useCallback(async (data: FormData) => {
		// Check if offline
		if (!navigator.onLine) {
			setIsOffline(true);
			return;
		}
		setIsOffline(false);
		setIsGenerating(true);
		setError(null);
		setProgressStep(0);

		// Simulate progress steps
		const progressInterval = setInterval(() => {
			setProgressStep((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
		}, 2500);

		try {
			const response = await fetch("/api/generate-letter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					senderName: data.senderName,
					senderPlz: data.senderPlz,
					wahlkreis: data.wahlkreis,
					mdb: data.mdb,
					forderungen: data.forderungen,
					personalNote: data.personalNote,
					_timing: data._timing,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fehler beim Generieren");
			}

			const result = await response.json();

			// Save letter data for editor
			sessionStorage.setItem(
				"letterData",
				JSON.stringify({
					...result,
					mdb: data.mdb,
					senderName: data.senderName,
				}),
			);

			// Remove form data as we no longer need it
			sessionStorage.removeItem("formData");

			setLetterReady(true);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Ein Fehler ist aufgetreten",
			);
		} finally {
			clearInterval(progressInterval);
			setIsGenerating(false);
		}
	}, []);

	// Listen for online/offline events
	useEffect(() => {
		const handleOnline = () => {
			setIsOffline(false);
			// Retry if we have form data
			if (formData && !letterReady && !isGenerating) {
				generateLetter(formData);
			}
		};
		const handleOffline = () => setIsOffline(true);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [formData, letterReady, isGenerating, generateLetter]);

	useEffect(() => {
		// Check if we have form data (new flow) or letter data (old flow/refresh)
		const storedFormData = sessionStorage.getItem("formData");
		const storedLetterData = sessionStorage.getItem("letterData");

		if (storedFormData) {
			// New flow: Form data exists, generate letter in background
			const data = JSON.parse(storedFormData) as FormData;
			setFormData(data);
			generateLetter(data);
		} else if (storedLetterData) {
			// Letter already generated (page refresh or old flow)
			setLetterReady(true);
		} else {
			// No data at all, redirect to home
			router.push("/");
		}
	}, [router, generateLetter]);

	const handleCopyMessage = async () => {
		try {
			await navigator.clipboard.writeText(shareMessage);
			setCopiedMessage(true);
			setTimeout(() => setCopiedMessage(false), 2000);
		} catch {
			// Fallback for older browsers
			const textarea = document.createElement("textarea");
			textarea.value = shareMessage;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopiedMessage(true);
			setTimeout(() => setCopiedMessage(false), 2000);
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch {
			// Fallback for older browsers
			const input = document.createElement("input");
			input.value = shareUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			document.body.removeChild(input);
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		}
	};

	const handleWhatsAppShare = () => {
		const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
		window.open(url, "_blank");
	};

	const handleEmailShare = () => {
		const subject = "Schreib auch einen Brief für den Iran";
		window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
	};

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Stimme für Iran",
					text: shareMessage,
					url: shareUrl,
				});
			} catch {
				// User cancelled or error
			}
		}
	};

	const handleContinue = () => {
		if (letterReady) {
			router.push("/editor");
		}
	};

	const handleRetry = () => {
		if (formData) {
			generateLetter(formData);
		}
	};

	const handleBack = () => {
		router.push("/");
	};

	// Show loading state while we check for data
	if (!formData && !letterReady) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	// Show offline state
	if (isOffline) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center space-y-4 p-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-2">
						<WifiOff className="h-8 w-8" />
					</div>
					<h1 className="text-2xl font-bold">Keine Internetverbindung</h1>
					<p className="text-muted-foreground max-w-sm mx-auto">
						Bitte überprüfe deine Verbindung. Der Brief wird automatisch
						erstellt, sobald du wieder online bist.
					</p>
					<Button variant="outline" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Zurück zur Startseite
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="bg-linear-to-b from-primary/5 to-transparent">
				<div className="container max-w-2xl mx-auto px-4 pt-8 pb-8">
					{/* Back button */}
					<button
						type="button"
						onClick={handleBack}
						className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Zurück
					</button>

					<div className="text-center space-y-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
							{letterReady ? (
								<Check className="h-8 w-8" />
							) : error ? (
								<RefreshCw className="h-8 w-8" />
							) : (
								<Loader2 className="h-8 w-8 animate-spin" />
							)}
						</div>
						<h1 className="text-3xl font-bold">
							{letterReady
								? "Dein Brief ist fertig"
								: error
									? "Es gab ein Problem"
									: "Dein Brief wird erstellt..."}
						</h1>
						<p className="text-lg text-muted-foreground max-w-md mx-auto">
							{letterReady
								? "Lade deine Freund*innen ein, auch ihre Stimme zu erheben."
								: error
									? error
									: PROGRESS_STEPS[progressStep]}
						</p>
						{/* Progress indicator */}
						{isGenerating && (
							<div className="flex items-center justify-center gap-2 pt-2">
								{PROGRESS_STEPS.map((_, idx) => (
									<div
										key={idx}
										className={`h-1.5 w-8 rounded-full transition-colors ${
											idx <= progressStep ? "bg-primary" : "bg-muted"
										}`}
									/>
								))}
							</div>
						)}
						{/* Retry button when error */}
						{error && !isGenerating && (
							<Button onClick={handleRetry} className="mt-4">
								<RefreshCw className="h-4 w-4 mr-2" />
								Erneut versuchen
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
				{/* Campaign Goal */}
				<CampaignGoal goal={1000} />

				{/* Share section */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
							<Share2 className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-semibold text-lg">Teile die Aktion</h2>
							<p className="text-sm text-muted-foreground">
								Je mehr Briefe, desto groesser der Druck auf die Politik
							</p>
						</div>
					</div>

					{/* Copyable message */}
					<div className="mb-6">
						<p className="block text-sm font-medium mb-2">
							Nachricht zum Teilen
						</p>
						<div className="relative">
							<textarea
								readOnly
								value={shareMessage}
								aria-label="Nachricht zum Teilen"
								className="w-full h-32 p-3 pr-24 text-sm bg-muted/50 border border-border rounded-lg resize-none focus:outline-none"
							/>
							<Button
								variant="secondary"
								size="sm"
								className="absolute top-2 right-2"
								onClick={handleCopyMessage}
							>
								{copiedMessage ? (
									<>
										<Check className="h-4 w-4 mr-1" />
										Kopiert
									</>
								) : (
									<>
										<Copy className="h-4 w-4 mr-1" />
										Kopieren
									</>
								)}
							</Button>
						</div>
					</div>

					{/* Share buttons */}
					<div className="grid grid-cols-2 gap-3 mb-4">
						<Button
							variant="outline"
							className="h-12 flex items-center justify-center gap-2"
							onClick={handleWhatsAppShare}
						>
							<MessageCircle className="h-5 w-5 text-green-600" />
							<span>WhatsApp</span>
						</Button>
						<Button
							variant="outline"
							className="h-12 flex items-center justify-center gap-2"
							onClick={handleEmailShare}
						>
							<Mail className="h-5 w-5 text-blue-600" />
							<span>E-Mail</span>
						</Button>
					</div>

					{/* Copy link only */}
					<div className="flex gap-2">
						<div className="flex-1 bg-muted/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground truncate">
							{shareUrl}
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="shrink-0"
							onClick={handleCopyLink}
						>
							{copiedLink ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>

					{/* Native share (mobile) */}
					{typeof navigator !== "undefined" && "share" in navigator && (
						<Button
							variant="ghost"
							className="w-full mt-4 text-muted-foreground"
							onClick={handleNativeShare}
						>
							<Share2 className="h-4 w-4 mr-2" />
							Weitere Optionen...
						</Button>
					)}
				</div>

				{/* Motivation text */}
				<div className="text-center text-muted-foreground text-sm max-w-md mx-auto">
					<p>
						<strong className="text-foreground">Wusstest du?</strong>{" "}
						Persönliche Briefe aus dem Wahlkreis werden von Abgeordneten 10x
						häufiger gelesen als Petitions-Unterschriften.
					</p>
				</div>

				{/* Continue button */}
				<div className="pt-4">
					<Button
						size="lg"
						className="w-full h-14 text-lg font-medium"
						onClick={handleContinue}
						disabled={!letterReady || isGenerating}
					>
						{isGenerating ? (
							<>
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
								{PROGRESS_STEPS[progressStep]}
							</>
						) : error ? (
							<>
								<RefreshCw className="h-5 w-5 mr-2" />
								Erneut versuchen
							</>
						) : (
							<>
								Weiter zu meinem Brief
								<ArrowRight className="h-5 w-5 ml-2" />
							</>
						)}
					</Button>
					{error && !isGenerating && (
						<Button
							variant="ghost"
							className="w-full mt-2"
							onClick={handleRetry}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Erneut versuchen
						</Button>
					)}
					<p className="text-center text-xs text-muted-foreground mt-3">
						{isGenerating
							? "Das dauert nur wenige Sekunden"
							: error
								? "Bitte versuche es erneut"
								: "Du kannst deinen Brief noch bearbeiten, bevor du ihn versendest"}
					</p>
				</div>
			</div>

			{/* Footer */}
			<footer className="container max-w-2xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
				<p>Gemeinsam für Freiheit, Würde und Menschenrechte.</p>
			</footer>
		</div>
	);
}
