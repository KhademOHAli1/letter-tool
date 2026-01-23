import { redirect } from "next/navigation";

/**
 * Root page - redirects to country-specific version
 * The middleware handles geo-based routing, but this serves as a fallback
 */
export default async function RootPage() {
	// Fallback redirect to German version if middleware doesn't catch it
	// This shouldn't normally happen, but provides a safety net
	redirect("/de");
}
