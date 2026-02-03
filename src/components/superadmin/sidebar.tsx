/**
 * Super Admin Sidebar
 * Navigation for platform administration
 */

"use client";

import {
	Activity,
	ClipboardList,
	Home,
	LogOut,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface SuperAdminSidebarProps {
	user: AuthUser | null;
}

const NAV_ITEMS = [
	{ href: "/superadmin", label: "Dashboard", icon: Home },
	{
		href: "/superadmin/applications",
		label: "Applications",
		icon: ClipboardList,
	},
	{ href: "/superadmin/campaigners", label: "Campaigners", icon: Users },
	{ href: "/superadmin/activity", label: "Activity Logs", icon: Activity },
	{ href: "/superadmin/settings", label: "Settings", icon: Settings },
];

export function SuperAdminSidebar({ user }: SuperAdminSidebarProps) {
	const pathname = usePathname();

	const handleSignOut = async () => {
		await signOut();
		window.location.href = "/";
	};

	return (
		<aside className="flex w-64 flex-col border-r bg-background">
			{/* Header */}
			<div className="flex h-16 items-center gap-2 border-b px-4">
				<Shield className="h-6 w-6 text-primary" />
				<span className="font-semibold">Super Admin</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-4">
				{NAV_ITEMS.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/superadmin" && pathname.startsWith(item.href));

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* User section */}
			<div className="border-t p-4">
				<div className="mb-3">
					<p className="text-sm font-medium truncate">
						{user?.profile?.displayName || user?.email}
					</p>
					<p className="text-xs text-muted-foreground">Super Admin</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" className="flex-1" asChild>
						<Link href="/admin">Admin Panel</Link>
					</Button>
					<Button variant="ghost" size="sm" onClick={handleSignOut}>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</aside>
	);
}
