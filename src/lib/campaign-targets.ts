export const TARGET_FIELDS = [
	"name",
	"email",
	"postal_code",
	"city",
	"region",
	"country_code",
	"category",
	"image_url",
	"latitude",
	"longitude",
] as const;

export type TargetField = (typeof TARGET_FIELDS)[number];

export const REQUIRED_TARGET_FIELDS: TargetField[] = [
	"name",
	"email",
	"postal_code",
];

export const TARGET_FIELD_LABELS: Record<TargetField, string> = {
	name: "Name",
	email: "Email",
	postal_code: "Postal Code",
	city: "City",
	region: "Region",
	country_code: "Country Code",
	category: "Category",
	image_url: "Image URL",
	latitude: "Latitude",
	longitude: "Longitude",
};

export const TARGET_FIELD_HELP: Record<TargetField, string> = {
	name: "Target name (required)",
	email: "Contact email (required)",
	postal_code: "Postal code (required)",
	city: "City name",
	region: "State or province",
	country_code: "Two-letter country code",
	category: "Optional label like University or NGO",
	image_url: "Logo or image URL",
	latitude: "Decimal degrees",
	longitude: "Decimal degrees",
};

export type TargetUploadRow = {
	name: string;
	email: string;
	postal_code: string;
	city?: string;
	region?: string;
	country_code?: string;
	category?: string;
	image_url?: string;
	latitude?: string;
	longitude?: string;
};

export const TARGET_TEMPLATE_CSV = `name,email,postal_code,city,region,country_code,category,latitude,longitude\nExample University,info@example.edu,10115,Berlin,Berlin,DE,University,52.5200,13.4050\n`;

const TARGET_HEADER_MAP: Record<string, TargetField> = {
	name: "name",
	email: "email",
	postalcode: "postal_code",
	postal_code: "postal_code",
	postcode: "postal_code",
	post_code: "postal_code",
	plz: "postal_code",
	zip: "postal_code",
	city: "city",
	region: "region",
	state: "region",
	country: "country_code",
	countrycode: "country_code",
	country_code: "country_code",
	category: "category",
	type: "category",
	image: "image_url",
	imageurl: "image_url",
	image_url: "image_url",
	latitude: "latitude",
	lat: "latitude",
	longitude: "longitude",
	lng: "longitude",
	lon: "longitude",
};

export function normalizeHeader(header: string): string {
	return header
		.replace(/^\uFEFF/, "")
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "");
}

export function mapHeaderToField(header: string): TargetField | null {
	const key = normalizeHeader(header);
	return TARGET_HEADER_MAP[key] || null;
}

export function autoMapHeaders(headers: string[]): Array<TargetField | null> {
	return headers.map((header) => mapHeaderToField(header));
}

export function detectDelimiter(text: string): string {
	const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
	if (lines.length === 0) return ",";
	const sample = lines[0];
	const tabCount = (sample.match(/\t/g) || []).length;
	const commaCount = (sample.match(/,/g) || []).length;
	return tabCount > commaCount ? "\t" : ",";
}

export function parseDelimited(text: string, delimiter: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i += 1) {
		const char = text[i];
		const next = text[i + 1];

		if (char === '"') {
			if (inQuotes && next === '"') {
				cell += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (char === delimiter && !inQuotes) {
			row.push(cell);
			cell = "";
			continue;
		}

		if ((char === "\n" || char === "\r") && !inQuotes) {
			if (char === "\r" && next === "\n") {
				i += 1;
			}
			row.push(cell);
			if (row.some((value) => value.trim().length > 0)) {
				rows.push(row);
			}
			row = [];
			cell = "";
			continue;
		}

		cell += char;
	}

	row.push(cell);
	if (row.some((value) => value.trim().length > 0)) {
		rows.push(row);
	}

	return rows;
}

export function parseTargetRows(rows: string[][]): {
	rows: TargetUploadRow[];
	skipped: number;
} {
	if (rows.length === 0) return { rows: [], skipped: 0 };

	const headerMap = autoMapHeaders(rows[0]);

	const parsed: TargetUploadRow[] = [];
	let skipped = 0;

	for (let i = 1; i < rows.length; i += 1) {
		const row = rows[i];
		const entry: Partial<TargetUploadRow> = {};

		headerMap.forEach((field, index) => {
			if (!field) return;
			const value = row[index]?.trim();
			if (value) {
				entry[field] = value;
			}
		});

		if (!entry.name || !entry.email || !entry.postal_code) {
			skipped += 1;
			continue;
		}

		parsed.push(entry as TargetUploadRow);
	}

	return { rows: parsed, skipped };
}

export function parseTargetsFromFile(
	fileName: string,
	content: string,
): { rows: TargetUploadRow[]; skipped: number } {
	const lowerName = fileName.toLowerCase();
	if (lowerName.endsWith(".json")) {
		let json: unknown;
		try {
			json = JSON.parse(content);
		} catch {
			throw new Error("Invalid JSON file.");
		}

		if (!Array.isArray(json)) {
			throw new Error("JSON must be an array of targets.");
		}

		const filtered = json
			.map((entry) => {
				if (typeof entry !== "object" || entry === null) return null;
				const record = entry as Record<string, unknown>;
				return {
					name: record.name as string,
					email: record.email as string,
					postal_code:
						(record.postal_code as string) || (record.postalCode as string),
					city: record.city as string | undefined,
					region: record.region as string | undefined,
					country_code:
						(record.country_code as string) || (record.countryCode as string),
					category: record.category as string | undefined,
					image_url:
						(record.image_url as string) || (record.imageUrl as string),
					latitude: (record.latitude as string) || (record.lat as string),
					longitude:
						(record.longitude as string) ||
						(record.lng as string) ||
						(record.lon as string),
				} satisfies Partial<TargetUploadRow>;
			})
			.filter(Boolean) as TargetUploadRow[];

		const valid = filtered.filter(
			(entry) => entry.name && entry.email && entry.postal_code,
		);

		return {
			rows: valid,
			skipped: filtered.length - valid.length,
		};
	}

	const delimiter = lowerName.endsWith(".tsv") ? "\t" : ",";
	const rows = parseDelimited(content, delimiter);
	return parseTargetRows(rows);
}
