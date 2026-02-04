/**
 * Admin Profile Page
 * Personal profile and security settings
 */

"use client";

import {
	Building2,
	Camera,
	Check,
	Eye,
	EyeOff,
	Globe,
	Key,
	Loader2,
	User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export default function AdminProfilePage() {
	const { user, profile, refreshProfile } = useAuth();

	const [displayName, setDisplayName] = useState(profile?.displayName || "");
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
	const [organizationName, setOrganizationName] = useState(
		profile?.organizationName || "",
	);
	const [organizationWebsite, setOrganizationWebsite] = useState(
		profile?.organizationWebsite || "",
	);
	const [bio, setBio] = useState(profile?.bio || "");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user?.email || "",
				password: currentPassword,
			});

			if (signInError) {
				setPasswordError("Current password is incorrect");
				setIsChangingPassword(false);
				return;
			}

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

	const hasProfileChanges =
		displayName !== (profile?.displayName || "") ||
		organizationName !== (profile?.organizationName || "") ||
		organizationWebsite !== (profile?.organizationWebsite || "") ||
		bio !== (profile?.bio || "");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Profile</h1>
				<p className="text-muted-foreground">
					Manage your public profile and security settings
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile
					</CardTitle>
					<CardDescription>Your public profile information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
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
								placeholder="********"
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
									placeholder="********"
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
								placeholder="********"
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
		</div>
	);
}
