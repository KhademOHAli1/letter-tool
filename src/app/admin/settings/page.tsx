/**
 * Admin Settings Page
 * Account settings, preferences, and platform configuration
 */

"use client";

import { AlertTriangle, Loader2, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { PlatformSetting } from "@/lib/types";
import { SettingsClient } from "../platform-settings/settings-client";

type PlatformSettingRow = {
	key: string;
	value: unknown;
	description: string | null;
	updated_at: string;
	updated_by: string | null;
};

export default function AdminSettingsPage() {
	const router = useRouter();
	const { user, profile, signOut } = useAuth();

	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>(
		[],
	);
	const [platformSettingsError, setPlatformSettingsError] = useState<
		string | null
	>(null);
	const [isLoadingPlatformSettings, setIsLoadingPlatformSettings] =
		useState(false);

	const isSuperAdmin = profile?.role === "super_admin";

	useEffect(() => {
		if (!isSuperAdmin) return;

		let isMounted = true;

		const loadSettings = async () => {
			setIsLoadingPlatformSettings(true);
			setPlatformSettingsError(null);

			try {
				const response = await fetch("/api/superadmin/settings");
				const data = await response.json().catch(() => null);

				if (!response.ok) {
					throw new Error(data?.error || "Failed to load platform settings");
				}

				const rows = (data?.settings ?? []) as PlatformSettingRow[];
				const mapped = rows.map((setting) => ({
					key: setting.key,
					value: setting.value,
					description: setting.description,
					updatedAt: setting.updated_at,
					updatedBy: setting.updated_by,
				}));

				if (isMounted) {
					setPlatformSettings(mapped);
				}
			} catch (error) {
				if (isMounted) {
					setPlatformSettingsError(
						error instanceof Error
							? error.message
							: "Failed to load platform settings",
					);
				}
			} finally {
				if (isMounted) {
					setIsLoadingPlatformSettings(false);
				}
			}
		};

		loadSettings();

		return () => {
			isMounted = false;
		};
	}, [isSuperAdmin]);

	const handleDeleteAccount = async () => {
		if (deleteConfirmText !== "DELETE") return;

		setIsDeleting(true);

		try {
			const response = await fetch("/api/account/delete", {
				method: "POST",
			});

			if (response.ok) {
				await signOut();
				router.push("/?deleted=true");
			} else {
				const data = await response.json();
				alert(data.error || "Failed to delete account");
			}
		} catch (err) {
			console.error("Delete account error:", err);
			alert("Failed to delete account");
		}

		setIsDeleting(false);
	};

	const quotaUsed = profile?.monthlyLettersUsed || 0;
	const quotaLimit = profile?.monthlyLetterQuota || 1000;
	const quotaPercentage = Math.min((quotaUsed / quotaLimit) * 100, 100);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your plan, account details, and platform defaults
				</p>
			</div>

			{isSuperAdmin && (
				<div id="platform-settings" className="space-y-4">
					<div>
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Platform Settings
						</h2>
						<p className="text-sm text-muted-foreground">
							Configure platform-wide defaults and guardrails
						</p>
					</div>

					{platformSettingsError && (
						<Alert variant="destructive">
							<AlertDescription>{platformSettingsError}</AlertDescription>
						</Alert>
					)}

					{isLoadingPlatformSettings ? (
						<Card>
							<CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading platform settings...
							</CardContent>
						</Card>
					) : platformSettings.length > 0 ? (
						<SettingsClient settings={platformSettings} showHeader={false} />
					) : (
						<Card>
							<CardContent className="py-6 text-sm text-muted-foreground">
								No platform settings available.
							</CardContent>
						</Card>
					)}
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Usage & Quotas</CardTitle>
					<CardDescription>Your current plan usage and limits</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-2">
							<Label className="text-muted-foreground">Current Plan</Label>
							<div className="flex items-center gap-2">
								<Badge
									variant="secondary"
									className="text-base px-3 py-1 capitalize"
								>
									{profile?.planTier || "free"}
								</Badge>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-muted-foreground">Campaigns</Label>
							<p className="text-2xl font-bold">
								{profile?.maxCampaigns || 3}
								<span className="text-sm font-normal text-muted-foreground ml-1">
									max
								</span>
							</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label>Monthly Letter Quota</Label>
							<span className="text-sm text-muted-foreground">
								{quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()}
							</span>
						</div>
						<Progress value={quotaPercentage} className="h-2" />
						<p className="text-xs text-muted-foreground">
							{quotaPercentage < 80 ? (
								<>
									You have{" "}
									<strong>{(quotaLimit - quotaUsed).toLocaleString()}</strong>{" "}
									letters remaining this month.
								</>
							) : quotaPercentage < 100 ? (
								<span className="text-amber-600 dark:text-amber-400">
									You&apos;re approaching your monthly limit.
								</span>
							) : (
								<span className="text-destructive">
									You&apos;ve reached your monthly limit.
								</span>
							)}
							{profile?.quotaResetAt && (
								<>
									{" "}
									Resets on{" "}
									{new Date(profile.quotaResetAt).toLocaleDateString()}.
								</>
							)}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>Details about your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<Label className="text-muted-foreground">Account ID</Label>
							<p className="font-mono text-xs break-all">{user?.id || "-"}</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Member Since</Label>
							<p className="text-sm">
								{profile?.createdAt
									? new Date(profile.createdAt).toLocaleDateString()
									: "-"}
							</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Last Updated</Label>
							<p className="text-sm">
								{profile?.updatedAt
									? new Date(profile.updatedAt).toLocaleDateString()
									: "-"}
							</p>
						</div>
						{profile?.approvedAt && (
							<div>
								<Label className="text-muted-foreground">Approved On</Label>
								<p className="text-sm">
									{new Date(profile.approvedAt).toLocaleDateString()}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</CardTitle>
					<CardDescription>
						Irreversible actions for your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-destructive/30 p-4 bg-destructive/5">
						<h4 className="font-medium text-destructive mb-2">
							Delete Account
						</h4>
						<p className="text-sm text-muted-foreground mb-4">
							Once you delete your account, there is no going back. All your
							campaigns, letters, and data will be permanently deleted.
						</p>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Account
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription asChild>
										<div className="space-y-3">
											<p>
												This action cannot be undone. This will permanently
												delete your account and remove all your data from our
												servers.
											</p>
											<p>This includes:</p>
											<ul className="list-disc list-inside text-sm space-y-1">
												<li>All your campaigns</li>
												<li>All generated letters</li>
												<li>Your profile and settings</li>
												<li>All analytics data</li>
											</ul>
											<div className="pt-2">
												<Label htmlFor="deleteConfirm">
													Type <strong>DELETE</strong> to confirm:
												</Label>
												<Input
													id="deleteConfirm"
													value={deleteConfirmText}
													onChange={(e) =>
														setDeleteConfirmText(e.target.value.toUpperCase())
													}
													placeholder="DELETE"
													className="mt-2"
												/>
											</div>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										disabled={deleteConfirmText !== "DELETE" || isDeleting}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{isDeleting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Deleting...
											</>
										) : (
											"Delete Account"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
