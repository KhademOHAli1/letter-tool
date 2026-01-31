"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailSender } from "@/components/email-sender";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Language } from "@/lib/i18n/translations";

interface LetterData {
	content: string;
	subject: string;
	wordCount: number;
	mdb: {
		name: string;
		email: string;
		party: string;
	};
	senderName: string;
}

// Localized text for preview page
const PREVIEW_TEXT = {
	de: {
		loading: "Lade...",
		title: "Dein Brief ist fertig",
		subtitle: (name: string) => `Überprüfe den Text und sende ihn an ${name}`,
		recipient: "Empfänger",
		subject: "Betreff",
		message: "Nachricht",
		words: "Wörter",
		sendEmail: "📧 E-Mail öffnen und senden",
		copy: "Text kopieren",
		copied: "Kopiert!",
		newLetter: "Neuer Brief",
		hint: 'Klicke auf "E-Mail öffnen" um deinen E-Mail-Client zu starten. Der Brief wird automatisch eingefügt.',
	},
	en: {
		loading: "Loading...",
		title: "Your letter is ready",
		subtitle: (name: string) => `Review the text and send it to ${name}`,
		recipient: "Recipient",
		subject: "Subject",
		message: "Message",
		words: "words",
		sendEmail: "📧 Open email and send",
		copy: "Copy text",
		copied: "Copied!",
		newLetter: "New letter",
		hint: 'Click "Open email" to launch your email client. The letter will be automatically inserted.',
	},
} as const;

export default function PreviewPage() {
	const router = useRouter();
	const params = useParams<{ country: string }>();
	const country = params.country || "de";
	const [data, setData] = useState<LetterData | null>(null);
	const [copied, setCopied] = useState(false);

	// Use English for UK/CA, German for DE
	const lang = country === "de" ? "de" : "en";
	const t = PREVIEW_TEXT[lang];

	useEffect(() => {
		const stored = sessionStorage.getItem("letterData");
		if (stored) {
			setData(JSON.parse(stored));
		} else {
			router.push(`/${country}`);
		}
	}, [router, country]);

	if (!data) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>{t.loading}</p>
			</div>
		);
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(data.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleNewLetter = () => {
		sessionStorage.removeItem("letterData");
		router.push(`/${country}`);
	};

	const language: Language = country === "de" ? "de" : "en";

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto max-w-3xl px-4 py-8">
				<header className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
					<p className="mt-2 text-muted-foreground">
						{t.subtitle(data.mdb.name)}
					</p>
				</header>

				{/* Recipient Info */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t.recipient}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-medium">{data.mdb.name}</p>
						<p className="text-sm text-muted-foreground">{data.mdb.party}</p>
						<p className="text-sm text-muted-foreground">{data.mdb.email}</p>
					</CardContent>
				</Card>

				{/* Subject */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t.subject}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">{data.subject}</p>
					</CardContent>
				</Card>

				{/* Letter Text */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex justify-between items-center">
							<span>{t.message}</span>
							<span className="text-sm font-normal text-muted-foreground">
								{data.wordCount} {t.words}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-md">
							{data.content}
						</div>
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="space-y-3">
					<EmailSender
						to={data.mdb.email}
						subject={data.subject}
						body={data.content}
						language={language}
					>
						<Button size="lg" className="w-full">
							{t.sendEmail}
						</Button>
					</EmailSender>
					<div className="grid grid-cols-2 gap-3">
						<Button onClick={handleCopy} variant="outline">
							{copied ? t.copied : t.copy}
						</Button>
						<Button onClick={handleNewLetter} variant="outline">
							{t.newLetter}
						</Button>
					</div>
				</div>

				<p className="mt-6 text-xs text-center text-muted-foreground">
					{t.hint}
				</p>
			</main>
		</div>
	);
}
