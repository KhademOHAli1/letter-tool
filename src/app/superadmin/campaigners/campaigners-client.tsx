/**
 * Campaigners List Client Component
 */

"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	AlertTriangle,
	Building2,
	CheckCircle2,
	Clock,
	Loader2,
	Megaphone,
	MoreHorizontal,
	Pause,
	Play,
	Search,
	Settings,
	Users,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";

interface CampaignerWithStats {
	id: string;
	displayName: string | null;
	email: string;
	role: string;
	accountStatus: string;
	planTier: string;
	organizationName: string | null;
	campaignQuota: number;
	monthlyLetterQuota: number;
	lettersThisMonth: number;
	createdAt: string;
	lastActiveAt: string | null;
	campaignCount: number;
}

interface CampaignersClientProps {
	campaigners: CampaignerWithStats[];
	currentStatus?: string;
}

function getStatusBadge(status: string) {
	switch (status) {
		case "active":
			return (
				<Badge
					variant="outline"
					className="bg-green-50 text-green-700 border-green-200"
				>
					<CheckCircle2 className="mr-1 h-3 w-3" />
					Active
				</Badge>
			);
		case "trial":
			return (
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-700 border-blue-200"
				>
					<Clock className="mr-1 h-3 w-3" />
					Trial
				</Badge>
			);
		case "suspended":
			return (
				<Badge
					variant="outline"
					className="bg-orange-50 text-orange-700 border-orange-200"
				>
					<AlertTriangle className="mr-1 h-3 w-3" />
					Suspended
				</Badge>
			);
		case "deactivated":
			return (
				<Badge
					variant="outline"
					className="bg-gray-50 text-gray-700 border-gray-200"
				>
					<XCircle className="mr-1 h-3 w-3" />
					Deactivated
				</Badge>
			);
		case "pending":
			return (
				<Badge
					variant="outline"
					className="bg-yellow-50 text-yellow-700 border-yellow-200"
				>
					<Clock className="mr-1 h-3 w-3" />
					Pending
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
}

function getPlanBadge(plan: string) {
	const colors: Record<string, string> = {
		free: "bg-gray-100 text-gray-700",
		starter: "bg-blue-100 text-blue-700",
		professional: "bg-purple-100 text-purple-700",
		enterprise: "bg-amber-100 text-amber-700",
		unlimited: "bg-emerald-100 text-emerald-700",
	};

	return (
		<Badge variant="secondary" className={colors[plan] || colors.free}>
			{plan.charAt(0).toUpperCase() + plan.slice(1)}
		</Badge>
	);
}

export function CampaignersClient({
	campaigners,
	currentStatus = "all",
}: CampaignersClientProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCampaigner, setSelectedCampaigner] =
		useState<CampaignerWithStats | null>(null);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState<
		"suspend" | "reactivate" | "quotas" | null
	>(null);
	const [actionReason, setActionReason] = useState("");
	const [quotaValues, setQuotaValues] = useState({
		campaigns: 3,
		letters: 1000,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleStatusChange = (status: string) => {
		const params = new URLSearchParams();
		if (status !== "all") {
			params.set("status", status);
		}
		router.push(`/superadmin/campaigners?${params.toString()}`);
	};

	const filteredCampaigners = campaigners.filter((c) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			c.displayName?.toLowerCase().includes(query) ||
			c.organizationName?.toLowerCase().includes(query) ||
			c.email.toLowerCase().includes(query)
		);
	});

	const handleAction = (
		campaigner: CampaignerWithStats,
		action: "suspend" | "reactivate" | "quotas",
	) => {
		setSelectedCampaigner(campaigner);
		setActionType(action);
		setActionReason("");
		if (action === "quotas") {
			setQuotaValues({
				campaigns: campaigner.campaignQuota,
				letters: campaigner.monthlyLetterQuota,
			});
		}
		setActionDialogOpen(true);
	};

	const handleActionSubmit = async () => {
		if (!selectedCampaigner || !actionType) return;

		setIsSubmitting(true);
		try {
			let endpoint = "";
			let body: Record<string, unknown> = {};

			if (actionType === "suspend") {
				endpoint = `/api/superadmin/accounts/${selectedCampaigner.id}/suspend`;
				body = { reason: actionReason };
			} else if (actionType === "reactivate") {
				endpoint = `/api/superadmin/accounts/${selectedCampaigner.id}/reactivate`;
				body = { reason: actionReason };
			} else if (actionType === "quotas") {
				endpoint = `/api/superadmin/accounts/${selectedCampaigner.id}/quotas`;
				body = {
					campaignQuota: quotaValues.campaigns,
					monthlyLetterQuota: quotaValues.letters,
				};
			}

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to perform action");
			}

			setActionDialogOpen(false);
			router.refresh();
		} catch (error) {
			console.error("Error performing action:", error);
			alert(
				error instanceof Error ? error.message : "Failed to perform action",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Campaigners</h1>
					<p className="text-muted-foreground">
						Manage platform users and their accounts
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name, organization, or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={currentStatus || "all"}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="trial">Trial</SelectItem>
						<SelectItem value="suspended">Suspended</SelectItem>
						<SelectItem value="deactivated">Deactivated</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Campaigners Table */}
			{filteredCampaigners.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Users className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium">No campaigners found</h3>
						<p className="text-sm text-muted-foreground">
							{searchQuery
								? "Try a different search term"
								: "No campaigners with this status"}
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>
							{filteredCampaigners.length} Campaigner
							{filteredCampaigners.length !== 1 ? "s" : ""}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Campaigner</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Plan</TableHead>
									<TableHead>Usage</TableHead>
									<TableHead>Campaigns</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCampaigners.map((campaigner) => {
									const letterUsage = Math.round(
										(campaigner.lettersThisMonth /
											campaigner.monthlyLetterQuota) *
											100,
									);
									return (
										<TableRow key={campaigner.id}>
											<TableCell>
												<div className="flex items-start gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
														<Building2 className="h-5 w-5 text-muted-foreground" />
													</div>
													<div>
														<div className="font-medium">
															{campaigner.displayName || "Unnamed"}
														</div>
														<div className="text-sm text-muted-foreground">
															{campaigner.organizationName || "No organization"}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getStatusBadge(campaigner.accountStatus)}
											</TableCell>
											<TableCell>{getPlanBadge(campaigner.planTier)}</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">
															Letters
														</span>
														<span>
															{campaigner.lettersThisMonth} /{" "}
															{campaigner.monthlyLetterQuota}
														</span>
													</div>
													<Progress value={letterUsage} className="h-1.5" />
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Megaphone className="h-4 w-4 text-muted-foreground" />
													<span>
														{campaigner.campaignCount} /{" "}
														{campaigner.campaignQuota}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<span
													title={format(new Date(campaigner.createdAt), "PPpp")}
												>
													{formatDistanceToNow(new Date(campaigner.createdAt), {
														addSuffix: true,
													})}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => handleAction(campaigner, "quotas")}
														>
															<Settings className="mr-2 h-4 w-4" />
															Edit Quotas
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{campaigner.accountStatus === "suspended" ? (
															<DropdownMenuItem
																onClick={() =>
																	handleAction(campaigner, "reactivate")
																}
															>
																<Play className="mr-2 h-4 w-4" />
																Reactivate
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem
																onClick={() =>
																	handleAction(campaigner, "suspend")
																}
																className="text-orange-600"
															>
																<Pause className="mr-2 h-4 w-4" />
																Suspend
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Action Dialog */}
			<Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{actionType === "suspend" && "Suspend Account"}
							{actionType === "reactivate" && "Reactivate Account"}
							{actionType === "quotas" && "Edit Quotas"}
						</DialogTitle>
						<DialogDescription>
							{actionType === "suspend" &&
								"This will prevent the campaigner from creating new campaigns or generating letters."}
							{actionType === "reactivate" &&
								"This will restore full access to the campaigner's account."}
							{actionType === "quotas" &&
								"Adjust the limits for this campaigner's account."}
						</DialogDescription>
					</DialogHeader>

					{selectedCampaigner && (
						<div className="space-y-4">
							<div className="bg-muted p-3 rounded-lg">
								<div className="font-medium">
									{selectedCampaigner.displayName || "Unnamed"}
								</div>
								<div className="text-sm text-muted-foreground">
									{selectedCampaigner.organizationName}
								</div>
							</div>

							{(actionType === "suspend" || actionType === "reactivate") && (
								<div className="space-y-2">
									<Label htmlFor="reason">Reason</Label>
									<Textarea
										id="reason"
										value={actionReason}
										onChange={(e) => setActionReason(e.target.value)}
										placeholder={
											actionType === "suspend"
												? "Why is this account being suspended?"
												: "Why is this account being reactivated?"
										}
										rows={3}
									/>
								</div>
							)}

							{actionType === "quotas" && (
								<div className="grid gap-4">
									<div className="space-y-2">
										<Label htmlFor="campaign-quota">Campaign Limit</Label>
										<Input
											id="campaign-quota"
											type="number"
											min={0}
											value={quotaValues.campaigns}
											onChange={(e) =>
												setQuotaValues((v) => ({
													...v,
													campaigns: Number.parseInt(e.target.value, 10) || 0,
												}))
											}
										/>
										<p className="text-xs text-muted-foreground">
											Maximum number of campaigns this user can create
										</p>
									</div>
									<div className="space-y-2">
										<Label htmlFor="letter-quota">Monthly Letter Limit</Label>
										<Input
											id="letter-quota"
											type="number"
											min={0}
											value={quotaValues.letters}
											onChange={(e) =>
												setQuotaValues((v) => ({
													...v,
													letters: Number.parseInt(e.target.value, 10) || 0,
												}))
											}
										/>
										<p className="text-xs text-muted-foreground">
											Maximum letters generated per month across all campaigns
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setActionDialogOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							variant={actionType === "suspend" ? "destructive" : "default"}
							onClick={handleActionSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{actionType === "suspend" && "Suspend Account"}
							{actionType === "reactivate" && "Reactivate"}
							{actionType === "quotas" && "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
