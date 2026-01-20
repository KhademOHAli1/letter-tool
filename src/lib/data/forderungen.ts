/**
 * Forderungen die Bürger:innen unterstützen können
 */

export interface Forderung {
	id: string;
	title: string;
	description: string;
}

export const FORDERUNGEN: Forderung[] = [
	{
		id: "sanctions",
		title: "Gezielte Sanktionen gegen Verantwortliche",
		description:
			"Einreiseverbote und Kontensperren für iranische Funktionäre, die für Menschenrechtsverletzungen verantwortlich sind",
	},
	{
		id: "irgc",
		title: "IRGC auf EU-Terrorliste",
		description:
			"Einstufung der Iranischen Revolutionsgarden (IRGC) als terroristische Organisation auf EU-Ebene",
	},
	{
		id: "embassy",
		title: "Diplomatische Konsequenzen",
		description:
			"Einschränkung der diplomatischen Beziehungen und Schließung von Kulturzentren, die der Überwachung dienen",
	},
	{
		id: "asylum",
		title: "Schutz für Geflüchtete",
		description:
			"Schnellere Asylverfahren und sicherer Aufenthaltsstatus für iranische Schutzsuchende in Deutschland",
	},
	{
		id: "internet",
		title: "Freies Internet unterstützen",
		description:
			"Förderung von Technologien, die Iraner:innen Zugang zu freiem Internet ermöglichen",
	},
	{
		id: "documentation",
		title: "Dokumentation von Verbrechen",
		description:
			"Unterstützung internationaler Mechanismen zur Dokumentation von Menschenrechtsverletzungen im Iran",
	},
];
