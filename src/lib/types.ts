import type { HelpActionCategory } from "./prompts/letter-prompt";

/**
 * Personal inputs required from the user to generate a letter.
 * All fields marked as required must be provided.
 */
export interface LetterInput {
	// 1) Sender context
	senderName: string;
	senderLocation: string; // City, optionally country

	// 2) Story of Self (2-4 sentences)
	personalConnection: string; // Connection to Iran or the topic
	concreteDetail: string; // Specific moment, message, call, image, situation

	// 3) Story of Us (1-2 sentences)
	communityConnection: string; // Why this affects "us" as society/community

	// 4) Story of Now (1 sentence)
	urgencyReason: string; // Why action is needed now

	// 5) Target audience and tone
	targetAudience: TargetAudience;
	tone: LetterTone;

	// 6) Optional: verifiable anchor
	verifiableAnchor?: string;

	// Selected help actions (exactly 3)
	selectedHelpActions: [
		HelpActionCategory,
		HelpActionCategory,
		HelpActionCategory,
	];
}

export type TargetAudience =
	| "friends"
	| "colleagues"
	| "community"
	| "general-public";

export type LetterTone = "calm-factual" | "emotional-serious";

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
	friends: "Freunde",
	colleagues: "Kolleg*innen",
	community: "Community",
	"general-public": "Breite Öffentlichkeit",
};

export const TONE_LABELS: Record<LetterTone, string> = {
	"calm-factual": "Ruhig-sachlich",
	"emotional-serious": "Emotional-ernst",
};

/**
 * Generated letter response from the LLM
 */
export interface GeneratedLetter {
	content: string;
	wordCount: number;
	missingInputs?: string[]; // Any PI inputs that were missing
}

/**
 * Future: Database types for MdBs and Wahlkreise
 */
export interface MdB {
	id: string;
	name: string;
	email: string;
	party: string;
	wahlkreisId: string;
}

export interface Wahlkreis {
	id: string;
	name: string;
	plzRanges: string[]; // Postal code ranges covered
}
