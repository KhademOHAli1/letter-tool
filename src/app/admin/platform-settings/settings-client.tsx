/**
 * Platform Settings Client Component
 */

"use client";

import {
	AlertCircle,
	Check,
	Loader2,
	Mail,
	Megaphone,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PlatformSetting } from "@/lib/types";

interface SettingsClientProps {
	settings: PlatformSetting[];
}

const SETTING_GROUPS: Record<
	string,
	{ label: string; icon: React.ReactNode; keys: string[] }
> = {
	registration: {
		label: "Registration & Onboarding",
		icon: <Users className="h-5 w-5" />,
		keys: [
			"allow_public_registration",
			"require_application_approval",
			"default_trial_days",
			"default_campaign_quota",
			"default_monthly_letter_quota",
		],
	},
	campaigns: {
		label: "Campaigns",
		icon: <Megaphone className="h-5 w-5" />,
		keys: ["max_demands_per_campaign", "require_campaign_approval"],
	},
	notifications: {
		label: "Notifications",
		icon: <Mail className="h-5 w-5" />,
		keys: ["admin_notification_email", "send_application_notifications"],
	},
	security: {
		label: "Security",
		icon: <Shield className="h-5 w-5" />,
		keys: ["rate_limit_per_minute", "max_letter_length"],
	},
};

const SETTING_LABELS: Record<
	string,
	{ label: string; description: string; type: "boolean" | "number" | "string" }
> = {
	allow_public_registration: {
		label: "Allow Public Registration",
		description: "Allow anyone to create an account without an invitation",
		type: "boolean",
	},
	require_application_approval: {
		label: "Require Application Approval",
		description:
			"New campaigners must be approved before they can create campaigns",
		type: "boolean",
	},
	default_trial_days: {
		label: "Default Trial Period (days)",
		description: "Number of days for new account trial period",
		type: "number",
	},
	default_campaign_quota: {
		label: "Default Campaign Quota",
		description: "Default number of campaigns new accounts can create",
		type: "number",
	},
	default_monthly_letter_quota: {
		label: "Default Monthly Letter Quota",
		description:
			"Default number of letters new accounts can generate per month",
		type: "number",
	},
	max_demands_per_campaign: {
		label: "Max Demands per Campaign",
		description: "Maximum number of demands allowed in a single campaign",
		type: "number",
	},
	require_campaign_approval: {
		label: "Require Campaign Approval",
		description: "Campaigns must be approved before they go live",
		type: "boolean",
	},
	admin_notification_email: {
		label: "Admin Notification Email",
		description: "Email address to receive admin notifications",
		type: "string",
	},
	send_application_notifications: {
		label: "Send Application Notifications",
		description: "Send email notifications when new applications are submitted",
		type: "boolean",
	},
	rate_limit_per_minute: {
		label: "Rate Limit (per minute)",
		description: "Maximum API requests per minute per IP",
		type: "number",
	},
	max_letter_length: {
		label: "Max Letter Length",
		description: "Maximum character length for generated letters",
		type: "number",
	},
};

export function SettingsClient({ settings }: SettingsClientProps) {
	const router = useRouter();
	const [editedSettings, setEditedSettings] = useState<Record<string, unknown>>(
		Object.fromEntries(settings.map((s) => [s.key, s.value])),
	);
	const [savingKey, setSavingKey] = useState<string | null>(null);
	const [savedKey, setSavedKey] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (key: string, value: unknown) => {
		setEditedSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async (key: string) => {
		setSavingKey(key);
		setError(null);

		try {
			const response = await fetch("/api/superadmin/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key, value: editedSettings[key] }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to save setting");
			}

			setSavedKey(key);
			setTimeout(() => setSavedKey(null), 2000);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save setting");
		} finally {
			setSavingKey(null);
		}
	};

	const getSettingValue = (key: string) => {
		return editedSettings[key];
	};

	const hasChanged = (key: string) => {
		const original = settings.find((s) => s.key === key)?.value;
		return editedSettings[key] !== original;
	};

	const renderSettingInput = (key: string) => {
		const config = SETTING_LABELS[key];
		if (!config) return null;

		const value = getSettingValue(key);
		const changed = hasChanged(key);

		if (config.type === "boolean") {
			return (
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor={key}>{config.label}</Label>
						<p className="text-sm text-muted-foreground">
							{config.description}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Switch
							id={key}
							checked={value === true || value === "true"}
							onCheckedChange={(checked) => handleChange(key, checked)}
						/>
						{changed && (
							<Button
								size="sm"
								onClick={() => handleSave(key)}
								disabled={savingKey === key}
							>
								{savingKey === key ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : savedKey === key ? (
									<Check className="h-4 w-4" />
								) : (
									"Save"
								)}
							</Button>
						)}
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-2">
				<Label htmlFor={key}>{config.label}</Label>
				<p className="text-sm text-muted-foreground">{config.description}</p>
				<div className="flex items-center gap-2">
					<Input
						id={key}
						type={config.type === "number" ? "number" : "text"}
						value={String(value ?? "")}
						onChange={(e) =>
							handleChange(
								key,
								config.type === "number"
									? Number.parseInt(e.target.value, 10) || 0
									: e.target.value,
							)
						}
						className="max-w-xs"
					/>
					{changed && (
						<Button
							size="sm"
							onClick={() => handleSave(key)}
							disabled={savingKey === key}
						>
							{savingKey === key ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : savedKey === key ? (
								<Check className="h-4 w-4" />
							) : (
								"Save"
							)}
						</Button>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Platform Settings</h1>
				<p className="text-muted-foreground">
					Configure platform-wide settings and defaults
				</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{Object.entries(SETTING_GROUPS).map(([groupKey, group]) => {
				const groupSettings = settings.filter((s) =>
					group.keys.includes(s.key),
				);
				if (groupSettings.length === 0) return null;

				return (
					<Card key={groupKey}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{group.icon}
								{group.label}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{group.keys.map((key) => {
								const setting = settings.find((s) => s.key === key);
								if (!setting) return null;
								return (
									<div
										key={key}
										className="pb-4 border-b last:border-0 last:pb-0"
									>
										{renderSettingInput(key)}
									</div>
								);
							})}
						</CardContent>
					</Card>
				);
			})}

			{/* Show any settings not in groups */}
			{settings.filter(
				(s) =>
					!Object.values(SETTING_GROUPS).some((g) => g.keys.includes(s.key)),
			).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Other Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{settings
							.filter(
								(s) =>
									!Object.values(SETTING_GROUPS).some((g) =>
										g.keys.includes(s.key),
									),
							)
							.map((setting) => (
								<div
									key={setting.key}
									className="pb-4 border-b last:border-0 last:pb-0"
								>
									<div className="space-y-2">
										<Label>{setting.key}</Label>
										{setting.description && (
											<p className="text-sm text-muted-foreground">
												{setting.description}
											</p>
										)}
										<div className="flex items-center gap-2">
											<Input
												value={String(editedSettings[setting.key] ?? "")}
												onChange={(e) =>
													handleChange(setting.key, e.target.value)
												}
												className="max-w-xs"
											/>
											{hasChanged(setting.key) && (
												<Button
													size="sm"
													onClick={() => handleSave(setting.key)}
													disabled={savingKey === setting.key}
												>
													{savingKey === setting.key ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : savedKey === setting.key ? (
														<Check className="h-4 w-4" />
													) : (
														"Save"
													)}
												</Button>
											)}
										</div>
									</div>
								</div>
							))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
