/**
 * Admin Profile Page - Redirects to Settings
 * Profile settings are consolidated in the Settings page
 */

import { redirect } from "next/navigation";

export default function AdminProfilePage() {
	redirect("/admin/settings");
}
