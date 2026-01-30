"use client";

/**
 * Social Share Buttons Component
 * Phase 9: Sharing & Distribution
 *
 * Provides share functionality for campaigns across multiple platforms
 */

import {
	Check,
	Copy,
	Facebook,
	Linkedin,
	Mail,
	MessageCircle,
	Share2,
	Twitter,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface ShareButtonsProps {
	/** URL to share */
	url: string;
	/** Title/text for the share */
	title: string;
	/** Optional description for platforms that support it */
	description?: string;
	/** Optional hashtags for Twitter (without #) */
	hashtags?: string[];
	/** Campaign slug for UTM tracking */
	campaignSlug?: string;
	/** Show as inline buttons or in a dialog */
	variant?: "inline" | "dialog";
	/** Size of buttons */
	size?: "sm" | "default" | "lg";
	/** Callback when share is clicked (for analytics) */
	onShare?: (platform: string) => void;
}

/**
 * Add UTM parameters to a URL
 */
function addUtmParams(
	baseUrl: string,
	source: string,
	campaign?: string,
): string {
	const url = new URL(baseUrl);
	url.searchParams.set("utm_source", source);
	url.searchParams.set("utm_medium", "social");
	if (campaign) {
		url.searchParams.set("utm_campaign", campaign);
	}
	return url.toString();
}

/**
 * Generate share URLs for different platforms
 */
function getShareUrls(
	url: string,
	title: string,
	description?: string,
	hashtags?: string[],
	campaign?: string,
) {
	const encodedUrl = encodeURIComponent(addUtmParams(url, "twitter", campaign));
	const encodedTitle = encodeURIComponent(title);
	const encodedDesc = encodeURIComponent(description || "");
	const hashtagString = hashtags?.length ? hashtags.join(",") : "";

	return {
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashtagString ? `&hashtags=${hashtagString}` : ""}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(addUtmParams(url, "facebook", campaign))}`,
		whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodeURIComponent(addUtmParams(url, "whatsapp", campaign))}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(addUtmParams(url, "linkedin", campaign))}`,
		email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodeURIComponent(addUtmParams(url, "email", campaign))}`,
	};
}

/**
 * Individual share button component
 */
function ShareButton({
	platform,
	url,
	icon: Icon,
	label,
	color,
	size = "default",
	onShare,
}: {
	platform: string;
	url: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	color: string;
	size?: "sm" | "default" | "lg";
	onShare?: (platform: string) => void;
}) {
	const handleClick = () => {
		onShare?.(platform);
		window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
	};

	const sizeClasses = {
		sm: "h-8 w-8",
		default: "h-10 w-10",
		lg: "h-12 w-12",
	};

	const iconSizes = {
		sm: "h-4 w-4",
		default: "h-5 w-5",
		lg: "h-6 w-6",
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all hover:scale-110 ${color}`}
			title={`Share on ${label}`}
			aria-label={`Share on ${label}`}
		>
			<Icon className={iconSizes[size]} />
		</button>
	);
}

/**
 * Copy link button with feedback
 */
