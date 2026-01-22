import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Impressum | Stimme für Iran",
	description: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG",
};

export default function ImpressumPage() {
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
					<h1 className="text-3xl font-bold mt-4">Impressum</h1>
					<p className="text-muted-foreground mt-2">
						Angaben gemäß § 5 TMG (Telemediengesetz)
					</p>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-10">
				<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-xl font-semibold mb-3">Anbieter & Kontakt</h2>
						<div className="text-muted-foreground space-y-2">
							<p className="font-medium text-foreground">
								Ali Khademolhosseini
							</p>
							<p>
								E-Mail:{" "}
								<a
									href="mailto:hi@khademohali.me"
									className="text-primary hover:underline"
								>
									hi@khademohali.me
								</a>
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
						</h2>
						<div className="text-muted-foreground space-y-3">
							<p className="font-medium text-foreground">
								Ali Khademolhosseini
							</p>
							<p>
								Die redaktionelle Verantwortung bezieht sich ausschließlich auf
								die statischen Inhalte dieser Website (Texte, Anleitungen,
								Informationen zur Nutzung).{" "}
								<strong>
									Für KI-generierte Briefentwürfe übernimmt der Nutzer die volle
									inhaltliche Verantwortung
								</strong>{" "}
								(siehe Abschnitt „KI-generierte Inhalte" unten).
							</p>
						</div>
					</section>

					{/* Critical AI Content Section */}
					<section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4 text-amber-900 dark:text-amber-100">
							⚠️ KI-generierte Inhalte – Wichtige Hinweise
						</h2>

						<h3 className="text-lg font-medium mt-4 mb-2 text-amber-800 dark:text-amber-200">
							Art der Dienstleistung
						</h3>
						<p className="text-amber-700 dark:text-amber-300">
							Diese Website stellt ein{" "}
							<strong>Werkzeug zur Unterstützung</strong> bei der Erstellung von
							Briefentwürfen bereit. Die KI (OpenAI GPT) generiert auf Basis
							Ihrer Eingaben <strong>unverbindliche Textvorschläge</strong>, die
							ausdrücklich als Entwürfe zu verstehen sind.
						</p>

						<h3 className="text-lg font-medium mt-4 mb-2 text-amber-800 dark:text-amber-200">
							Verantwortung des Nutzers
						</h3>
						<ul className="text-amber-700 dark:text-amber-300 space-y-2 list-disc list-inside">
							<li>
								<strong>Sie als Nutzer sind allein verantwortlich</strong> für
								den finalen Inhalt jedes Briefes, den Sie versenden.
							</li>
							<li>
								Sie sind verpflichtet, jeden generierten Text{" "}
								<strong>
									vor dem Versenden zu prüfen, zu bearbeiten und anzupassen
								</strong>
								.
							</li>
							<li>
								Mit dem Versenden eines Briefes übernehmen Sie die volle
								<strong> rechtliche Verantwortung</strong> für dessen Inhalt.
							</li>
							<li>
								KI-generierte Inhalte können{" "}
								<strong>
									Fehler, Ungenauigkeiten oder unbeabsichtigte Aussagen
								</strong>{" "}
								enthalten.
							</li>
						</ul>

						<h3 className="text-lg font-medium mt-4 mb-2 text-amber-800 dark:text-amber-200">
							Keine Gewährleistung
						</h3>
						<p className="text-amber-700 dark:text-amber-300">
							Der Betreiber übernimmt <strong>keine Gewähr</strong> für die
							Richtigkeit, Vollständigkeit, Aktualität oder Angemessenheit der
							KI-generierten Texte. Insbesondere wird keine Haftung übernommen
							für:
						</p>
						<ul className="text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside mt-2">
							<li>
								Sachliche Fehler oder falsche Informationen in generierten
								Texten
							</li>
							<li>Rechtliche Konsequenzen aus dem Versenden von Briefen</li>
							<li>
								Schäden, die durch die Nutzung der generierten Inhalte entstehen
							</li>
							<li>Die Eignung der Texte für einen bestimmten Zweck</li>
						</ul>

						<h3 className="text-lg font-medium mt-4 mb-2 text-amber-800 dark:text-amber-200">
							Kennzeichnung gemäß EU AI Act
						</h3>
						<p className="text-amber-700 dark:text-amber-300">
							Gemäß Art. 50 der EU-Verordnung über Künstliche Intelligenz (AI
							Act) weisen wir darauf hin: Die von diesem Dienst generierten
							Textinhalte werden mittels{" "}
							<strong>künstlicher Intelligenz (OpenAI GPT)</strong> erstellt.
							Die Texte durchlaufen keine redaktionelle Prüfung durch den
							Betreiber. Die redaktionelle Kontrolle und Verantwortung liegt
							beim Nutzer.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">Nutzungsbedingungen</h2>
						<p className="text-muted-foreground">
							Die Nutzung dieses kostenlosen Dienstes erfolgt auf eigene Gefahr.
							Mit der Nutzung akzeptieren Sie, dass:
						</p>
						<ul className="text-muted-foreground space-y-1 list-disc list-inside mt-2">
							<li>
								Sie die generierten Inhalte vor dem Versenden prüfen und
								anpassen
							</li>
							<li>
								Sie die volle Verantwortung für versendete Briefe übernehmen
							</li>
							<li>Sie den Dienst nicht für rechtswidrige Zwecke nutzen</li>
							<li>
								Sie keine falschen, irreführenden oder diffamierenden Inhalte
								verbreiten
							</li>
							<li>
								Sie keine Inhalte erstellen, die gegen geltendes Recht verstoßen
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Haftungsausschluss für kostenlose Dienste
						</h2>
						<p className="text-muted-foreground">
							Dieser Dienst wird{" "}
							<strong>unentgeltlich und ohne kommerzielle Absicht</strong>{" "}
							angeboten. Die Haftung des Betreibers für Schäden jeglicher Art,
							die durch die Nutzung dieses Dienstes entstehen, wird
							ausgeschlossen, soweit gesetzlich zulässig. Dies gilt nicht bei
							Vorsatz oder grober Fahrlässigkeit sowie bei der Verletzung von
							Leben, Körper oder Gesundheit.
						</p>

						<h3 className="text-lg font-medium mt-4 mb-2">
							Haftung für Inhalte
						</h3>
						<p className="text-muted-foreground">
							Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
							Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
							verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
							jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
							Informationen zu überwachen.{" "}
							<strong>
								KI-generierte Inhalte, die auf Nutzereingaben basieren, gelten
								als nutzergenerierte Inhalte.
							</strong>
						</p>

						<h3 className="text-lg font-medium mt-4 mb-2">Haftung für Links</h3>
						<p className="text-muted-foreground">
							Unser Angebot enthält Links zu externen Websites Dritter, auf
							deren Inhalte wir keinen Einfluss haben. Für die Inhalte der
							verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
							verantwortlich.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
						<p className="text-muted-foreground">
							Die durch den Betreiber erstellten Inhalte und Werke auf diesen
							Seiten (Website-Design, statische Texte, Quellcode) unterliegen
							dem deutschen Urheberrecht. Der Quellcode steht unter der
							MIT-Lizenz auf GitHub zur Verfügung.
						</p>
						<p className="text-muted-foreground mt-2">
							<strong>KI-generierte Briefentwürfe:</strong> Nach deutschem
							Urheberrecht genießen rein maschinell generierte Texte keinen
							Urheberrechtsschutz, da sie keine persönliche geistige Schöpfung
							darstellen. Die Rechte an den finalen, vom Nutzer bearbeiteten
							Briefen liegen beim jeweiligen Nutzer.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
						<p className="text-muted-foreground">
							Die Europäische Kommission stellt eine Plattform zur
							Online-Streitbeilegung (OS) bereit:{" "}
							<a
								href="https://ec.europa.eu/consumers/odr/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								https://ec.europa.eu/consumers/odr/
							</a>
						</p>
						<p className="text-muted-foreground mt-2">
							Da dieser Dienst kostenlos und nicht kommerziell ist, sind wir
							nicht verpflichtet, an Streitbeilegungsverfahren vor einer
							Verbraucherschlichtungsstelle teilzunehmen.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Missbrauch und rechtswidrige Nutzung
						</h2>
						<p className="text-muted-foreground">
							Der Dienst ist ausschließlich für die Erstellung sachlicher,
							höflicher und rechtmäßiger Korrespondenz mit Abgeordneten
							bestimmt. Folgende Nutzungen sind untersagt:
						</p>
						<ul className="text-muted-foreground space-y-1 list-disc list-inside mt-2">
							<li>Erstellung von Drohungen, Beleidigungen oder Hassrede</li>
							<li>Verbreitung von Falschinformationen oder Propaganda</li>
							<li>Automatisierte Massennutzung (Spam)</li>
							<li>
								Jegliche Nutzung, die gegen deutsches oder EU-Recht verstößt
							</li>
						</ul>
						<p className="text-muted-foreground mt-2">
							Bei Verdacht auf Missbrauch behalten wir uns vor, den Zugang zu
							sperren und gegebenenfalls rechtliche Schritte einzuleiten.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Zweck und politische Einordnung
						</h2>
						<p className="text-muted-foreground">
							Dieses Werkzeug ist ein{" "}
							<strong>zivilgesellschaftliches Advocacy-Projekt</strong> der
							iranischen Diaspora in Deutschland. Es unterstützt Menschen dabei,
							sich bei ihren gewählten Bundestagsabgeordneten für
							Menschenrechte, Freiheit und Würde in Iran einzusetzen.
						</p>
						<p className="text-muted-foreground mt-2">
							Der Betreiber positioniert sich klar{" "}
							<strong>
								für Menschenrechte und gegen Menschenrechtsverletzungen
							</strong>{" "}
							durch das Regime in Iran. Dies ist eine zivilgesellschaftliche
							Position, keine parteipolitische. Der Dienst ist unabhängig von
							politischen Parteien, Regierungen oder staatlichen Stellen.
						</p>
						<p className="text-muted-foreground mt-2">
							Nutzer sind frei, die generierten Texte nach ihren eigenen
							Überzeugungen anzupassen oder nicht zu verwenden.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">Keine Rechtsberatung</h2>
						<p className="text-muted-foreground">
							Die auf dieser Website bereitgestellten Informationen und
							generierten Texte stellen <strong>keine Rechtsberatung</strong>{" "}
							dar. Bei rechtlichen Fragen wenden Sie sich bitte an einen
							qualifizierten Rechtsanwalt. Der Betreiber ist nicht für
							rechtliche Konsequenzen verantwortlich, die aus der Nutzung der
							generierten Briefe entstehen könnten.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Änderungen und Verfügbarkeit
						</h2>
						<p className="text-muted-foreground">
							Der Betreiber behält sich vor, diesen Dienst jederzeit ohne
							Vorankündigung zu ändern, einzuschränken oder einzustellen. Es
							besteht kein Anspruch auf dauerhafte Verfügbarkeit des Dienstes.
							Diese rechtlichen Hinweise können jederzeit aktualisiert werden;
							die jeweils aktuelle Version gilt ab dem Zeitpunkt der
							Veröffentlichung.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Anwendbares Recht und Gerichtsstand
						</h2>
						<p className="text-muted-foreground">
							Es gilt ausschließlich das Recht der Bundesrepublik Deutschland
							unter Ausschluss des UN-Kaufrechts. Für Streitigkeiten aus oder im
							Zusammenhang mit der Nutzung dieses Dienstes ist, soweit
							gesetzlich zulässig, der Gerichtsstand am Wohnsitz des Betreibers.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Salvatorische Klausel
						</h2>
						<p className="text-muted-foreground">
							Sollten einzelne Bestimmungen dieses Impressums unwirksam sein
							oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
							unberührt. An die Stelle der unwirksamen Bestimmung tritt eine
							wirksame Bestimmung, die dem wirtschaftlichen Zweck der
							unwirksamen Bestimmung am nächsten kommt.
						</p>
					</section>

					<section className="border-t border-border/50 pt-6">
						<p className="text-sm text-muted-foreground/70">
							<strong>Stand:</strong> Januar 2026
						</p>
					</section>
				</div>
			</main>

			<footer className="border-t border-border/50 mt-10">
				<div className="container mx-auto max-w-3xl px-4 py-6">
					<p className="text-sm text-muted-foreground text-center">
						<Link href="/datenschutz" className="hover:text-primary">
							Datenschutzerklärung
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
