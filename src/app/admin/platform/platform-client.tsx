/**
 * Platform Dashboard Client Component
 */

"use client";

import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	ClipboardList,
	Megaphone,
	Settings,
	UserPlus,
	Users,
	UserX,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
	applications: {
		pending: number;
		total: number;
	};
	organizers: {
		active: number;
		trial: number;
		suspended: number;
	};
	campaigns: {
		active: number;
		total: number;
	};
	recentActivity: Array<{
		id: string;
		action: string;
		entity_type: string;
		entity_id: string | null;
		details: Record<string, unknown> | null;
		created_at: string;
		performed_by: string | null;
	}>;
}

interface PlatformDashboardClientProps {
	stats: DashboardStats;
}

function getActivityIcon(action: string) {
	switch (action) {
		case "application_submitted":
			return <UserPlus className="h-4 w-4 text-blue-500" />;
		case "application_approved":
			return <CheckCircle2 className="h-4 w-4 text-green-500" />;
		case "application_rejected":
			return <XCircle className="h-4 w-4 text-red-500" />;
		case "account_suspended":
			return <UserX className="h-4 w-4 text-orange-500" />;
		case "account_reactivated":
			return <Users className="h-4 w-4 text-green-500" />;
		case "settings_updated":
			return <Settings className="h-4 w-4 text-gray-500" />;
		default:
			return <AlertCircle className="h-4 w-4 text-gray-400" />;
	}
}

function formatAction(
	action: string,
	details?: Record<string, unknown> | null,
): string {
	const actionLabels: Record<string, string> = {
		application_submitted: "New application submitted",
		application_approved: "Application approved",
		application_rejected: "Application rejected",
		account_suspended: "Account suspended",
		account_reactivated: "Account reactivated",
		settings_updated: "Platform settings updated",
		campaign_created: "Campaign created",
		campaign_published: "Campaign published",
	};

	let label = actionLabels[action] || action.replace(/_/g, " ");

	// Add context from details if available
	if (details?.organization_name) {
		label += ` (${details.organization_name})`;
	} else if (details?.email) {
		label += ` (${details.email})`;
	}

	return label;
}

export function PlatformDashboardClient({
	stats,
}: PlatformDashboardClientProps) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Platform Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of platform status and activity
				</p>
			</div>

			{/* Alert for pending applications */}
			{stats.applications.pending > 0 && (
				<Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
							<span className="font-medium text-orange-800 dark:text-orange-200">
								{stats.applications.pending} pending application
								{stats.applications.pending !== 1 ? "s" : ""} require review
							</span>
						</div>
						<Button asChild size="sm">
							<Link href="/admin/applications">
								Review Now
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Applications</CardTitle>
						<ClipboardList className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.applications.pending}
						</div>
						<p className="text-xs text-muted-foreground">
							pending of {stats.applications.total} total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Campaigners
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.organizers.active}</div>
						<p className="text-xs text-muted-foreground">
							{stats.organizers.trial} in trial, {stats.organizers.suspended}{" "}
							suspended
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Campaigns
						</CardTitle>
						<Megaphone className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.campaigns.active}</div>
						<p className="text-xs text-muted-foreground">
							of {stats.campaigns.total} total campaigns
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Platform Health
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">Good</div>
						<p className="text-xs text-muted-foreground">
							All systems operational
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions + Recent Activity */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common administrative tasks</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-2">
						<Button variant="outline" className="justify-start" asChild>
							<Link href="/admin/applications">
								<ClipboardList className="mr-2 h-4 w-4" />
								Review Applications
								{stats.applications.pending > 0 && (
									<Badge variant="secondary" className="ml-auto">
										{stats.applications.pending}
									</Badge>
								)}
							</Link>
						</Button>
						<Button variant="outline" className="justify-start" asChild>
							<Link href="/admin/campaigners">
								<Users className="mr-2 h-4 w-4" />
								Manage Campaigners
							</Link>
						</Button>
						<Button variant="outline" className="justify-start" asChild>
							<Link href="/admin/activity">
								<AlertCircle className="mr-2 h-4 w-4" />
								View Activity Logs
							</Link>
						</Button>
						<Button variant="outline" className="justify-start" asChild>
							<Link href="/admin/settings#platform-settings">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest platform events</CardDescription>
					</CardHeader>
					<CardContent>
						{stats.recentActivity.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No recent activity
							</p>
						) : (
							<div className="space-y-4">
								{stats.recentActivity.slice(0, 5).map((activity) => (
									<div
										key={activity.id}
										className="flex items-start gap-3 text-sm"
									>
										{getActivityIcon(activity.action)}
										<div className="flex-1 space-y-1">
											<p className="leading-none">
												{formatAction(activity.action, activity.details)}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(activity.created_at), {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
						{stats.recentActivity.length > 5 && (
							<Button variant="link" className="mt-4 px-0" asChild>
								<Link href="/admin/activity">View all activity</Link>
							</Button>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
