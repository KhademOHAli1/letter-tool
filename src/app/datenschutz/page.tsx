import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Datenschutzerklärung | Stimme für Iran",
	description:
		"Datenschutzerklärung gemäß DSGVO - Informationen zur Verarbeitung personenbezogener Daten",
};

export default function DatenschutzPage() {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b border-border/50">
				<div className="container mx-auto max-w-3xl px-4 py-8">
					<Link
						href="/"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						← Zurück zur Startseite
					</Link>
					<h1 className="text-3xl font-bold mt-4">Datenschutzerklärung</h1>
					<p className="text-muted-foreground mt-2">
						Informationen gemäß Art. 13 und 14 DSGVO
					</p>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-10">
				<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
						<p className="text-muted-foreground">
							Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO)
							ist:
						</p>
						<address className="not-italic text-muted-foreground mt-2">
							<p className="font-medium text-foreground">Ali Khademolhosseini</p>
							<p>
								E-Mail:{" "}
								<a
									href="mailto:hi@khademohali.me"
									className="text-primary hover:underline"
								>
									hi@khademohali.me
								</a>
							</p>
						</address>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							2. Übersicht der Datenverarbeitung
						</h2>
						<p className="text-muted-foreground">
							Diese Website unterstützt Sie dabei, einen persönlichen Brief an
							Ihren Bundestagsabgeordneten zu verfassen. Dabei werden folgende
							Daten verarbeitet:
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
							<li>
								<strong>Eingabedaten:</strong> Name, Postleitzahl, persönliche
								Notizen
							</li>
							<li>
								<strong>Technische Daten:</strong> IP-Adresse, Browser-Typ,
								Zugriffszeit
							</li>
							<li>
								<strong>Nutzungsdaten:</strong> Anonymisierte Analysedaten
								(Vercel Analytics)
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							3. Briefgenerierung mit KI (OpenAI)
						</h2>
						<p className="text-muted-foreground">
							<strong className="text-foreground">
								Dies ist der wichtigste Punkt:
							</strong>{" "}
							Wenn Sie einen Brief generieren lassen, werden Ihre Eingaben
							(Name, Wahlkreis, persönliche Notiz, ausgewählte Forderungen) an
							die Server von OpenAI, LLC in den USA übermittelt.
						</p>

						<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
							<h3 className="font-semibold text-amber-800 dark:text-amber-200">
								Wichtige Hinweise zur Datenübermittlung in die USA
							</h3>
							<ul className="text-amber-700 dark:text-amber-300 text-sm mt-2 space-y-1">
								<li>
									• OpenAI verarbeitet Ihre Daten in den USA (Drittland gemäß
									DSGVO)
								</li>
								<li>
									• Die Übermittlung erfolgt auf Grundlage Ihrer ausdrücklichen
									Einwilligung (Art. 49 Abs. 1 lit. a DSGVO)
								</li>
								<li>
									• OpenAI ist unter dem EU-US Data Privacy Framework
									zertifiziert
								</li>
								<li>
									• OpenAI speichert API-Anfragen standardmäßig 30 Tage zur
									Missbrauchserkennung
								</li>
							</ul>
						</div>

						<p className="text-muted-foreground mt-4">
							<strong>Rechtsgrundlage:</strong> Ihre ausdrückliche Einwilligung
							gemäß Art. 6 Abs. 1 lit. a DSGVO, die Sie durch Aktivieren der
							Checkbox vor der Generierung erteilen.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit
							mit Wirkung für die Zukunft widerrufen, indem Sie uns per E-Mail
							kontaktieren. Die Rechtmäßigkeit der aufgrund der Einwilligung bis
							zum Widerruf erfolgten Verarbeitung bleibt unberührt.
						</p>
						<p className="text-muted-foreground mt-2">
							Weitere Informationen:{" "}
							<a
								href="https://openai.com/policies/privacy-policy"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								OpenAI Privacy Policy
							</a>
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">4. Hosting (Vercel)</h2>
						<p className="text-muted-foreground">
							Diese Website wird bei Vercel Inc. gehostet. Vercel verarbeitet
							technische Daten wie IP-Adressen, um die Website bereitzustellen.
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
							<li>
								<strong>Anbieter:</strong> Vercel Inc., 340 S Lemon Ave #4133,
								Walnut, CA 91789, USA
							</li>
							<li>
								<strong>Server-Standort:</strong> Frankfurt (fra1) - EU-Region
							</li>
							<li>
								<strong>Rechtsgrundlage:</strong> Berechtigtes Interesse (Art. 6
								Abs. 1 lit. f DSGVO)
							</li>
							<li>
								<strong>Garantien:</strong> EU-US Data Privacy Framework, SCCs
							</li>
						</ul>
						<p className="text-muted-foreground mt-2">
							Weitere Informationen:{" "}
							<a
								href="https://vercel.com/legal/privacy-policy"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Vercel Privacy Policy
							</a>
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							5. Webanalyse (Vercel Analytics)
						</h2>
						<p className="text-muted-foreground">
							Wir nutzen Vercel Analytics zur Analyse der Websitenutzung. Dabei
							werden anonymisierte Daten erfasst:
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
							<li>Seitenaufrufe und Verweildauer</li>
							<li>Gerätekategorie und Betriebssystem (anonymisiert)</li>
							<li>Geografische Region (auf Landesebene)</li>
						</ul>
						<p className="text-muted-foreground mt-3">
							<strong>Hinweis:</strong> Vercel Analytics ist
							datenschutzfreundlich konzipiert und setzt keine Cookies.
							IP-Adressen werden nicht gespeichert.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>Rechtsgrundlage:</strong> Berechtigtes Interesse an der
							Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							6. Rate Limiting und Missbrauchsschutz
						</h2>
						<p className="text-muted-foreground">
							Zum Schutz vor Missbrauch speichern wir temporär:
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
							<li>
								Gehashte IP-Adressen (zur Begrenzung der Anfragen pro Minute)
							</li>
							<li>Fingerprints des Browsers (zur Erkennung von Bots)</li>
							<li>Zeitstempel der letzten Anfragen</li>
						</ul>
						<p className="text-muted-foreground mt-3">
							<strong>Speicherdauer:</strong> Diese Daten werden nur im
							Arbeitsspeicher gehalten und nach maximal 1 Stunde automatisch
							gelöscht.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>Rechtsgrundlage:</strong> Berechtigtes Interesse am Schutz
							vor Missbrauch (Art. 6 Abs. 1 lit. f DSGVO).
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							7. Anonymisierte Nutzungsstatistik
						</h2>
						<p className="text-muted-foreground">
							Zur Messung der Wirksamkeit unserer Kampagne speichern wir bei
							jeder Briefgenerierung anonymisierte Metadaten in unserer
							Datenbank (Supabase, EU-Region Frankfurt):
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
							<li>Name des kontaktierten MdB und Partei</li>
							<li>Ausgewählte Forderungen (nur IDs)</li>
							<li>Wahlkreis-Name</li>
							<li>Anonymisierter Browser-Fingerprint (zur Deduplizierung)</li>
							<li>Zeitstempel</li>
						</ul>
						<p className="text-muted-foreground mt-3">
							<strong>Nicht gespeichert:</strong> Ihr Name, Ihre persönliche
							Geschichte, der Brieftext selbst oder sonstige personenbezogene
							Daten.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>Zweck:</strong> Aggregierte Statistiken (z.B. "423 Briefe
							an den Bundestag gesendet") zur Motivation und Transparenz.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>Rechtsgrundlage:</strong> Berechtigtes Interesse an der
							Wirksamkeitsmessung (Art. 6 Abs. 1 lit. f DSGVO).
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							8. Keine dauerhafte Speicherung Ihrer Briefe
						</h2>
						<p className="text-muted-foreground">
							<strong className="text-foreground">
								Wir speichern Ihre Briefe nicht.
							</strong>{" "}
							Nach der Generierung wird der Brief nur in Ihrem Browser
							angezeigt. Wir haben keine Datenbank mit Ihren persönlichen
							Briefen.
						</p>
						<p className="text-muted-foreground mt-2">
							Der generierte Brief wird temporär (für die Dauer Ihrer
							Browser-Sitzung) in Ihrem lokalen Browser-Speicher gehalten, damit
							Sie ihn kopieren oder per E-Mail versenden können.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">9. Ihre Rechte</h2>
						<p className="text-muted-foreground">
							Sie haben gemäß DSGVO folgende Rechte:
						</p>
						<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
							<li>
								<strong>Auskunft (Art. 15):</strong> Sie können Auskunft über
								Ihre verarbeiteten Daten verlangen.
							</li>
							<li>
								<strong>Berichtigung (Art. 16):</strong> Sie können die
								Berichtigung unrichtiger Daten verlangen.
							</li>
							<li>
								<strong>Löschung (Art. 17):</strong> Sie können die Löschung
								Ihrer Daten verlangen.
							</li>
							<li>
								<strong>Einschränkung (Art. 18):</strong> Sie können die
								Einschränkung der Verarbeitung verlangen.
							</li>
							<li>
								<strong>Datenübertragbarkeit (Art. 20):</strong> Sie können Ihre
								Daten in einem gängigen Format erhalten.
							</li>
							<li>
								<strong>Widerspruch (Art. 21):</strong> Sie können der
								Verarbeitung widersprechen.
							</li>
							<li>
								<strong>Widerruf (Art. 7):</strong> Sie können erteilte
								Einwilligungen jederzeit widerrufen.
							</li>
						</ul>
						<p className="text-muted-foreground mt-4">
							Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte per E-Mail.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							10. Beschwerderecht bei der Aufsichtsbehörde
						</h2>
						<p className="text-muted-foreground">
							Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
							zu beschweren. Die zuständige Behörde richtet sich nach Ihrem
							Wohnort oder dem Sitz des Verantwortlichen.
						</p>
						<p className="text-muted-foreground mt-2">
							Liste der Aufsichtsbehörden:{" "}
							<a
								href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Datenschutzbehörden der Länder
							</a>
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							11. Aktualität dieser Datenschutzerklärung
						</h2>
						<p className="text-muted-foreground">Stand: Januar 2026</p>
						<p className="text-muted-foreground mt-2">
							Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um
							sie an geänderte Rechtslagen oder Änderungen des Dienstes
							anzupassen.
						</p>
					</section>
				</div>
			</main>

			<footer className="border-t border-border/50 mt-10">
				<div className="container mx-auto max-w-3xl px-4 py-6">
					<p className="text-sm text-muted-foreground text-center">
						<Link href="/impressum" className="hover:text-primary">
							Impressum
						</Link>
						{" · "}
						<Link href="/" className="hover:text-primary">
							Startseite
						</Link>
					</p>
				</div>
			</footer>
		</div>
	);
}
