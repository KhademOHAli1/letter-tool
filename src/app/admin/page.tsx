/**
 * Admin Dashboard page
 * Combined dashboard with campaigns management
 * Phase 5: Frontend Admin Interface
 */

"use client";

import { FileText, PlusCircle, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
	CampaignCard,
	type CampaignCardData,
} from "@/components/admin/campaign-card";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { CampaignStatus } from "@/lib/types";

interface DashboardStats {
	totalCampaigns: number;
	activeCampaigns: number;
	totalLetters: number;
}

export default function AdminDashboard() {
	const { user, profile } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">(
		"all",
	);

	const fetchDashboardData = useCallback(async () => {
		if (!user) return;

		const supabase = getSupabaseBrowserClient();

		// Fetch user's campaigns with optional status filter
		let query = supabase
			.from("campaigns")
			.select(
				"id, slug, name, description, status, country_codes, goal_letters, created_at",
			)
			.eq("created_by", user.id)
			.order("created_at", { ascending: false });

		if (statusFilter !== "all") {
			query = query.eq("status", statusFilter);
		}

		const { data: campaignData, error } = await query;

		if (error) {
			console.error("Error fetching campaigns:", error);
			setIsLoading(false);
			return;
		}

		// Fetch letter counts for each campaign
		const campaignsWithStats: CampaignCardData[] = await Promise.all(
			(campaignData || []).map(async (campaign) => {
				const { count } = await supabase
					.from("letter_generations")
					.select("*", { count: "exact", head: true })
					.eq("campaign_id", campaign.id);

				return {
					id: campaign.id,
					slug: campaign.slug,
					name: campaign.name as Record<string, string>,
					description: campaign.description as Record<string, string>,
					status: campaign.status as CampaignStatus,
					countryCodes: campaign.country_codes as string[],
					letterCount: count || 0,
					goalLetters: campaign.goal_letters,
					createdAt: campaign.created_at,
				};
			}),
		);

		setCampaigns(campaignsWithStats);

		// Calculate stats (from all campaigns, not filtered)
		const { data: allCampaigns } = await supabase
			.from("campaigns")
			.select("id, status")
			.eq("created_by", user.id);

		const totalCampaigns = allCampaigns?.length || 0;
		const activeCampaigns =
			allCampaigns?.filter((c) => c.status === "active").length || 0;
		const totalLetters = campaignsWithStats.reduce(
			(sum, c) => sum + c.letterCount,
			0,
		);

		setStats({ totalCampaigns, activeCampaigns, totalLetters });
		setIsLoading(false);
	}, [user, statusFilter]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
		const supabase = getSupabaseBrowserClient();

		const { error } = await supabase
			.from("campaigns")
			.update({ status: newStatus })
			.eq("id", id);

		if (error) {
			console.error("Error updating status:", error);
			return;
		}

		fetchDashboardData();
	};

	const handleDelete = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this campaign? This action cannot be undone.",
			)
		) {
			return;
		}

		const supabase = getSupabaseBrowserClient();

		const { error } = await supabase.from("campaigns").delete().eq("id", id);

		if (error) {
			console.error("Error deleting campaign:", error);
			return;
		}

		fetchDashboardData();
	};

	const handleDuplicate = async (id: string) => {
		const campaign = campaigns.find((c) => c.id === id);
		if (!campaign) return;

		const supabase = getSupabaseBrowserClient();

		const newName: Record<string, string> = {};
		for (const [lang, name] of Object.entries(campaign.name)) {
			newName[lang] = `${name} (Copy)`;
		}

		const { error } = await supabase.from("campaigns").insert({
			slug: `${campaign.slug}-copy-${Date.now()}`,
			name: newName,
			description: campaign.description,
			status: "draft" as CampaignStatus,
			country_codes: campaign.countryCodes,
			goal_letters: campaign.goalLetters,
			created_by: user?.id,
		});

		if (error) {
			console.error("Error duplicating campaign:", error);
			return;
		}

		fetchDashboardData();
	};

	// Filter campaigns by search query
	const filteredCampaigns = campaigns.filter((campaign) => {
		if (!searchQuery) return true;
		const name =
			campaign.name.en ||
			campaign.name.de ||
			Object.values(campaign.name)[0] ||
			"";
		return name.toLowerCase().includes(searchQuery.toLowerCase());
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="h-16 animate-pulse rounded bg-muted" />
							</CardContent>
						</Card>
					))}
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-48 animate-pulse rounded-lg border bg-muted"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">
						Welcome back, {profile?.displayName || "Organizer"}
					</h1>
					<p className="text-muted-foreground">
						Manage your advocacy campaigns
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/campaigns/new">
						<PlusCircle className="mr-2 h-4 w-4" />
						New Campaign
					</Link>
				</Button>
			</div>

			{/* Stats cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Campaigns
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalCampaigns}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Campaigns
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.activeCampaigns}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Letters</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.totalLetters.toLocaleString()}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search campaigns..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as CampaignStatus | "all")
					}
				>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="draft">Draft</SelectItem>
						<SelectItem value="paused">Paused</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Campaign grid */}
			{filteredCampaigns.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
					<PlusCircle className="h-12 w-12 text-muted-foreground/50" />
					<h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						{searchQuery || statusFilter !== "all"
							? "Try adjusting your filters"
							: "Create your first campaign to get started"}
					</p>
					{!searchQuery && statusFilter === "all" && (
						<Button asChild className="mt-4">
							<Link href="/admin/campaigns/new">
								<PlusCircle className="mr-2 h-4 w-4" />
								Create Campaign
							</Link>
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredCampaigns.map((campaign) => (
						<CampaignCard
							key={campaign.id}
							campaign={campaign}
							onStatusChange={handleStatusChange}
							onDelete={handleDelete}
							onDuplicate={handleDuplicate}
						/>
					))}
				</div>
			)}
		</div>
	);
}
