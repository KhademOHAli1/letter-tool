"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LetterData {
	content: string;
	subject: string;
	wordCount: number;
	mdb: {
		name: string;
		email: string;
		party: string;
		imageUrl?: string;
	};
	senderName: string;
}

// Wortzählung
function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

// Wort-Status bestimmen
function getWordCountStatus(count: number): {
	color: string;
	bg: string;
	message: string;
} {
	if (count < 180) {
		return {
			color: "text-amber-700",
			bg: "bg-amber-50",
			message: "Etwas kurz",
		};
	}
	if (count <= 400) {
		return { color: "text-green-700", bg: "bg-green-50", message: "Optimal" };
	}
	if (count <= 500) {
		return {
			color: "text-amber-700",
			bg: "bg-amber-50",
			message: "Etwas lang",
		};
	}
	return { color: "text-red-700", bg: "bg-red-50", message: "Zu lang" };
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
	const [data, setData] = useState<LetterData | null>(null);
	const [content, setContent] = useState("");
	const [subject, setSubject] = useState("");
	const [isModified, setIsModified] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const stored = sessionStorage.getItem("letterData");
		if (stored) {
			const parsed = JSON.parse(stored) as LetterData;
			setData(parsed);
			setContent(parsed.content);
			setSubject(parsed.subject);
		} else {
			router.push("/");
		}
	}, [router]);

	const handleContentChange = useCallback((value: string) => {
		setContent(value);
		setIsModified(true);
	}, []);

	const handleSubjectChange = useCallback((value: string) => {
		setSubject(value);
		setIsModified(true);
	}, []);

	const handleSendEmail = () => {
		if (data) {
			const updatedData = {
				...data,
				content,
				subject,
				wordCount: countWords(content),
			};
			sessionStorage.setItem("letterData", JSON.stringify(updatedData));
		}

		const mailtoUrl = `mailto:${data?.mdb.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;

		// Open mailto in a new context and redirect to success page
		window.open(mailtoUrl, "_self");
		setTimeout(() => {
			router.push("/success");
		}, 500);
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleBack = () => {
		router.push("/");
	};

	const handleReset = () => {
		if (data) {
			setContent(data.content);
			setSubject(data.subject);
			setIsModified(false);
		}
	};

	if (!data) {
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
					<p className="text-muted-foreground">Lade deinen Brief...</p>
				</div>
			</div>
		);
	}

	const wordCount = countWords(content);
	const wordStatus = getWordCountStatus(wordCount);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border/50 bg-linear-to-b from-accent/10 to-background">
				<div className="container mx-auto max-w-3xl px-4 py-6">
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
						Zurück
					</button>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Dein Brief ist fertig
					</h1>
					<p className="mt-1 text-muted-foreground">
						Prüfe und bearbeite deinen Brief, bevor du ihn sendest.
					</p>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-8">
				{/* Empfänger Info Card */}
				<div className="mb-8 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
					<div className="flex items-start gap-4">
						{data.mdb.imageUrl && (
							<div className="h-16 w-16 overflow-hidden rounded-full bg-muted shrink-0 ring-2 ring-border">
								<Image
									src={data.mdb.imageUrl}
									alt={data.mdb.name}
									width={64}
									height={64}
									className="object-cover object-top w-full h-full"
									unoptimized
								/>
							</div>
						)}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h2 className="font-semibold text-lg">{data.mdb.name}</h2>
								<span
									className={`inline-block px-2 py-0.5 rounded text-xs ${
										PARTY_COLORS[data.mdb.party] || "bg-gray-200"
									}`}
								>
									{data.mdb.party}
								</span>
							</div>
							<p className="text-sm text-muted-foreground flex items-center gap-1.5">
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
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								{data.mdb.email}
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Absender: <span className="font-medium">{data.senderName}</span>
							</p>
						</div>
					</div>
				</div>

				{/* Betreff Editor */}
				<div className="mb-6 space-y-2">
					<Label htmlFor="subject" className="text-sm font-medium">
						Betreff
					</Label>
					<Input
						id="subject"
						value={subject}
						onChange={(e) => handleSubjectChange(e.target.value)}
						className="font-medium text-base"
					/>
				</div>

				{/* Brief Editor */}
				<div className="mb-6 space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="content" className="text-sm font-medium">
							Dein Brief
						</Label>
						<div className="flex items-center gap-2">
							<span
								className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${wordStatus.color} ${wordStatus.bg}`}
							>
								{wordStatus.message}
							</span>
							<span className="text-xs text-muted-foreground font-mono">
								{wordCount} Wörter
							</span>
						</div>
					</div>
					<div className="relative">
						<Textarea
							id="content"
							value={content}
							onChange={(e) => handleContentChange(e.target.value)}
							className="min-h-112.5 text-base leading-relaxed resize-y p-4 rounded-xl"
							placeholder="Dein Brief..."
						/>
					</div>
				</div>

				{/* Modifikations-Hinweis */}
				{isModified && (
					<div className="mb-6 flex items-center gap-2 text-sm">
						<span className="flex h-2 w-2 rounded-full bg-amber-500" />
						<span className="text-muted-foreground">Bearbeitet</span>
						<button
							type="button"
							onClick={handleReset}
							className="text-primary hover:text-primary/80 underline underline-offset-2"
						>
							Zurücksetzen
						</button>
					</div>
				)}

				{/* Aktionen */}
				<div className="space-y-4">
					<Button
						onClick={handleSendEmail}
						size="lg"
						className="w-full h-14 text-base font-medium shadow-md gap-2"
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
						E-Mail-Programm öffnen
					</Button>

					<Button
						onClick={handleCopy}
						variant="outline"
						className="w-full gap-2"
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
								Kopiert!
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
								Brief kopieren
							</>
						)}
					</Button>
				</div>

				{/* Hinweis */}
				<div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
					<p className="text-sm text-muted-foreground text-center">
						💡 Der Brief wird in deinem E-Mail-Programm geöffnet. Dort kannst du
						ihn vor dem Senden nochmal prüfen.
					</p>
				</div>
			</main>
		</div>
	);
}
