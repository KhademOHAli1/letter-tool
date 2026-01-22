"use client";

import { Check, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FORDERUNGEN } from "@/lib/data/forderungen";
import {
	findMdBsByWahlkreis,
	findWahlkreisByPlz,
	type MdB,
	type Wahlkreis,
} from "@/lib/data/wahlkreise";
import { useLanguage } from "@/lib/i18n/context";

// Partei-Farben für Badge
const PARTY_COLORS: Record<string, string> = {
	"CDU/CSU": "bg-black text-white",
	SPD: "bg-red-600 text-white",
	GRÜNE: "bg-green-600 text-white",
	"DIE LINKE": "bg-purple-600 text-white",
	BSW: "bg-orange-600 text-white",
	Fraktionslos: "bg-gray-500 text-white",
};

// Validate personal story: at least 3 sentences, each with 4+ words
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

	// Split by sentence-ending punctuation
	const sentences = trimmed
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	if (sentences.length < 3) {
		return {
			valid: false,
			message: t("form", "step3.validation.tooFewSentences", {
				count: sentences.length,
			}),
		};
	}

	// Check each sentence has at least 4 words
	for (let i = 0; i < sentences.length; i++) {
		const words = sentences[i].split(/\s+/).filter((w) => w.length > 0);
		if (words.length < 4) {
			return {
				valid: false,
				message: t("form", "step3.validation.sentenceTooShort", { num: i + 1 }),
			};
		}
	}

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
	const { t, language } = useLanguage();
	const [error, setError] = useState<string | null>(null);

	// Honeypot field (hidden, bots will fill it)
	const honeypotRef = useRef<HTMLInputElement>(null);
	// Track form render time (bots submit too fast)
	const formRenderTime = useRef(Date.now());

	// Form state
	const [name, setName] = useState("");
	const [plz, setPlz] = useState("");
	const [wahlkreis, setWahlkreis] = useState<Wahlkreis | null>(null);
	const [mdbs, setMdbs] = useState<MdB[]>([]);
	const [selectedMdB, setSelectedMdB] = useState<MdB | null>(null);
	const [selectedForderungen, setSelectedForderungen] = useState<string[]>([]);
	const [personalNote, setPersonalNote] = useState("");
	const [consentGiven, setConsentGiven] = useState(false);
	const [mdbSelectorOpen, setMdbSelectorOpen] = useState(false);

	// PLZ eingeben → Wahlkreis finden
	const handlePlzChange = (value: string) => {
		setPlz(value);
		setWahlkreis(null);
		setMdbs([]);
		setSelectedMdB(null);

		if (value.length === 5) {
			const found = findWahlkreisByPlz(value);
			if (found) {
				setWahlkreis(found);
				const foundMdbs = findMdBsByWahlkreis(found.id);
				setMdbs(foundMdbs);
				if (foundMdbs.length === 1) {
					setSelectedMdB(foundMdbs[0]);
				}
			}
		}
	};

	// Forderung an-/abwählen
	const toggleForderung = (id: string) => {
		setSelectedForderungen((prev) =>
			prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
		);
	};

	// Formular absenden
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

		if (!selectedMdB || selectedForderungen.length === 0) {
			setError(
				language === "de"
					? "Bitte wähle einen MdB und mindestens eine Forderung"
					: "Please select an MP and at least one demand",
			);
			return;
		}

		const noteValidation = validatePersonalNote(personalNote, t);
		if (!noteValidation.valid) {
			setError(noteValidation.message);
			return;
		}

		// Speichere Formulardaten und leite direkt zur Editor-Seite weiter
		// Der Brief wird dort im Hintergrund generiert mit Streaming
		sessionStorage.setItem(
			"formData",
			JSON.stringify({
				senderName: name,
				senderPlz: plz,
				wahlkreis: wahlkreis?.name,
				mdb: selectedMdB,
				forderungen: selectedForderungen,
				personalNote,
				language, // Store selected language for letter generation
				_timing: timeSinceRender,
			}),
		);

		router.push("/editor");
	}

	const isValid =
		name.trim() &&
		selectedMdB &&
		selectedForderungen.length > 0 &&
		validatePersonalNote(personalNote, t).valid &&
		consentGiven;

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

			{/* Step 1: Name & PLZ */}
			<div className="space-y-4 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						1
					</span>
					<h3 className="font-medium">{t("form", "step1.title")}</h3>
				</div>

				<div className="space-y-4 pl-8">
					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-sm">
							{t("form", "step1.nameLabel")}
						</Label>
						<Input
							id="name"
							placeholder={t("form", "step1.namePlaceholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					{/* PLZ */}
					<div className="space-y-2">
						<Label htmlFor="plz" className="text-sm">
							{t("form", "step1.plzLabel")}
						</Label>
						<Input
							id="plz"
							placeholder={t("form", "step1.plzPlaceholder")}
							maxLength={5}
							value={plz}
							onChange={(e) =>
								handlePlzChange(e.target.value.replace(/\D/g, ""))
							}
							className="max-w-40"
						/>
						{plz.length === 5 && !wahlkreis && (
							<p className="text-sm text-destructive">
								{t("form", "step1.wahlkreisNotFound")}
							</p>
						)}
						{wahlkreis && (
							<p className="text-sm text-muted-foreground">
								📍 {t("form", "step1.wahlkreisFound")}: {wahlkreis.name}
							</p>
						)}
					</div>

					<WhyBox
						title={t("form", "step1.whyTitle")}
						text={t("form", "step1.whyText")}
					/>
				</div>
			</div>

			{/* Step 2: MdB Selection */}
			<div className="space-y-4 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						2
					</span>
					<h3 className="font-medium">{t("form", "step2.title")}</h3>
				</div>

				<div className="space-y-4 pl-8">
					{!wahlkreis && (
						<p className="text-sm text-muted-foreground">
							{t("form", "step2.enterPlzFirst")}
						</p>
					)}

					{wahlkreis && mdbs.length === 0 && (
						<div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
							<p className="text-sm font-medium">
								{language === "de" ? "Keine MdBs gefunden" : "No MPs found"}
							</p>
							<p className="text-xs mt-1">
								{language === "de"
									? "Für diesen Wahlkreis sind derzeit keine Daten verfügbar."
									: "No data available for this constituency."}
							</p>
						</div>
					)}

					{mdbs.length > 0 && (
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								{t("form", "step2.selectLabel")}
							</Label>
							{/* Inline expandable MdB selector */}
							<div className="rounded-lg border border-border overflow-hidden transition-all duration-200">
								{/* Show selected MdB or placeholder when collapsed */}
								{!mdbSelectorOpen && (
									<button
										type="button"
										onClick={() => setMdbSelectorOpen(true)}
										className="w-full flex items-center justify-between gap-3 p-3 bg-background hover:bg-muted/30 transition-colors text-left"
									>
										{selectedMdB ? (
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<div className="h-10 w-10 overflow-hidden rounded-full bg-muted shrink-0 border-2 border-primary/20">
													<Image
														src={selectedMdB.imageUrl}
														alt={selectedMdB.name}
														width={40}
														height={40}
														className="object-cover object-top w-full h-full"
														unoptimized
													/>
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-foreground truncate">
														{selectedMdB.name}
													</p>
													<span
														className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${
															PARTY_COLORS[selectedMdB.party] || "bg-gray-200"
														}`}
													>
														{selectedMdB.party}
													</span>
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

								{/* Expanded list of MdBs */}
								{mdbSelectorOpen && (
									<div
										className="divide-y divide-border"
										role="listbox"
										aria-label={t("form", "step2.selectLabel")}
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												setMdbSelectorOpen(false);
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
										{mdbs.map((mdb) => (
											<button
												key={mdb.id}
												type="button"
												role="option"
												aria-selected={selectedMdB?.id === mdb.id}
												onClick={() => {
													setSelectedMdB(mdb);
													setMdbSelectorOpen(false);
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														setSelectedMdB(mdb);
														setMdbSelectorOpen(false);
													}
												}}
												className={`w-full flex items-center gap-3 p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
													selectedMdB?.id === mdb.id
														? "bg-primary/10"
														: "bg-background hover:bg-muted/50"
												}`}
											>
												<div className="h-10 w-10 overflow-hidden rounded-full bg-muted shrink-0 border border-border">
													<Image
														src={mdb.imageUrl}
														alt={mdb.name}
														width={40}
														height={40}
														className="object-cover object-top w-full h-full"
														unoptimized
													/>
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-foreground truncate">
														{mdb.name}
													</p>
													<span
														className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${
															PARTY_COLORS[mdb.party] || "bg-gray-200"
														}`}
													>
														{mdb.party}
													</span>
												</div>
												{selectedMdB?.id === mdb.id && (
													<Check className="h-5 w-5 text-primary shrink-0" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{wahlkreis && (
						<WhyBox
							title={t("form", "step2.whyTitle")}
							text={t("form", "step2.whyText")}
						/>
					)}
				</div>
			</div>

			{/* Step 3: Personal Story */}
			<div className="space-y-4 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						3
					</span>
					<h3 className="font-medium">
						{t("form", "step3.title")}{" "}
						<span className="text-destructive">*</span>
					</h3>
				</div>

				<div className="space-y-4 pl-8">
					<p className="text-sm text-muted-foreground">
						{t("form", "step3.languageHint")}
					</p>
					<Textarea
						id="story"
						placeholder={t("form", "step3.placeholder")}
						className="min-h-30 resize-none"
						value={personalNote}
						onChange={(e) => setPersonalNote(e.target.value)}
						required
					/>
					{personalNote.length > 0 &&
						!validatePersonalNote(personalNote, t).valid && (
							<p className="text-xs text-destructive">
								{validatePersonalNote(personalNote, t).message}
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
			<div className="space-y-4 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						4
					</span>
					<h3 className="font-medium">{t("form", "step4.title")}</h3>
				</div>

				<div className="space-y-3 pl-8">
					<p className="text-sm text-muted-foreground">
						{t("form", "step4.hint")}
					</p>
					<div className="grid gap-2">
						{FORDERUNGEN.map((forderung) => {
							const isSelected = selectedForderungen.includes(forderung.id);
							return (
								<button
									key={forderung.id}
									type="button"
									onClick={() => toggleForderung(forderung.id)}
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
										<div className="space-y-1 min-w-0">
											<span
												className={`font-medium text-sm block ${isSelected ? "text-primary-foreground" : ""}`}
											>
												{forderung.title}
											</span>
											<p
												className={`text-xs leading-relaxed ${
													isSelected
														? "text-primary-foreground/80"
														: "text-muted-foreground"
												}`}
											>
												{forderung.description}
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
			<div className="p-4 md:p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
				<label
					htmlFor="consent"
					className="flex gap-3 cursor-pointer"
				>
					<div className="pt-0.5">
						<Checkbox
							id="consent"
							checked={consentGiven}
							onCheckedChange={(checked) => setConsentGiven(checked === true)}
							className="h-5 w-5"
							required
						/>
					</div>
					<div className="space-y-1 min-w-0">
						<span className="text-sm font-medium text-foreground">
							{language === "de"
								? "Einwilligung zur Datenverarbeitung *"
								: "Consent to Data Processing *"}
						</span>
						<p className="text-xs text-muted-foreground leading-relaxed">
							{t("form", "consent.label")}
						</p>
					</div>
				</label>
			</div>

			{/* Error */}
			{error && (
				<div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
					{error}
				</div>
			)}

			{/* Submit */}
			<Button
				type="submit"
				size="lg"
				className="w-full h-14 text-base font-medium shadow-md"
				disabled={!isValid}
			>
				{t("form", "submit.default")}
			</Button>
		</form>
	);
}
