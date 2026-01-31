/**
 * Admin Header component with user menu
 * Phase 5: Frontend Admin Interface
 */

"use client";

import { LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
	const router = useRouter();
	const { user, profile, signOut } = useAuth();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	const displayName =
		profile?.displayName || user?.email?.split("@")[0] || "User";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
			<div className="flex-1">
				{/* Placeholder for breadcrumbs or page title */}
			</div>

			<div className="flex items-center gap-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative h-9 w-9 rounded-full bg-muted"
						>
							{profile?.avatarUrl ? (
								<Image
									src={profile.avatarUrl}
									alt={displayName}
									fill
									sizes="36px"
									className="rounded-full object-cover"
								/>
							) : (
								<span className="text-sm font-medium">{initials}</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel>
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium">{displayName}</p>
								<p className="text-xs text-muted-foreground">{user?.email}</p>
								{profile?.role && (
									<span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
										{profile.role}
									</span>
								)}
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/admin/profile" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/admin/settings" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleSignOut}
							className="cursor-pointer text-red-600 focus:text-red-600"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
