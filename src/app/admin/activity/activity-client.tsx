/**
 * Activity Logs Client Component
 */

"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Megaphone,
	Play,
	Settings,
	Shield,
	UserPlus,
	Users,
	UserX,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ActivityLog } from "@/lib/types";

interface ActivityLogsClientProps {
	logs: ActivityLog[];
	currentType?: string;
}

const ENTITY_TYPES = [
	{ value: "all", label: "All Types" },
	{ value: "application", label: "Applications" },
	{ value: "account", label: "Accounts" },
	{ value: "campaign", label: "Campaigns" },
	{ value: "platform", label: "Platform" },
];

function getActionIcon(action: string) {
	const icons: Record<string, React.ReactNode> = {
		application_submitted: <UserPlus className="h-4 w-4 text-blue-500" />,
		application_approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
		application_rejected: <XCircle className="h-4 w-4 text-red-500" />,
		account_suspended: <UserX className="h-4 w-4 text-orange-500" />,
		account_reactivated: <Play className="h-4 w-4 text-green-500" />,
		account_quotas_updated: <Settings className="h-4 w-4 text-purple-500" />,
		settings_updated: <Settings className="h-4 w-4 text-gray-500" />,
		campaign_created: <Megaphone className="h-4 w-4 text-blue-500" />,
		campaign_published: <Megaphone className="h-4 w-4 text-green-500" />,
		campaign_paused: <Megaphone className="h-4 w-4 text-orange-500" />,
	};

	return icons[action] || <AlertCircle className="h-4 w-4 text-gray-400" />;
}

function getEntityBadge(entityType?: string | null) {
	const badges: Record<string, { icon: React.ReactNode; className: string }> = {
		application: {
			icon: <UserPlus className="mr-1 h-3 w-3" />,
			className: "bg-blue-50 text-blue-700 border-blue-200",
		},
		account: {
			icon: <Users className="mr-1 h-3 w-3" />,
			className: "bg-purple-50 text-purple-700 border-purple-200",
		},
		campaign: {
			icon: <Megaphone className="mr-1 h-3 w-3" />,
			className: "bg-green-50 text-green-700 border-green-200",
		},
		platform: {
			icon: <Shield className="mr-1 h-3 w-3" />,
			className: "bg-gray-50 text-gray-700 border-gray-200",
		},
	};

	const effectiveType = entityType ?? "platform";
	const config = badges[effectiveType] || badges.platform;

	return (
		<Badge variant="outline" className={config.className}>
			{config.icon}
			{effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)}
		</Badge>
	);
}

function formatActionLabel(action: string): string {
	return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDetails(details: Record<string, unknown> | null): string {
	if (!details) return "";

	const parts: string[] = [];

	if (details.organization_name) {
		parts.push(`Org: ${details.organization_name}`);
	}
	if (details.email) {
		parts.push(`Email: ${details.email}`);
	}
	if (details.reason) {
		parts.push(`Reason: ${details.reason}`);
	}
	if (details.campaign_name) {
		parts.push(`Campaign: ${details.campaign_name}`);
	}
	if (details.old_status && details.new_status) {
		parts.push(`${details.old_status} → ${details.new_status}`);
	}

	return parts.join(" • ");
}

export function ActivityLogsClient({
	logs,
	currentType = "all",
}: ActivityLogsClientProps) {
	const router = useRouter();

	const handleTypeChange = (type: string) => {
		const params = new URLSearchParams();
		if (type !== "all") {
			params.set("type", type);
		}
		router.push(`/admin/activity?${params.toString()}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Activity Logs</h1>
					<p className="text-muted-foreground">
						Recent platform activity and events
					</p>
				</div>
				<Select value={currentType || "all"} onValueChange={handleTypeChange}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						{ENTITY_TYPES.map((type) => (
							<SelectItem key={type.value} value={type.value}>
								{type.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{logs.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Activity className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium">No activity</h3>
						<p className="text-sm text-muted-foreground">
							No activity logs found for this filter
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>
							{logs.length} Log Entr{logs.length !== 1 ? "ies" : "y"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12" />
									<TableHead>Action</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Details</TableHead>
									<TableHead>Time</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => (
									<TableRow key={log.id}>
										<TableCell>{getActionIcon(log.action)}</TableCell>
										<TableCell>
											<div className="font-medium">
												{formatActionLabel(log.action)}
											</div>
											{log.resourceId && (
												<div className="text-xs text-muted-foreground font-mono">
													{log.resourceId.slice(0, 8)}...
												</div>
											)}
										</TableCell>
										<TableCell>{getEntityBadge(log.resourceType)}</TableCell>
										<TableCell>
											<div className="max-w-md truncate text-sm text-muted-foreground">
												{formatDetails(log.details)}
											</div>
										</TableCell>
										<TableCell>
											<span
												title={format(new Date(log.createdAt), "PPpp")}
												className="text-sm"
											>
												{formatDistanceToNow(new Date(log.createdAt), {
													addSuffix: true,
												})}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
