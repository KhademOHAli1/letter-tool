/**
 * Translation strings for German and English.
 * All UI text should come from here to support internationalization.
 */

export type Language = "de" | "en";

export const translations = {
	// ===== Common =====
	common: {
		back: { de: "Zurück", en: "Back" },
		next: { de: "Weiter", en: "Next" },
		loading: { de: "Laden...", en: "Loading..." },
		error: { de: "Fehler", en: "Error" },
		retry: { de: "Erneut versuchen", en: "Try again" },
		copy: { de: "Kopieren", en: "Copy" },
		copied: { de: "Kopiert!", en: "Copied!" },
		share: { de: "Teilen", en: "Share" },
		send: { de: "Senden", en: "Send" },
		words: { de: "Wörter", en: "words" },
	},

	// ===== Home Page =====
	home: {
		title: {
			de: "Brief an deine*n Abgeordnete*n",
			en: "Letter to Your MP",
		},
		subtitle: {
			de: "In 5 Minuten einen persönlichen Brief schreiben - für Menschenrechte im Iran",
			en: "Write a personal letter in 5 minutes - for human rights in Iran",
		},
		whyTitle: {
			de: "Warum Briefe an Abgeordnete?",
			en: "Why Write to MPs?",
		},
		whyText: {
			de: "Bundestagsabgeordnete zählen Nachrichten aus ihrem Wahlkreis. Persönliche Briefe haben nachweislich Einfluss auf politische Entscheidungen. Je mehr Menschen schreiben, desto lauter wird die Stimme für Menschenrechte.",
			en: "Members of Parliament count messages from their constituency. Personal letters have proven influence on political decisions. The more people write, the louder the voice for human rights becomes.",
		},
	},

	// ===== Form Steps =====
	form: {
		// Step 1: Personal Info
		step1: {
			title: { de: "Deine Angaben", en: "Your Information" },
			whyTitle: { de: "Warum brauchen wir das?", en: "Why do we need this?" },
			whyText: {
				de: "Abgeordnete antworten nur auf Briefe von Menschen aus ihrem Wahlkreis. Mit deiner PLZ finden wir deine*n zuständige*n Abgeordnete*n. Dein Name macht den Brief persönlich und glaubwürdig.",
				en: "MPs only respond to letters from people in their constituency. With your postal code, we find your responsible MP. Your name makes the letter personal and credible.",
			},
			nameLabel: { de: "Dein Name", en: "Your Name" },
			namePlaceholder: { de: "Vorname Nachname", en: "First Last Name" },
			plzLabel: { de: "Deine Postleitzahl", en: "Your Postal Code" },
			plzPlaceholder: { de: "z.B. 10115", en: "e.g. 10115" },
			wahlkreisFound: {
				de: "Wahlkreis gefunden",
				en: "Constituency found",
			},
			wahlkreisNotFound: {
				de: "Kein Wahlkreis gefunden",
				en: "No constituency found",
			},
		},

		// Step 2: Select MP
		step2: {
			title: { de: "Dein*e Abgeordnete*r", en: "Your MP" },
			whyTitle: { de: "Warum wichtig?", en: "Why is this important?" },
			whyText: {
				de: "Jeder Wahlkreis hat eine*n direkt gewählte*n Abgeordnete*n. Diese Person vertritt die Menschen in deinem Wahlkreis im Bundestag. Ein Brief aus dem Wahlkreis hat besonderes Gewicht.",
				en: "Each constituency has a directly elected MP. This person represents the people in your constituency in Parliament. A letter from the constituency carries special weight.",
			},
			selectLabel: { de: "Wähle deine*n Abgeordnete*n", en: "Select your MP" },
			selectPlaceholder: {
				de: "Abgeordnete*n auswählen...",
				en: "Select MP...",
			},
			enterPlzFirst: {
				de: "Bitte gib zuerst deine PLZ ein",
				en: "Please enter your postal code first",
			},
		},

		// Step 3: Personal Story
		step3: {
			title: { de: "Deine Geschichte", en: "Your Story" },
			whyTitle: { de: "Warum deine Geschichte?", en: "Why your story?" },
			whyText: {
				de: "Persönliche Geschichten bewegen mehr als Statistiken. Abgeordnete erhalten täglich Dutzende E-Mails - aber echte, emotionale Geschichten von echten Menschen bleiben im Gedächtnis. Deine Verbindung zum Iran macht den Brief einzigartig und authentisch.",
				en: "Personal stories move more than statistics. MPs receive dozens of emails daily - but real, emotional stories from real people stay in memory. Your connection to Iran makes the letter unique and authentic.",
			},
			label: { de: "Deine Geschichte", en: "Your Story" },
			placeholder: {
				de: "z.B. Als Deutsch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden. Die Menschenrechtslage macht mir große Sorgen und ich möchte, dass Deutschland sich stärker einsetzt.",
				en: "e.g. As a German-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want Germany to take a stronger stance.",
			},
			hint: {
				de: "Mindestens 3 Sätze. Details machen deinen Brief authentisch: Konkrete Erlebnisse, Namen, Orte, Gefühle.",
				en: "At least 3 sentences. Details make your letter authentic: specific experiences, names, places, feelings.",
			},
			languageHint: {
				de: "Du kannst auf Deutsch, Englisch oder Farsi schreiben - wir übersetzen es für den Brief.",
				en: "You can write in German, English or Farsi - we'll translate it for the letter.",
			},
			validation: {
				empty: {
					de: "Bitte erzähle deine Geschichte",
					en: "Please tell your story",
				},
				tooFewSentences: {
					de: "Bitte schreibe mindestens 3 Sätze (aktuell: {count})",
					en: "Please write at least 3 sentences (currently: {count})",
				},
				sentenceTooShort: {
					de: "Satz {num} ist zu kurz (mindestens 4 Wörter pro Satz)",
					en: "Sentence {num} is too short (at least 4 words per sentence)",
				},
			},
		},

		// Step 4: Demands
		step4: {
			title: { de: "Forderungen", en: "Demands" },
			whyTitle: {
				de: "Warum konkrete Forderungen?",
				en: "Why specific demands?",
			},
			whyText: {
				de: "Politiker*innen können nur handeln, wenn sie wissen, was du von ihnen erwartest. Konkrete Forderungen geben deinem Brief Richtung und machen es dem*der Abgeordneten leicht, aktiv zu werden.",
				en: "Politicians can only act when they know what you expect from them. Specific demands give your letter direction and make it easy for the MP to take action.",
			},
			hint: {
				de: "Wähle die Forderungen, die dir am wichtigsten sind. Je weniger, desto fokussierter dein Brief.",
				en: "Choose the demands that matter most to you. The fewer, the more focused your letter.",
			},
		},

		// Consent
		consent: {
			label: {
				de: "Ich habe die Datenschutzhinweise gelesen und stimme zu, dass meine Daten zur Erstellung des Briefs verarbeitet werden.",
				en: "I have read the privacy notice and agree that my data will be processed to create the letter.",
			},
		},

		// Submit button
		submit: {
			generating: { de: "Brief wird erstellt...", en: "Creating letter..." },
			default: { de: "Brief erstellen", en: "Create Letter" },
		},
	},

	// ===== Editor Page =====
	editor: {
		titleGenerating: {
			de: "Brief wird geschrieben...",
			en: "Writing your letter...",
		},
		titleReady: { de: "Dein Brief ist fertig", en: "Your letter is ready" },
		subtitleGenerating: {
			de: "Der Brief erscheint gleich - du kannst ihn dann noch bearbeiten.",
			en: "The letter will appear shortly - you can then edit it.",
		},
		subtitleReady: {
			de: "Prüfe und bearbeite deinen Brief, bevor du ihn sendest.",
			en: "Review and edit your letter before sending it.",
		},
		subjectLabel: { de: "Betreff", en: "Subject" },
		contentLabel: { de: "Dein Brief", en: "Your Letter" },
		senderLabel: { de: "Absender", en: "Sender" },
		modified: { de: "Bearbeitet", en: "Modified" },
		writing: { de: "Wird geschrieben...", en: "Writing..." },
		wordStatus: {
			tooShort: { de: "Etwas kurz", en: "A bit short" },
			optimal: { de: "Optimal", en: "Optimal" },
			tooLong: { de: "Etwas lang", en: "A bit long" },
			wayTooLong: { de: "Zu lang", en: "Too long" },
		},
		sendButton: {
			de: "E-Mail-Programm öffnen",
			en: "Open Email Client",
		},
		copyButton: { de: "Brief kopieren", en: "Copy Letter" },
		hint: {
			de: "Der Brief wird in deinem E-Mail-Programm geöffnet. Dort kannst du ihn vor dem Senden nochmal prüfen.",
			en: "The letter will open in your email client. You can review it there before sending.",
		},
		errorTitle: {
			de: "Fehler beim Generieren",
			en: "Error generating letter",
		},
	},

	// ===== Success Page =====
	success: {
		title: { de: "Vielen Dank!", en: "Thank You!" },
		subtitle: {
			de: "Dein Brief wurde gesendet.",
			en: "Your letter has been sent.",
		},
		shareTitle: { de: "Teile die Aktion", en: "Share the Action" },
		shareText: {
			de: "Jeder weitere Brief erhöht den Druck. Teile das Tool mit Freunden und Familie.",
			en: "Every additional letter increases the pressure. Share the tool with friends and family.",
		},
		whatsNext: { de: "Was passiert jetzt?", en: "What happens next?" },
		whatsNextSteps: {
			de: [
				"Dein Brief landet im Posteingang des*der Abgeordneten",
				"Mitarbeiter*innen lesen und kategorisieren eingehende Post",
				"Bei vielen Briefen zum gleichen Thema wird es zur Priorität",
				"Der*die Abgeordnete kann im Plenum oder in Ausschüssen handeln",
				"Teile dieses Tool mit Freund*innen – jede Stimme zählt!",
			],
			en: [
				"Your letter arrives in the MP's inbox",
				"Staff read and categorize incoming mail",
				"With many letters on the same topic, it becomes a priority",
				"The MP can act in plenary sessions or committees",
				"Share this tool with friends – every voice counts!",
			],
		},
		newLetter: { de: "Neuen Brief schreiben", en: "Write Another Letter" },

		// Multi-MP feature
		moreMps: {
			title: {
				de: "Noch mehr Wirkung?",
				en: "Want more impact?",
			},
			subtitle: {
				de: "Weitere Abgeordnete in deinem Wahlkreis",
				en: "More MPs in your constituency",
			},
			description: {
				de: "Dein Wahlkreis hat mehrere Abgeordnete. Mit einem Klick kannst du deinen Brief anpassen und an weitere senden.",
				en: "Your constituency has multiple MPs. With one click you can adapt your letter and send it to more.",
			},
			reuseButton: {
				de: "Brief anpassen für",
				en: "Adapt letter for",
			},
			allDone: {
				de: "Du hast alle Abgeordneten in deinem Wahlkreis erreicht! 🎉",
				en: "You've reached all MPs in your constituency! 🎉",
			},
			newLetterHint: {
				de: "Möchtest du einen neuen Brief schreiben? Dein bisheriger Text wird als Vorlage verwendet.",
				en: "Want to write a new letter? Your previous text will be used as a template.",
			},
			reuseExisting: {
				de: "Vorlage verwenden",
				en: "Use template",
			},
			startFresh: {
				de: "Neu beginnen",
				en: "Start fresh",
			},
			adapting: {
				de: "Brief wird angepasst...",
				en: "Adapting letter...",
			},
			adapted: {
				de: "Brief angepasst für {name}",
				en: "Letter adapted for {name}",
			},
			emailed: {
				de: "✓ Bereits kontaktiert",
				en: "✓ Already contacted",
			},
		},
	},

	// ===== Share Message =====
	shareMessage: {
		de: `Ich habe gerade einen Brief an meine*n Bundestagsabgeordnete*n geschrieben - für Menschenrechte im Iran.

Warum das wichtig ist: Abgeordnete zählen Briefe aus ihrem Wahlkreis. Persönliche Nachrichten haben echten Einfluss auf politische Entscheidungen. Je mehr Menschen schreiben, desto lauter wird unsere Stimme.

Du kannst in 5 Minuten auch einen Brief schreiben - das Tool hilft dir dabei:`,
		en: `I just wrote a letter to my Member of Parliament - for human rights in Iran.

Why it matters: MPs count letters from their constituency. Personal messages have real influence on political decisions. The more people write, the louder our voice becomes.

You can also write a letter in 5 minutes - the tool helps you:`,
	},

	// ===== Language Names =====
	languages: {
		de: { de: "Deutsch", en: "German" },
		en: { de: "Englisch", en: "English" },
	},
} as const;

