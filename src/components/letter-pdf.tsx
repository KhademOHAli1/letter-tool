"use client";

import {
	Document,
	Page,
	pdf,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

/**
 * Country-specific letter format standards:
 * - Germany: DIN 5008 (Geschäftsbrief Form B)
 * - France: NF Z 11-001 (Norme AFNOR)
 * - UK/Canada/US: Full block format (standard business letter)
 *
 * All measurements in points (1mm ≈ 2.835pt)
 */

// Convert mm to points
const mm = (millimeters: number) => millimeters * 2.835;

// ============================================
// DIN 5008 Format (Germany) - Form B
// ============================================
// Left margin: 25mm, Right margin: 20mm
// Top margin: 27mm (Form B)
// Address field starts at 45mm from top, 25mm from left
// Date line: right-aligned
// Subject: bold, after address block
// Body: justified, 12pt line spacing
const dinStyles = StyleSheet.create({
	page: {
		paddingLeft: mm(25),
		paddingRight: mm(20),
		paddingTop: mm(27),
		paddingBottom: mm(20),
		fontFamily: "Helvetica",
		fontSize: 11,
		lineHeight: 1.5,
	},
	// Fold marks for DIN A4 (optional visual guides)
	foldMarkTop: {
		position: "absolute",
		left: mm(5),
		top: mm(105), // First fold at 105mm
		width: mm(5),
		height: 0.5,
		backgroundColor: "#ccc",
	},
	foldMarkBottom: {
		position: "absolute",
		left: mm(5),
		top: mm(210), // Second fold at 210mm
		width: mm(5),
		height: 0.5,
		backgroundColor: "#ccc",
	},
	// Sender line (small, above address)
	senderLine: {
		fontSize: 8,
		color: "#666",
		marginBottom: mm(2),
		textDecoration: "underline",
	},
	// Address block (starts at 45mm from top in Form B)
	addressBlock: {
		marginTop: mm(18), // ~45mm from top
		marginBottom: mm(8.46), // Standard gap
		minHeight: mm(27.3), // Address window height
	},
	recipientName: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	recipientTitle: {
		fontSize: 11,
	},
	recipientAddress: {
		fontSize: 11,
		marginTop: mm(1),
	},
	// Information block (right side: date, reference)
	infoBlock: {
		marginBottom: mm(8.46),
	},
	dateLine: {
		fontSize: 11,
		textAlign: "right",
	},
	// Subject line (bold)
	subject: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		marginBottom: mm(8.46),
	},
	// Salutation
	salutation: {
		fontSize: 11,
		marginBottom: mm(4.23),
	},
	// Body text
	body: {
		textAlign: "justify",
	},
	paragraph: {
		fontSize: 11,
		marginBottom: mm(4.23),
		lineHeight: 1.5,
	},
	// Closing
	closing: {
		marginTop: mm(8.46),
		fontSize: 11,
	},
	signature: {
		marginTop: mm(12),
		fontSize: 11,
	},
	// Footer
	footer: {
		position: "absolute",
		bottom: mm(10),
		left: mm(25),
		right: mm(20),
		textAlign: "center",
		fontSize: 7,
		color: "#aaa",
	},
});

// ============================================
// UK/Canada/US Block Format
// ============================================
// All elements left-aligned
// Standard margins (1 inch / 25.4mm)
const blockStyles = StyleSheet.create({
	page: {
		paddingLeft: mm(25.4),
		paddingRight: mm(25.4),
		paddingTop: mm(25.4),
		paddingBottom: mm(25.4),
		fontFamily: "Helvetica",
		fontSize: 11,
		lineHeight: 1.5,
	},
	// Sender info at top
	senderBlock: {
		marginBottom: mm(12),
	},
	senderName: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
	},
	// Date
	dateLine: {
		fontSize: 11,
		marginBottom: mm(12),
	},
	// Recipient address block
	addressBlock: {
		marginBottom: mm(12),
	},
	recipientName: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	recipientTitle: {
		fontSize: 11,
		color: "#333",
	},
	recipientEmail: {
		fontSize: 10,
		color: "#666",
		marginTop: mm(1),
	},
	// Subject line (bold, optional "Re:")
	subject: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		marginBottom: mm(8),
	},
	// Salutation
	salutation: {
		fontSize: 11,
		marginBottom: mm(6),
	},
	// Body
	body: {},
	paragraph: {
		fontSize: 11,
		marginBottom: mm(6),
		lineHeight: 1.5,
	},
	// Closing
	closing: {
		marginTop: mm(12),
		fontSize: 11,
	},
	signature: {
		marginTop: mm(16),
		fontSize: 11,
	},
	// Footer
	footer: {
		position: "absolute",
		bottom: mm(15),
		left: mm(25.4),
		right: mm(25.4),
		textAlign: "center",
		fontSize: 7,
		color: "#aaa",
	},
});

