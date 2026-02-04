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
	Shield,
	Users,
	Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PlatformSetting } from "@/lib/types";

interface SettingsClientProps {
	settings: PlatformSetting[];
	showHeader?: boolean;
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

const formatSettingLabel = (key: string) => {
	return key
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function SettingsClient({
	settings,
	showHeader = true,
}: SettingsClientProps) {
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
			{showHeader && (
				<div>
					<h1 className="text-2xl font-bold">Platform Settings</h1>
					<p className="text-muted-foreground">
						Configure platform-wide settings and defaults
					</p>
				</div>
			)}

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
				<Card className="overflow-hidden border-dashed">
					<CardHeader className="bg-muted/30">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									<Wrench className="h-5 w-5 text-muted-foreground" />
								</div>
								<div>
									<CardTitle className="text-lg">Other Settings</CardTitle>
									<CardDescription>
										Advanced configuration options
									</CardDescription>
								</div>
							</div>
							<Badge variant="outline" className="text-xs">
								{
									settings.filter(
										(s) =>
											!Object.values(SETTING_GROUPS).some((g) =>
												g.keys.includes(s.key),
											),
									).length
								}{" "}
								items
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<TooltipProvider>
							<div className="divide-y">
								{settings
									.filter(
										(s) =>
											!Object.values(SETTING_GROUPS).some((g) =>
												g.keys.includes(s.key),
											),
									)
									.map((setting, index) => (
										<div
											key={setting.key}
											className="group relative p-5 transition-colors hover:bg-muted/40"
										>
											<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
												<div className="flex items-start gap-4">
													<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-100 to-slate-200 text-sm font-medium text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
														{index + 1}
													</div>
													<div className="space-y-1.5">
														<div className="flex items-center gap-2">
															<span className="font-medium">
																{formatSettingLabel(setting.key)}
															</span>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Badge
																		variant="secondary"
																		className="cursor-help font-mono text-[10px] px-1.5 py-0"
																	>
																		{setting.key}
																	</Badge>
																</TooltipTrigger>
																<TooltipContent side="top">
																	<p>Database key: {setting.key}</p>
																</TooltipContent>
															</Tooltip>
														</div>
														<p className="text-sm text-muted-foreground leading-relaxed max-w-md">
															{setting.description ||
																"No description provided for this setting."}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-3 lg:w-85">
													<div className="relative flex-1">
														<Input
															value={String(editedSettings[setting.key] ?? "")}
															onChange={(e) =>
																handleChange(setting.key, e.target.value)
															}
															className="pr-10 font-mono text-sm"
														/>
														{hasChanged(setting.key) && (
															<span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
														)}
													</div>
													<Button
														size="sm"
														variant={
															hasChanged(setting.key) ? "default" : "ghost"
														}
														onClick={() => handleSave(setting.key)}
														disabled={
															!hasChanged(setting.key) ||
															savingKey === setting.key
														}
														className="min-w-17.5 transition-all"
													>
														{savingKey === setting.key ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : savedKey === setting.key ? (
															<>
																<Check className="mr-1 h-4 w-4 text-green-500" />
																Saved
															</>
														) : (
															"Save"
														)}
													</Button>
												</div>
											</div>
										</div>
									))}
							</div>
						</TooltipProvider>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
