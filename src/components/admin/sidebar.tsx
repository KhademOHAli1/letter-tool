/**
 * Unified Admin Sidebar component
 * Shows organizer features for all, superadmin features conditionally
 * Phase 5: Frontend Admin Interface
 */

"use client";

import {
	Activity,
	BarChart3,
	ChevronDown,
	ChevronRight,
	ClipboardList,
	FileText,
	Home,
	LogOut,
	Menu,
	PlusCircle,
	Settings,
	Shield,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: React.ReactNode;
	badge?: number;
}

// Regular admin navigation items
const adminNavItems: NavItem[] = [
	{
		href: "/admin",
		label: "Dashboard",
		icon: <Home className="h-5 w-5" />,
	},
	{
		href: "/admin/campaigns/new",
		label: "New Campaign",
		icon: <PlusCircle className="h-5 w-5" />,
	},
	{
		href: "/admin/analytics",
		label: "Analytics",
		icon: <BarChart3 className="h-5 w-5" />,
	},
	{
		href: "/admin/settings",
		label: "Settings",
		icon: <Settings className="h-5 w-5" />,
	},
];

// Super admin navigation items
const superAdminNavItems: NavItem[] = [
	{
		href: "/admin/platform",
		label: "Platform Overview",
		icon: <Shield className="h-5 w-5" />,
	},
	{
		href: "/admin/applications",
		label: "Applications",
		icon: <ClipboardList className="h-5 w-5" />,
	},
	{
		href: "/admin/campaigners",
		label: "Campaigners",
		icon: <Users className="h-5 w-5" />,
	},
	{
		href: "/admin/activity",
		label: "Activity Logs",
		icon: <Activity className="h-5 w-5" />,
	},
	{
		href: "/admin/platform-settings",
		label: "Platform Settings",
		icon: <Settings className="h-5 w-5" />,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const { profile, user } = useAuth();
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [superAdminExpanded, setSuperAdminExpanded] = useState(true);

	const isSuperAdmin = profile?.role === "super_admin";

	const isActive = (href: string) => {
		// Exact match for specific pages
		if (
			href === "/admin" ||
			href === "/admin/campaigns/new" ||
			href === "/admin/platform"
		) {
			return pathname === href;
		}
		// For other routes, use startsWith
		return pathname.startsWith(href);
	};

	const handleSignOut = async () => {
		await signOut();
		window.location.href = "/";
	};

	const NavLinks = ({
		items,
		onItemClick,
	}: {
		items: NavItem[];
		onItemClick?: () => void;
	}) => (
		<>
			{items.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					onClick={onItemClick}
					className={cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
						isActive(item.href)
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					{item.icon}
					<span className="flex-1">{item.label}</span>
					{item.badge !== undefined && item.badge > 0 && (
						<Badge variant="secondary" className="ml-auto">
							{item.badge}
						</Badge>
					)}
				</Link>
			))}
		</>
	);

	const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
		<>
			{/* Admin Navigation */}
			<nav className="flex flex-col gap-1 p-4">
				<NavLinks items={adminNavItems} onItemClick={onItemClick} />
			</nav>

			{/* Super Admin Section */}
			{isSuperAdmin && (
				<>
					<Separator className="mx-4" />
					<div className="p-4">
						<button
							type="button"
							onClick={() => setSuperAdminExpanded(!superAdminExpanded)}
							className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						>
							<Shield className="h-4 w-4 text-orange-500" />
							<span className="flex-1 text-left">Platform Admin</span>
							{superAdminExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</button>
						{superAdminExpanded && (
							<nav className="mt-2 flex flex-col gap-1 pl-2">
								<NavLinks
									items={superAdminNavItems}
									onItemClick={onItemClick}
								/>
							</nav>
						)}
					</div>
				</>
			)}

			{/* User section at bottom */}
			<div className="mt-auto border-t p-4">
				<div className="mb-3">
					<p className="text-sm font-medium truncate">
						{profile?.displayName || user?.email}
					</p>
					<p className="text-xs text-muted-foreground">
						{isSuperAdmin ? "Super Admin" : "Campaign Organizer"}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start"
					onClick={handleSignOut}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</Button>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed left-4 top-4 z-50 md:hidden"
				onClick={() => setIsMobileOpen(!isMobileOpen)}
			>
				{isMobileOpen ? (
					<X className="h-5 w-5" />
				) : (
					<Menu className="h-5 w-5" />
				)}
			</Button>

			{/* Mobile overlay */}
			{isMobileOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 cursor-default bg-background/80 backdrop-blur-sm md:hidden"
					onClick={() => setIsMobileOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setIsMobileOpen(false);
					}}
					aria-label="Close sidebar"
				/>
			)}

			{/* Mobile sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r bg-background transition-transform duration-200 ease-in-out md:hidden",
					isMobileOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-14 items-center border-b px-4">
					<Link
						href="/admin"
						className="flex items-center gap-2 font-semibold"
						onClick={() => setIsMobileOpen(false)}
					>
						<FileText className="h-5 w-5" />
						<span>Campaign Admin</span>
					</Link>
				</div>
				<SidebarContent onItemClick={() => setIsMobileOpen(false)} />
			</aside>

			{/* Desktop sidebar */}
			<aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
				<div className="flex h-14 items-center border-b px-4">
					<Link href="/admin" className="flex items-center gap-2 font-semibold">
						<FileText className="h-5 w-5" />
						<span>Campaign Admin</span>
					</Link>
				</div>
				<SidebarContent />
			</aside>
		</>
	);
}
