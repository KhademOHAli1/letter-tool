"use client";

import {
	ArrowLeft,
	ArrowRight,
	Check,
	Copy,
	Mail,
	MessageCircle,
	Share2,
	Sparkles,
	Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CampaignGoal } from "@/components/campaign-goal";
import { FooterSettings } from "@/components/footer-settings";
import { Button } from "@/components/ui/button";
import { findMdBsByWahlkreis, type MdB } from "@/lib/data/wahlkreise";
import { useLanguage } from "@/lib/i18n/context";
import { type Language, tArray, t as translate } from "@/lib/i18n/translations";
import {
	adaptLetterForMdB,
	type CachedLetter,
	cacheGeneratedLetter,
	getCachedLetter,
	getEmailedMdBs,
	getRemainingMdBs,
	markMdBAsEmailed,
} from "@/lib/letter-cache";

// Party colors for badges
const PARTY_COLORS: Record<string, string> = {
	"CDU/CSU": "bg-black text-white",
	SPD: "bg-red-600 text-white",
	GRÜNE: "bg-green-600 text-white",
	"DIE LINKE": "bg-purple-600 text-white",
	BSW: "bg-orange-600 text-white",
	Fraktionslos: "bg-gray-500 text-white",
};

function getShareMessage(lang: Language, url: string): string {
	const message = translate("shareMessage", "", lang);
	return `${message}\n\n${url}`;
}

