import { z } from "zod";
import { HELP_ACTION_CATEGORIES } from "./prompts/letter-prompt";

/**
 * Zod schema for letter input validation.
 * Used with react-hook-form for form validation.
 */
export const letterInputSchema = z.object({
	senderName: z
		.string()
		.min(1, "Name ist erforderlich")
		.max(100, "Name ist zu lang"),

	senderLocation: z
		.string()
		.min(1, "Ort ist erforderlich")
		.max(100, "Ort ist zu lang"),

	personalConnection: z
		.string()
		.min(1, "Bitte teile deine persönliche Verbindung")
		.max(2000, "Bitte kürze deine Beschreibung (max. 2000 Zeichen)"),

	concreteDetail: z
		.string()
		.max(500, "Bitte kürze das Detail (max. 500 Zeichen)")
		.optional()
		.or(z.literal("")),

	communityConnection: z
		.string()
		.max(500, "Bitte kürze die Beschreibung (max. 500 Zeichen)")
		.optional()
		.or(z.literal("")),

	urgencyReason: z
		.string()
		.max(300, "Bitte kürze die Begründung (max. 300 Zeichen)")
		.optional()
		.or(z.literal("")),

	targetAudience: z.enum(
		["friends", "colleagues", "community", "general-public"],
		{ message: "Bitte wähle eine Zielgruppe" },
	),

	tone: z.enum(["calm-factual", "emotional-serious"], {
		message: "Bitte wähle einen Ton",
	}),

	verifiableAnchor: z
		.string()
		.max(300, "Bitte kürze den Anker (max. 300 Zeichen)")
		.optional(),

	selectedHelpActions: z
		.array(z.enum(HELP_ACTION_CATEGORIES as unknown as [string, ...string[]]))
		.length(3, "Bitte wähle genau 3 Hilfsoptionen"),
});

export type LetterInputSchema = z.infer<typeof letterInputSchema>;
