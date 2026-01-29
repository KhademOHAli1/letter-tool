/**
 * Translation strings for German, English, French, and Spanish.
 * All UI text should come from here to support internationalization.
 */

export type Language = "de" | "en" | "fr" | "es";

export const translations = {
	// ===== SEO / Metadata =====
	seo: {
		titleDE: {
			de: "Stimme für Iran | Schreib deinem MdB",
			en: "Voice for Iran | Write to Your MP",
			fr: "Voix pour l'Iran | Écrivez à votre député",
		},
		titleCA: {
			de: "Stimme für Iran | Kanada",
			en: "Voice for Iran | Write to Your MP",
			fr: "Voix pour l'Iran | Écrivez à votre député(e)",
		},
		titleUK: {
			de: "Stimme für Iran | Großbritannien",
			en: "Voice for Iran | Write to Your MP",
			fr: "Voix pour l'Iran | Royaume-Uni",
		},
		titleFR: {
			de: "Stimme für Iran | Frankreich",
			en: "Voice for Iran | France",
			fr: "Voix pour l'Iran | Écrivez à votre député(e)",
		},
		titleUS: {
			de: "Stimme für Iran | USA",
			en: "Voice for Iran | Write to Congress",
			fr: "Voix pour l'Iran | États-Unis",
			es: "Voz por Irán | Escribe al Congreso",
		},
		descriptionDE: {
			de: "Setze dich für Menschenrechte im Iran ein. Schreibe einen persönlichen Brief an deinen Bundestagsabgeordneten – schnell, einfach und wirkungsvoll.",
			en: "Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			fr: "Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député – rapide, simple et efficace.",
		},
		descriptionCA: {
			de: "Setze dich für Menschenrechte im Iran ein. Schreibe deinem kanadischen Abgeordneten.",
			en: "Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			fr: "Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député(e) – rapide, simple et efficace.",
		},
		descriptionUK: {
			de: "Setze dich für Menschenrechte im Iran ein. Schreibe deinem britischen Abgeordneten.",
			en: "Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			fr: "Défendez les droits humains en Iran. Écrivez à votre député britannique.",
		},
		descriptionFR: {
			de: "Setze dich für Menschenrechte im Iran ein. Schreibe deinem französischen Abgeordneten.",
			en: "Advocate for human rights in Iran. Write a personal letter to your Member of Parliament – quick, easy and effective.",
			fr: "Défendez les droits humains en Iran. Écrivez une lettre personnelle à votre député(e) – rapide, simple et efficace.",
		},
		descriptionUS: {
			de: "Setze dich für Menschenrechte im Iran ein. Schreibe deinem US-Kongressabgeordneten oder Senator.",
			en: "Advocate for human rights in Iran. Write a personal letter to your Representative or Senator – quick, easy and effective.",
			fr: "Défendez les droits humains en Iran. Écrivez à votre représentant au Congrès américain.",
			es: "Defiende los derechos humanos en Irán. Escribe una carta personal a tu Representante o Senador – rápido, fácil y efectivo.",
		},
		ogAltDE: {
			de: "Stimme für Iran - Schreib deinem Bundestagsabgeordneten",
			en: "Voice for Iran - Write to Your MP",
			fr: "Voix pour l'Iran - Écrivez à votre député",
		},
		ogAltCA: {
			de: "Stimme für Iran - Kanada",
			en: "Voice for Iran - Write to Your Canadian MP",
			fr: "Voix pour l'Iran - Écrivez à votre député(e) canadien(ne)",
		},
		ogAltUK: {
			de: "Stimme für Iran - Großbritannien",
			en: "Voice for Iran - Write to Your UK MP",
			fr: "Voix pour l'Iran - Royaume-Uni",
		},
		ogAltFR: {
			de: "Stimme für Iran - Frankreich",
			en: "Voice for Iran - France",
			fr: "Voix pour l'Iran - Écrivez à votre député(e)",
		},
		ogAltUS: {
			de: "Stimme für Iran - USA",
			en: "Voice for Iran - Write to Congress",
			fr: "Voix pour l'Iran - États-Unis",
			es: "Voz por Irán - Escribe al Congreso",
		},
	},

	// ===== Common =====
	common: {
		back: { de: "Zurück", en: "Back", fr: "Retour", es: "Atrás" },
		next: { de: "Weiter", en: "Next", fr: "Suivant", es: "Siguiente" },
		loading: {
			de: "Laden...",
			en: "Loading...",
			fr: "Chargement...",
			es: "Cargando...",
		},
		error: { de: "Fehler", en: "Error", fr: "Erreur", es: "Error" },
		retry: {
			de: "Erneut versuchen",
			en: "Try again",
			fr: "Réessayer",
			es: "Intentar de nuevo",
		},
		copy: { de: "Kopieren", en: "Copy", fr: "Copier", es: "Copiar" },
		copied: { de: "Kopiert!", en: "Copied!", fr: "Copié !", es: "¡Copiado!" },
		share: { de: "Teilen", en: "Share", fr: "Partager", es: "Compartir" },
		send: { de: "Senden", en: "Send", fr: "Envoyer", es: "Enviar" },
		words: { de: "Wörter", en: "words", fr: "mots", es: "palabras" },
	},

	// ===== Home Page =====
	home: {
		title: {
			de: "Brief an deine*n Abgeordnete*n",
			en: "Letter to Your MP",
			fr: "Lettre à votre député(e)",
			es: "Carta a tu Representante",
		},
		subtitle: {
			de: "In 5 Minuten einen persönlichen Brief schreiben - für Menschenrechte im Iran",
			en: "Write a personal letter in 5 minutes - for human rights in Iran",
			fr: "Écrivez une lettre personnelle en 5 minutes - pour les droits humains en Iran",
			es: "Escribe una carta personal en 5 minutos - por los derechos humanos en Irán",
		},
		whyTitle: {
			de: "Warum Briefe an Abgeordnete?",
			en: "Why Write to MPs?",
			fr: "Pourquoi écrire aux député(e)s ?",
			es: "¿Por qué escribir a los Representantes?",
		},
		whyText: {
			de: "Bundestagsabgeordnete zählen Nachrichten aus ihrem Wahlkreis. Persönliche Briefe haben nachweislich Einfluss auf politische Entscheidungen. Je mehr Menschen schreiben, desto lauter wird die Stimme für Menschenrechte.",
			en: "Members of Parliament count messages from their constituency. Personal letters have proven influence on political decisions. The more people write, the louder the voice for human rights becomes.",
			fr: "Les député(e)s comptent les messages de leur circonscription. Les lettres personnelles ont une influence prouvée sur les décisions politiques. Plus les gens écrivent, plus la voix pour les droits humains se fait entendre.",
			es: "Los miembros del Congreso cuentan los mensajes de sus distritos. Las cartas personales tienen una influencia comprobada en las decisiones políticas. Cuantas más personas escriban, más fuerte será la voz por los derechos humanos.",
		},
	},

	// ===== Form Steps =====
	form: {
		// Step 1: Name only
		step1: {
			title: {
				de: "Dein Name",
				en: "Your Name",
				fr: "Votre nom",
				es: "Tu nombre",
			},
			whyTitle: {
				de: "Warum brauchen wir das?",
				en: "Why do we need this?",
				fr: "Pourquoi avons-nous besoin de cela ?",
				es: "¿Por qué necesitamos esto?",
			},
			whyText: {
				de: "Dein Name macht den Brief persönlich und glaubwürdig. Abgeordnete nehmen Briefe von echten Menschen ernst. Dein Name wird nur für den Brief verwendet und nicht auf unseren Servern gespeichert.",
				en: "Your name makes the letter personal and credible. MPs take letters from real people seriously. Your name is only used for the letter and is not stored on our servers.",
				fr: "Votre nom rend la lettre personnelle et crédible. Les député(e)s prennent au sérieux les lettres de vraies personnes. Votre nom n'est utilisé que pour la lettre et n'est pas stocké sur nos serveurs.",
			},
			nameLabel: {
				de: "Dein Name",
				en: "Your Name",
				fr: "Votre nom",
				es: "Tu nombre",
			},
			namePlaceholder: {
				de: "Vorname Nachname",
				en: "First Last Name",
				fr: "Prénom Nom",
				es: "Nombre Apellido",
			},
		},

		// Step 2: Postal Code & MP Selection
		step2: {
			title: {
				de: "Dein*e Abgeordnete*r",
				en: "Your MP",
				fr: "Votre député(e)",
				es: "Tu representante",
			},
			whyTitle: {
				de: "Warum brauchen wir das?",
				en: "Why do we need this?",
				fr: "Pourquoi avons-nous besoin de cela ?",
				es: "¿Por qué necesitamos esto?",
			},
			whyText: {
				de: "Abgeordnete antworten nur auf Briefe aus ihrem Wahlkreis. Mit deiner PLZ finden wir deine*n zuständige*n Abgeordnete*n. Deine PLZ wird nur lokal im Browser verarbeitet und nicht an unsere Server gesendet.",
				en: "MPs only respond to letters from their constituency. With your postal code, we find your responsible MP. Your postal code is processed locally in your browser and is not sent to our servers.",
				fr: "Les député(e)s ne répondent qu'aux lettres de leur circonscription. Avec votre code postal, nous trouvons votre député(e) responsable. Votre code postal est traité localement dans votre navigateur et n'est pas envoyé à nos serveurs.",
			},
			plzLabel: {
				de: "Deine Postleitzahl",
				en: "Your Postal Code",
				fr: "Votre code postal",
				es: "Tu código postal",
			},
			plzPlaceholder: {
				de: "z.B. 10115",
				en: "e.g. 10115",
				fr: "ex. H2X 1Y4",
				es: "ej. 90210",
			},
			wahlkreisFound: {
				de: "Wahlkreis gefunden",
				en: "Constituency found",
				fr: "Circonscription trouvée",
				es: "Distrito encontrado",
			},
			wahlkreisNotFound: {
				de: "Kein Wahlkreis gefunden",
				en: "No constituency found",
				fr: "Aucune circonscription trouvée",
				es: "No se encontró distrito",
			},
			selectLabel: {
				de: "Wähle deine*n Abgeordnete*n",
				en: "Select your MP",
				fr: "Sélectionnez votre député(e)",
				es: "Selecciona tu representante",
			},
			selectPlaceholder: {
				de: "Abgeordnete*n auswählen...",
				en: "Select MP...",
				fr: "Sélectionner un(e) député(e)...",
				es: "Seleccionar representante...",
			},
		},

		// Step 3: Personal Story
		step3: {
			title: {
				de: "Deine Geschichte",
				en: "Your Story",
				fr: "Votre histoire",
				es: "Tu historia",
			},
			whyTitle: {
				de: "Warum brauchen wir das?",
				en: "Why do we need this?",
				fr: "Pourquoi avons-nous besoin de cela ?",
			},
			whyText: {
				de: "Persönliche Geschichten bewegen mehr als Statistiken. Abgeordnete erhalten täglich Dutzende E-Mails - aber echte Geschichten von echten Menschen bleiben im Gedächtnis. Deine Geschichte wird nur für die Briefgenerierung verwendet und nicht gespeichert.",
				en: "Personal stories move more than statistics. MPs receive dozens of emails daily - but real stories from real people stay in memory. Your story is only used to generate the letter and is not stored.",
				fr: "Les histoires personnelles touchent plus que les statistiques. Les député(e)s reçoivent des dizaines de courriels chaque jour - mais les vraies histoires de vraies personnes restent en mémoire. Votre histoire n'est utilisée que pour générer la lettre et n'est pas stockée.",
			},
			label: { de: "Deine Geschichte", en: "Your Story", fr: "Votre histoire" },
			placeholder: {
				de: "z.B. Als Deutsch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden. Die Menschenrechtslage macht mir große Sorgen und ich möchte, dass Deutschland sich stärker einsetzt.",
				en: "e.g. As a German-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want Germany to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Canadien(ne), je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation. La situation des droits humains me préoccupe profondément et je veux que le Canada prenne une position plus forte.",
			},
			// Country-specific placeholders
			placeholderDE: {
				de: "z.B. Als Deutsch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden. Die Menschenrechtslage macht mir große Sorgen und ich möchte, dass Deutschland sich stärker einsetzt.",
				en: "e.g. As a German-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want Germany to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Allemand(e), je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation. La situation des droits humains me préoccupe profondément.",
			},
			placeholderCA: {
				de: "z.B. Als Kanadisch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden. Ich möchte, dass Kanada sich stärker für Menschenrechte einsetzt.",
				en: "e.g. As a Canadian-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want Canada to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Canadien(ne), je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation. La situation des droits humains me préoccupe profondément et je veux que le Canada prenne une position plus forte.",
			},
			placeholderUK: {
				de: "z.B. Als Britisch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden.",
				en: "e.g. As a British-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want the UK to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Britannique, je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation.",
			},
			placeholderFR: {
				de: "z.B. Als Französisch-Iranerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden.",
				en: "e.g. As a French-Iranian, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want France to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Français(e), je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation. La situation des droits humains me préoccupe profondément et je veux que la France prenne une position plus forte.",
			},
			placeholderUS: {
				de: "z.B. Als Iranisch-Amerikanerin verfolge ich die Nachrichten aus dem Iran jeden Tag. Ich habe Freunde und Familie dort, die unter der Situation leiden.",
				en: "e.g. As an Iranian-American, I follow the news from Iran every day. I have friends and family there who are suffering under the situation. The human rights situation deeply concerns me and I want the United States to take a stronger stance.",
				fr: "ex. En tant qu'Irano-Américain(e), je suis les nouvelles de l'Iran chaque jour. J'ai des amis et de la famille là-bas qui souffrent de la situation.",
				es: "p.ej. Como irano-estadounidense, sigo las noticias de Irán todos los días. Tengo amigos y familiares allí que sufren bajo la situación. La situación de los derechos humanos me preocupa profundamente y quiero que Estados Unidos tome una posición más fuerte.",
			},
			hint: {
				de: "Details machen deinen Brief authentisch: Konkrete Erlebnisse, Namen, Orte, Gefühle.",
				en: "Details make your letter authentic: specific experiences, names, places, feelings.",
				fr: "Les détails rendent votre lettre authentique : expériences concrètes, noms, lieux, sentiments.",
			},
			languageHint: {
				de: "Du kannst auf Deutsch, Englisch oder Farsi schreiben - wir übersetzen es für den Brief.",
				en: "You can write in English or Farsi - we'll translate it for the letter.",
				fr: "Vous pouvez écrire en français, anglais ou farsi - nous traduirons pour la lettre.",
				es: "Puedes escribir en inglés, español o farsi - lo traduciremos para la carta.",
			},
			languageHintDE: {
				de: "Du kannst auf Deutsch, Englisch oder Farsi schreiben - wir übersetzen es für den Brief.",
				en: "You can write in German, English or Farsi - we'll translate it for the letter.",
				fr: "Vous pouvez écrire en allemand, anglais ou farsi - nous traduirons pour la lettre.",
				es: "Puedes escribir en alemán, inglés o farsi - lo traduciremos para la carta.",
			},
			languageHintUS: {
				de: "Du kannst auf Englisch, Spanisch oder Farsi schreiben - wir übersetzen es für den Brief.",
				en: "You can write in English, Spanish or Farsi - we'll translate it for the letter.",
				fr: "Vous pouvez écrire en anglais, espagnol ou farsi - nous traduirons pour la lettre.",
				es: "Puedes escribir en inglés, español o farsi - lo traduciremos para la carta.",
			},
			languageHintFR: {
				de: "Du kannst auf Französisch, Englisch oder Farsi schreiben - wir übersetzen es für den Brief.",
				en: "You can write in French, English or Farsi - we'll translate it for the letter.",
				fr: "Vous pouvez écrire en français, anglais ou farsi - nous traduirons pour la lettre.",
				es: "Puedes escribir en francés, inglés o farsi - lo traduciremos para la carta.",
			},
			validation: {
				empty: {
					de: "Bitte erzähle deine Geschichte",
					en: "Please tell your story",
					fr: "Veuillez raconter votre histoire",
				},
			},
		},

		// Step 4: Demands
		step4: {
			title: {
				de: "Forderungen",
				en: "Demands",
				fr: "Demandes",
				es: "Demandas",
			},
			whyTitle: {
				de: "Warum brauchen wir das?",
				en: "Why do we need this?",
				fr: "Pourquoi avons-nous besoin de cela ?",
			},
			whyText: {
				de: "Konkrete Forderungen geben deinem Brief Richtung und machen es dem*der Abgeordneten leicht, aktiv zu werden. Politiker*innen können nur handeln, wenn sie wissen, was du von ihnen erwartest.",
				en: "Specific demands give your letter direction and make it easy for the MP to take action. Politicians can only act when they know what you expect from them.",
				fr: "Des demandes spécifiques donnent une direction à votre lettre et permettent au/à la député(e) d'agir facilement. Les politicien(ne)s ne peuvent agir que lorsqu'ils/elles savent ce que vous attendez d'eux/elles.",
			},
			hint: {
				de: "Wähle die Forderungen, die dir am wichtigsten sind. Je weniger, desto fokussierter dein Brief.",
				en: "Choose the demands that matter most to you. The fewer, the more focused your letter.",
				fr: "Choisissez les demandes qui comptent le plus pour vous. Moins il y en a, plus votre lettre sera ciblée.",
			},
		},

		// Consent
		consent: {
			label: {
				de: "Ich habe die Datenschutzhinweise gelesen und stimme zu, dass meine Daten zur Erstellung des Briefs verarbeitet werden.",
				en: "I have read the privacy notice and agree that my data will be processed to create the letter.",
				fr: "J'ai lu l'avis de confidentialité et j'accepte que mes données soient traitées pour créer la lettre.",
			},
		},

		// Submit button
		submit: {
			generating: {
				de: "Brief wird erstellt...",
				en: "Creating letter...",
				fr: "Création de la lettre...",
				es: "Creando carta...",
			},
			default: {
				de: "Brief erstellen",
				en: "Create Letter",
				fr: "Créer la lettre",
				es: "Crear carta",
			},
		},

		// Privacy/data notice
		dataNotice: {
			de: "Deine Daten werden nicht gespeichert – nur für deinen Brief verwendet.",
			en: "Your data is not stored – only used to create your letter.",
			fr: "Vos données ne sont pas stockées – elles sont uniquement utilisées pour créer votre lettre.",
		},

		// Draft restoration
		draft: {
			found: {
				de: "Du hast einen unvollständigen Entwurf",
				en: "You have an unfinished draft",
				fr: "Vous avez un brouillon inachevé",
			},
			dismiss: { de: "Verwerfen", en: "Dismiss", fr: "Ignorer" },
			restore: { de: "Wiederherstellen", en: "Restore", fr: "Restaurer" },
		},

		// Consent title
		consentTitle: {
			de: "Einwilligung zur Datenverarbeitung",
			en: "Consent to Data Processing",
			fr: "Consentement au traitement des données",
		},

		// No account hint
		noAccount: {
			de: "Kein Account nötig. Keine Datenbank. Dein Brief wird lokal generiert und direkt an dich übergeben.",
			en: "No account needed. No database. Your letter is generated locally and handed directly to you.",
			fr: "Aucun compte requis. Pas de base de données. Votre lettre est générée localement et vous est remise directement.",
		},
	},

	// ===== Header/Banner =====
	header: {
		badge: {
			de: "Deine Stimme zählt",
			en: "Your Voice Matters",
			fr: "Votre voix compte",
		},
		writeToPrefix: {
			de: "Schreib deinem",
			en: "Write to Your",
			fr: "Écrivez à votre",
		},
		subheading: {
			de: "Ein persönlicher Brief kann mehr bewirken als tausend Tweets. Fordere deine Abgeordneten auf, sich für Menschenrechte im Iran einzusetzen.",
			en: "A personal letter can achieve more than a thousand tweets. Ask your representative to stand up for human rights in Iran.",
			fr: "Une lettre personnelle peut accomplir plus que mille tweets. Demandez à votre représentant(e) de défendre les droits humains en Iran.",
		},
	},

	// ===== Footer =====
	footer: {
		openaiNotice: {
			de: "Der generierte Brief wird nicht auf unseren Servern gespeichert. Zur Generierung werden deine Eingaben an OpenAI übermittelt.",
			en: "The generated letter is not stored on our servers. Your inputs are sent to OpenAI for generation.",
			fr: "La lettre générée n'est pas stockée sur nos serveurs. Vos données sont envoyées à OpenAI pour la génération.",
		},
		impressum: {
			de: "Impressum",
			en: "Legal Notice",
			fr: "Mentions légales",
		},
		privacy: {
			de: "Datenschutz",
			en: "Privacy Policy",
			fr: "Politique de confidentialité",
		},
	},

	// ===== Letter History =====
	letterHistory: {
		title: { de: "Deine Briefe", en: "Your Letters", fr: "Vos lettres" },
		sent: { de: "gesendet", en: "sent", fr: "envoyée(s)" },
		pending: { de: "ausstehend", en: "pending", fr: "en attente" },
		clearAll: { de: "Alle löschen", en: "Clear all", fr: "Tout supprimer" },
		letterSingular: { de: "Brief", en: "letter", fr: "lettre" },
		letterPlural: { de: "Briefe", en: "letters", fr: "lettres" },
		showLess: { de: "Weniger anzeigen", en: "Show less", fr: "Afficher moins" },
		showMore: { de: "weitere anzeigen", en: "more", fr: "autres" },
		to: { de: "An", en: "To", fr: "À" },
		resume: { de: "Fortsetzen", en: "Resume", fr: "Reprendre" },
		delete: { de: "Löschen", en: "Delete", fr: "Supprimer" },
	},

	// ===== Editor Page =====
	editor: {
		titleGenerating: {
			de: "Brief wird geschrieben...",
			en: "Writing your letter...",
			fr: "Rédaction de votre lettre...",
			es: "Escribiendo tu carta...",
		},
		titleReady: {
			de: "Dein Brief ist fertig",
			en: "Your letter is ready",
			fr: "Votre lettre est prête",
			es: "Tu carta está lista",
		},
		subtitleGenerating: {
			de: "Der Brief erscheint gleich - du kannst ihn dann noch bearbeiten.",
			en: "The letter will appear shortly - you can then edit it.",
			fr: "La lettre apparaîtra sous peu - vous pourrez ensuite la modifier.",
		},
		subtitleReady: {
			de: "Prüfe und bearbeite deinen Brief, bevor du ihn sendest.",
			en: "Review and edit your letter before sending it.",
			fr: "Révisez et modifiez votre lettre avant de l'envoyer.",
		},
		subjectLabel: { de: "Betreff", en: "Subject", fr: "Objet", es: "Asunto" },
		contentLabel: {
			de: "Dein Brief",
			en: "Your Letter",
			fr: "Votre lettre",
			es: "Tu carta",
		},
		senderLabel: {
			de: "Absender",
			en: "Sender",
			fr: "Expéditeur",
			es: "Remitente",
		},
		modified: { de: "Bearbeitet", en: "Modified", fr: "Modifié" },
		writing: {
			de: "Wird geschrieben...",
			en: "Writing...",
			fr: "Rédaction...",
		},
		wordStatus: {
			tooShort: { de: "Etwas kurz", en: "A bit short", fr: "Un peu court" },
			optimal: { de: "Optimal", en: "Optimal", fr: "Optimal" },
			tooLong: { de: "Etwas lang", en: "A bit long", fr: "Un peu long" },
			wayTooLong: { de: "Zu lang", en: "Too long", fr: "Trop long" },
		},
		sendButton: {
			de: "Weiter zum Senden",
			en: "Ready to Send",
			fr: "Prêt à envoyer",
			es: "Listo para enviar",
		},
		copyButton: {
			de: "Brief kopieren",
			en: "Copy Letter",
			fr: "Copier la lettre",
		},
		downloadPdf: {
			de: "Als PDF herunterladen",
			en: "Download as PDF",
			fr: "Télécharger en PDF",
		},
		downloading: {
			de: "Wird erstellt...",
			en: "Generating...",
			fr: "Génération...",
		},
		hint: {
			de: "Der Brief wird in deinem E-Mail-Programm geöffnet. Dort kannst du ihn vor dem Senden nochmal prüfen.",
			en: "The letter will open in your email client. You can review it there before sending.",
			fr: "La lettre s'ouvrira dans votre client de messagerie. Vous pourrez la réviser avant de l'envoyer.",
		},
		errorTitle: {
			de: "Fehler beim Generieren",
			en: "Error generating letter",
			fr: "Erreur lors de la génération",
		},
	},

	// ===== Success Page =====
	success: {
		title: { de: "Vielen Dank!", en: "Thank You!", fr: "Merci !" },
		subtitle: {
			de: "Dein Brief wurde gesendet.",
			en: "Your letter has been sent.",
			fr: "Votre lettre a été envoyée.",
		},
		shareTitle: {
			de: "Teile die Aktion",
			en: "Share the Action",
			fr: "Partagez l'action",
		},
		shareText: {
			de: "Jeder weitere Brief erhöht den Druck. Teile das Tool mit Freunden und Familie.",
			en: "Every additional letter increases the pressure. Share the tool with friends and family.",
			fr: "Chaque lettre supplémentaire augmente la pression. Partagez l'outil avec vos amis et votre famille.",
		},
		whatsNext: {
			de: "Was passiert jetzt?",
			en: "What happens next?",
			fr: "Que se passe-t-il ensuite ?",
		},
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
			fr: [
				"Votre lettre arrive dans la boîte de réception du/de la député(e)",
				"Le personnel lit et classe le courrier entrant",
				"Avec de nombreuses lettres sur le même sujet, cela devient une priorité",
				"Le/La député(e) peut agir en séance plénière ou en comité",
				"Partagez cet outil avec vos amis – chaque voix compte !",
			],
		},
		newLetter: {
			de: "Neuen Brief schreiben",
			en: "Write Another Letter",
			fr: "Écrire une autre lettre",
		},

		// Multi-MP feature
		moreMps: {
			title: {
				de: "Noch mehr Wirkung?",
				en: "Want more impact?",
				fr: "Voulez-vous plus d'impact ?",
			},
			subtitle: {
				de: "Weitere Abgeordnete in deinem Wahlkreis",
				en: "More MPs in your constituency",
				fr: "Plus de député(e)s dans votre circonscription",
			},
			description: {
				de: "Dein Wahlkreis hat mehrere Abgeordnete. Mit einem Klick kannst du deinen Brief anpassen und an weitere senden.",
				en: "Your constituency has multiple MPs. With one click you can adapt your letter and send it to more.",
				fr: "Votre circonscription a plusieurs député(e)s. En un clic, vous pouvez adapter votre lettre et l'envoyer à d'autres.",
			},
			reuseButton: {
				de: "Brief anpassen für",
				en: "Adapt letter for",
				fr: "Adapter la lettre pour",
			},
			allDone: {
				de: "Du hast alle Abgeordneten in deinem Wahlkreis erreicht! 🎉",
				en: "You've reached all MPs in your constituency! 🎉",
				fr: "Vous avez atteint tous les député(e)s de votre circonscription ! 🎉",
			},
			newLetterHint: {
				de: "Möchtest du einen neuen Brief schreiben? Dein bisheriger Text wird als Vorlage verwendet.",
				en: "Want to write a new letter? Your previous text will be used as a template.",
				fr: "Voulez-vous écrire une nouvelle lettre ? Votre texte précédent sera utilisé comme modèle.",
			},
			reuseExisting: {
				de: "Vorlage verwenden",
				en: "Use template",
				fr: "Utiliser le modèle",
			},
			startFresh: {
				de: "Neu beginnen",
				en: "Start fresh",
				fr: "Recommencer",
			},
			adapting: {
				de: "Brief wird angepasst...",
				en: "Adapting letter...",
				fr: "Adaptation de la lettre...",
			},
			adapted: {
				de: "Brief angepasst für {name}",
				en: "Letter adapted for {name}",
				fr: "Lettre adaptée pour {name}",
			},
			emailed: {
				de: "✓ Bereits kontaktiert",
				en: "✓ Already contacted",
				fr: "✓ Déjà contacté(e)",
			},
		},
		// Share via email
		shareEmailSubject: {
			de: "Schreib auch einen Brief für den Iran",
			en: "Write a letter for Iran too",
			fr: "Écrivez aussi une lettre pour l'Iran",
		},
		createdWith: {
			de: "Erstellt mit",
			en: "Created with",
			fr: "Créé avec",
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
		fr: `Je viens d'écrire une lettre à mon/ma député(e) - pour les droits humains en Iran.

Pourquoi c'est important : Les député(e)s comptent les lettres de leur circonscription. Les messages personnels ont une vraie influence sur les décisions politiques. Plus les gens écrivent, plus notre voix se fait entendre.

Vous pouvez aussi écrire une lettre en 5 minutes - l'outil vous aide :`,
	},

	// ===== Language Names =====
	languages: {
		de: { de: "Deutsch", en: "German", fr: "Allemand" },
		en: { de: "Englisch", en: "English", fr: "Anglais" },
		fr: { de: "Französisch", en: "French", fr: "Français" },
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

	if (typeof value === "object" && (value[lang] || value.en)) {
		// Fallback to English if requested language not available (e.g., French)
		const result = value[lang] ?? value.en;

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

	if (typeof value === "object" && (value[lang] || value.en)) {
		// Fallback to English if requested language not available
		const result = value[lang] ?? value.en;
		return Array.isArray(result) ? result : [];
	}

	return [];
}
