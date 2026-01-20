"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

export function LetterForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
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

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/generate-letter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					senderName: name,
					senderPlz: plz,
					wahlkreis: wahlkreis?.name,
					mdb: selectedMdB,
					forderungen: selectedForderungen,
					personalNote,
					// Include timing info for server-side validation
					_timing: timeSinceRender,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fehler beim Generieren");
			}

			const result = await response.json();

			// Speichere Ergebnis in sessionStorage und navigiere zum Editor
			sessionStorage.setItem(
				"letterData",
				JSON.stringify({
					...result,
					mdb: selectedMdB,
					senderName: name,
				}),
			);
			router.push("/editor");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Ein Fehler ist aufgetreten",
			);
		} finally {
			setIsLoading(false);
		}
	}

	const isValid = name.trim() && selectedMdB && selectedForderungen.length > 0;

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{/* Honeypot field - hidden from users, bots will fill it */}
			<div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
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

			{/* Step 1: PLZ → Wahlkreis → MdB */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						1
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
							className="max-w-[160px]"
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
						<div className="space-y-2">
							<Label className="text-sm">Wähle deine:n Abgeordnete:n</Label>
							<Select
								value={selectedMdB?.id || ""}
								onValueChange={(id) =>
									setSelectedMdB(mdbs.find((m) => m.id === id) || null)
								}
							>
								<SelectTrigger className="h-auto py-2">
									{selectedMdB ? (
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 overflow-hidden rounded-full bg-muted flex-shrink-0 ring-2 ring-border">
												<Image
													src={selectedMdB.imageUrl}
													alt={selectedMdB.name}
													width={40}
													height={40}
													className="object-cover object-top w-full h-full"
													unoptimized
												/>
											</div>
											<div className="text-left">
												<p className="font-medium">{selectedMdB.name}</p>
												<span
													className={`inline-block px-2 py-0.5 rounded text-xs ${
														PARTY_COLORS[selectedMdB.party] || "bg-gray-200"
													}`}
												>
													{selectedMdB.party}
												</span>
											</div>
										</div>
									) : (
										<SelectValue placeholder="Abgeordnete:n auswählen..." />
									)}
								</SelectTrigger>
								<SelectContent className="max-h-80">
									{mdbs.map((mdb) => (
										<SelectItem
											key={mdb.id}
											value={mdb.id}
											className="cursor-pointer py-2"
										>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 overflow-hidden rounded-full bg-muted flex-shrink-0 ring-2 ring-border">
													<Image
														src={mdb.imageUrl}
														alt={mdb.name}
														width={40}
														height={40}
														className="object-cover object-top w-full h-full"
														unoptimized
													/>
												</div>
												<div>
													<p className="font-medium">{mdb.name}</p>
													<span
														className={`inline-block px-2 py-0.5 rounded text-xs ${
															PARTY_COLORS[mdb.party] || "bg-gray-200"
														}`}
													>
														{mdb.party}
													</span>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
			</div>

			{/* Step 2: Forderungen */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						2
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

			{/* Step 3: Persönliche Geschichte */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						3
					</span>
					<h3 className="font-medium">Deine Geschichte</h3>
				</div>

				<div className="space-y-4 pl-8">
					<p className="text-sm text-muted-foreground">
						Was verbindet dich mit dem Iran? Erzähle von deiner Familie, deinen
						Erfahrungen oder warum dir das Thema am Herzen liegt.
					</p>
					<Textarea
						id="story"
						placeholder="z.B. Meine Großeltern leben noch in Teheran und ich mache mir jeden Tag Sorgen um sie..."
						className="min-h-[120px] resize-none"
						value={personalNote}
						onChange={(e) => setPersonalNote(e.target.value)}
					/>
					<p className="text-xs text-muted-foreground">
						💡 Persönliche Geschichten berühren mehr als Statistiken.
					</p>
				</div>
			</div>

			{/* Step 4: Name */}
			<div className="space-y-4 p-5 rounded-xl bg-card border border-border/60 shadow-sm">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						4
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
				disabled={isLoading || !isValid}
			>
				{isLoading ? (
					<span className="flex items-center gap-2">
						<svg
							className="h-4 w-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Brief wird erstellt...
					</span>
				) : (
					"Brief erstellen ✨"
				)}
			</Button>
		</form>
	);
}