// ============================================
// French Format (NF Z 11-001 inspired)
// ============================================
// Sender top-left, recipient top-right
// Date below recipient address
// More formal structure
const frenchStyles = StyleSheet.create({
	page: {
		paddingLeft: mm(20),
		paddingRight: mm(20),
		paddingTop: mm(20),
		paddingBottom: mm(20),
		fontFamily: "Helvetica",
		fontSize: 11,
		lineHeight: 1.5,
	},
	// Header row with sender left, recipient right
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: mm(15),
	},
	// Sender (left side)
	senderBlock: {
		width: "45%",
	},
	senderName: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	// Recipient (right side)
	recipientBlock: {
		width: "45%",
		textAlign: "right",
	},
	recipientName: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	recipientTitle: {
		fontSize: 10,
		color: "#333",
	},
	// Date and place (right-aligned, below recipient)
	dateLine: {
		textAlign: "right",
		fontSize: 11,
		marginBottom: mm(15),
	},
	// Object line (French uses "Objet:")
	objectLine: {
		fontSize: 11,
		marginBottom: mm(10),
	},
	objectLabel: {
		fontFamily: "Helvetica-Bold",
	},
	// Salutation
	salutation: {
		fontSize: 11,
		marginBottom: mm(6),
	},
	// Body
	body: {
		textAlign: "justify",
	},
	paragraph: {
		fontSize: 11,
		marginBottom: mm(6),
		lineHeight: 1.5,
	},
	// Closing (French formal closings are longer)
	closing: {
		marginTop: mm(12),
		fontSize: 11,
	},
	signature: {
		marginTop: mm(16),
		fontSize: 11,
		textAlign: "right",
	},
	// Footer
	footer: {
		position: "absolute",
		bottom: mm(12),
		left: mm(20),
		right: mm(20),
		textAlign: "center",
		fontSize: 7,
		color: "#aaa",
	},
});

interface LetterPdfProps {
	content: string;
	subject: string;
	senderName: string;
	recipientName: string;
	recipientEmail: string;
	recipientParty: string;
	recipientOffice?: string; // Individual office address (e.g., "153 Cannon HOB")
	recipientState?: string; // For US: state name
	country: string;
	language: "de" | "en" | "fr" | "es";
}

// Get localized strings
function getStrings(language: "de" | "en" | "fr" | "es", country: string) {
	const representativeTitle: Record<string, Record<string, string>> = {
		de: {
			de: "Mitglied des Deutschen Bundestages",
			en: "Member of German Parliament",
			fr: "Député(e) du Bundestag",
			es: "Miembro del Parlamento Alemán",
		},
		ca: {
			de: "Mitglied des kanadischen Parlaments",
			en: "Member of Parliament, House of Commons",
			fr: "Député(e), Chambre des communes",
			es: "Miembro del Parlamento, Cámara de los Comunes",
		},
		uk: {
			de: "Mitglied des britischen Parlaments",
			en: "Member of Parliament, House of Commons",
			fr: "Député(e) du Parlement britannique",
			es: "Miembro del Parlamento Británico",
		},
		fr: {
			de: "Mitglied der französischen Nationalversammlung",
			en: "Member of the French National Assembly",
			fr: "Député(e) à l'Assemblée nationale",
			es: "Miembro de la Asamblea Nacional Francesa",
		},
		us: {
			de: "Mitglied des US-Kongresses",
			en: "Member of Congress",
			fr: "Membre du Congrès américain",
			es: "Miembro del Congreso de EE.UU.",
		},
	};

	const generatedBy: Record<string, string> = {
		de: "Erstellt mit stimme-fuer-iran.de",
		en: "Generated with voiceforiran.org",
		fr: "Créé avec voixpourliran.fr",
		es: "Generado con voiceforiran.org",
	};

	return {
		title: representativeTitle[country]?.[language] || "Member of Parliament",
		generatedBy: generatedBy[language] || generatedBy.en,
	};
}