// Helper type for accessing translations
export type TranslationKey = keyof typeof translations;

// Get a translation value
export function t(
	section: keyof typeof translations,
	key: string,
	lang: Language,
	replacements?: Record<string, string | number>,
): string {
	// biome-ignore lint/suspicious/noExplicitAny: dynamic access
	const sectionData = translations[section] as any;
	if (!sectionData) return key;

	// Handle direct translations (like shareMessage which is { de: "...", en: "..." })
	if (key === "" && sectionData[lang]) {
		return sectionData[lang] as string;
	}

	const keyParts = key.split(".");
	let value = sectionData;

	for (const part of keyParts) {
		if (!value[part]) return key;
		value = value[part];
	}

	if (typeof value === "object" && value[lang]) {
		const result = value[lang];

		// Handle replacements like {count}, {num}
		if (replacements && typeof result === "string") {
			let replaced = result;
			for (const [placeholder, replacement] of Object.entries(replacements)) {
				replaced = replaced.replace(`{${placeholder}}`, String(replacement));
			}
			return replaced;
		}

		return typeof result === "string" ? result : key;
	}

	return key;
}

// Get array translation (for lists like "what happens next" steps)
export function tArray(
	section: keyof typeof translations,
	key: string,
	lang: Language,
): string[] {
	// biome-ignore lint/suspicious/noExplicitAny: dynamic access
	const sectionData = translations[section] as any;
	if (!sectionData) return [];

	const keyParts = key.split(".");
	let value = sectionData;

	for (const part of keyParts) {
		if (!value[part]) return [];
		value = value[part];
	}

	if (typeof value === "object" && value[lang]) {
		const result = value[lang];
		return Array.isArray(result) ? result : [];
	}

	return [];
}
