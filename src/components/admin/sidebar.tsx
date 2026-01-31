/**
 * Admin Sidebar component
 * Phase 5: Frontend Admin Interface
 */

"use client";

import {
	BarChart3,
	FileText,
	Home,
	Menu,
	PlusCircle,
	Settings,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: React.ReactNode;
}

const navItems: NavItem[] = [
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

export function AdminSidebar() {
	const pathname = usePathname();
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const isActive = (href: string) => {
		// Exact match for dashboard and new campaign
		if (href === "/admin" || href === "/admin/campaigns/new") {
			return pathname === href;
		}
		// For other routes, use startsWith
		return pathname.startsWith(href);
	};

	const NavLinks = () => (
		<nav className="flex flex-col gap-1 p-4">
			{navItems.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					onClick={() => setIsMobileOpen(false)}
					className={cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
						isActive(item.href)
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					{item.icon}
					{item.label}
				</Link>
			))}
		</nav>
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
					"fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:hidden",
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
				<NavLinks />
			</aside>

			{/* Desktop sidebar */}
			<aside className="hidden w-64 shrink-0 border-r bg-background md:block">
				<div className="flex h-14 items-center border-b px-4">
					<Link href="/admin" className="flex items-center gap-2 font-semibold">
						<FileText className="h-5 w-5" />
						<span>Campaign Admin</span>
					</Link>
				</div>
				<NavLinks />
			</aside>
		</>
	);
}
