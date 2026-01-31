/**
 * Admin Settings Page
 * Account settings, preferences, and platform configuration
 */

"use client";

import { Camera, Check, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
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
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export default function AdminSettingsPage() {
	const { user, profile, refreshProfile } = useAuth();
	const [displayName, setDisplayName] = useState(profile?.displayName || "");
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (profile?.displayName) {
			setDisplayName(profile.displayName);
		}
		if (profile?.avatarUrl) {
			setAvatarUrl(profile.avatarUrl);
		}
	}, [profile?.displayName, profile?.avatarUrl]);

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			alert("Image must be less than 2MB");
			return;
		}

		setIsUploadingAvatar(true);

		try {
			const supabase = getSupabaseBrowserClient();

			// Upload to Supabase Storage
			// Path format: {user_id}/{filename} - RLS policy uses folder name for auth
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

			// Get public URL
			const { data: urlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			const newAvatarUrl = urlData.publicUrl;

			// Update profile with new avatar URL
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
			.update({ display_name: displayName })
			.eq("id", user.id);

		if (!error) {
			await refreshProfile();
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}

		setIsSaving(false);
	};

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

					{/* Email */}
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

					<div className="space-y-2">
						<Label>Role</Label>
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
								{profile?.role || "user"}
							</span>
						</div>
						<p className="text-xs text-muted-foreground">
							Contact an administrator to change your role
						</p>
					</div>

					<Separator />

					<div className="flex items-center gap-2">
						<Button
							onClick={handleSaveProfile}
							disabled={isSaving || displayName === profile?.displayName}
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
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<Label className="text-muted-foreground">Account ID</Label>
							<p className="font-mono text-sm">{user?.id || "—"}</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Member Since</Label>
							<p className="text-sm">
								{profile?.createdAt
									? new Date(profile.createdAt).toLocaleDateString()
									: "—"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone - Placeholder */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
					<CardDescription>
						Irreversible actions for your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="destructive" disabled>
						Delete Account
					</Button>
					<p className="mt-2 text-xs text-muted-foreground">
						Account deletion is not yet available. Contact support if needed.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
