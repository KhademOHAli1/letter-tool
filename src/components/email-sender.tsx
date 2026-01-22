"use client";

import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Language } from "@/lib/i18n/translations";

// Email provider detection and URL builders
type EmailProvider = "gmail" | "outlook" | "yahoo" | "default";

interface EmailSenderProps {
	to: string;
	subject: string;
	body: string;
	language: Language;
	onSent?: () => void;
	children: React.ReactNode;
}

// Detect likely email provider from common signals
function detectEmailProvider(): EmailProvider {
	if (typeof window === "undefined") return "default";

	// Check localStorage for user's previous choice
	const savedProvider = localStorage.getItem("preferredEmailProvider");
	if (
		savedProvider &&
		["gmail", "outlook", "yahoo", "default"].includes(savedProvider)
	) {
		return savedProvider as EmailProvider;
	}

	// Heuristics based on browser behavior (limited but helpful)
	const userAgent = navigator.userAgent.toLowerCase();

	// If on mobile, default client usually works well
	if (/android|iphone|ipad/.test(userAgent)) {
		return "default";
	}

	// Check for Outlook app indicators
	if (userAgent.includes("outlook") || userAgent.includes("office")) {
		return "outlook";
	}

	// Default to showing options on desktop
	return "default";
}

// Build email URLs for different providers
function buildGmailUrl(to: string, subject: string, body: string): string {
	const params = new URLSearchParams({
		to,
		su: subject,
		body,
	});
	return `https://mail.google.com/mail/?view=cm&${params.toString()}`;
}

