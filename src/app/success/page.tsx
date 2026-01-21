"use client";

import {
	ArrowLeft,
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

export default function SuccessPage() {
	const router = useRouter();
	const [copiedMessage, setCopiedMessage] = useState(false);
	const [mdbName, setMdbName] = useState<string | null>(null);

	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareMessage = `Ich habe gerade einen Brief an meine:n Bundestagsabgeordnete:n geschrieben, um mich für Menschenrechte im Iran einzusetzen.

In 5 Minuten kannst du auch deinen eigenen Brief schreiben - direkt an den/die Abgeordnete:n in deinem Wahlkreis.

Je mehr Briefe, desto mehr Druck auf die Politik.

${shareUrl}`;

	useEffect(() => {
		const letterData = sessionStorage.getItem("letterData");
		if (letterData) {
			const data = JSON.parse(letterData);
			setMdbName(data.mdb?.name || null);
			// Clear session data after successful send
			sessionStorage.removeItem("letterData");
			sessionStorage.removeItem("formData");
		}
	}, []);

	const handleCopyMessage = async () => {
		try {
			await navigator.clipboard.writeText(shareMessage);
			setCopiedMessage(true);
			setTimeout(() => setCopiedMessage(false), 2000);
		} catch {
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
				// User cancelled
			}
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="bg-linear-to-b from-primary/10 to-transparent">
				<div className="container max-w-2xl mx-auto px-4 pt-8 pb-12">
					<button
						type="button"
						onClick={() => router.push("/")}
						className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Neuen Brief schreiben
					</button>

					<div className="text-center space-y-6">
						{/* Success animation */}
						<div className="relative inline-flex items-center justify-center">
							<div className="absolute inset-0 w-20 h-20 rounded-full bg-green-500/20 animate-ping" />
							<div className="relative w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
								<Check className="h-10 w-10 text-green-600" />
							</div>
						</div>

						<div className="space-y-2">
							<h1 className="text-3xl font-bold text-foreground">
								Danke für deine Stimme!
							</h1>
							{mdbName && (
								<p className="text-lg text-muted-foreground">
									Dein Brief an{" "}
									<span className="font-medium text-foreground">{mdbName}</span>{" "}
									wurde vorbereitet.
								</p>
							)}
						</div>

						<p className="text-muted-foreground max-w-md mx-auto">
							Jede Stimme zählt. Gemeinsam können wir den Druck auf die Politik
							erhöhen.
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
							<h2 className="font-semibold text-lg">
								Multipliziere deine Wirkung
							</h2>
							<p className="text-sm text-muted-foreground">
								Lade Freund:innen ein, auch ihre Stimme zu erheben
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
					<div className="grid grid-cols-2 gap-3">
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

				{/* What happens next */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
					<h3 className="font-semibold mb-4">Was passiert jetzt?</h3>
					<ul className="space-y-3 text-sm text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
								1
							</span>
							<span>Dein Brief wird an das Büro des Abgeordneten gesendet</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
								2
							</span>
							<span>Das Büro liest und kategorisiert eingehende Post</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
								3
							</span>
							<span>
								Bei vielen Briefen zum gleichen Thema wird der MdB aufmerksam
							</span>
						</li>
					</ul>
				</div>

				{/* Call to action */}
				<div className="text-center pt-4">
					<Button
						size="lg"
						variant="outline"
						onClick={() => router.push("/")}
						className="h-12"
					>
						Noch einen Brief schreiben
					</Button>
				</div>
			</div>

			{/* Footer */}
			<footer className="container max-w-2xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
				<p>Gemeinsam für Freiheit, Würde und Menschenrechte.</p>
			</footer>
		</div>
	);
}
