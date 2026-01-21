"use client";

import { Check, ChevronDown } from "lucide-react";
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
function validatePersonalNote(text: string): {
	valid: boolean;
	message: string;
} {
	const trimmed = text.trim();
	if (!trimmed)
		return { valid: false, message: "Bitte erzähle deine Geschichte" };

	// Split by sentence-ending punctuation
	const sentences = trimmed
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	if (sentences.length < 3) {
		return {
			valid: false,
			message: `Bitte schreibe mindestens 3 Sätze (aktuell: ${sentences.length})`,
		};
	}

	// Check each sentence has at least 4 words
	for (let i = 0; i < sentences.length; i++) {
		const words = sentences[i].split(/\s+/).filter((w) => w.length > 0);
		if (words.length < 4) {
			return {
				valid: false,
				message: `Satz ${i + 1} ist zu kurz (mindestens 4 Wörter pro Satz)`,
			};
		}
	}

	return { valid: true, message: "" };
}

export function LetterForm() {
	const router = useRouter();
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
			setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
			return;
		}

		// Bot detection: form must be open for at least 3 seconds
		const timeSinceRender = Date.now() - formRenderTime.current;
		if (timeSinceRender < 3000) {
			console.warn("Form submitted too quickly - bot detected");
			setError("Bitte nimm dir Zeit, das Formular auszufüllen.");
			return;
		}

		if (!selectedMdB || selectedForderungen.length === 0) {
			setError("Bitte wähle einen MdB und mindestens eine Forderung");
			return;
		}

		const noteValidation = validatePersonalNote(personalNote);
		if (!noteValidation.valid) {
			setError(noteValidation.message);
			return;
		}

		// Speichere Formulardaten und leite sofort zur Share-Seite weiter
		// Der Brief wird dort im Hintergrund generiert
		sessionStorage.setItem(
			"formData",
			JSON.stringify({
				senderName: name,
				senderPlz: plz,
				wahlkreis: wahlkreis?.name,
				mdb: selectedMdB,
				forderungen: selectedForderungen,
				personalNote,
				_timing: timeSinceRender,
			}),
		);

		router.push("/share");
	}

	const isValid =
		name.trim() &&
		selectedMdB &&
		selectedForderungen.length > 0 &&
		validatePersonalNote(personalNote).valid &&
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
					Dein persönlicher Brief
				</h2>
				<p className="text-sm text-muted-foreground">
					Beantworte ein paar Fragen – wir erstellen daraus einen überzeugenden
					Brief an deine:n Abgeordnete:n.
				</p>
			</div>

			{/* Step 1: Name */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						1
					</span>
					<h3 className="font-medium">Dein Name</h3>
				</div>

				<div className="space-y-2 pl-8">
					<Input
						id="name"
						placeholder="Wie möchtest du den Brief unterschreiben?"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<p className="text-xs text-muted-foreground">
						Der Brief wird mit deinem Namen unterschrieben.
					</p>
				</div>
			</div>

			{/* Step 2: PLZ → Wahlkreis → MdB */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						2
					</span>
					<h3 className="font-medium">An wen geht dein Brief?</h3>
				</div>

				<div className="space-y-4 pl-8">
					{/* PLZ */}
					<div className="space-y-2">
						<Label htmlFor="plz" className="text-sm">
							Deine Postleitzahl
						</Label>
						<Input
							id="plz"
							placeholder="z.B. 10115"
							maxLength={5}
							value={plz}
							onChange={(e) =>
								handlePlzChange(e.target.value.replace(/\D/g, ""))
							}
							className="max-w-40"
						/>
						{plz.length === 5 && !wahlkreis && (
							<p className="text-sm text-destructive">
								Keine Abgeordneten für PLZ {plz} gefunden.
							</p>
						)}
						{wahlkreis && (
							<p className="text-sm text-muted-foreground">
								📍 Wahlkreis {wahlkreis.id}: {wahlkreis.name}
							</p>
						)}
					</div>

					{/* MdB Auswahl */}
					{wahlkreis && mdbs.length === 0 && (
						<div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
							<p className="text-sm font-medium">Keine MdBs gefunden</p>
							<p className="text-xs mt-1">
								Für diesen Wahlkreis sind derzeit keine Daten verfügbar.
							</p>
						</div>
					)}
					{mdbs.length > 0 && (
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								Wähle deine:n Abgeordnete:n
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
												Abgeordnete:n auswählen...
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
										aria-label="Wähle deine:n Abgeordnete:n"
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
				</div>
			</div>

			{/* Step 3: Persönliche Geschichte */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						3
					</span>
					<h3 className="font-medium">
						Deine Geschichte <span className="text-destructive">*</span>
					</h3>
				</div>

				<div className="space-y-4 pl-8">
					<p className="text-sm text-muted-foreground">
						Was verbindet dich mit dem Iran? Erzähle von deiner Familie, deinen
						Erfahrungen oder warum dir das Thema am Herzen liegt.
					</p>
					<Textarea
						id="story"
						placeholder="z.B. Meine Großeltern leben noch in Teheran und ich mache mir jeden Tag Sorgen um sie..."
						className="min-h-30 resize-none"
						value={personalNote}
						onChange={(e) => setPersonalNote(e.target.value)}
						required
					/>
					{personalNote.length > 0 &&
						!validatePersonalNote(personalNote).valid && (
							<p className="text-xs text-destructive">
								{validatePersonalNote(personalNote).message}
							</p>
						)}
					<p className="text-xs text-muted-foreground">
						Schreibe mindestens 3 Sätze mit jeweils 4 Wörtern. Persönliche
						Geschichten berühren mehr als Statistiken.
					</p>
				</div>
			</div>

			{/* Step 4: Forderungen */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						4
					</span>
					<h3 className="font-medium">Wofür setzt du dich ein?</h3>
				</div>

				<div className="space-y-3 pl-8">
					<p className="text-sm text-muted-foreground">
						Wähle die Forderungen, die dir am wichtigsten sind.
					</p>
					<div className="space-y-3">
						{FORDERUNGEN.map((forderung) => (
							<label
								key={forderung.id}
								htmlFor={forderung.id}
								className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
									selectedForderungen.includes(forderung.id)
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-muted/30"
								}`}
							>
								<Checkbox
									id={forderung.id}
									checked={selectedForderungen.includes(forderung.id)}
									onCheckedChange={() => toggleForderung(forderung.id)}
									className="mt-0.5"
								/>
								<div className="space-y-0.5">
									<span className="font-medium text-sm">{forderung.title}</span>
									<p className="text-xs text-muted-foreground">
										{forderung.description}
									</p>
								</div>
							</label>
						))}
					</div>
				</div>
			</div>

			{/* Consent Checkbox (DSGVO-required) */}
			<div className="space-y-4 p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
				<label
					htmlFor="consent"
					className="flex items-start gap-3 cursor-pointer"
				>
					<Checkbox
						id="consent"
						checked={consentGiven}
						onCheckedChange={(checked) => setConsentGiven(checked === true)}
						className="mt-0.5"
						required
					/>
					<div className="space-y-1">
						<span className="text-sm font-medium text-foreground">
							Einwilligung zur Datenverarbeitung *
						</span>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Ich willige ein, dass meine Eingaben (Name, Wahlkreis, persönliche
							Notiz) zur Generierung des Briefes an OpenAI (USA) übermittelt
							werden. Ich habe die{" "}
							<a
								href="/datenschutz"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary underline hover:no-underline"
							>
								Datenschutzerklärung
							</a>{" "}
							gelesen und verstanden.
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
				className="w-full h-12 text-base font-medium shadow-md"
				disabled={!isValid}
			>
				Brief erstellen
			</Button>
		</form>
	);
}
