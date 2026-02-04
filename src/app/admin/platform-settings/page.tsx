/**
 * Platform Settings Page
 * Redirect to unified settings page
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";

export default async function PlatformSettingsPage() {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/admin");
	}

	redirect("/admin/settings#platform-settings");
}