export default function SuccessPage() {
	const router = useRouter();
	const { t, language } = useLanguage();
	const [copiedMessage, setCopiedMessage] = useState(false);
	const [mdbName, setMdbName] = useState<string | null>(null);
	const [wahlkreisId, setWahlkreisId] = useState<string | null>(null);
	const [cachedLetter, setCachedLetter] = useState<CachedLetter | null>(null);
	const [remainingMdBs, setRemainingMdBs] = useState<MdB[]>([]);
	const [adaptingFor, setAdaptingFor] = useState<string | null>(null);

	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareMessage = getShareMessage(language, shareUrl);

	// Load data on mount
	useEffect(() => {
		// Get letter data from sessionStorage
		const letterDataRaw = sessionStorage.getItem("letterData");
		const formDataRaw = sessionStorage.getItem("formData");

		if (letterDataRaw) {
			try {
				const letterData = JSON.parse(letterDataRaw);
				setMdbName(letterData.mdb?.name || null);

				// Get form data for wahlkreis
				if (formDataRaw) {
					const formData = JSON.parse(formDataRaw);
					const wkId = formData.mdb?.wahlkreisId;
					setWahlkreisId(wkId);

					// Cache the letter for reuse
					if (letterData.content && letterData.mdb) {
						cacheGeneratedLetter({
							content: letterData.content,
							subject:
								letterData.subject ||
								"Bitte um Unterstützung: Menschenrechte im Iran",
							wordCount: letterData.wordCount || 0,
							senderName: formData.senderName || "",
							senderPlz: formData.senderPlz || "",
							wahlkreisId: wkId || "",
							wahlkreisName: formData.wahlkreis || "",
							forderungen: formData.forderungen || [],
							personalNote: formData.personalNote || "",
							mdb: letterData.mdb,
						});
					}

					// Mark current MdB as emailed
					if (letterData.mdb) {
						markMdBAsEmailed(letterData.mdb);
					}

					// Find remaining MdBs in same Wahlkreis
					if (wkId) {
						const allMdBs = findMdBsByWahlkreis(wkId);
						const remaining = getRemainingMdBs(allMdBs);
						setRemainingMdBs(remaining);
					}
				}
			} catch {
				// Invalid JSON
			}
		}

		// Also try to get cached letter
		const cached = getCachedLetter();
		if (cached) {
			setCachedLetter(cached);
			if (!wahlkreisId && cached.wahlkreisId) {
				setWahlkreisId(cached.wahlkreisId);
				const allMdBs = findMdBsByWahlkreis(cached.wahlkreisId);
				const remaining = getRemainingMdBs(allMdBs);
				setRemainingMdBs(remaining);
			}
		}

		// Clear session data (but keep in localStorage cache)
		sessionStorage.removeItem("letterData");
		sessionStorage.removeItem("formData");
	}, [wahlkreisId]);

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

	// Handle adapting letter for another MdB
	const handleAdaptForMdB = async (newMdb: MdB) => {
		if (!cachedLetter) return;

		setAdaptingFor(newMdb.id);

		// Small delay for UX
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Adapt the letter content
		const adaptedContent = adaptLetterForMdB(
			cachedLetter.content,
			cachedLetter.mdb,
			newMdb,
		);

		// Store adapted letter in sessionStorage for editor
		const adaptedLetterData = {
			content: adaptedContent,
			subject: cachedLetter.subject,
			wordCount: cachedLetter.wordCount,
			mdb: newMdb,
			senderName: cachedLetter.senderName,
			isAdapted: true,
		};

		sessionStorage.setItem("letterData", JSON.stringify(adaptedLetterData));

		// Also store form data for potential regeneration
		sessionStorage.setItem(
			"formData",
			JSON.stringify({
				senderName: cachedLetter.senderName,
				senderPlz: cachedLetter.senderPlz,
				wahlkreis: cachedLetter.wahlkreisName,
				mdb: newMdb,
				forderungen: cachedLetter.forderungen,
				personalNote: cachedLetter.personalNote,
			}),
		);

		// Navigate to editor
		router.push("/editor");
	};

	// Handle starting fresh or reusing template
	const handleNewLetter = (reuseTemplate: boolean) => {
		if (reuseTemplate && cachedLetter) {
			// Store hint that we want to reuse the personal note
			sessionStorage.setItem(
				"reuseTemplate",
				JSON.stringify({
					personalNote: cachedLetter.personalNote,
					forderungen: cachedLetter.forderungen,
					senderName: cachedLetter.senderName,
					senderPlz: cachedLetter.senderPlz,
				}),
			);
		}
		router.push("/");
	};

	// Get the "what happens next" steps based on language
	const whatsNextSteps = tArray("success", "whatsNextSteps", language);
	const emailedCount = getEmailedMdBs().length;

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

						{/* Email count badge */}
						{emailedCount > 0 && (
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
								<Mail className="h-4 w-4" />
								<span>
									{emailedCount}{" "}
									{language === "de"
										? emailedCount === 1
											? "Brief verschickt"
											: "Briefe verschickt"
										: emailedCount === 1
											? "letter sent"
											: "letters sent"}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
				{/* Campaign Goal */}
				<CampaignGoal goal={1000} />

				{/* MORE MPs SECTION - Primary CTA */}
				{remainingMdBs.length > 0 && cachedLetter && (
					<div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
								<Sparkles className="h-5 w-5" />
							</div>
							<div>
								<h2 className="font-semibold text-lg">
									{t("success", "moreMps.title")}
								</h2>
								<p className="text-sm text-muted-foreground">
									{remainingMdBs.length}{" "}
									{language === "de"
										? remainingMdBs.length === 1
											? "weiterer Abgeordneter"
											: "weitere Abgeordnete"
										: remainingMdBs.length === 1
											? "more MP"
											: "more MPs"}
								</p>
							</div>
						</div>

						<p className="text-sm text-muted-foreground mb-4">
							{t("success", "moreMps.description")}
						</p>

						{/* MP Cards */}
						<div className="space-y-3">
							{remainingMdBs.map((mdb) => (
								<button
									key={mdb.id}
									type="button"
									onClick={() => handleAdaptForMdB(mdb)}
									disabled={adaptingFor !== null}
									className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-[0.98] disabled:opacity-50"
								>
									{/* MP Photo */}
									<div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-muted">
										{mdb.imageUrl ? (
											<Image
												src={mdb.imageUrl}
												alt={mdb.name}
												fill
												className="object-cover"
												sizes="48px"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-muted-foreground">
												<Users className="h-5 w-5" />
											</div>
										)}
									</div>

									{/* MP Info */}
									<div className="flex-1 text-left min-w-0">
										<p className="font-medium text-sm truncate">{mdb.name}</p>
										<span
											className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
												PARTY_COLORS[mdb.party] || "bg-gray-200 text-gray-800"
											}`}
										>
											{mdb.party}
										</span>
									</div>

									{/* Action */}
									<div className="shrink-0">
										{adaptingFor === mdb.id ? (
											<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
										) : (
											<div className="flex items-center gap-1 text-primary text-sm font-medium">
												<span className="hidden sm:inline">
													{language === "de" ? "Anpassen" : "Adapt"}
												</span>
												<ArrowRight className="h-4 w-4" />
											</div>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* All MPs contacted - celebrate! */}
				{remainingMdBs.length === 0 && wahlkreisId && (
					<div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-5 text-center">
						<div className="text-3xl mb-2">🎉</div>
						<p className="font-medium text-green-800 dark:text-green-200">
							{t("success", "moreMps.allDone")}
						</p>
					</div>
				)}

				{/* Share section */}
				<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
							<Share2 className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-semibold">
								{language === "de"
									? "Multipliziere deine Wirkung"
									: "Multiply Your Impact"}
							</h2>
							<p className="text-sm text-muted-foreground">
								{language === "de" ? "Lade Freund*innen ein" : "Invite friends"}
							</p>
						</div>
					</div>

					{/* Share buttons - Prominent on mobile */}
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

					{/* Copyable message - Collapsible on mobile */}
					<details className="group">
						<summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
							<Copy className="h-4 w-4" />
							{language === "de" ? "Nachricht kopieren" : "Copy message"}
						</summary>
						<div className="mt-3">
							<div className="relative">
								<textarea
									readOnly
									value={shareMessage}
									aria-label={
										language === "de"
											? "Nachricht zum Teilen"
											: "Message to share"
									}
									className="w-full h-28 p-3 pr-20 text-sm bg-muted/50 border border-border rounded-lg resize-none focus:outline-none"
								/>
								<Button
									variant="secondary"
									size="sm"
									className="absolute top-2 right-2"
									onClick={handleCopyMessage}
								>
									{copiedMessage ? (
										<Check className="h-4 w-4" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</details>

					{/* Native share (mobile) */}
					{typeof navigator !== "undefined" && "share" in navigator && (
						<Button
							variant="ghost"
							className="w-full mt-3 text-muted-foreground"
							onClick={handleNativeShare}
						>
							<Share2 className="h-4 w-4 mr-2" />
							{language === "de" ? "Weitere Optionen..." : "More options..."}
						</Button>
					)}
				</div>

				{/* What happens next - Collapsible */}
				<details className="rounded-xl border border-border bg-card shadow-sm group">
					<summary className="flex items-center justify-between p-5 cursor-pointer">
						<h3 className="font-semibold">{t("success", "whatsNext")}</h3>
						<ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
					</summary>
					<div className="px-5 pb-5">
						<ul className="space-y-3 text-sm text-muted-foreground">
							{Array.isArray(whatsNextSteps) &&
								whatsNextSteps.map((step, index) => (
									<li key={index} className="flex items-start gap-3">
										<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
											{index + 1}
										</span>
										<span>{step}</span>
									</li>
								))}
						</ul>
					</div>
				</details>

				{/* New letter section */}
				<div className="pt-2">
					{cachedLetter ? (
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground text-center">
								{t("success", "moreMps.newLetterHint")}
							</p>
							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="outline"
									className="h-12"
									onClick={() => handleNewLetter(true)}
								>
									{t("success", "moreMps.reuseExisting")}
								</Button>
								<Button
									variant="ghost"
									className="h-12"
									onClick={() => handleNewLetter(false)}
								>
									{t("success", "moreMps.startFresh")}
								</Button>
							</div>
						</div>
					) : (
						<div className="text-center">
							<Button
								size="lg"
								variant="outline"
								onClick={() => router.push("/")}
								className="h-12"
							>
								{t("success", "newLetter")}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<footer className="container max-w-2xl mx-auto px-4 py-6 text-center space-y-3">
				<p className="text-sm text-muted-foreground">
					{language === "de"
						? "Gemeinsam für Freiheit, Würde und Menschenrechte."
						: "Together for freedom, dignity and human rights."}
				</p>
				<FooterSettings />
			</footer>
		</div>
	);
}
