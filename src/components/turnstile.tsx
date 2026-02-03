/**
 * Cloudflare Turnstile CAPTCHA component
 * A privacy-friendly alternative to reCAPTCHA
 *
 * Usage:
 * 1. Get site key from Cloudflare dashboard
 * 2. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY env vars
 * 3. Add <Turnstile onVerify={setToken} /> to your form
 * 4. Verify token server-side using verifyTurnstileToken()
 */

"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { clientEnv } from "@/lib/env";

interface TurnstileProps {
	onVerify: (token: string) => void;
	onError?: (error: string) => void;
	onExpire?: () => void;
	theme?: "light" | "dark" | "auto";
	size?: "normal" | "compact";
	className?: string;
}

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					callback: (token: string) => void;
					"error-callback"?: (error: string) => void;
					"expired-callback"?: () => void;
					theme?: "light" | "dark" | "auto";
					size?: "normal" | "compact";
				},
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

export function Turnstile({
	onVerify,
	onError,
	onExpire,
	theme = "auto",
	size = "normal",
	className,
}: TurnstileProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	const siteKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

	const renderWidget = useCallback(() => {
		if (
			!containerRef.current ||
			!window.turnstile ||
			widgetIdRef.current ||
			!siteKey
		) {
			return;
		}

		widgetIdRef.current = window.turnstile.render(containerRef.current, {
			sitekey: siteKey,
			callback: onVerify,
			"error-callback": onError,
			"expired-callback": onExpire,
			theme,
			size,
		});
	}, [siteKey, onVerify, onError, onExpire, theme, size]);

	useEffect(() => {
		if (isLoaded) {
			renderWidget();
		}

		return () => {
			if (widgetIdRef.current && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
				widgetIdRef.current = null;
			}
		};
	}, [isLoaded, renderWidget]);

	// Don't render anything if no site key is configured
	if (!siteKey) {
		return null;
	}

	return (
		<>
			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js"
				strategy="lazyOnload"
				onLoad={() => setIsLoaded(true)}
			/>
			<div ref={containerRef} className={className} />
		</>
	);
}

/**
 * Verify Turnstile token server-side
 * Call this in your API route before processing the form
 */
export async function verifyTurnstileToken(
	token: string,
	remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
	const secretKey = process.env.TURNSTILE_SECRET_KEY;

	if (!secretKey) {
		// If not configured, skip verification (dev mode)
		console.warn(
			"[Turnstile] Secret key not configured, skipping verification",
		);
		return { success: true };
	}

	if (!token) {
		return { success: false, error: "Missing verification token" };
	}

	try {
		const formData = new URLSearchParams();
		formData.append("secret", secretKey);
		formData.append("response", token);
		if (remoteIp) {
			formData.append("remoteip", remoteIp);
		}

		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData,
			},
		);

		const result = await response.json();

		if (result.success) {
			return { success: true };
		}

		return {
			success: false,
			error: result["error-codes"]?.join(", ") || "Verification failed",
		};
	} catch (error) {
		console.error("[Turnstile] Verification error:", error);
		return { success: false, error: "Verification service unavailable" };
	}
}
