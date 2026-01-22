"use client";

import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface VoiceInputProps {
	/** Callback when transcribed text is ready */
	onTranscript: (text: string) => void;
	/** Whether to append to existing text or replace */
	appendMode?: boolean;
	/** Current text value (for append mode) */
	currentValue?: string;
	/** Disabled state */
	disabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
	resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
	message?: string;
}

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start: () => void;
	stop: () => void;
	abort: () => void;
	onresult: (event: SpeechRecognitionEvent) => void;
	onerror: (event: SpeechRecognitionErrorEvent) => void;
	onend: () => void;
	onstart: () => void;
}

declare global {
	interface Window {
		SpeechRecognition: new () => SpeechRecognition;
		webkitSpeechRecognition: new () => SpeechRecognition;
	}
}

export function VoiceInput({
	onTranscript,
	appendMode = true,
	currentValue = "",
	disabled = false,
}: VoiceInputProps) {
	const { language } = useLanguage();
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [isRequestingPermission, setIsRequestingPermission] = useState(false);
	const [permissionState, setPermissionState] =
		useState<PermissionState | null>(null);
	const [interimTranscript, setInterimTranscript] = useState("");
	const [error, setError] = useState<string | null>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	// Check browser support and permission status on mount
	useEffect(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		setIsSupported(!!SpeechRecognition);

		// Check microphone permission status if available
		// Note: This API is not available in all browsers, so we handle errors gracefully
		if (navigator.permissions) {
			navigator.permissions
				.query({ name: "microphone" as PermissionName })
				.then((result) => {
					setPermissionState(result.state);
					// Listen for permission changes
					result.onchange = () => {
						setPermissionState(result.state);
					};
				})
				.catch(() => {
					// Permission API not available for microphone - set to prompt so we try anyway
					setPermissionState("prompt");
				});
		} else {
			// No Permissions API - assume we can try
			setPermissionState("prompt");
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
		};
	}, []);

	const startListening = useCallback(async () => {
		setError(null);
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			setError(
				language === "de"
					? "Spracherkennung nicht unterstützt"
					: "Speech recognition not supported",
			);
			return;
		}

		// Request microphone permission explicitly first
		if (permissionState !== "granted") {
			setIsRequestingPermission(true);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				// Permission granted - stop the stream immediately, we just needed permission
				for (const track of stream.getTracks()) {
					track.stop();
				}
				setPermissionState("granted");
			} catch (err) {
				setIsRequestingPermission(false);
				const error = err as Error;
				if (
					error.name === "NotAllowedError" ||
					error.name === "PermissionDeniedError"
				) {
					setError(
						language === "de"
							? "Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen."
							: "Microphone access denied. Please allow access in your browser settings.",
					);
					setPermissionState("denied");
				} else {
					setError(
						language === "de"
							? "Mikrofon konnte nicht aktiviert werden"
							: "Could not activate microphone",
					);
				}
				return;
			}
			setIsRequestingPermission(false);
		}

		const recognition = new SpeechRecognition();
		recognitionRef.current = recognition;

		// Configure recognition
		recognition.continuous = true;
		recognition.interimResults = true;
		// Support German, English, and Farsi
		recognition.lang = language === "de" ? "de-DE" : "en-US";

		recognition.onstart = () => {
			setIsListening(true);
			setInterimTranscript("");
		};

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let finalTranscript = "";
			let interim = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcript;
				} else {
					interim += transcript;
				}
			}

			setInterimTranscript(interim);

			if (finalTranscript) {
				if (appendMode) {
					const separator = currentValue.trim() ? " " : "";
					onTranscript(currentValue + separator + finalTranscript.trim());
				} else {
					onTranscript(finalTranscript.trim());
				}
			}
		};

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			console.error("Speech recognition error:", event.error);
			setIsListening(false);

			if (event.error === "not-allowed") {
				setError(
					language === "de"
						? "Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen."
						: "Microphone access denied. Please allow access in your browser settings.",
				);
			} else if (event.error === "no-speech") {
				// Silently ignore no-speech errors
			} else {
				setError(
					language === "de"
						? `Fehler: ${event.error}`
						: `Error: ${event.error}`,
				);
			}
		};

		recognition.onend = () => {
			setIsListening(false);
			setInterimTranscript("");
		};

		try {
			recognition.start();
		} catch (err) {
			console.error("Failed to start recognition:", err);
			setError(
				language === "de"
					? "Spracherkennung konnte nicht gestartet werden"
					: "Could not start speech recognition",
			);
		}
	}, [language, appendMode, currentValue, onTranscript, permissionState]);

	const stopListening = useCallback(() => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
		}
		setIsListening(false);
	}, []);

	const toggleListening = useCallback(() => {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	}, [isListening, startListening, stopListening]);

	// Don't render if not supported or permission permanently denied
	if (!isSupported) {
		return null;
	}

	// Show different state when permission is denied
	if (permissionState === "denied") {
		return (
			<button
				type="button"
				disabled
				className="p-1.5 rounded-md text-destructive/50 cursor-not-allowed"
				title={
					language === "de"
						? "Mikrofon-Zugriff verweigert"
						: "Microphone access denied"
				}
			>
				<MicOff className="h-4 w-4" />
			</button>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={toggleListening}
				disabled={disabled || isRequestingPermission}
				className={`p-1.5 rounded-md transition-all duration-200 ${
					isRequestingPermission
						? "text-primary/70 animate-pulse"
						: isListening
							? "text-destructive bg-destructive/10 animate-pulse"
							: "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
				}`}
				aria-label={
					isRequestingPermission
						? language === "de"
							? "Mikrofon-Zugriff wird angefragt..."
							: "Requesting microphone access..."
						: isListening
							? language === "de"
								? "Aufnahme stoppen"
								: "Stop recording"
							: language === "de"
								? "Spracheingabe"
								: "Voice input"
				}
				title={
					isRequestingPermission
						? language === "de"
							? "Bitte erlaube Mikrofon-Zugriff"
							: "Please allow microphone access"
						: isListening
							? language === "de"
								? "Klicken zum Stoppen"
								: "Click to stop"
							: language === "de"
								? "Spracheingabe starten"
								: "Start voice input"
				}
			>
				{isListening ? (
					<MicOff className="h-4 w-4" />
				) : (
					<Mic className="h-4 w-4" />
				)}
			</button>

			{/* Subtle interim transcript indicator */}
			{isListening && interimTranscript && (
				<span className="text-[10px] text-muted-foreground/60 italic max-w-24 truncate">
					{interimTranscript.slice(0, 20)}...
				</span>
			)}

			{/* Error tooltip - only show briefly */}
			{error && (
				<span className="text-[10px] text-destructive/70 max-w-32 truncate">
					{error.slice(0, 30)}
				</span>
			)}
		</>
	);
}
