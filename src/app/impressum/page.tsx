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
					{/* WICHTIG: Ersetze die Platzhalter mit deinen echten Daten! */}
					<section>
						<h2 className="text-xl font-semibold mb-3">Anbieter</h2>
						<address className="not-italic text-muted-foreground leading-relaxed">
							{/* TODO: Echte Daten eintragen */}
							<p className="font-medium text-foreground">
								[Vorname Nachname / Vereinsname]
							</p>
							<p>[Straße und Hausnummer]</p>
							<p>[PLZ Ort]</p>
							<p>Deutschland</p>
						</address>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">Kontakt</h2>
						<div className="text-muted-foreground space-y-1">
							{/* TODO: Echte Kontaktdaten eintragen */}
							<p>
								E-Mail:{" "}
								<a
									href="mailto:kontakt@example.com"
									className="text-primary hover:underline"
								>
									[deine-email@example.com]
								</a>
							</p>
							{/* Optional: Telefon - nur wenn gewünscht */}
							{/* <p>Telefon: [Telefonnummer]</p> */}
						</div>
					</section>

					{/* Falls Verein oder GmbH: */}
					{/*
					<section>
						<h2 className="text-xl font-semibold mb-3">Registereintrag</h2>
						<div className="text-muted-foreground space-y-1">
							<p>Eingetragen im Vereinsregister / Handelsregister</p>
							<p>Registergericht: Amtsgericht [Stadt]</p>
							<p>Registernummer: VR [Nummer] / HRB [Nummer]</p>
						</div>
					</section>
					*/}

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
						</h2>
						<div className="text-muted-foreground">
							{/* TODO: Echte Daten eintragen - kann dieselbe Person wie oben sein */}
							<p className="font-medium text-foreground">[Vorname Nachname]</p>
							<p>[Adresse wie oben]</p>
						</div>
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
							Wir sind nicht bereit oder verpflichtet, an
							Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
							teilzunehmen.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>

						<h3 className="text-lg font-medium mt-4 mb-2">
							Haftung für Inhalte
						</h3>
						<p className="text-muted-foreground">
							Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
							Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
							verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
							jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
							Informationen zu überwachen oder nach Umständen zu forschen, die
							auf eine rechtswidrige Tätigkeit hinweisen.
						</p>

						<h3 className="text-lg font-medium mt-4 mb-2">Haftung für Links</h3>
						<p className="text-muted-foreground">
							Unser Angebot enthält Links zu externen Websites Dritter, auf
							deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
							diese fremden Inhalte auch keine Gewähr übernehmen. Für die
							Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
							oder Betreiber der Seiten verantwortlich.
						</p>

						<h3 className="text-lg font-medium mt-4 mb-2">Urheberrecht</h3>
						<p className="text-muted-foreground">
							Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
							diesen Seiten unterliegen dem deutschen Urheberrecht. Die
							Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
							Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
							schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-3">
							Hinweis zur KI-Nutzung
						</h2>
						<p className="text-muted-foreground">
							Diese Website nutzt künstliche Intelligenz (OpenAI) zur
							Unterstützung bei der Erstellung von Briefentwürfen. Die
							generierten Texte dienen als Vorschläge und sollten vor dem
							Versenden geprüft und bei Bedarf angepasst werden. Der Nutzer ist
							für den finalen Inhalt seines Briefes selbst verantwortlich.
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
