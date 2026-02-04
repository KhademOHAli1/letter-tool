/**
 * Platform Settings Page
 * Configure platform-wide settings
 */

import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { PlatformSetting } from "@/lib/types";
import { SettingsClient } from "./settings-client";

async function getSettings(): Promise<PlatformSetting[]> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase
		.from("platform_settings")
		.select("*")
		.order("key");

	if (error) {
		console.error("Error fetching settings:", error);
		return [];
	}

	type SettingRow = {
		key: string;
		value: unknown;
		description: string | null;
		updated_at: string;
		updated_by: string | null;
	};
	return (data ?? []).map((s: SettingRow) => ({
		key: s.key,
		value: s.value,
		description: s.description,
		updatedAt: s.updated_at,
		updatedBy: s.updated_by,
	}));
}

export default async function PlatformSettingsPage() {
	const user = await getUser();

	if (!user || !isSuperAdmin(user)) {
		redirect("/admin");
	}

	const settings = await getSettings();

	return <SettingsClient settings={settings} />;
}
