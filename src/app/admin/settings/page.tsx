/**
 * Admin Settings Page
 * Account settings, preferences, and platform configuration
 */

"use client";

import {
	AlertTriangle,
	Building2,
	Camera,
	Check,
	Eye,
	EyeOff,
	Globe,
	Key,
	Loader2,
	Trash2,
	User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
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
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export default function AdminSettingsPage() {
	const router = useRouter();
	const { user, profile, refreshProfile, signOut } = useAuth();

	// Profile fields
	const [displayName, setDisplayName] = useState(profile?.displayName || "");
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
	const [organizationName, setOrganizationName] = useState(
		profile?.organizationName || "",
	);
	const [organizationWebsite, setOrganizationWebsite] = useState(
		profile?.organizationWebsite || "",
	);
	const [bio, setBio] = useState(profile?.bio || "");

	// Password change
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	// UI state
	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync profile data when it loads
	useEffect(() => {
		if (profile) {
			setDisplayName(profile.displayName || "");
			setAvatarUrl(profile.avatarUrl || "");
			setOrganizationName(profile.organizationName || "");
			setOrganizationWebsite(profile.organizationWebsite || "");
			setBio(profile.bio || "");
		}
	}, [profile]);

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;

		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			alert("Image must be less than 2MB");
			return;
		}

		setIsUploadingAvatar(true);

		try {
			const supabase = getSupabaseBrowserClient();
			const fileExt = file.name.split(".").pop();
			const fileName = `avatar-${Date.now()}.${fileExt}`;
			const filePath = `${user.id}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, file, { upsert: true });

			if (uploadError) {
				console.error("Upload error:", uploadError);
				alert("Failed to upload image. Storage bucket may not be configured.");
				setIsUploadingAvatar(false);
				return;
			}

			const { data: urlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			const newAvatarUrl = urlData.publicUrl;

			const { error: updateError } = await supabase
				.from("user_profiles")
				.update({ avatar_url: newAvatarUrl })
				.eq("id", user.id);

			if (updateError) {
				console.error("Update error:", updateError);
				alert("Failed to update profile");
			} else {
				setAvatarUrl(newAvatarUrl);
				await refreshProfile();
			}
		} catch (err) {
			console.error("Avatar upload error:", err);
			alert("Failed to upload avatar");
		}

		setIsUploadingAvatar(false);
	};

	const handleSaveProfile = async () => {
		if (!user) return;

		setIsSaving(true);
		setSaveSuccess(false);

		const supabase = getSupabaseBrowserClient();
		const { error } = await supabase
			.from("user_profiles")
			.update({
				display_name: displayName,
				organization_name: organizationName || null,
				organization_website: organizationWebsite || null,
				bio: bio || null,
			})
			.eq("id", user.id);

		if (!error) {
			await refreshProfile();
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} else {
			alert("Failed to save profile");
		}

		setIsSaving(false);
	};

	const handleChangePassword = async () => {
		setPasswordError(null);
		setPasswordSuccess(false);

		// Validation
		if (!currentPassword) {
			setPasswordError("Please enter your current password");
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters");
			return;
		}

		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			setPasswordError(
				"Password must contain uppercase, lowercase, and a number",
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		setIsChangingPassword(true);

		try {
			const supabase = getSupabaseBrowserClient();

			// First verify the current password by re-authenticating
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user?.email || "",
				password: currentPassword,
			});

			if (signInError) {
				setPasswordError("Current password is incorrect");
				setIsChangingPassword(false);
				return;
			}

			// Update to new password
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (updateError) {
				setPasswordError(updateError.message);
			} else {
				setPasswordSuccess(true);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
				setTimeout(() => setPasswordSuccess(false), 5000);
			}
		} catch (err) {
			console.error("Password change error:", err);
			setPasswordError("An unexpected error occurred");
		}

		setIsChangingPassword(false);
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirmText !== "DELETE") return;

		setIsDeleting(true);

		try {
			// Call the account deletion API
			const response = await fetch("/api/account/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
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

	// Calculate quota usage
	const quotaUsed = profile?.monthlyLettersUsed || 0;
	const quotaLimit = profile?.monthlyLetterQuota || 1000;
	const quotaPercentage = Math.min((quotaUsed / quotaLimit) * 100, 100);

	const hasProfileChanges =
		displayName !== (profile?.displayName || "") ||
		organizationName !== (profile?.organizationName || "") ||
		organizationWebsite !== (profile?.organizationWebsite || "") ||
		bio !== (profile?.bio || "");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account and preferences
				</p>
			</div>

			{/* Profile Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile
					</CardTitle>
					<CardDescription>Your public profile information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar Section */}
					<div className="flex items-center gap-6">
						<div className="relative">
							<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt="Profile"
										width={80}
										height={80}
										className="h-full w-full object-cover"
									/>
								) : (
									<User className="h-10 w-10 text-muted-foreground" />
								)}
							</div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploadingAvatar}
								className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
							>
								{isUploadingAvatar ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Camera className="h-3.5 w-3.5" />
								)}
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleAvatarUpload}
								className="hidden"
							/>
						</div>
						<div>
							<p className="text-sm font-medium">Profile Picture</p>
							<p className="text-xs text-muted-foreground">
								Click the camera icon to upload a new photo.
								<br />
								Max size: 2MB. Recommended: Square image.
							</p>
						</div>
					</div>

					<Separator />

					{/* Basic Info */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={user?.email || ""}
								disabled
								className="bg-muted"
							/>
							<p className="text-xs text-muted-foreground">
								Email cannot be changed
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayName">Display Name</Label>
							<Input
								id="displayName"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Your display name"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Role</Label>
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="capitalize">
								{profile?.role || "user"}
							</Badge>
							{profile?.accountStatus && profile.accountStatus !== "active" && (
								<Badge
									variant={
										profile.accountStatus === "suspended"
											? "destructive"
											: "outline"
									}
								>
									{profile.accountStatus}
								</Badge>
							)}
						</div>
					</div>

					<Separator />

					{/* Organization Info */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Organization
						</h3>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="orgName">Organization Name</Label>
								<Input
									id="orgName"
									value={organizationName}
									onChange={(e) => setOrganizationName(e.target.value)}
									placeholder="Your organization"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="orgWebsite">Website</Label>
								<div className="relative">
									<Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="orgWebsite"
										value={organizationWebsite}
										onChange={(e) => setOrganizationWebsite(e.target.value)}
										placeholder="https://example.org"
										className="pl-9"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell us about yourself or your organization..."
								rows={3}
							/>
							<p className="text-xs text-muted-foreground">
								A short description that may be shown publicly
							</p>
						</div>
					</div>

					<Separator />

					<div className="flex items-center gap-2">
						<Button
							onClick={handleSaveProfile}
							disabled={isSaving || !hasProfileChanges}
						>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : saveSuccess ? (
								<>
									<Check className="mr-2 h-4 w-4" />
									Saved!
								</>
							) : (
								"Save Changes"
							)}
						</Button>
						{hasProfileChanges && (
							<p className="text-xs text-muted-foreground">
								You have unsaved changes
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Password Change */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Change Password
					</CardTitle>
					<CardDescription>
						Update your password to keep your account secure
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{passwordError && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{passwordError}
						</div>
					)}

					{passwordSuccess && (
						<div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
							Password changed successfully!
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="currentPassword">Current Password</Label>
						<div className="relative">
							<Input
								id="currentPassword"
								type={showCurrentPassword ? "text" : "password"}
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showCurrentPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<div className="relative">
								<Input
									id="newPassword"
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showNewPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
					</div>

					<p className="text-xs text-muted-foreground">
						Password must be at least 8 characters and contain uppercase,
						lowercase, and a number.
					</p>

					<Button
						onClick={handleChangePassword}
						disabled={
							isChangingPassword ||
							!currentPassword ||
							!newPassword ||
							!confirmPassword
						}
					>
						{isChangingPassword ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Changing...
							</>
						) : (
							"Change Password"
						)}
					</Button>
				</CardContent>
			</Card>

			{/* Usage & Quotas */}
			<Card>
				<CardHeader>
					<CardTitle>Usage & Quotas</CardTitle>
					<CardDescription>Your current plan usage and limits</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Plan Info */}
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

						{/* Campaigns */}
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

					{/* Letter Quota */}
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

			{/* Account Info */}
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>Details about your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<Label className="text-muted-foreground">Account ID</Label>
							<p className="font-mono text-xs break-all">{user?.id || "—"}</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Member Since</Label>
							<p className="text-sm">
								{profile?.createdAt
									? new Date(profile.createdAt).toLocaleDateString()
									: "—"}
							</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Last Updated</Label>
							<p className="text-sm">
								{profile?.updatedAt
									? new Date(profile.updatedAt).toLocaleDateString()
									: "—"}
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

			{/* Danger Zone */}
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
