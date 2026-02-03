import { type NextRequest, NextResponse } from "next/server";

function parseGoogleSheetUrl(
	input: string,
): { id: string; gid: string } | null {
	try {
		const url = new URL(input);
		const match = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
		if (!match) return null;
		const id = match[1];
		let gid = url.searchParams.get("gid") || "0";

		if (url.hash) {
			const hashMatch = url.hash.match(/gid=([0-9]+)/);
			if (hashMatch?.[1]) {
				gid = hashMatch[1];
			}
		}

		return { id, gid };
	} catch {
		return null;
	}
}

export async function POST(request: NextRequest) {
	let body: { url?: string };
	try {
		body = (await request.json()) as { url?: string };
	} catch {
		return NextResponse.json(
			{ error: "Invalid request payload." },
			{ status: 400 },
		);
	}

	if (!body.url) {
		return NextResponse.json(
			{ error: "Missing Google Sheets URL." },
			{ status: 400 },
		);
	}

	const parsed = parseGoogleSheetUrl(body.url);
	if (!parsed) {
		return NextResponse.json(
			{ error: "Invalid Google Sheets URL." },
			{ status: 400 },
		);
	}

	const exportUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv&gid=${parsed.gid}`;

	try {
		const response = await fetch(exportUrl, { cache: "no-store" });
		if (!response.ok) {
			return NextResponse.json(
				{
					error:
						"Could not access the Google Sheet. Make sure it's shared as 'Anyone with the link can view'.",
				},
				{ status: 400 },
			);
		}

		const text = await response.text();
		const trimmed = text.trim().toLowerCase();
		if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
			return NextResponse.json(
				{
					error:
						"Could not access the Google Sheet. Make sure it's shared as 'Anyone with the link can view'.",
				},
				{ status: 400 },
			);
		}

		return NextResponse.json({ csv: text });
	} catch (error) {
		console.error("[API] Error fetching Google Sheet:", error);
		return NextResponse.json(
			{ error: "Failed to fetch Google Sheet." },
			{ status: 500 },
		);
	}
}
