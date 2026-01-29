/**
 * Forderungen basierend auf dem Strategiepapier Iran 2026
 * Fokus: Menschenrechtslage, Regime Change, R2P
 * Scharf, direkt, symbolisch wirksam
 */

import type { Language } from "@/lib/i18n/translations";

export interface Forderung {
	id: string;
	title: { de: string; en: string };
	description: { de: string; en: string };
	/** Kurze, prägnante Formulierung für den Brief */
	briefText: { de: string; en: string };
	/** Zuständigkeit im Bundestag/Regierung */
	zustaendigkeit: string;
}

/** Helper to get localized text from a Forderung */
export function getForderungText(
	forderung: Forderung,
	field: "title" | "description" | "briefText",
	language: Language,
): string {
	// French and Spanish fall back to English since German demands are only in de/en
	const effectiveLang =
		language === "fr" || language === "es" ? "en" : language;
	return forderung[field][effectiveLang];
}

export const FORDERUNGEN: Forderung[] = [
	{
		id: "r2p",
		title: {
			de: "Schutzverantwortung (R2P) aktivieren",
			en: "Activate Responsibility to Protect (R2P)",
		},
		description: {
			de: "Bei über 36.500 Toten und systematischen Verbrechen gegen die Menschlichkeit muss Deutschland die Schutzverantwortung (Responsibility to Protect) im UN-Rahmen aktivieren - inklusive Artikel 42 der UN-Charta.",
			en: "With over 36,500 dead and systematic crimes against humanity, Germany must activate the Responsibility to Protect (R2P) within the UN framework - including Article 42 of the UN Charter.",
		},
		briefText: {
			de: "Ich fordere Sie auf, sich für die Aktivierung der Schutzverantwortung (R2P) einzusetzen. Bei über 36.500 Toten sind alle Artikel-41-Maßnahmen ausgeschöpft. Deutschland muss im UN-Sicherheitsrat weitergehende Schritte nach Artikel 42 der UN-Charta vorbereiten.",
			en: "I urge you to advocate for activating the Responsibility to Protect (R2P). With over 36,500 dead, all Article 41 measures are exhausted. Germany must prepare further steps under Article 42 of the UN Charter in the Security Council.",
		},
		zustaendigkeit: "AA/BK",
	},
	{
		id: "regime-delegitimierung",
		title: {
			de: "Regime politisch delegitimieren",
			en: "Politically Delegitimize the Regime",
		},
		description: {
			de: "Das iranische Regime hat jede Legitimität verloren. Deutschland muss es auf internationaler Bühne als das benennen, was es ist: ein verbrecherisches System, das sein eigenes Volk massakriert.",
			en: "The Iranian regime has lost all legitimacy. Germany must call it out on the international stage for what it is: a criminal system that massacres its own people.",
		},
		briefText: {
			de: "Sprechen Sie in der UN-Generalversammlung und im Bundestag klar aus: Dieses Regime hat jede Legitimität verloren. Es massakriert sein eigenes Volk. Deutschland darf es nicht länger als legitimen Verhandlungspartner behandeln.",
			en: "Speak clearly in the UN General Assembly and Parliament: This regime has lost all legitimacy. It massacres its own people. Germany must no longer treat it as a legitimate negotiating partner.",
		},
		zustaendigkeit: "AA/BK",
	},
	{
		id: "gba-ermittlung",
		title: {
			de: "Strafverfolgung nach Völkerstrafrecht",
			en: "Prosecution Under International Criminal Law",
		},
		description: {
			de: "Der Generalbundesanwalt muss sofort ein Strukturermittlungsverfahren wegen Verbrechen gegen die Menschlichkeit einleiten. Haftbefehle gegen IRGC-Kommandeure, Geheimdienstchefs und Richter der Revolutionsgerichte.",
			en: "The Federal Prosecutor General must immediately open structural investigations for crimes against humanity. Arrest warrants for IRGC commanders, intelligence chiefs, and Revolutionary Court judges.",
		},
		briefText: {
			de: "Fordern Sie das BMJ auf, den Generalbundesanwalt zur sofortigen Einleitung eines Strukturermittlungsverfahrens nach § 7 VStGB zu bewegen. Haftbefehle gegen die Haupttäter müssen vorbereitet werden - jetzt.",
			en: "Urge the Ministry of Justice to have the Federal Prosecutor General immediately initiate structural investigations under the Code of Crimes against International Law. Arrest warrants for the main perpetrators must be prepared - now.",
		},
		zustaendigkeit: "BMJ/GBA",
	},
	{
		id: "irgc-terrorliste",
		title: {
			de: "IRGC auf die EU-Terrorliste",
			en: "Put the IRGC on the EU Terror List",
		},
		description: {
			de: "Die Islamischen Revolutionsgarden sind eine Terrororganisation. Sie müssen auf die EU-Terrorliste - mit Betätigungsverbot, Vermögenseinfrierung und strafrechtlicher Verfolgung von Unterstützern in Deutschland.",
			en: "The Islamic Revolutionary Guard Corps is a terrorist organization. It must be placed on the EU terror list - with activity bans, asset freezes, and criminal prosecution of supporters in Germany.",
		},
		briefText: {
			de: "Setzen Sie sich dafür ein, dass Deutschland die sofortige Listung der IRGC als terroristische Organisation auf EU-Ebene durchsetzt. Das EU-Parlament fordert dies seit 2023. Wann handelt die Bundesregierung?",
			en: "Advocate for Germany to push for the immediate listing of the IRGC as a terrorist organization at the EU level. The EU Parliament has demanded this since 2023. When will the government act?",
		},
		zustaendigkeit: "AA/BMI",
	},
	{
		id: "interpol",
		title: {
			de: "Internationale Haftbefehle",
			en: "International Arrest Warrants",
		},
		description: {
			de: "Deutschland muss über Interpol Red Notices für die Haupttäter beantragen. Kein IRGC-General, kein Folterer, kein Henker-Richter darf sich bei Auslandsreisen sicher fühlen.",
			en: "Germany must request Interpol Red Notices for the main perpetrators. No IRGC general, no torturer, no executioner-judge should feel safe when traveling abroad.",
		},
		briefText: {
			de: "Fordern Sie das BKA auf, Interpol Red Notices für dokumentierte Haupttäter zu beantragen. Die Mörder von 12.000 Menschen dürfen nirgendwo auf der Welt sicher sein.",
			en: "Urge the Federal Criminal Police to request Interpol Red Notices for documented perpetrators. The murderers of 12,000 people must not be safe anywhere in the world.",
		},
		zustaendigkeit: "BKA/AA",
	},
	{
		id: "botschafter",
		title: {
			de: "Iranischen Botschafter ausweisen",
			en: "Expel the Iranian Ambassador",
		},
		description: {
			de: "Der iranische Botschafter in Berlin vertritt ein Regime, das Verbrechen gegen die Menschlichkeit begeht. Er muss ausgewiesen werden.",
			en: "The Iranian ambassador in Berlin represents a regime committing crimes against humanity. He must be expelled.",
		},
		briefText: {
			de: "Setzen Sie sich für die Ausweisung des iranischen Botschafters ein. Deutschland kann nicht Diplomaten eines Regimes empfangen, das gerade sein Volk massakriert.",
			en: "Advocate for the expulsion of the Iranian ambassador. Germany cannot host diplomats from a regime currently massacring its own people.",
		},
		zustaendigkeit: "AA",
	},
	{
		id: "icc",
		title: {
			de: "Verweisung an den Strafgerichtshof",
			en: "Referral to the International Criminal Court",
		},
		description: {
			de: "Deutschland muss eine Koalition für die Verweisung an den Internationalen Strafgerichtshof bilden und selbst eine Art. 15-Kommunikation einreichen.",
			en: "Germany must build a coalition for referral to the International Criminal Court and submit an Article 15 communication itself.",
		},
		briefText: {
			de: "Unterstützen Sie eine deutsche Initiative zur Verweisung der Iran-Situation an den Internationalen Strafgerichtshof. Die Täter müssen vor ein internationales Tribunal.",
			en: "Support a German initiative to refer the Iran situation to the International Criminal Court. The perpetrators must face an international tribunal.",
		},
		zustaendigkeit: "AA/BMJ",
	},
	{
		id: "starlink",
		title: {
			de: "Internet für den Widerstand",
			en: "Internet for the Resistance",
		},
		description: {
			de: "Die Bundesregierung muss Starlink-Terminals und VPN-Infrastruktur für die iranische Bevölkerung finanzieren. Kommunikation ist die Lebensader des Widerstands.",
			en: "The German government must fund Starlink terminals and VPN infrastructure for the Iranian population. Communication is the lifeline of the resistance.",
		},
		briefText: {
			de: "Setzen Sie sich dafür ein, dass Deutschland Starlink-Terminals und sichere Kommunikationskanäle für Iraner*innen finanziert. Das Regime kämpft mit Blackouts - wir müssen dem Volk Augen und Stimme geben.",
			en: "Advocate for Germany to fund Starlink terminals and secure communication channels for Iranians. The regime fights with blackouts - we must give the people eyes and a voice.",
		},
		zustaendigkeit: "AA/BMZ",
	},
];
