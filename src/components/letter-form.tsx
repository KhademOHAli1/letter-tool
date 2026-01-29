"use client";

import {
	Check,
	ChevronDown,
	ChevronUp,
	HelpCircle,
	RotateCcw,
	ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/voice-input";
import { DEMANDS_CA } from "@/lib/data/ca/forderungen-ca";
import {
	findMPByPostalCode,
	findRidingByPostalCode,
	type MP,
	type Riding,
} from "@/lib/data/ca/ridings";
import { FORDERUNGEN } from "@/lib/data/forderungen";
import {
	DEPARTMENTS,
	type Depute,
	FR_PARTY_COLORS,
	findDeputesByPostalCode,
	getDepartmentFromPostalCode,
} from "@/lib/data/fr/circonscriptions";
import { DEMANDS_FR } from "@/lib/data/fr/forderungen-fr";
import {
	findMPByPostcode as findUKMPByPostcode,
	type UKMP,
} from "@/lib/data/uk/constituencies";
import { DEMANDS_UK } from "@/lib/data/uk/forderungen-uk";
import {
	findAllRepresentativesByZipCode,
	type Senator,
	STATE_CODES,
	type Representative as USRepresentative,
} from "@/lib/data/us/districts";
import { DEMANDS_US } from "@/lib/data/us/forderungen-us";
import {
	findMdBsByWahlkreis,
	findWahlkreisByPlz,
	type MdB,
	type Wahlkreis,
} from "@/lib/data/wahlkreise";
import { useLanguage } from "@/lib/i18n/context";
import {
	clearFormDraft,
	getFormDraft,
	saveFormDraft,
} from "@/lib/letter-cache";

// Unified representative type for all countries
type Representative = MdB | MP | UKMP | Depute | USRepresentative | Senator;
type District = Wahlkreis | Riding | { name: string };

// German party colors
const DE_PARTY_COLORS: Record<string, string> = {
	"CDU/CSU": "bg-black text-white",
	SPD: "bg-red-600 text-white",
	GRÜNE: "bg-green-600 text-white",
	"DIE LINKE": "bg-purple-600 text-white",
	BSW: "bg-orange-600 text-white",
	Fraktionslos: "bg-gray-500 text-white",
};

// Canadian party colors
const CA_PARTY_COLORS: Record<string, string> = {
	Liberal: "bg-red-600 text-white",
	Conservative: "bg-blue-800 text-white",
	NDP: "bg-orange-500 text-white",
	"Bloc Québécois": "bg-sky-500 text-white",
	Green: "bg-green-600 text-white",
	Independent: "bg-gray-500 text-white",
};

// UK party colors (Tailwind classes)
const UK_PARTY_COLORS: Record<string, string> = {
	Labour: "bg-red-600 text-white",
	Conservative: "bg-blue-800 text-white",
	"Liberal Democrats": "bg-amber-500 text-black",
	"Scottish National Party": "bg-yellow-400 text-black",
	"Green Party": "bg-green-600 text-white",
	"Reform UK": "bg-cyan-600 text-white",
	"Plaid Cymru": "bg-green-700 text-white",
	"Democratic Unionist Party": "bg-orange-700 text-white",
	"Sinn Féin": "bg-green-800 text-white",
	"Social Democratic & Labour Party": "bg-green-600 text-white",
	Alliance: "bg-yellow-500 text-black",
	"Ulster Unionist Party": "bg-blue-500 text-white",
	Independent: "bg-gray-500 text-white",
};

// US party colors (Tailwind classes)
const US_PARTY_COLORS: Record<string, string> = {
	Democratic: "bg-blue-700 text-white",
	Republican: "bg-red-600 text-white",
	Independent: "bg-gray-500 text-white",
	Libertarian: "bg-yellow-500 text-black",
};

// Validate personal story: just check it's not empty
function validatePersonalNote(
	text: string,
	t: (
		section: "form",
		key: string,
		replacements?: Record<string, string | number>,
	) => string,
): {
	valid: boolean;
	message: string;
} {
	const trimmed = text.trim();
	if (!trimmed)
		return { valid: false, message: t("form", "step3.validation.empty") };

	return { valid: true, message: "" };
}

// Collapsible "Why we ask" component
function WhyBox({
	title,
	text,
	defaultOpen = false,
}: {
	title: string;
	text: string;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="mt-3 rounded-lg bg-muted/50 border border-border/40">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
			>
				<HelpCircle className="h-3.5 w-3.5 shrink-0" />
				<span className="font-medium">{title}</span>
				{open ? (
					<ChevronUp className="ml-auto h-3.5 w-3.5 shrink-0" />
				) : (
					<ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0" />
				)}
			</button>
			{open && (
				<p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed">
					{text}
				</p>
			)}
		</div>
	);
}

export function LetterForm() {
	const router = useRouter();
	const pathname = usePathname();
	const { t, language } = useLanguage();
	const [error, setError] = useState<string | null>(null);

	// Detect country from URL path
	const country = useMemo(() => {
		const segment = pathname.split("/")[1];
		if (segment === "ca") return "ca";
		if (segment === "uk") return "uk";
		if (segment === "fr") return "fr";
		if (segment === "us") return "us";
		return "de";
	}, [pathname]);
	const isCanada = country === "ca";
	const isUK = country === "uk";
	const isFrance = country === "fr";
	const isUS = country === "us";

	// Country-specific demands list
	const demands = isCanada
		? DEMANDS_CA
		: isUK
			? DEMANDS_UK
			: isFrance
				? DEMANDS_FR
				: isUS
					? DEMANDS_US
					: FORDERUNGEN;

	// Honeypot field (hidden, bots will fill it)
	const honeypotRef = useRef<HTMLInputElement>(null);
	// Track form render time (bots submit too fast)
	const formRenderTime = useRef(Date.now());

	// Form state - use unified types
	const [name, setName] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [district, setDistrict] = useState<District | null>(null);
	const [representatives, setRepresentatives] = useState<Representative[]>([]);
	const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
	const [selectedDemands, setSelectedDemands] = useState<string[]>([]);
	const [personalNote, setPersonalNote] = useState("");
	const [consentGiven, setConsentGiven] = useState(false);
	const [repSelectorOpen, setRepSelectorOpen] = useState(false);
	const [isReusingTemplate, setIsReusingTemplate] = useState(false);
	const [hasDraft, setHasDraft] = useState(false);
	const [draftRestored, setDraftRestored] = useState(false);
	const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);

	// Auto-save draft debounced
	const saveTimeout = useRef<NodeJS.Timeout | null>(null);

	// Auto-save form state (debounced)
	const autoSaveDraft = useCallback(() => {
		if (saveTimeout.current) {
			clearTimeout(saveTimeout.current);
		}
		saveTimeout.current = setTimeout(() => {
			// Only save if there's meaningful content
			if (
				name.trim() ||
				postalCode.trim() ||
				personalNote.trim() ||
				selectedDemands.length > 0
			) {
				saveFormDraft({
					name,
					plz: postalCode,
					personalNote,
					selectedForderungen: selectedDemands,
					selectedMdBId: selectedRep?.id,
				});
			}
		}, 1000); // Save after 1 second of inactivity
	}, [name, postalCode, personalNote, selectedDemands, selectedRep]);

	// Trigger auto-save on form changes
	useEffect(() => {
		autoSaveDraft();
		return () => {
			if (saveTimeout.current) {
				clearTimeout(saveTimeout.current);
			}
		};
	}, [autoSaveDraft]);

	// Check for saved draft on mount
	useEffect(() => {
		const draft = getFormDraft();
		if (draft && !isReusingTemplate) {
			setHasDraft(true);
		}
	}, [isReusingTemplate]);

	// Restore draft handler
	const restoreDraft = useCallback(() => {
		const draft = getFormDraft();
		if (!draft) return;

		setName(draft.name);
		setPostalCode(draft.plz);
		setPersonalNote(draft.personalNote);
		setSelectedDemands(draft.selectedForderungen);

		// Trigger postal code lookup based on country
		if (isCanada) {
			// Canadian FSA is at least 3 chars
			if (draft.plz.length >= 3) {
				const mp = findMPByPostalCode(draft.plz);
				if (mp) {
					setRepresentatives([mp]);
					const riding = findRidingByPostalCode(draft.plz);
					if (riding) {
						setDistrict(riding);
					}
					if (draft.selectedMdBId && mp.id === draft.selectedMdBId) {
						setSelectedRep(mp);
					}
				}
			}
		} else if (isUK) {
			// UK postcode - async lookup, restore will need user to re-enter
			// Can't do async lookup in useCallback easily, so just restore the postal code
			// and let the user trigger lookup manually
			// The postal code field will be populated and they can press Enter
		} else if (isFrance) {
			// French code postal is 5 digits
			if (draft.plz.length === 5 && /^\d{5}$/.test(draft.plz)) {
				const deputes = findDeputesByPostalCode(draft.plz);
				if (deputes.length > 0) {
					const deptCode = getDepartmentFromPostalCode(draft.plz);
					const deptName = deptCode ? DEPARTMENTS[deptCode] : null;
					setDistrict({ name: deptName || "France" });
					setRepresentatives(deputes);

					// Restore selected député if possible
					if (draft.selectedMdBId) {
						const depute = deputes.find((d) => d.id === draft.selectedMdBId);
						if (depute) {
							setSelectedRep(depute);
						}
					}
				}
			}
		} else if (isUS) {
			// US ZIP code is 5 digits
			if (draft.plz.length === 5 && /^\d{5}$/.test(draft.plz)) {
				const {
					representative,
					senators,
					district: usDistrict,
				} = findAllRepresentativesByZipCode(draft.plz);
				const allReps: Representative[] = [];
				if (representative) allReps.push(representative);
				allReps.push(...senators);

				if (allReps.length > 0) {
					const stateName = usDistrict?.stateCode
						? STATE_CODES[usDistrict.stateCode]
						: "United States";
					setDistrict({ name: stateName || "United States" });
					setRepresentatives(allReps);

					// Restore selected representative if possible
					if (draft.selectedMdBId) {
						const rep = allReps.find((r) => r.id === draft.selectedMdBId);
						if (rep) {
							setSelectedRep(rep);
						}
					}
				}
			}
		} else {
			// German PLZ is 5 digits
			if (draft.plz.length === 5) {
				const found = findWahlkreisByPlz(draft.plz);
				if (found) {
					setDistrict(found);
					const foundMdbs = findMdBsByWahlkreis(found.id);
					setRepresentatives(foundMdbs);

					// Restore selected MdB if possible
					if (draft.selectedMdBId) {
						const mdb = foundMdbs.find((m) => m.id === draft.selectedMdBId);
						if (mdb) {
							setSelectedRep(mdb);
						}
					}
				}
			}
		}

		setHasDraft(false);
		setDraftRestored(true);
		setTimeout(() => setDraftRestored(false), 3000);
	}, [isCanada, isUK, isFrance, isUS]);

	// Dismiss draft handler
	const dismissDraft = useCallback(() => {
		clearFormDraft();
		setHasDraft(false);
	}, []);

	// Check for reuse template on mount
	useEffect(() => {
		const reuseData = sessionStorage.getItem("reuseTemplate");
		if (reuseData) {
			try {
				const template = JSON.parse(reuseData) as {
					personalNote: string;
					forderungen: string[];
					senderName: string;
					senderPlz: string;
				};

				// Pre-fill form fields
				setName(template.senderName);
				setPostalCode(template.senderPlz);
				setPersonalNote(template.personalNote);
				setSelectedDemands(template.forderungen);
				setIsReusingTemplate(true);

				// Trigger postal code lookup based on country
				if (isCanada) {
					if (template.senderPlz.length >= 3) {
						const mp = findMPByPostalCode(template.senderPlz);
						if (mp) {
							setRepresentatives([mp]);
							const riding = findRidingByPostalCode(template.senderPlz);
							if (riding) {
								setDistrict(riding);
							}
						}
					}
				} else if (isFrance) {
					if (
						template.senderPlz.length === 5 &&
						/^\d{5}$/.test(template.senderPlz)
					) {
						const deputes = findDeputesByPostalCode(template.senderPlz);
						if (deputes.length > 0) {
							const deptCode = getDepartmentFromPostalCode(template.senderPlz);
							const deptName = deptCode ? DEPARTMENTS[deptCode] : null;
							setDistrict({ name: deptName || "France" });
							setRepresentatives(deputes);
						}
					}
				} else if (isUS) {
					if (
						template.senderPlz.length === 5 &&
						/^\d{5}$/.test(template.senderPlz)
					) {
						const {
							representative,
							senators,
							district: usDistrict,
						} = findAllRepresentativesByZipCode(template.senderPlz);
						const allReps: Representative[] = [];
						if (representative) allReps.push(representative);
						allReps.push(...senators);

						if (allReps.length > 0) {
							const stateName = usDistrict?.stateCode
								? STATE_CODES[usDistrict.stateCode]
								: "United States";
							setDistrict({ name: stateName || "United States" });
							setRepresentatives(allReps);
						}
					}
				} else {
					if (template.senderPlz.length === 5) {
						const found = findWahlkreisByPlz(template.senderPlz);
						if (found) {
							setDistrict(found);
							const foundMdbs = findMdBsByWahlkreis(found.id);
							setRepresentatives(foundMdbs);
						}
					}
				}

				// Clear the template after using it
				sessionStorage.removeItem("reuseTemplate");
			} catch {
				// Ignore parse errors
			}
		}
	}, [isCanada, isFrance, isUS]);

	// Postal code input → find district/representative
	const handlePostalCodeChange = async (value: string) => {
		setPostalCode(value);
		setDistrict(null);
		setRepresentatives([]);
		setSelectedRep(null);

		if (isCanada) {
			// Canadian FSA: 3 alphanumeric chars (e.g., M5V, K1A)
			const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
			if (normalized.length >= 3) {
				const fsa = normalized.substring(0, 3);
				const mp = findMPByPostalCode(fsa);
				if (mp) {
					setRepresentatives([mp]);
					setSelectedRep(mp);
					const riding = findRidingByPostalCode(fsa);
					if (riding) {
						setDistrict(riding);
					}
				}
			}
		} else if (isUK) {
			// UK postcode: format like "SW1A 1AA" or "SW1A1AA"
			const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
			// UK postcodes are 5-7 alphanumeric chars without space
			if (normalized.length >= 5) {
				setIsLookingUpPostcode(true);
				try {
					const mp = await findUKMPByPostcode(value);
					if (mp) {
						setRepresentatives([mp]);
						setSelectedRep(mp);
						setDistrict({ name: mp.constituencyName });
					}
				} catch (err) {
					console.error("Failed to lookup UK postcode:", err);
				} finally {
					setIsLookingUpPostcode(false);
				}
			}
		} else if (isFrance) {
			// French code postal: 5 digits
			if (value.length === 5 && /^\d{5}$/.test(value)) {
				const deputes = findDeputesByPostalCode(value);
				if (deputes.length > 0) {
					const deptCode = getDepartmentFromPostalCode(value);
					const deptName = deptCode ? DEPARTMENTS[deptCode] : null;
					setDistrict({ name: deptName || "France" });
					setRepresentatives(deputes);
					if (deputes.length === 1) {
						setSelectedRep(deputes[0]);
					}
				}
			}
		} else if (isUS) {
			// US ZIP code: 5 digits
			if (value.length === 5 && /^\d{5}$/.test(value)) {
				const {
					representative,
					senators,
					district: usDistrict,
				} = findAllRepresentativesByZipCode(value);
				const allReps: Representative[] = [];
				if (representative) allReps.push(representative);
				allReps.push(...senators);

				if (allReps.length > 0) {
					const stateName = usDistrict?.stateCode
						? STATE_CODES[usDistrict.stateCode]
						: "United States";
					setDistrict({ name: stateName || "United States" });
					setRepresentatives(allReps);
					if (allReps.length === 1) {
						setSelectedRep(allReps[0]);
					}
				}
			}
		} else {
			// German PLZ: 5 digits
			if (value.length === 5) {
				const found = findWahlkreisByPlz(value);
				if (found) {
					setDistrict(found);
					const foundMdbs = findMdBsByWahlkreis(found.id);
					setRepresentatives(foundMdbs);
					if (foundMdbs.length === 1) {
						setSelectedRep(foundMdbs[0]);
					}
				}
			}
		}
	};

	// Toggle demand selection
	const toggleDemand = (id: string) => {
		setSelectedDemands((prev) =>
			prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
		);
	};

	// Form submission
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Bot detection: honeypot field must be empty
		if (honeypotRef.current?.value) {
			console.warn("Honeypot triggered - bot detected");
			setError(t("common", "error"));
			return;
		}

		// Bot detection: form must be open for at least 3 seconds
		const timeSinceRender = Date.now() - formRenderTime.current;
		if (timeSinceRender < 3000) {
			console.warn("Form submitted too quickly - bot detected");
			setError(t("common", "error"));
			return;
		}

		if (!selectedRep || selectedDemands.length === 0) {
			setError(
				language === "de"
					? "Bitte wähle einen MdB und mindestens eine Forderung"
					: isUS
						? "Please select a representative and at least one demand"
						: "Please select an MP and at least one demand",
			);
			return;
		}

		const noteValidation = validatePersonalNote(personalNote, t);
		if (!noteValidation.valid) {
			setError(noteValidation.message);
			return;
		}

		// Store form data and navigate to editor page
		// Letter will be generated there in the background with streaming
		sessionStorage.setItem(
			"formData",
			JSON.stringify({
				senderName: name,
				senderPlz: postalCode,
				wahlkreis: district?.name,
				mdb: selectedRep,
				forderungen: selectedDemands,
				personalNote,
				language, // Store selected language for letter generation
				country, // Store country for API route
				_timing: timeSinceRender,
			}),
		);

		// Clear draft on successful submission
		clearFormDraft();

		router.push(`/${country}/editor`);
	}

	// Helper to get representative name
	const getRepName = (rep: Representative): string => {
		// Both MdB and MP have a name field
		return rep.name;
	};

	// Helper to get party badge style - returns Tailwind classes
	const getPartyBadge = (rep: Representative): string => {
		// Both types use 'party' field
		if (isCanada) {
			return CA_PARTY_COLORS[rep.party] || "bg-gray-500 text-white";
		}
		if (isUK) {
			return UK_PARTY_COLORS[rep.party] || "bg-gray-500 text-white";
		}
		if (isFrance) {
			// French députés use partyShort field for lookup
			const partyKey = "partyShort" in rep ? rep.partyShort : rep.party;
			return FR_PARTY_COLORS[partyKey] || "bg-gray-500 text-white";
		}
		if (isUS) {
			return US_PARTY_COLORS[rep.party] || "bg-gray-500 text-white";
		}
		return DE_PARTY_COLORS[rep.party] || "bg-gray-500 text-white";
	};

	// Helper to get party name
	const getPartyName = (rep: Representative): string => {
		return rep.party;
	};

	// Helper to get representative image URL (French députés don't have images)
	const getRepImageUrl = (rep: Representative): string | null => {
		if ("imageUrl" in rep) {
			return rep.imageUrl;
		}
		return null;
	};

	// Helper to get circonscription display for French députés and US representatives
	const getCirconscriptionDisplay = (rep: Representative): string | null => {
		if ("constituency" in rep && typeof rep.constituency === "number") {
			const ordinal = rep.constituency === 1 ? "1ère" : `${rep.constituency}e`;
			return `${ordinal} circ.`;
		}
		// For US, show chamber and district info
		if (isUS) {
			if ("district" in rep && rep.district) {
				// House Representative - show district code
				return `Rep. · ${rep.district}`;
			}
			if ("senateClass" in rep) {
				// Senator - show rank
				const rank = "stateRank" in rep ? rep.stateRank : "";
				return rank === "senior" ? "Sen. (Senior)" : "Sen. (Junior)";
			}
		}
		return null;
	};

	// Validation state for each field
	const validationErrors = useMemo(() => {
		const errors: {
			name?: string;
			postalCode?: string;
			representative?: string;
			personalNote?: string;
			demands?: string;
			consent?: string;
		} = {};

		if (!name.trim()) {
			errors.name =
				language === "de"
					? "Bitte gib deinen Namen ein"
					: language === "fr"
						? "Veuillez entrer votre nom"
						: "Please enter your name";
		}

		if (!postalCode.trim()) {
			errors.postalCode =
				language === "de"
					? "Bitte gib deine Postleitzahl ein"
					: language === "fr"
						? "Veuillez entrer votre code postal"
						: isUS
							? "Please enter your ZIP code"
							: "Please enter your postal code";
		} else if (!district) {
			errors.postalCode =
				language === "de"
					? "Kein Wahlkreis für diese PLZ gefunden"
					: language === "fr"
						? "Aucune circonscription trouvée pour ce code postal"
						: isUS
							? "No congressional district found for this ZIP code"
							: "No constituency found for this postal code";
		}

		if (!selectedRep) {
			errors.representative =
				language === "de"
					? "Bitte wähle eine*n Abgeordnete*n aus"
					: language === "fr"
						? "Veuillez sélectionner un(e) député(e)"
						: isUS
							? "Please select a representative"
							: "Please select an MP";
		}

		const noteValidation = validatePersonalNote(personalNote, t);
		if (!noteValidation.valid) {
			errors.personalNote = noteValidation.message;
		}

		if (selectedDemands.length === 0) {
			errors.demands =
				language === "de"
					? "Bitte wähle mindestens eine Forderung"
					: language === "fr"
						? "Veuillez sélectionner au moins une demande"
						: "Please select at least one demand";
		}

		if (!consentGiven) {
			errors.consent =
				language === "de"
					? "Bitte stimme der Datenverarbeitung zu"
					: language === "fr"
						? "Veuillez accepter le traitement des données"
						: "Please agree to data processing";
		}

		return errors;
	}, [
		name,
		postalCode,
		district,
		selectedRep,
		personalNote,
		selectedDemands,
		consentGiven,
		language,
		isUS,
		t,
	]);

	const isValid = Object.keys(validationErrors).length === 0;

	// Track if user has attempted to submit (to show errors)
	const [showValidationErrors, setShowValidationErrors] = useState(false);

	// Handle click on disabled submit button - show errors
	const handleSubmitClick = useCallback(() => {
		if (!isValid) {
			setShowValidationErrors(true);

			// Build a comprehensive error message
			const errorList = Object.values(validationErrors);
			const errorMessage =
				language === "de"
					? `Bitte korrigiere folgende Fehler:\n• ${errorList.join("\n• ")}`
					: language === "fr"
						? `Veuillez corriger les erreurs suivantes :\n• ${errorList.join("\n• ")}`
						: `Please fix the following issues:\n• ${errorList.join("\n• ")}`;
			setError(errorMessage);

			// Scroll to first error
			setTimeout(() => {
				const firstErrorField = document.querySelector(
					'[data-has-error="true"]',
				);
				if (firstErrorField) {
					firstErrorField.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}, 100);
		}
	}, [isValid, validationErrors, language]);

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{/* Honeypot field - hidden from users, bots will fill it */}
			<div className="absolute -left-2499.75 -top-2499.75" aria-hidden="true">
				<label htmlFor="_website">Website</label>
				<input
					type="text"
					id="_website"
					name="_website"
					ref={honeypotRef}
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			{/* Section Header */}
			<div className="space-y-1">
				<h2 className="text-xl font-semibold text-foreground">
					{t("home", "title")}
				</h2>
				<p className="text-sm text-muted-foreground">{t("home", "subtitle")}</p>
			</div>

			{/* Draft recovery banner */}
			{hasDraft && !isReusingTemplate && (
				<div className="px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
						<RotateCcw className="h-4 w-4 shrink-0" />
						<span>
							{language === "de"
								? "Du hast einen unvollständigen Entwurf"
								: "You have an unfinished draft"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={dismissDraft}
							className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
						>
							{language === "de" ? "Verwerfen" : "Dismiss"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={restoreDraft}
							className="bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700"
						>
							{language === "de" ? "Wiederherstellen" : "Restore"}
						</Button>
					</div>
				</div>
			)}

			{/* Draft restored confirmation */}
			{draftRestored && (
				<div className="px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
					<Check className="h-4 w-4 shrink-0" />
					<span>
						{language === "de"
							? "Entwurf wiederhergestellt!"
							: "Draft restored!"}
					</span>
				</div>
			)}

			{/* Template reuse notice */}
			{isReusingTemplate && (
				<div className="px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary flex items-start gap-2">
					<svg
						className="h-4 w-4 shrink-0 mt-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span>
						{language === "de"
							? "Deine vorherigen Eingaben wurden übernommen. Wähle nur noch eine*n neue*n Abgeordnete*n aus."
							: language === "fr"
								? "Vos entrées précédentes ont été chargées. Sélectionnez simplement un(e) nouveau/nouvelle député(e)."
								: "Your previous inputs have been loaded. Just select a new MP."}
					</span>
				</div>
			)}

			{/* Privacy Notice Banner */}
			<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
				<ShieldCheck className="h-4 w-4 text-emerald-600" />
				<span>{t("form", "dataNotice")}</span>
			</div>

			{/* Step 1: Name */}
			<div
				className={`p-4 md:p-5 rounded-xl bg-card border shadow-sm space-y-4 transition-colors ${
					showValidationErrors && validationErrors.name
						? "border-destructive/60 bg-destructive/5"
						: "border-border/60"
				}`}
				data-has-error={
					showValidationErrors && validationErrors.name ? "true" : undefined
				}
			>
				<div className="flex items-center gap-2">
					<span
						className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
							showValidationErrors && validationErrors.name
								? "bg-destructive text-destructive-foreground"
								: "bg-primary text-primary-foreground"
						}`}
					>
						1
					</span>
					<h3 className="font-medium">{t("form", "step1.title")}</h3>
					{showValidationErrors && validationErrors.name && (
						<span className="text-xs text-destructive ml-auto">
							⚠️{" "}
							{language === "de"
								? "Pflichtfeld"
								: language === "fr"
									? "Requis"
									: "Required"}
						</span>
					)}
				</div>
				<div className="space-y-4 px-2">
					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-sm">
							{t("form", "step1.nameLabel")}{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							placeholder={t("form", "step1.namePlaceholder")}
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								if (showValidationErrors && e.target.value.trim()) {
									setError(null);
								}
							}}
							className={
								showValidationErrors && validationErrors.name
									? "border-destructive focus-visible:ring-destructive"
									: ""
							}
							aria-invalid={showValidationErrors && !!validationErrors.name}
							aria-describedby={
								showValidationErrors && validationErrors.name
									? "name-error"
									: undefined
							}
						/>
						{showValidationErrors && validationErrors.name && (
							<p
								id="name-error"
								className="text-xs text-destructive flex items-center gap-1"
							>
								<span>⚠️</span> {validationErrors.name}
							</p>
						)}
					</div>

					<WhyBox
						title={t("form", "step1.whyTitle")}
						text={t("form", "step1.whyText")}
					/>
				</div>
			</div>

			{/* Step 2: Postal Code & Representative Selection */}
			<div
				className={`p-4 md:p-5 rounded-xl bg-card border shadow-sm space-y-4 transition-colors ${
					showValidationErrors &&
					(validationErrors.postalCode || validationErrors.representative)
						? "border-destructive/60 bg-destructive/5"
						: "border-border/60"
				}`}
				data-has-error={
					showValidationErrors &&
					(validationErrors.postalCode || validationErrors.representative)
						? "true"
						: undefined
				}
			>
				<div className="flex items-center gap-2">
					<span
						className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
							showValidationErrors &&
							(validationErrors.postalCode || validationErrors.representative)
								? "bg-destructive text-destructive-foreground"
								: "bg-primary text-primary-foreground"
						}`}
					>
						2
					</span>
					<h3 className="font-medium">{t("form", "step2.title")}</h3>
					{showValidationErrors &&
						(validationErrors.postalCode ||
							validationErrors.representative) && (
							<span className="text-xs text-destructive ml-auto">
								⚠️{" "}
								{language === "de"
									? "Pflichtfeld"
									: language === "fr"
										? "Requis"
										: "Required"}
							</span>
						)}
				</div>
				<div className="space-y-4 px-2">
					{/* Postal Code */}
					<div className="space-y-2">
						<Label htmlFor="postalCode" className="text-sm">
							{isCanada
								? language === "de"
									? "Postleitzahl"
									: "Postal Code"
								: isUK
									? "Postcode"
									: isUS
										? "ZIP Code"
										: t("form", "step2.plzLabel")}
						</Label>
						<Input
							id="postalCode"
							placeholder={
								isCanada
									? language === "de"
										? "z.B. M5V 1A1"
										: "e.g., M5V 1A1"
									: isUK
										? "e.g., SW1A 1AA"
										: isFrance
											? language === "fr"
												? "ex. 75001"
												: "e.g., 75001"
											: isUS
												? "e.g., 90210"
												: t("form", "step2.plzPlaceholder")
							}
							maxLength={isCanada ? 7 : isUK ? 8 : isFrance ? 5 : isUS ? 5 : 5}
							value={postalCode}
							onChange={(e) =>
								handlePostalCodeChange(
									isCanada || isUK
										? e.target.value.toUpperCase()
										: e.target.value.replace(/\D/g, ""),
								)
							}
							className={`max-w-40 ${showValidationErrors && validationErrors.postalCode ? "border-destructive focus-visible:ring-destructive" : ""}`}
							aria-invalid={
								showValidationErrors && !!validationErrors.postalCode
							}
						/>
						{showValidationErrors &&
							validationErrors.postalCode &&
							!district && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<span>⚠️</span> {validationErrors.postalCode}
								</p>
							)}
						{isLookingUpPostcode && (
							<p className="text-sm text-muted-foreground">
								🔍 Looking up your constituency...
							</p>
						)}
						{!isCanada &&
							!isUK &&
							!isUS &&
							postalCode.length === 5 &&
							!district && (
								<p className="text-sm text-destructive">
									{t("form", "step2.wahlkreisNotFound")}
								</p>
							)}
						{isUS && postalCode.length === 5 && !district && (
							<p className="text-sm text-destructive">
								No congressional district found for this ZIP code
							</p>
						)}
						{isCanada && postalCode.length >= 3 && !district && (
							<p className="text-sm text-destructive">
								{language === "de"
									? "Kein Wahlkreis gefunden"
									: "No riding found for this postal code"}
							</p>
						)}
						{isUK &&
							!isLookingUpPostcode &&
							postalCode.length >= 5 &&
							!district && (
								<p className="text-sm text-destructive">
									No constituency found for this postcode
								</p>
							)}
						{district && (
							<p className="text-sm text-muted-foreground">
								📍{" "}
								{isCanada
									? language === "de"
										? "Wahlkreis"
										: "Riding"
									: isUK
										? "Constituency"
										: isUS
											? "Congressional District"
											: t("form", "step2.wahlkreisFound")}
								: {district.name}
							</p>
						)}
					</div>

					{district && representatives.length === 0 && (
						<div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
							<p className="text-sm font-medium">
								{language === "de"
									? isCanada
										? "Kein/e Abgeordnete/r gefunden"
										: "Keine MdBs gefunden"
									: isUS
										? "No representatives found"
										: "No MPs found"}
							</p>
							<p className="text-xs mt-1">
								{language === "de"
									? "Für diesen Wahlkreis sind derzeit keine Daten verfügbar."
									: isUS
										? "No data available for this ZIP code."
										: "No data available for this constituency."}
							</p>
						</div>
					)}

					{representatives.length > 0 && (
						<div className="space-y-3">
							{/* Help text for France - explain how to find circonscription */}
							{isFrance && representatives.length > 1 && (
								<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
									<p className="text-sm">
										{language === "fr"
											? "Plusieurs député(e)s trouvé(e)s pour votre département. Sélectionnez celui/celle de votre circonscription."
											: language === "de"
												? "Mehrere Abgeordnete in Ihrem Département gefunden. Wählen Sie den Ihrer circonscription."
												: "Multiple deputies found for your département. Select the one for your constituency."}
									</p>
									<a
										href="https://www.nosdeputes.fr/circonscription"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
									>
										{language === "fr"
											? "→ Trouver ma circonscription"
											: language === "de"
												? "→ Meine circonscription finden"
												: "→ Find my constituency"}
									</a>
								</div>
							)}
							<Label className="text-sm font-medium">
								{t("form", "step2.selectLabel")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							{/* Inline expandable representative selector */}
							<div
								className={`rounded-lg border overflow-hidden transition-all duration-200 ${
									showValidationErrors &&
									validationErrors.representative &&
									!selectedRep
										? "border-destructive"
										: "border-border"
								}`}
							>
								{showValidationErrors &&
									validationErrors.representative &&
									!selectedRep && (
										<div className="px-3 py-2 bg-destructive/10 border-b border-destructive/20">
											<p className="text-xs text-destructive flex items-center gap-1">
												<span>⚠️</span> {validationErrors.representative}
											</p>
										</div>
									)}
								{/* Show selected representative or placeholder when collapsed */}
								{!repSelectorOpen && (
									<button
										type="button"
										onClick={() => setRepSelectorOpen(true)}
										className="w-full flex items-center justify-between gap-3 p-3 bg-background hover:bg-muted/30 transition-colors text-left"
									>
										{selectedRep ? (
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<div className="h-10 w-10 overflow-hidden rounded-full bg-muted shrink-0 border-2 border-primary/20 flex items-center justify-center">
													{getRepImageUrl(selectedRep) ? (
														<Image
															src={getRepImageUrl(selectedRep) as string}
															alt={selectedRep.name}
															width={40}
															height={40}
															className="object-cover object-top w-full h-full"
															unoptimized
														/>
													) : (
														<span className="text-lg font-medium text-muted-foreground">
															{selectedRep.name.charAt(0)}
														</span>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-foreground truncate">
														{getRepName(selectedRep)}
													</p>
													<div className="flex items-center gap-2 mt-0.5 flex-wrap">
														<span
															className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPartyBadge(selectedRep)}`}
														>
															{getPartyName(selectedRep)}
														</span>
														{getCirconscriptionDisplay(selectedRep) && (
															<span className="text-xs text-muted-foreground">
																{getCirconscriptionDisplay(selectedRep)}
															</span>
														)}
													</div>
												</div>
											</div>
										) : (
											<span className="text-muted-foreground">
												{t("form", "step2.selectPlaceholder")}
											</span>
										)}
										<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
									</button>
								)}

								{/* Expanded list of representatives */}
								{repSelectorOpen && (
									<div
										className="divide-y divide-border"
										role="listbox"
										aria-label={t("form", "step2.selectLabel")}
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												setRepSelectorOpen(false);
											} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
												e.preventDefault();
												const buttons =
													e.currentTarget.querySelectorAll("button");
												const current = Array.from(buttons).indexOf(
													document.activeElement as HTMLButtonElement,
												);
												const next =
													e.key === "ArrowDown"
														? Math.min(current + 1, buttons.length - 1)
														: Math.max(current - 1, 0);
												(buttons[next] as HTMLButtonElement)?.focus();
											}
										}}
									>
										{representatives.map((rep) => (
											<button
												key={rep.id}
												type="button"
												role="option"
												aria-selected={selectedRep?.id === rep.id}
												onClick={() => {
													setSelectedRep(rep);
													setRepSelectorOpen(false);
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														setSelectedRep(rep);
														setRepSelectorOpen(false);
													}
												}}
												className={`w-full flex items-center gap-3 p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
													selectedRep?.id === rep.id
														? "bg-primary/10"
														: "bg-background hover:bg-muted/50"
												}`}
											>
												<div className="h-10 w-10 overflow-hidden rounded-full bg-muted shrink-0 border border-border flex items-center justify-center">
													{getRepImageUrl(rep) ? (
														<Image
															src={getRepImageUrl(rep) as string}
															alt={rep.name}
															width={40}
															height={40}
															className="object-cover object-top w-full h-full"
															unoptimized
														/>
													) : (
														<span className="text-lg font-medium text-muted-foreground">
															{rep.name.charAt(0)}
														</span>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-foreground truncate">
														{getRepName(rep)}
													</p>
													<div className="flex items-center gap-2 mt-0.5 flex-wrap">
														<span
															className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPartyBadge(rep)}`}
														>
															{getPartyName(rep)}
														</span>
														{getCirconscriptionDisplay(rep) && (
															<span className="text-xs text-muted-foreground">
																{getCirconscriptionDisplay(rep)}
															</span>
														)}
													</div>
												</div>
												{selectedRep?.id === rep.id && (
													<Check className="h-5 w-5 text-primary shrink-0" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					<WhyBox
						title={t("form", "step2.whyTitle")}
						text={t("form", "step2.whyText")}
					/>
				</div>
			</div>

			{/* Step 3: Personal Story */}
			<div
				className={`p-4 md:p-5 rounded-xl bg-card border shadow-sm space-y-4 transition-colors ${
					showValidationErrors && validationErrors.personalNote
						? "border-destructive/60 bg-destructive/5"
						: "border-border/60"
				}`}
				data-has-error={
					showValidationErrors && validationErrors.personalNote
						? "true"
						: undefined
				}
			>
				<div className="flex items-center gap-2">
					<span
						className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
							showValidationErrors && validationErrors.personalNote
								? "bg-destructive text-destructive-foreground"
								: "bg-primary text-primary-foreground"
						}`}
					>
						3
					</span>
					<h3 className="font-medium">
						{t("form", "step3.title")}{" "}
						<span className="text-destructive">*</span>
					</h3>
					{showValidationErrors && validationErrors.personalNote && (
						<span className="text-xs text-destructive ml-auto">
							⚠️{" "}
							{language === "de"
								? "Pflichtfeld"
								: language === "fr"
									? "Requis"
									: "Required"}
						</span>
					)}
				</div>
				<div className="space-y-4 px-2">
					<p className="text-sm text-muted-foreground">
						{t(
							"form",
							isUS
								? "step3.languageHintUS"
								: isFrance
									? "step3.languageHintFR"
									: country === "de"
										? "step3.languageHintDE"
										: "step3.languageHint",
						)}
					</p>

					{/* Textarea with subtle voice input icon */}
					<div className="relative">
						<Textarea
							id="story"
							placeholder={t(
								"form",
								isCanada
									? "step3.placeholderCA"
									: isUK
										? "step3.placeholderUK"
										: isFrance
											? "step3.placeholderFR"
											: isUS
												? "step3.placeholderUS"
												: "step3.placeholderDE",
							)}
							className={`min-h-30 resize-none pr-10 ${
								showValidationErrors && validationErrors.personalNote
									? "border-destructive focus-visible:ring-destructive"
									: ""
							}`}
							value={personalNote}
							onChange={(e) => {
								setPersonalNote(e.target.value);
								if (showValidationErrors && e.target.value.trim()) {
									setError(null);
								}
							}}
							required
							aria-invalid={
								showValidationErrors && !!validationErrors.personalNote
							}
							aria-describedby={
								showValidationErrors && validationErrors.personalNote
									? "story-error"
									: undefined
							}
						/>
						{/* Voice input - subtle icon in corner */}
						<div className="absolute top-2 right-2 flex items-center gap-1">
							<VoiceInput
								onTranscript={setPersonalNote}
								appendMode={true}
								currentValue={personalNote}
							/>
						</div>
					</div>
					{showValidationErrors && validationErrors.personalNote && (
						<p
							id="story-error"
							className="text-xs text-destructive flex items-center gap-1"
						>
							<span>⚠️</span> {validationErrors.personalNote}
						</p>
					)}
					<p className="text-xs text-muted-foreground">
						{t("form", "step3.hint")}
					</p>

					<WhyBox
						title={t("form", "step3.whyTitle")}
						text={t("form", "step3.whyText")}
						defaultOpen
					/>
				</div>
			</div>

			{/* Step 4: Demands */}
			<div
				className={`p-4 md:p-5 rounded-xl bg-card border shadow-sm space-y-4 transition-colors ${
					showValidationErrors && validationErrors.demands
						? "border-destructive/60 bg-destructive/5"
						: "border-border/60"
				}`}
				data-has-error={
					showValidationErrors && validationErrors.demands ? "true" : undefined
				}
			>
				<div className="flex items-center gap-2">
					<span
						className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
							showValidationErrors && validationErrors.demands
								? "bg-destructive text-destructive-foreground"
								: "bg-primary text-primary-foreground"
						}`}
					>
						4
					</span>
					<h3 className="font-medium">
						{t("form", "step4.title")}{" "}
						<span className="text-destructive">*</span>
					</h3>
					{showValidationErrors && validationErrors.demands && (
						<span className="text-xs text-destructive ml-auto">
							⚠️{" "}
							{language === "de"
								? "Pflichtfeld"
								: language === "fr"
									? "Requis"
									: "Required"}
						</span>
					)}
				</div>
				<div className="space-y-3 px-2">
					<p className="text-sm text-muted-foreground">
						{t("form", "step4.hint")}
					</p>
					{showValidationErrors && validationErrors.demands && (
						<p className="text-xs text-destructive flex items-center gap-1">
							<span>⚠️</span> {validationErrors.demands}
						</p>
					)}
					<div className="grid gap-2">
						{demands.map((demand) => {
							const isSelected = selectedDemands.includes(demand.id);
							// Check if demand is completed/achieved
							// biome-ignore lint/suspicious/noExplicitAny: Union type requires explicit casting
							const isCompleted = (demand as any).completed === true;
							// Handle different language structures: DE has {de, en}, CA has {en, fr}
							// biome-ignore lint/suspicious/noExplicitAny: Union type requires explicit casting
							const titleObj = demand.title as any;
							// biome-ignore lint/suspicious/noExplicitAny: Union type requires explicit casting
							const descObj = demand.description as any;
							const demandTitle =
								titleObj[language] || titleObj.en || titleObj.de;
							const demandDescription =
								descObj[language] || descObj.en || descObj.de;

							// Completed demand styling
							const completedBadgeText =
								language === "de"
									? "Erreicht!"
									: language === "fr"
										? "Accompli!"
										: language === "es"
											? "¡Logrado!"
											: "Achieved!";

							// Completed demands are NOT selectable - shown as achievements only
							if (isCompleted) {
								return (
									<div
										key={demand.id}
										className="w-full text-left p-4 rounded-xl bg-green-50 dark:bg-green-950/40 text-foreground border-2 border-green-500 relative overflow-hidden"
									>
										{/* Celebration corner ribbon */}
										<div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
											🎉 {completedBadgeText}
										</div>
										<div className="flex items-start gap-3">
											<div className="shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center bg-green-500 text-white">
												<Check className="h-3 w-3 text-white" />
											</div>
											<div className="space-y-1 min-w-0 flex-1 pr-16">
												<span className="font-medium text-sm text-green-800 dark:text-green-200">
													{demandTitle}
												</span>
												<p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
													{demandDescription}
												</p>
											</div>
										</div>
									</div>
								);
							}

							return (
								<button
									key={demand.id}
									type="button"
									onClick={() => toggleDemand(demand.id)}
									className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
										isSelected
											? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
											: "bg-muted/40 hover:bg-muted/70 text-foreground border border-border/50 hover:border-primary/30"
									}`}
								>
									<div className="flex items-start gap-3">
										<div
											className={`shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
												isSelected
													? "bg-primary-foreground/20"
													: "bg-primary/10"
											}`}
										>
											{isSelected && (
												<Check className="h-3 w-3 text-primary-foreground" />
											)}
										</div>
										<div className="space-y-1 min-w-0 flex-1">
											<span
												className={`font-medium text-sm ${
													isSelected ? "text-primary-foreground" : ""
												}`}
											>
												{demandTitle}
											</span>
											<p
												className={`text-xs leading-relaxed ${
													isSelected
														? "text-primary-foreground/80"
														: "text-muted-foreground"
												}`}
											>
												{demandDescription}
											</p>
										</div>
									</div>
								</button>
							);
						})}
					</div>

					<WhyBox
						title={t("form", "step4.whyTitle")}
						text={t("form", "step4.whyText")}
					/>
				</div>
			</div>

			{/* Consent Checkbox (DSGVO-required) */}
			<div
				className={`p-4 md:p-5 rounded-xl space-y-3 transition-colors ${
					showValidationErrors && validationErrors.consent
						? "bg-destructive/10 border border-destructive/60"
						: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40"
				}`}
				data-has-error={
					showValidationErrors && validationErrors.consent ? "true" : undefined
				}
			>
				<label htmlFor="consent" className="flex gap-3 cursor-pointer">
					<div className="flex-none w-5 h-5 mt-0.5">
						<Checkbox
							id="consent"
							checked={consentGiven}
							onCheckedChange={(checked) => setConsentGiven(checked === true)}
							required
						/>
					</div>
					<div className="flex-1 min-w-0 space-y-1">
						<span className="text-sm font-medium text-foreground">
							{language === "de"
								? "Einwilligung zur Datenverarbeitung *"
								: "Consent to Data Processing *"}
						</span>
						<p className="text-xs text-muted-foreground leading-relaxed">
							{t("form", "consent.label")}
						</p>
						{showValidationErrors && validationErrors.consent && (
							<p className="text-xs text-destructive flex items-center gap-1 mt-1">
								<span>⚠️</span> {validationErrors.consent}
							</p>
						)}
					</div>
				</label>
				{/* Extra reassurance */}
				<div className="flex items-start gap-2 pt-2 border-t border-amber-200/40 dark:border-amber-800/30">
					<ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
					<p className="text-xs text-muted-foreground">
						{language === "de"
							? "Kein Account nötig. Keine Datenbank. Dein Brief wird lokal generiert und direkt an dich übergeben."
							: "No account needed. No database. Your letter is generated locally and handed directly to you."}
					</p>
				</div>
			</div>

			{/* Error */}
			{error && (
				<div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
					{error}
				</div>
			)}

			{/* Submit */}
			<div className="relative">
				<Button
					type="submit"
					size="lg"
					className="w-full h-14 text-base font-medium shadow-md"
					disabled={!isValid}
				>
					{t("form", "submit.default")}
				</Button>
				{/* Invisible overlay to capture clicks when button is disabled */}
				{!isValid && (
					<button
						type="button"
						className="absolute inset-0 cursor-pointer"
						onClick={handleSubmitClick}
						aria-label={
							language === "de"
								? "Formular überprüfen"
								: language === "fr"
									? "Vérifier le formulaire"
									: "Check form"
						}
					/>
				)}
			</div>

			{/* Validation summary when there are errors */}
			{showValidationErrors && !isValid && (
				<div className="rounded-lg bg-destructive/5 border border-destructive/30 p-4 space-y-2">
					<p className="text-sm font-medium text-destructive flex items-center gap-2">
						<span>⚠️</span>
						{language === "de"
							? "Bitte fülle alle Pflichtfelder aus:"
							: language === "fr"
								? "Veuillez remplir tous les champs obligatoires :"
								: "Please complete all required fields:"}
					</p>
					<ul className="text-sm text-destructive space-y-1 ml-6 list-disc">
						{Object.entries(validationErrors).map(([key, message]) => (
							<li key={key}>{message}</li>
						))}
					</ul>
				</div>
			)}
		</form>
	);
}
