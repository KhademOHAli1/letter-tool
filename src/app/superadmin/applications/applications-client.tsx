/**
 * Applications List Client Component
 */

"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	Building2,
	CheckCircle2,
	Clock,
	Eye,
	FileText,
	Globe,
	Loader2,
	Mail,
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
import { Label } from "@/components/ui/label";
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
import type { CampaignerApplication } from "@/lib/types";

interface ApplicationsClientProps {
	applications: CampaignerApplication[];
	currentStatus?: string;
}

function getStatusBadge(status: string) {
	switch (status) {
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
		case "approved":
			return (
				<Badge
					variant="outline"
					className="bg-green-50 text-green-700 border-green-200"
				>
					<CheckCircle2 className="mr-1 h-3 w-3" />
					Approved
				</Badge>
			);
		case "rejected":
			return (
				<Badge
					variant="outline"
					className="bg-red-50 text-red-700 border-red-200"
				>
					<XCircle className="mr-1 h-3 w-3" />
					Rejected
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
}

export function ApplicationsClient({
	applications,
	currentStatus = "pending",
}: ApplicationsClientProps) {
	const router = useRouter();
	const [selectedApp, setSelectedApp] = useState<CampaignerApplication | null>(
		null,
	);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
		null,
	);
	const [reviewNotes, setReviewNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleStatusChange = (status: string) => {
		const params = new URLSearchParams();
		if (status !== "all") {
			params.set("status", status);
		}
		router.push(`/superadmin/applications?${params.toString()}`);
	};

	const handleView = (app: CampaignerApplication) => {
		setSelectedApp(app);
		setViewDialogOpen(true);
	};

	const handleReviewClick = (
		app: CampaignerApplication,
		action: "approve" | "reject",
	) => {
		setSelectedApp(app);
		setReviewAction(action);
		setReviewNotes("");
		setReviewDialogOpen(true);
	};

	const handleReviewSubmit = async () => {
		if (!selectedApp || !reviewAction) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/applications/${selectedApp.id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: reviewAction,
					reviewNotes: reviewNotes || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to review application");
			}

			setReviewDialogOpen(false);
			setViewDialogOpen(false);
			router.refresh();
		} catch (error) {
			console.error("Error reviewing application:", error);
			alert(
				error instanceof Error ? error.message : "Failed to review application",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const pendingCount = applications.filter(
		(a) => a.status === "pending",
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Applications</h1>
					<p className="text-muted-foreground">
						Review and process campaigner applications
					</p>
				</div>
				<Select
					value={currentStatus || "pending"}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="pending">
							Pending {pendingCount > 0 && `(${pendingCount})`}
						</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{applications.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium">No applications</h3>
						<p className="text-sm text-muted-foreground">
							{currentStatus === "pending"
								? "No pending applications to review"
								: "No applications found with this status"}
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>
							{applications.length} Application
							{applications.length !== 1 ? "s" : ""}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Organization</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Submitted</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applications.map((app) => (
									<TableRow key={app.id}>
										<TableCell>
											<div className="font-medium">{app.organizationName}</div>
											{app.organizationWebsite && (
												<div className="text-sm text-muted-foreground truncate max-w-48">
													{app.organizationWebsite}
												</div>
											)}
										</TableCell>
										<TableCell>
											<div>{app.name}</div>
											<div className="text-sm text-muted-foreground">
												{app.email}
											</div>
										</TableCell>
										<TableCell>
											<span title={format(new Date(app.createdAt), "PPpp")}>
												{formatDistanceToNow(new Date(app.createdAt), {
													addSuffix: true,
												})}
											</span>
										</TableCell>
										<TableCell>{getStatusBadge(app.status)}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleView(app)}
												>
													<Eye className="h-4 w-4" />
												</Button>
												{app.status === "pending" && (
													<>
														<Button
															variant="ghost"
															size="sm"
															className="text-green-600 hover:text-green-700 hover:bg-green-50"
															onClick={() => handleReviewClick(app, "approve")}
														>
															<CheckCircle2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
															onClick={() => handleReviewClick(app, "reject")}
														>
															<XCircle className="h-4 w-4" />
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* View Application Dialog */}
			<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Application Details</DialogTitle>
						<DialogDescription>
							Submitted{" "}
							{selectedApp &&
								formatDistanceToNow(new Date(selectedApp.createdAt), {
									addSuffix: true,
								})}
						</DialogDescription>
					</DialogHeader>

					{selectedApp && (
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								{getStatusBadge(selectedApp.status)}
								{selectedApp.reviewedAt && (
									<span className="text-sm text-muted-foreground">
										Reviewed{" "}
										{formatDistanceToNow(new Date(selectedApp.reviewedAt), {
											addSuffix: true,
										})}
									</span>
								)}
							</div>

							<div className="grid gap-4">
								<div className="flex items-start gap-3">
									<Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<div className="font-medium">
											{selectedApp.organizationName}
										</div>
										<div className="text-sm text-muted-foreground">
											Organization
										</div>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<div className="font-medium">{selectedApp.name}</div>
									</div>
								</div>

								{selectedApp.organizationWebsite && (
									<div className="flex items-start gap-3">
										<Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<a
												href={selectedApp.organizationWebsite}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium text-primary hover:underline"
											>
												{selectedApp.organizationWebsite}
											</a>
											<div className="text-sm text-muted-foreground">
												Website
											</div>
										</div>
									</div>
								)}
							</div>

							<div>
								<Label className="text-sm font-medium">Intended Use</Label>
								<p className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
									{selectedApp.intendedUse}
								</p>
							</div>

							{selectedApp.reviewNotes && (
								<div>
									<Label className="text-sm font-medium">Review Notes</Label>
									<p className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
										{selectedApp.reviewNotes}
									</p>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						{selectedApp?.status === "pending" && (
							<>
								<Button
									variant="outline"
									onClick={() => handleReviewClick(selectedApp, "reject")}
								>
									<XCircle className="mr-2 h-4 w-4" />
									Reject
								</Button>
								<Button
									onClick={() => handleReviewClick(selectedApp, "approve")}
								>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Approve
								</Button>
							</>
						)}
						{selectedApp?.status !== "pending" && (
							<Button
								variant="outline"
								onClick={() => setViewDialogOpen(false)}
							>
								Close
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Review Confirmation Dialog */}
			<Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{reviewAction === "approve" ? "Approve" : "Reject"} Application
						</DialogTitle>
						<DialogDescription>
							{reviewAction === "approve"
								? "This will create an account for the applicant and send them an invitation email."
								: "The applicant will be notified of the rejection."}
						</DialogDescription>
					</DialogHeader>

					{selectedApp && (
						<div className="space-y-4">
							<div className="bg-muted p-3 rounded-lg">
								<div className="font-medium">
									{selectedApp.organizationName}
								</div>
								<div className="text-sm text-muted-foreground">
									{selectedApp.name} ({selectedApp.email})
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="review-notes">
									Notes{" "}
									{reviewAction === "reject" ? "(recommended)" : "(optional)"}
								</Label>
								<Textarea
									id="review-notes"
									value={reviewNotes}
									onChange={(e) => setReviewNotes(e.target.value)}
									placeholder={
										reviewAction === "approve"
											? "Any notes about this approval..."
											: "Reason for rejection..."
									}
									rows={3}
								/>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setReviewDialogOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							variant={reviewAction === "reject" ? "destructive" : "default"}
							onClick={handleReviewSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{reviewAction === "approve" ? "Approve" : "Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
