/**
 * Forderungen basierend auf dem Strategiepapier Iran 2026
 * Fokus: Menschenrechtslage, Regime Change, R2P
 * Scharf, direkt, symbolisch wirksam
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
		id: "r2p",
		title: "Schutzverantwortung (R2P) aktivieren",
		description:
			"Bei über 12.000 Toten und systematischen Verbrechen gegen die Menschlichkeit muss Deutschland die Schutzverantwortung (Responsibility to Protect) im UN-Rahmen aktivieren - inklusive Artikel 42 der UN-Charta.",
		briefText:
			"Ich fordere Sie auf, sich für die Aktivierung der Schutzverantwortung (R2P) einzusetzen. Bei über 12.000 Toten sind alle Artikel-41-Maßnahmen ausgeschöpft. Deutschland muss im UN-Sicherheitsrat weitergehende Schritte nach Artikel 42 der UN-Charta vorbereiten.",
		zustaendigkeit: "AA/BK",
	},
	{
		id: "regime-delegitimierung",
		title: "Regime politisch delegitimieren",
		description:
			"Das iranische Regime hat jede Legitimität verloren. Deutschland muss es auf internationaler Bühne als das benennen, was es ist: ein verbrecherisches System, das sein eigenes Volk massakriert.",
		briefText:
			"Sprechen Sie in der UN-Generalversammlung und im Bundestag klar aus: Dieses Regime hat jede Legitimität verloren. Es massakriert sein eigenes Volk. Deutschland darf es nicht länger als legitimen Verhandlungspartner behandeln.",
		zustaendigkeit: "AA/BK",
	},
	{
		id: "gba-ermittlung",
		title: "Strafverfolgung nach Völkerstrafrecht",
		description:
			"Der Generalbundesanwalt muss sofort ein Strukturermittlungsverfahren wegen Verbrechen gegen die Menschlichkeit einleiten. Haftbefehle gegen IRGC-Kommandeure, Geheimdienstchefs und Richter der Revolutionsgerichte.",
		briefText:
			"Fordern Sie das BMJ auf, den Generalbundesanwalt zur sofortigen Einleitung eines Strukturermittlungsverfahrens nach § 7 VStGB zu bewegen. Haftbefehle gegen die Haupttäter müssen vorbereitet werden - jetzt.",
		zustaendigkeit: "BMJ/GBA",
	},
	{
		id: "irgc-terrorliste",
		title: "IRGC auf die EU-Terrorliste",
		description:
			"Die Islamischen Revolutionsgarden sind eine Terrororganisation. Sie müssen auf die EU-Terrorliste - mit Betätigungsverbot, Vermögenseinfrierung und strafrechtlicher Verfolgung von Unterstützern in Deutschland.",
		briefText:
			"Setzen Sie sich dafür ein, dass Deutschland die sofortige Listung der IRGC als terroristische Organisation auf EU-Ebene durchsetzt. Das EU-Parlament fordert dies seit 2023. Wann handelt die Bundesregierung?",
		zustaendigkeit: "AA/BMI",
	},
	{
		id: "interpol",
		title: "Internationale Haftbefehle",
		description:
			"Deutschland muss über Interpol Red Notices für die Haupttäter beantragen. Kein IRGC-General, kein Folterer, kein Henker-Richter darf sich bei Auslandsreisen sicher fühlen.",
		briefText:
			"Fordern Sie das BKA auf, Interpol Red Notices für dokumentierte Haupttäter zu beantragen. Die Mörder von 12.000 Menschen dürfen nirgendwo auf der Welt sicher sein.",
		zustaendigkeit: "BKA/AA",
	},
	{
		id: "botschafter",
		title: "Iranischen Botschafter ausweisen",
		description:
			"Der iranische Botschafter in Berlin vertritt ein Regime, das Verbrechen gegen die Menschlichkeit begeht. Er muss ausgewiesen werden.",
		briefText:
			"Setzen Sie sich für die Ausweisung des iranischen Botschafters ein. Deutschland kann nicht Diplomaten eines Regimes empfangen, das gerade sein Volk massakriert.",
		zustaendigkeit: "AA",
	},
	{
		id: "icc",
		title: "Verweisung an den Strafgerichtshof",
		description:
			"Deutschland muss eine Koalition für die Verweisung an den Internationalen Strafgerichtshof bilden und selbst eine Art. 15-Kommunikation einreichen.",
		briefText:
			"Unterstützen Sie eine deutsche Initiative zur Verweisung der Iran-Situation an den Internationalen Strafgerichtshof. Die Täter müssen vor ein internationales Tribunal.",
		zustaendigkeit: "AA/BMJ",
	},
	{
		id: "starlink",
		title: "Internet für den Widerstand",
		description:
			"Die Bundesregierung muss Starlink-Terminals und VPN-Infrastruktur für die iranische Bevölkerung finanzieren. Kommunikation ist die Lebensader des Widerstands.",
		briefText:
			"Setzen Sie sich dafür ein, dass Deutschland Starlink-Terminals und sichere Kommunikationskanäle für Iraner:innen finanziert. Das Regime kämpft mit Blackouts - wir müssen dem Volk Augen und Stimme geben.",
		zustaendigkeit: "AA/BMZ",
	},
];
