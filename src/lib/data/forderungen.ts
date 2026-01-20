/**
 * Forderungen basierend auf dem Strategiepapier Iran 2026
 * Konkret, scharf, umsetzbar - mit klarer Zuständigkeit
 */

export interface Forderung {
	id: string;
	title: string;
	description: string;
	/** Kurze, prägnante Formulierung für den Brief */
	briefText: string;
	/** Zuständigkeit im Bundestag/Regierung */
	zustaendigkeit: string;
}

export const FORDERUNGEN: Forderung[] = [
	{
		id: "gba-ermittlung",
		title: "Strafverfolgung nach Völkerstrafrecht einleiten",
		description:
			"Der Generalbundesanwalt soll ein Strukturermittlungsverfahren gegen iranische Verantwortliche wegen Verbrechen gegen die Menschlichkeit (§ 7 VStGB) einleiten.",
		briefText:
			"Fordern Sie das BMJ auf, den Generalbundesanwalt zur Einleitung eines Strukturermittlungsverfahrens gegen iranische Funktionsträger wegen Verbrechen gegen die Menschlichkeit zu bewegen. Das Weltrechtsprinzip ermöglicht dies.",
		zustaendigkeit: "BMJ/Generalbundesanwalt",
	},
	{
		id: "irgc-terrorliste",
		title: "IRGC auf die EU-Terrorliste setzen",
		description:
			"Die Islamischen Revolutionsgarden (IRGC) müssen als terroristische Organisation gelistet werden - mit Betätigungsverbot und Vermögenseinfrierung in der EU.",
		briefText:
			"Setzen Sie sich im Auswärtigen Ausschuss dafür ein, dass Deutschland die Listung der IRGC als terroristische Organisation auf EU-Ebene vorantreibt. Das EU-Parlament hat dies bereits 2023 gefordert.",
		zustaendigkeit: "AA/BMI",
	},
	{
		id: "interpol",
		title: "Internationale Haftbefehle beantragen",
		description:
			"Deutschland soll über das BKA Interpol Red Notices für identifizierte Haupttäter beantragen - IRGC-Kommandeure, Geheimdienstchefs, Richter der Revolutionsgerichte.",
		briefText:
			"Fordern Sie das BKA auf, Interpol Red Notices für dokumentierte Haupttäter zu beantragen. Kein Täter darf sich bei Auslandsreisen sicher fühlen.",
		zustaendigkeit: "BKA/AA",
	},
	{
		id: "defektionsprogramm",
		title: "Defektionsprogramm für Regime-Insider",
		description:
			"Ein deutsches Programm für Überläufer aus dem Regime schaffen - mit Schutz, Aufenthalt und Strafmilderung bei Kooperation.",
		briefText:
			"Unterstützen Sie die Einrichtung eines Defektionsprogramms für Regime-Insider, die aussagen wollen. Solche Programme haben sich bei anderen Diktaturen bewährt.",
		zustaendigkeit: "BND/BMI/AA",
	},
	{
		id: "starlink",
		title: "Freies Internet im Iran finanzieren",
		description:
			"Die Bundesregierung soll Starlink-Terminals und VPN-Infrastruktur für die iranische Bevölkerung beschaffen und finanzieren.",
		briefText:
			"Setzen Sie sich dafür ein, dass Deutschland Starlink-Terminals und VPN-Zugänge für Iraner:innen finanziert. Kommunikation ist Lebensader des Widerstands.",
		zustaendigkeit: "AA/BMZ",
	},
	{
		id: "icc",
		title: "Verweisung an den Internationalen Strafgerichtshof",
		description:
			"Deutschland soll eine Art. 15-Kommunikation beim IStGH einreichen und eine Koalition für eine UN-Sicherheitsratsverweisung bilden.",
		briefText:
			"Unterstützen Sie eine deutsche Initiative für eine Art. 15-Kommunikation an den Internationalen Strafgerichtshof. Die Verbrechen müssen international geahndet werden.",
		zustaendigkeit: "AA/BMJ",
	},
	{
		id: "iaea",
		title: "IAEA-Zugang zum Nuklearprogramm durchsetzen",
		description:
			"Keine Sanktionserleichterung ohne vollständige IAEA-Verifikation. Das Nuklearprogramm muss transparent werden.",
		briefText:
			"Fordern Sie: Keine Sanktionserleichterungen ohne vollständigen IAEA-Zugang. Nuklearwaffen in den Händen dieses Regimes wären eine Katastrophe.",
		zustaendigkeit: "AA",
	},
	{
		id: "sekundaersanktionen",
		title: "Sekundärsanktionen konsequent durchsetzen",
		description:
			"Deutsche Unternehmen und Banken, die Sanktionen umgehen, müssen konsequent bestraft werden. Keine Schlupflöcher für das Regime.",
		briefText:
			"Drängen Sie auf konsequente Durchsetzung der Sanktionen. Jedes deutsche Unternehmen, das dem Regime hilft, verlängert das Leid.",
		zustaendigkeit: "BMWi/BaFin",
	},
	{
		id: "asyl",
		title: "Schnelle Schutzverfahren für Iraner:innen",
		description:
			"Iranische Schutzsuchende brauchen beschleunigte Asylverfahren und sicheren Aufenthalt. Abschiebungen in den Iran müssen ausgesetzt bleiben.",
		briefText:
			"Setzen Sie sich für beschleunigte Asylverfahren für Iraner:innen ein. Wer vor diesem Regime flieht, braucht schnellen Schutz - nicht jahrelange Unsicherheit.",
		zustaendigkeit: "BMI/BAMF",
	},
	{
		id: "koalition",
		title: "Internationale Koalition 'Freunde des iranischen Volkes'",
		description:
			"Deutschland soll eine internationale Koalition gleichgesinnter Staaten für koordinierte Maßnahmen gegen das Regime anführen.",
		briefText:
			"Unterstützen Sie die Bildung einer internationalen Koalition 'Freunde des iranischen Volkes' unter deutscher Führung. Nur gemeinsam kann man dieses Regime in die Knie zwingen.",
		zustaendigkeit: "BK/AA",
	},
];