function buildOutlookUrl(to: string, subject: string, body: string): string {
	const params = new URLSearchParams({
		to,
		subject,
		body,
	});
	return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function buildYahooUrl(to: string, subject: string, body: string): string {
	const params = new URLSearchParams({
		to,
		subject,
		body,
	});
	return `https://compose.mail.yahoo.com/?${params.toString()}`;
}

function buildMailtoUrl(to: string, subject: string, body: string): string {
	return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Provider display info
const PROVIDERS = {
	gmail: {
		name: "Gmail",
		icon: "📧",
		color:
			"bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800",
	},
	outlook: {
		name: "Outlook",
		icon: "📬",
		color:
			"bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800",
	},
	yahoo: {
		name: "Yahoo Mail",
		icon: "💜",
		color:
			"bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800",
	},
	default: {
		name: "E-Mail App",
		icon: "✉️",
		color: "bg-muted hover:bg-muted/80 border-border",
	},
};

export function EmailSender({
	to,
	subject,
	body,
	language,
	onSent,
	children,
}: EmailSenderProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [copied, setCopied] = useState(false);

	const translations = {
		de: {
			title: "Wie möchtest du die E-Mail senden?",
			description: "Wähle deine bevorzugte E-Mail-Anwendung",
			rememberChoice: "Auswahl merken",
			copyAndOpen: "Kopieren & Öffnen",
			copyOnly: "Nur kopieren",
			copied: "Brief in Zwischenablage kopiert!",
			copiedToast: "Der Brief wurde kopiert. Füge ihn mit Strg+V / Cmd+V ein.",
			openingMail: "E-Mail wird geöffnet...",
			openDefault: "Standard E-Mail-App öffnen",
		},
		en: {
			title: "How would you like to send the email?",
			description: "Choose your preferred email application",
			rememberChoice: "Remember my choice",
			copyAndOpen: "Copy & Open",
			copyOnly: "Copy only",
			copied: "Letter copied to clipboard!",
			copiedToast: "The letter has been copied. Paste it with Ctrl+V / Cmd+V.",
			openingMail: "Opening email...",
			openDefault: "Open default email app",
		},
	};

	const t = translations[language];

	// Check if mailto URL would be too long
	const mailtoUrl = buildMailtoUrl(to, subject, body);
	const isMailtoTooLong = mailtoUrl.length > 2000;

	const handleCopyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(body);
			setCopied(true);
			toast.success(t.copied, {
				description: t.copiedToast,
				duration: 5000,
			});
			setTimeout(() => setCopied(false), 3000);
			return true;
		} catch {
			toast.error(
				language === "de" ? "Kopieren fehlgeschlagen" : "Copy failed",
			);
			return false;
		}
	};

	const handleProviderClick = async (provider: EmailProvider) => {
		let url: string;

		switch (provider) {
			case "gmail":
				url = buildGmailUrl(to, subject, body);
				break;
			case "outlook":
				url = buildOutlookUrl(to, subject, body);
				break;
			case "yahoo":
				url = buildYahooUrl(to, subject, body);
				break;
			default:
				// For mailto, check if we need to copy first
				if (isMailtoTooLong) {
					await handleCopyToClipboard();
					url = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
				} else {
					url = mailtoUrl;
				}
		}

		// Save preference for web mail providers
		if (provider !== "default") {
			localStorage.setItem("preferredEmailProvider", provider);
		}

		toast.success(t.openingMail, { duration: 2000 });
		setShowDialog(false);

		// Web mail opens in new tab, mailto in same window
		if (provider === "default") {
			window.location.href = url;
		} else {
			window.open(url, "_blank");
		}

		onSent?.();
	};

	const handleClick = () => {
		const detected = detectEmailProvider();

		// If user has a saved preference for web mail, use it directly
		if (
			detected === "gmail" ||
			detected === "outlook" ||
			detected === "yahoo"
		) {
			handleProviderClick(detected);
			return;
		}

		// On mobile, try mailto directly (usually works well)
		if (
			typeof window !== "undefined" &&
			/android|iphone|ipad/i.test(navigator.userAgent)
		) {
			if (isMailtoTooLong) {
				// For long emails on mobile, copy first
				handleCopyToClipboard().then(() => {
					window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
					onSent?.();
				});
			} else {
				window.location.href = mailtoUrl;
				onSent?.();
			}
			return;
		}

		// On desktop, show options dialog
		setShowDialog(true);
	};

	return (
		<>
			<button type="button" onClick={handleClick} className="contents">
				{children}
			</button>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5" />
							{t.title}
						</DialogTitle>
						<DialogDescription>{t.description}</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3 py-4">
						{/* Web mail options */}
						<Button
							variant="outline"
							className={`justify-start gap-3 h-14 ${PROVIDERS.gmail.color}`}
							onClick={() => handleProviderClick("gmail")}
						>
							<span className="text-xl">{PROVIDERS.gmail.icon}</span>
							<div className="text-left">
								<div className="font-medium">{PROVIDERS.gmail.name}</div>
								<div className="text-xs text-muted-foreground">
									mail.google.com
								</div>
							</div>
							<ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
						</Button>

						<Button
							variant="outline"
							className={`justify-start gap-3 h-14 ${PROVIDERS.outlook.color}`}
							onClick={() => handleProviderClick("outlook")}
						>
							<span className="text-xl">{PROVIDERS.outlook.icon}</span>
							<div className="text-left">
								<div className="font-medium">{PROVIDERS.outlook.name}</div>
								<div className="text-xs text-muted-foreground">
									outlook.live.com
								</div>
							</div>
							<ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
						</Button>

						<Button
							variant="outline"
							className={`justify-start gap-3 h-14 ${PROVIDERS.yahoo.color}`}
							onClick={() => handleProviderClick("yahoo")}
						>
							<span className="text-xl">{PROVIDERS.yahoo.icon}</span>
							<div className="text-left">
								<div className="font-medium">{PROVIDERS.yahoo.name}</div>
								<div className="text-xs text-muted-foreground">
									mail.yahoo.com
								</div>
							</div>
							<ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									{language === "de" ? "oder" : "or"}
								</span>
							</div>
						</div>

						{/* Default mail app option */}
						<Button
							variant="outline"
							className={`justify-start gap-3 h-14 ${PROVIDERS.default.color}`}
							onClick={() => handleProviderClick("default")}
						>
							<span className="text-xl">{PROVIDERS.default.icon}</span>
							<div className="text-left">
								<div className="font-medium">{t.openDefault}</div>
								<div className="text-xs text-muted-foreground">
									{isMailtoTooLong
										? language === "de"
											? "Brief wird kopiert"
											: "Letter will be copied"
										: "Apple Mail, Thunderbird, ..."}
								</div>
							</div>
						</Button>

						{/* Copy only option */}
						<Button
							variant="ghost"
							className="justify-center gap-2"
							onClick={handleCopyToClipboard}
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							{copied ? t.copied : t.copyOnly}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
