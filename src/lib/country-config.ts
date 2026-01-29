/**
 * Country-specific configuration for the letter tool
 * Defines content, settings, and routes per country
 */

export type CountryCode = "de" | "ca" | "uk" | "fr" | "us";

export interface CountryConfig {
	code: CountryCode;
	name: {
		en: string;
		native: string;
	};
	flag: string;
	/** Primary language for this country version */
	defaultLanguage: "de" | "en";
	/** Available languages */
	languages: ("de" | "en" | "fr")[];
	/** Target of advocacy (e.g., "Bundestag" or "Parliament") */
	legislatureLabel: {
		en: string;
		native: string;
		fr?: string;
	};
	/** What we call the representative */
	representativeLabel: {
		en: string;
		native: string;
		short: string;
		fr?: string;
	};
	/** Postal code format info */
	postalCode: {
		label: { en: string; native: string; fr?: string };
		placeholder: string;
		pattern: RegExp;
		maxLength: number;
	};
	/** Legal page routes (null if not available for this country) */
	legalPages: {
		impressum: string | null;
		privacy: string | null;
		dataTransparency: string | null;
	};
	/** Footer text */
	footer: {
		diaspora: { en: string; native: string; fr?: string };
		mission: { en: string; native: string; fr?: string };
	};
	/** Whether this country version is fully implemented */
	isReady: boolean;
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
	de: {
		code: "de",
		name: { en: "Germany", native: "Deutschland" },
		flag: "🇩🇪",
		defaultLanguage: "de",
		languages: ["de", "en"],
		legislatureLabel: {
			en: "German Bundestag",
			native: "Deutschen Bundestag",
		},
		representativeLabel: {
			en: "Member of Parliament",
			native: "Bundestagsabgeordneten",
			short: "MdB",
		},
		postalCode: {
			label: { en: "Postal Code", native: "Postleitzahl" },
			placeholder: "10115",
			pattern: /^\d{5}$/,
			maxLength: 5,
		},
		legalPages: {
			impressum: "/impressum",
			privacy: "/datenschutz",
			dataTransparency: "/daten-transparenz",
		},
		footer: {
			diaspora: {
				en: "A project by the Iranian diaspora in Germany.",
				native: "Ein Projekt der iranischen Diaspora in Deutschland.",
			},
			mission: {
				en: "For freedom, dignity and human rights.",
				native: "Für Freiheit, Würde und Menschenrechte.",
			},
		},
		isReady: true,
	},
	ca: {
		code: "ca",
		name: { en: "Canada", native: "Canada" },
		flag: "🇨🇦",
		defaultLanguage: "en",
		languages: ["en", "fr"],
		legislatureLabel: {
			en: "Canadian Parliament",
			native: "Canadian Parliament",
			fr: "Parlement canadien",
		},
		representativeLabel: {
			en: "Member of Parliament",
			native: "Member of Parliament",
			short: "MP",
			fr: "Député(e)",
		},
		postalCode: {
			label: { en: "Postal Code", native: "Postal Code", fr: "Code postal" },
			placeholder: "K1A 0A6",
			pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
			maxLength: 7,
		},
		legalPages: {
			impressum: null, // No German Impressum requirement
			privacy: null, // TODO: Create Canadian privacy policy
			dataTransparency: null,
		},
		footer: {
			diaspora: {
				en: "A project by the Iranian-Canadian community.",
				native: "A project by the Iranian-Canadian community.",
				fr: "Un projet de la communauté irano-canadienne.",
			},
			mission: {
				en: "For freedom, dignity and human rights.",
				native: "For freedom, dignity and human rights.",
				fr: "Pour la liberté, la dignité et les droits humains.",
			},
		},
		isReady: true, // Canada launch ready
	},
	uk: {
		code: "uk",
		name: { en: "United Kingdom", native: "United Kingdom" },
		flag: "🇬🇧",
		defaultLanguage: "en",
		languages: ["en"],
		legislatureLabel: {
			en: "UK Parliament",
			native: "UK Parliament",
		},
		representativeLabel: {
			en: "Member of Parliament",
			native: "Member of Parliament",
			short: "MP",
		},
		postalCode: {
			label: { en: "Postcode", native: "Postcode" },
			placeholder: "SW1A 1AA",
			pattern: /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i,
			maxLength: 8,
		},
		legalPages: {
			impressum: null,
			privacy: null,
			dataTransparency: null,
		},
		footer: {
			diaspora: {
				en: "A project by the Iranian-British community.",
				native: "A project by the Iranian-British community.",
			},
			mission: {
				en: "For freedom, dignity and human rights.",
				native: "For freedom, dignity and human rights.",
			},
		},
		isReady: true,
	},
	fr: {
		code: "fr",
		name: { en: "France", native: "France" },
		flag: "🇫🇷",
		defaultLanguage: "en", // We use French for the letter but English for UI until translations are complete
		languages: ["en", "fr"],
		legislatureLabel: {
			en: "French National Assembly",
			native: "Assemblée nationale",
			fr: "Assemblée nationale",
		},
		representativeLabel: {
			en: "Deputy",
			native: "Député(e)",
			short: "Député",
			fr: "Député(e)",
		},
		postalCode: {
			label: { en: "Postal Code", native: "Code postal", fr: "Code postal" },
			placeholder: "75001",
			pattern: /^\d{5}$/,
			maxLength: 5,
		},
		legalPages: {
			impressum: null,
			privacy: null,
			dataTransparency: null,
		},
		footer: {
			diaspora: {
				en: "A project by the Iranian diaspora in France.",
				native: "Un projet de la diaspora iranienne en France.",
				fr: "Un projet de la diaspora iranienne en France.",
			},
			mission: {
				en: "For freedom, dignity and human rights.",
				native: "Pour la liberté, la dignité et les droits humains.",
				fr: "Pour la liberté, la dignité et les droits humains.",
			},
		},
		isReady: true,
	},
	us: {
		code: "us",
		name: { en: "United States", native: "United States" },
		flag: "🇺🇸",
		defaultLanguage: "en",
		languages: ["en"],
		legislatureLabel: {
			en: "US Congress",
			native: "US Congress",
		},
		representativeLabel: {
			en: "Representative/Senator",
			native: "Representative/Senator",
			short: "Rep./Sen.",
		},
		postalCode: {
			label: { en: "ZIP Code", native: "ZIP Code" },
			placeholder: "90210",
			pattern: /^\d{5}(-\d{4})?$/,
			maxLength: 10,
		},
		legalPages: {
			impressum: null,
			privacy: null,
			dataTransparency: null,
		},
		footer: {
			diaspora: {
				en: "A project by the Iranian-American community.",
				native: "A project by the Iranian-American community.",
			},
			mission: {
				en: "For freedom, dignity and human rights.",
				native: "For freedom, dignity and human rights.",
			},
		},
		isReady: true,
	},
};

/** Get config for a country, with validation */
export function getCountryConfig(country: string): CountryConfig | null {
	if (
		country === "de" ||
		country === "ca" ||
		country === "uk" ||
		country === "fr" ||
		country === "us"
	) {
		return COUNTRY_CONFIGS[country];
	}
	return null;
}

/** List of valid country codes */
export const VALID_COUNTRIES: CountryCode[] = ["de", "ca", "uk", "fr", "us"];

/** Check if a country code is valid */
export function isValidCountry(country: string): country is CountryCode {
	return VALID_COUNTRIES.includes(country as CountryCode);
}
