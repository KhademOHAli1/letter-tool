/**
 * Campaigns Directory Page (redirect)
 * Redirects to country-specific campaigns page
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
	// Get preferred country from cookie, default to 'de'
	const cookieStore = await cookies();
	const country = cookieStore.get("country")?.value || "de";

	// Redirect to country-specific campaigns page
	redirect(`/${country}/campaigns`);
}
