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
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { type Language, tArray, t as translate } from "@/lib/i18n/translations";

function getShareMessage(lang: Language, url: string): string {
	const message = translate("shareMessage", "", lang);
	return `${message}\n\n${url}`;
}

export default function SuccessPage() {
	const router = useRouter();
	const { t, language } = useLanguage();
	const [copiedMessage, setCopiedMessage] = useState(false);
	const [mdbName, setMdbName] = useState<string | null>(null);

	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareMessage = getShareMessage(language, shareUrl);

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
		const subject =
			language === "de"
				? "Schreib auch einen Brief für den Iran"
				: "Write a letter for Iran too";
		window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
	};

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: language === "de" ? "Stimme für Iran" : "Voice for Iran",
					text: shareMessage,
					url: shareUrl,
				});
			} catch {
				// User cancelled
			}
		}
	};

	// Get the "what happens next" steps based on language
	const whatsNextSteps = tArray("success", "whatsNextSteps", language);

	return (
		<div className="min-h-screen bg-background">
			{/* Language Switcher */}
			<div className="fixed top-4 right-4 z-50">
				<LanguageSwitcher />
			</div>

			{/* Header */}
			<div className="bg-linear-to-b from-primary/10 to-transparent">
				<div className="container max-w-2xl mx-auto px-4 pt-8 pb-12">
					<button
						type="button"
						onClick={() => router.push("/")}
						className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						{t("success", "newLetter")}
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
								{t("success", "title")}
							</h1>
							{mdbName && (
								<p className="text-lg text-muted-foreground">
									{language === "de" ? (
										<>
											Dein Brief an{" "}
											<span className="font-medium text-foreground">
												{mdbName}
											</span>{" "}
											wurde vorbereitet.
										</>
									) : (
										<>
											Your letter to{" "}
											<span className="font-medium text-foreground">
												{mdbName}
											</span>{" "}
											has been prepared.
										</>
									)}
								</p>
							)}
						</div>

						<p className="text-muted-foreground max-w-md mx-auto">
							{language === "de"
								? "Jede Stimme zählt. Gemeinsam können wir den Druck auf die Politik erhöhen."
								: "Every voice counts. Together we can increase pressure on politics."}
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
								{language === "de"
									? "Multipliziere deine Wirkung"
									: "Multiply Your Impact"}
							</h2>
							<p className="text-sm text-muted-foreground">
								{language === "de"
									? "Lade Freund:innen ein, auch ihre Stimme zu erheben"
									: "Invite friends to raise their voice too"}
							</p>
						</div>
					</div>

					{/* Copyable message */}
					<div className="mb-6">
						<p className="block text-sm font-medium mb-2">
							{language === "de" ? "Nachricht zum Teilen" : "Message to share"}
						</p>
						<div className="relative">
							<textarea
								readOnly
								value={shareMessage}
								aria-label={
									language === "de"
										? "Nachricht zum Teilen"
										: "Message to share"
								}
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
										{t("common", "copied")}
									</>
								) : (
									<>
										<Copy className="h-4 w-4 mr-1" />
										{t("common", "copy")}
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
							{language === "de" ? "Weitere Optionen..." : "More options..."}
						</Button>
					)}
				</div>

				{/* What happens next */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
					<h3 className="font-semibold mb-4">{t("success", "whatsNext")}</h3>
					<ul className="space-y-3 text-sm text-muted-foreground">
						{Array.isArray(whatsNextSteps) &&
							whatsNextSteps.map((step, index) => (
								<li key={index} className="flex items-start gap-3">
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
										{index + 1}
									</span>
									<span>{step}</span>
								</li>
							))}
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
						{t("success", "newLetter")}
					</Button>
				</div>
			</div>

			{/* Footer */}
			<footer className="container max-w-2xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
				<p>
					{language === "de"
						? "Gemeinsam für Freiheit, Würde und Menschenrechte."
						: "Together for freedom, dignity and human rights."}
				</p>
			</footer>
		</div>
	);
}