// Format date based on country/language
function formatDate(
	language: "de" | "en" | "fr" | "es",
	country: string,
): string {
	const date = new Date();

	// German format: "Berlin, den 29. Januar 2026" or just "29. Januar 2026"
	if (language === "de") {
		const formatted = date.toLocaleDateString("de-DE", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		return formatted;
	}

	// French format: "Paris, le 29 janvier 2026" - but we skip city
	if (language === "fr") {
		const formatted = date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		return `Le ${formatted}`;
	}

	// Spanish format: "29 de enero de 2026"
	if (language === "es") {
		const formatted = date.toLocaleDateString("es-US", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		return formatted;
	}

	// English formats vary by country
	if (country === "uk") {
		// UK: 29 January 2026 (day month year)
		return date.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}

	// US/Canada: January 29, 2026 (month day, year)
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

// Split content into paragraphs
function splitParagraphs(content: string): string[] {
	return content
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
}

// ============================================
// German DIN 5008 Letter Document
// ============================================
function GermanLetterDocument({
	content,
	subject,
	senderName,
	recipientName,
	recipientParty,
	language,
}: LetterPdfProps) {
	const strings = getStrings(language, "de");
	const paragraphs = splitParagraphs(content);

	return (
		<Document>
			<Page size="A4" style={dinStyles.page}>
				{/* Optional fold marks */}
				<View style={dinStyles.foldMarkTop} />
				<View style={dinStyles.foldMarkBottom} />

				{/* Sender line (small, underlined, above address) */}
				<Text style={dinStyles.senderLine}>{senderName}</Text>

				{/* Address block */}
				<View style={dinStyles.addressBlock}>
					<Text style={dinStyles.recipientName}>{recipientName}</Text>
					<Text style={dinStyles.recipientTitle}>
						{strings.title} ({recipientParty})
					</Text>
					<Text style={dinStyles.recipientAddress}>Deutscher Bundestag</Text>
					<Text style={dinStyles.recipientAddress}>Platz der Republik 1</Text>
					<Text style={dinStyles.recipientAddress}>11011 Berlin</Text>
				</View>

				{/* Date (right-aligned) */}
				<View style={dinStyles.infoBlock}>
					<Text style={dinStyles.dateLine}>{formatDate(language, "de")}</Text>
				</View>

				{/* Subject line */}
				<Text style={dinStyles.subject}>{subject}</Text>

				{/* Body content */}
				<View style={dinStyles.body}>
					{paragraphs.map((paragraph) => (
						<Text key={paragraph} style={dinStyles.paragraph}>
							{paragraph}
						</Text>
					))}
				</View>

				{/* Footer */}
				<Text style={dinStyles.footer}>{strings.generatedBy}</Text>
			</Page>
		</Document>
	);
}

// ============================================
// UK/Canada/US Block Format Letter Document
// ============================================
function BlockLetterDocument({
	content,
	subject,
	senderName,
	recipientName,
	recipientEmail,
	recipientParty,
	recipientOffice,
	recipientState: _recipientState, // Reserved for future use (state in address)
	country,
	language,
}: LetterPdfProps) {
	const strings = getStrings(language, country);
	const paragraphs = splitParagraphs(content);

	// Build address based on country and available data
	let address: string[];
	if (country === "us" && recipientOffice) {
		// US with individual office address
		address = [recipientOffice, "Washington, D.C. 20515"];
	} else if (country === "uk") {
		address = ["House of Commons", "London SW1A 0AA", "United Kingdom"];
	} else if (country === "ca") {
		address = ["House of Commons", "Ottawa, Ontario K1A 0A6", "Canada"];
	} else {
		// Default US address
		address = ["United States Capitol", "Washington, D.C. 20515"];
	}

	return (
		<Document>
			<Page size={country === "uk" ? "A4" : "LETTER"} style={blockStyles.page}>
				{/* Sender info */}
				<View style={blockStyles.senderBlock}>
					<Text style={blockStyles.senderName}>{senderName}</Text>
				</View>

				{/* Date */}
				<Text style={blockStyles.dateLine}>
					{formatDate(language, country)}
				</Text>

				{/* Recipient address block */}
				<View style={blockStyles.addressBlock}>
					<Text style={blockStyles.recipientName}>{recipientName}</Text>
					<Text style={blockStyles.recipientTitle}>
						{strings.title} ({recipientParty})
					</Text>
					{address.map((line) => (
						<Text key={line} style={blockStyles.recipientTitle}>
							{line}
						</Text>
					))}
					<Text style={blockStyles.recipientEmail}>{recipientEmail}</Text>
				</View>

				{/* Subject line */}
				<Text style={blockStyles.subject}>Re: {subject}</Text>

				{/* Body content */}
				<View style={blockStyles.body}>
					{paragraphs.map((paragraph) => (
						<Text key={paragraph} style={blockStyles.paragraph}>
							{paragraph}
						</Text>
					))}
				</View>

				{/* Footer */}
				<Text style={blockStyles.footer}>{strings.generatedBy}</Text>
			</Page>
		</Document>
	);
}

// ============================================
// French Format Letter Document
// ============================================
function FrenchLetterDocument({
	content,
	subject,
	senderName,
	recipientName,
	recipientParty,
	language,
}: LetterPdfProps) {
	const strings = getStrings(language, "fr");
	const paragraphs = splitParagraphs(content);

	return (
		<Document>
			<Page size="A4" style={frenchStyles.page}>
				{/* Header: Sender left, Recipient right */}
				<View style={frenchStyles.headerRow}>
					{/* Sender */}
					<View style={frenchStyles.senderBlock}>
						<Text style={frenchStyles.senderName}>{senderName}</Text>
					</View>

					{/* Recipient */}
					<View style={frenchStyles.recipientBlock}>
						<Text style={frenchStyles.recipientName}>{recipientName}</Text>
						<Text style={frenchStyles.recipientTitle}>
							{strings.title} ({recipientParty})
						</Text>
						<Text style={frenchStyles.recipientTitle}>Assemblée nationale</Text>
						<Text style={frenchStyles.recipientTitle}>
							126, rue de l'Université
						</Text>
						<Text style={frenchStyles.recipientTitle}>75355 Paris 07 SP</Text>
					</View>
				</View>

				{/* Date (right-aligned) */}
				<Text style={frenchStyles.dateLine}>{formatDate(language, "fr")}</Text>

				{/* Object line */}
				<View style={frenchStyles.objectLine}>
					<Text>
						<Text style={frenchStyles.objectLabel}>Objet : </Text>
						{subject}
					</Text>
				</View>

				{/* Body content */}
				<View style={frenchStyles.body}>
					{paragraphs.map((paragraph) => (
						<Text key={paragraph} style={frenchStyles.paragraph}>
							{paragraph}
						</Text>
					))}
				</View>

				{/* Signature (right-aligned for French) */}
				<Text style={frenchStyles.signature}>{senderName}</Text>

				{/* Footer */}
				<Text style={frenchStyles.footer}>{strings.generatedBy}</Text>
			</Page>
		</Document>
	);
}

// ============================================
// Main export: Generate PDF based on country
// ============================================
export async function downloadLetterPdf(props: LetterPdfProps): Promise<void> {
	const { country } = props;

	// Generate PDF based on country format
	let blob: Blob;
	if (country === "de") {
		blob = await pdf(<GermanLetterDocument {...props} />).toBlob();
	} else if (country === "fr") {
		blob = await pdf(<FrenchLetterDocument {...props} />).toBlob();
	} else {
		// UK, CA, US use block format
		blob = await pdf(<BlockLetterDocument {...props} />).toBlob();
	}

	// Create filename from recipient name
	const safeName = props.recipientName
		.replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, "")
		.replace(/\s+/g, "_")
		.toLowerCase();

	const dateStr = new Date().toISOString().split("T")[0];
	const filename = `brief_${safeName}_${dateStr}.pdf`;

	saveAs(blob, filename);
}

// Export components for testing
export { GermanLetterDocument, BlockLetterDocument, FrenchLetterDocument };
