"use client";

import {
	ArrowRight,
	Check,
	Copy,
	Mail,
	MessageCircle,
	Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CampaignGoal } from "@/components/campaign-goal";
import { Button } from "@/components/ui/button";

export default function SharePage() {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [hasLetterData, setHasLetterData] = useState(false);

	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareText =
		"Ich habe gerade einen Brief an meine:n Bundestagsabgeordnete:n geschrieben, um mich für Menschenrechte im Iran einzusetzen. Mach mit!";

	useEffect(() => {
		// Check if we have letter data
		const data = sessionStorage.getItem("letterData");
		if (!data) {
			// No letter data, redirect to home
			router.push("/");
			return;
		}
		setHasLetterData(true);
	}, [router]);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const input = document.createElement("input");
			input.value = shareUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			document.body.removeChild(input);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleWhatsAppShare = () => {
		const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
		window.open(url, "_blank");
	};

	const handleEmailShare = () => {
		const subject = "Schreib auch einen Brief für den Iran!";
		const body = `${shareText}\n\nHier kannst du deinen eigenen Brief schreiben:\n${shareUrl}`;
		window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	};

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Stimme für Iran",
					text: shareText,
					url: shareUrl,
				});
			} catch {
				// User cancelled or error
			}
		}
	};

	const handleContinue = () => {
		router.push("/editor");
	};

	if (!hasLetterData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="bg-gradient-to-b from-primary/5 to-transparent">
				<div className="container max-w-2xl mx-auto px-4 pt-12 pb-8">
					<div className="text-center space-y-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
							<Check className="h-8 w-8" />
						</div>
						<h1 className="text-3xl font-bold">Dein Brief wird erstellt</h1>
						<p className="text-lg text-muted-foreground max-w-md mx-auto">
							Während wir deinen Brief vorbereiten, lade deine Freund:innen ein,
							auch ihre Stimme zu erheben.
						</p>
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
								Je mehr Briefe, desto größer der Druck auf die Politik
							</p>
						</div>
					</div>

					{/* Share buttons */}
					<div className="grid grid-cols-2 gap-3 mb-6">
						<Button
							variant="outline"
							className="h-14 flex items-center justify-center gap-2"
							onClick={handleWhatsAppShare}
						>
							<MessageCircle className="h-5 w-5 text-green-600" />
							<span>WhatsApp</span>
						</Button>
						<Button
							variant="outline"
							className="h-14 flex items-center justify-center gap-2"
							onClick={handleEmailShare}
						>
							<Mail className="h-5 w-5 text-blue-600" />
							<span>E-Mail</span>
						</Button>
					</div>

					{/* Copy link */}
					<div className="flex gap-2">
						<div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm truncate">
							{shareUrl}
						</div>
						<Button
							variant="outline"
							className="shrink-0"
							onClick={handleCopyLink}
						>
							{copied ? (
								<>
									<Check className="h-4 w-4 mr-2" />
									Kopiert!
								</>
							) : (
								<>
									<Copy className="h-4 w-4 mr-2" />
									Kopieren
								</>
							)}
						</Button>
					</div>

					{/* Native share (mobile) */}
					{typeof navigator !== "undefined" && "share" in navigator && (
						<Button
							variant="ghost"
							className="w-full mt-4"
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
						Persönliche Briefe von Wähler:innen werden von Abgeordneten 10x
						häufiger gelesen als Petitions-Unterschriften.
					</p>
				</div>

				{/* Continue button */}
				<div className="pt-4">
					<Button
						size="lg"
						className="w-full h-14 text-lg font-medium"
						onClick={handleContinue}
					>
						Weiter zu meinem Brief
						<ArrowRight className="h-5 w-5 ml-2" />
					</Button>
					<p className="text-center text-xs text-muted-foreground mt-3">
						Du kannst deinen Brief noch bearbeiten, bevor du ihn versendest
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
