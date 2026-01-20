"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface LetterOutputProps {
	letter: {
		content: string;
		wordCount: number;
	};
	onReset: () => void;
}

export function LetterOutput({ letter, onReset }: LetterOutputProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(letter.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Dein generierter Brief</span>
					<span className="text-sm font-normal text-muted-foreground">
						{letter.wordCount} Wörter
					</span>
				</CardTitle>
				<CardDescription>
					Überprüfe den Brief und passe ihn bei Bedarf an
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm leading-relaxed">
					{letter.content}
				</div>
				<div className="flex gap-3">
					<Button onClick={handleCopy} variant="default">
						{copied ? "Kopiert!" : "In Zwischenablage kopieren"}
					</Button>
					<Button onClick={onReset} variant="outline">
						Neuen Brief schreiben
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