function CopyLinkButton({
	url,
	size = "default",
	onShare,
}: {
	url: string;
	size?: "sm" | "default" | "lg";
	onShare?: (platform: string) => void;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			onShare?.("copy");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const textarea = document.createElement("textarea");
			textarea.value = url;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
			onShare?.("copy");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const sizeClasses = {
		sm: "h-8 w-8",
		default: "h-10 w-10",
		lg: "h-12 w-12",
	};

	const iconSizes = {
		sm: "h-4 w-4",
		default: "h-5 w-5",
		lg: "h-6 w-6",
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all hover:scale-110 bg-muted text-muted-foreground hover:bg-muted/80`}
			title={copied ? "Copied!" : "Copy link"}
			aria-label={copied ? "Link copied" : "Copy link"}
		>
			{copied ? (
				<Check className={`${iconSizes[size]} text-green-600`} />
			) : (
				<Copy className={iconSizes[size]} />
			)}
		</button>
	);
}

/**
 * Inline share buttons
 */
function InlineShareButtons({
	url,
	title,
	description,
	hashtags,
	campaignSlug,
	size = "default",
	onShare,
}: ShareButtonsProps) {
	const shareUrls = getShareUrls(
		url,
		title,
		description,
		hashtags,
		campaignSlug,
	);

	return (
		<div className="flex items-center gap-2">
			<ShareButton
				platform="twitter"
				url={shareUrls.twitter}
				icon={Twitter}
				label="Twitter/X"
				color="bg-[#1DA1F2] text-white hover:bg-[#1a8cd8]"
				size={size}
				onShare={onShare}
			/>
			<ShareButton
				platform="facebook"
				url={shareUrls.facebook}
				icon={Facebook}
				label="Facebook"
				color="bg-[#1877F2] text-white hover:bg-[#166fe5]"
				size={size}
				onShare={onShare}
			/>
			<ShareButton
				platform="whatsapp"
				url={shareUrls.whatsapp}
				icon={MessageCircle}
				label="WhatsApp"
				color="bg-[#25D366] text-white hover:bg-[#22c55e]"
				size={size}
				onShare={onShare}
			/>
			<ShareButton
				platform="linkedin"
				url={shareUrls.linkedin}
				icon={Linkedin}
				label="LinkedIn"
				color="bg-[#0A66C2] text-white hover:bg-[#0958a8]"
				size={size}
				onShare={onShare}
			/>
			<ShareButton
				platform="email"
				url={shareUrls.email}
				icon={Mail}
				label="Email"
				color="bg-gray-600 text-white hover:bg-gray-700"
				size={size}
				onShare={onShare}
			/>
			<CopyLinkButton
				url={addUtmParams(url, "copy", campaignSlug)}
				size={size}
				onShare={onShare}
			/>
		</div>
	);
}

/**
 * Share dialog with buttons
 */
function ShareDialog({
	url,
	title,
	description,
	hashtags,
	campaignSlug,
	size = "default",
	onShare,
}: ShareButtonsProps) {
	const shareUrls = getShareUrls(
		url,
		title,
		description,
		hashtags,
		campaignSlug,
	);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			onShare?.("copy");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback
			const textarea = document.createElement("textarea");
			textarea.value = url;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
			onShare?.("copy");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size={size}>
					<Share2 className="w-4 h-4 mr-2" />
					Share
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share this campaign</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					{/* Social buttons */}
					<div className="flex justify-center gap-4">
						<ShareButton
							platform="twitter"
							url={shareUrls.twitter}
							icon={Twitter}
							label="Twitter/X"
							color="bg-[#1DA1F2] text-white hover:bg-[#1a8cd8]"
							size="lg"
							onShare={onShare}
						/>
						<ShareButton
							platform="facebook"
							url={shareUrls.facebook}
							icon={Facebook}
							label="Facebook"
							color="bg-[#1877F2] text-white hover:bg-[#166fe5]"
							size="lg"
							onShare={onShare}
						/>
						<ShareButton
							platform="whatsapp"
							url={shareUrls.whatsapp}
							icon={MessageCircle}
							label="WhatsApp"
							color="bg-[#25D366] text-white hover:bg-[#22c55e]"
							size="lg"
							onShare={onShare}
						/>
						<ShareButton
							platform="linkedin"
							url={shareUrls.linkedin}
							icon={Linkedin}
							label="LinkedIn"
							color="bg-[#0A66C2] text-white hover:bg-[#0958a8]"
							size="lg"
							onShare={onShare}
						/>
						<ShareButton
							platform="email"
							url={shareUrls.email}
							icon={Mail}
							label="Email"
							color="bg-gray-600 text-white hover:bg-gray-700"
							size="lg"
							onShare={onShare}
						/>
					</div>

					{/* Copy link section */}
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Or copy link</p>
						<div className="flex items-center gap-2">
							<input
								type="text"
								readOnly
								value={url}
								className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
							/>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleCopy}
								className="shrink-0"
							>
								{copied ? (
									<>
										<Check className="w-4 h-4 mr-1" />
										Copied
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-1" />
										Copy
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Main ShareButtons component
 * Renders either inline buttons or a dialog trigger based on variant prop
 */
export function ShareButtons(props: ShareButtonsProps) {
	const { variant = "inline" } = props;

	if (variant === "dialog") {
		return <ShareDialog {...props} />;
	}

	return <InlineShareButtons {...props} />;
}

export { addUtmParams, getShareUrls };
