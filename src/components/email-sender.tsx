"use client";

import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import {
	cloneElement,
	isValidElement,
	type ReactElement,
	useState,
} from "react";
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
	children: ReactElement<{ onClick?: () => void }>;
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

// Provider display info - icons as component functions
const PROVIDER_ICONS = {
	gmail: () => (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
		</svg>
	),
	outlook: () => (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.101.086.229.086.33 0l6.855-5.146c.178-.139.264-.182.58.162v-.57zm-.238-1.529c.152 0 .3.048.424.144l-9.08 6.818c-.06.047-.125.07-.195.07s-.134-.023-.195-.07L5.58 6.002a.69.69 0 0 1 .424-.144h17.758zM14.635 24H1.455A1.455 1.455 0 0 1 0 22.545V1.455C0 .651.651 0 1.455 0h13.18v8.727h-4.364a.728.728 0 0 0-.727.727v6.546c0 .401.326.727.727.727h4.364V24zm-4.364-8.727v5.09h-5.09v-5.09h5.09zm0-7.273v5.09h-5.09v-5.09h5.09z" />
		</svg>
	),
	yahoo: () => (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M11.996 24c-1.31 0-2.373-1.063-2.373-2.373 0-1.31 1.063-2.373 2.373-2.373 1.31 0 2.373 1.063 2.373 2.373 0 1.31-1.063 2.373-2.373 2.373zm-.353-7.094c.353 0 .706.353.706.706v1.882c0 .353-.353.706-.706.706s-.706-.353-.706-.706v-1.882c0-.353.353-.706.706-.706zm-2.824-2.118l-5.648 5.648c-.235.235-.235.588 0 .824.235.235.588.235.824 0l5.648-5.648c.235-.235.235-.588 0-.824-.236-.235-.589-.235-.824 0zm9.176-9.176l-5.648 5.648c-.235.235-.235.588 0 .824.235.235.588.235.824 0l5.648-5.648c.235-.235.235-.588 0-.824-.236-.235-.589-.235-.824 0zM24 2.824L16.471 12l7.53 2.824V2.824zm0 14.352l-7.53-2.823L24 21.176v-4zM0 2.824v12l7.529-2.824L0 2.824zm0 14.352v4l7.529-6.823L0 17.176z" />
		</svg>
	),
	default: () => <Mail className="h-5 w-5" />,
};

const PROVIDERS = {
	gmail: {
		name: "Gmail",
		color:
			"bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800",
	},
	outlook: {
		name: "Outlook",
		color:
			"bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800",
	},
	yahoo: {
		name: "Yahoo Mail",
		color:
			"bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800",
	},
	default: {
		name: "E-Mail App",
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
			copyFailed: "Kopieren fehlgeschlagen",
			or: "oder",
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
			copyFailed: "Copy failed",
			or: "or",
		},
		fr: {
			title: "Comment souhaitez-vous envoyer l'e-mail ?",
			description: "Choisissez votre application e-mail préférée",
			rememberChoice: "Mémoriser mon choix",
			copyAndOpen: "Copier et ouvrir",
			copyOnly: "Copier uniquement",
			copied: "Lettre copiée dans le presse-papiers !",
			copiedToast: "La lettre a été copiée. Collez-la avec Ctrl+V / Cmd+V.",
			openingMail: "Ouverture de l'e-mail...",
			openDefault: "Ouvrir l'application e-mail par défaut",
			copyFailed: "Échec de la copie",
			or: "ou",
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
			toast.error(t.copyFailed);
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

	// Clone the child element and inject onClick handler
	const trigger = isValidElement(children)
		? cloneElement(children, { onClick: handleClick })
		: children;

	return (
		<>
			{trigger}

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
							<span className="text-red-600 dark:text-red-400">
								{PROVIDER_ICONS.gmail()}
							</span>
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
							<span className="text-blue-600 dark:text-blue-400">
								{PROVIDER_ICONS.outlook()}
							</span>
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
							<span className="text-purple-600 dark:text-purple-400">
								{PROVIDER_ICONS.yahoo()}
							</span>
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
									{t.or}
								</span>
							</div>
						</div>

						{/* Default mail app option */}
						<Button
							variant="outline"
							className={`justify-start gap-3 h-14 ${PROVIDERS.default.color}`}
							onClick={() => handleProviderClick("default")}
						>
							<span className="text-muted-foreground">
								{PROVIDER_ICONS.default()}
							</span>
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
