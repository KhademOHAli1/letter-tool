"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function PreviewPage() {
	const router = useRouter();
	const [data, setData] = useState<LetterData | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const stored = sessionStorage.getItem("letterData");
		if (stored) {
			setData(JSON.parse(stored));
		} else {
			router.push("/");
		}
	}, [router]);

	if (!data) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>Lade...</p>
			</div>
		);
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(data.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSendEmail = () => {
		const mailtoUrl = `mailto:${data.mdb.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.content)}`;
		window.location.href = mailtoUrl;
	};

	const handleNewLetter = () => {
		sessionStorage.removeItem("letterData");
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto max-w-3xl px-4 py-8">
				<header className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight">
						Dein Brief ist fertig
					</h1>
					<p className="mt-2 text-muted-foreground">
						Überprüfe den Text und sende ihn an {data.mdb.name}
					</p>
				</header>

				{/* Empfänger Info */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Empfänger</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-medium">{data.mdb.name}</p>
						<p className="text-sm text-muted-foreground">{data.mdb.party}</p>
						<p className="text-sm text-muted-foreground">{data.mdb.email}</p>
					</CardContent>
				</Card>

				{/* Betreff */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Betreff</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">{data.subject}</p>
					</CardContent>
				</Card>

				{/* Brief Text */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex justify-between items-center">
							<span>Nachricht</span>
							<span className="text-sm font-normal text-muted-foreground">
								{data.wordCount} Wörter
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-md">
							{data.content}
						</div>
					</CardContent>
				</Card>

				{/* Aktionen */}
				<div className="space-y-3">
					<Button onClick={handleSendEmail} size="lg" className="w-full">
						📧 E-Mail öffnen und senden
					</Button>
					<div className="grid grid-cols-2 gap-3">
						<Button onClick={handleCopy} variant="outline">
							{copied ? "Kopiert!" : "Text kopieren"}
						</Button>
						<Button onClick={handleNewLetter} variant="outline">
							Neuer Brief
						</Button>
					</div>
				</div>

				<p className="mt-6 text-xs text-center text-muted-foreground">
					Klicke auf &quot;E-Mail öffnen&quot; um deinen E-Mail-Client zu
					starten. Der Brief wird automatisch eingefügt.
				</p>
			</main>
		</div>
	);
}
