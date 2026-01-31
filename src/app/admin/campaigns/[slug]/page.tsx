/**
 * Campaign Edit Page
 * Phase 5: Frontend Admin Interface - Epic 5.5
 */

"use client";

import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DemandsTab } from "@/components/admin/edit/demands-tab";
// Tab components
import { OverviewTab } from "@/components/admin/edit/overview-tab";
import { PromptsTab } from "@/components/admin/edit/prompts-tab";
import { SettingsTab } from "@/components/admin/edit/settings-tab";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { Campaign, CampaignDemand, CampaignStatus } from "@/lib/types";

const STATUS_COLORS: Record<CampaignStatus, string> = {
	active: "bg-green-500",
	draft: "bg-gray-400",
	paused: "bg-yellow-500",
	completed: "bg-blue-500",
};

export default function EditCampaignPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const slug = params.slug as string;

	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [demands, setDemands] = useState<CampaignDemand[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");

	const fetchCampaign = useCallback(async () => {
		const supabase = getSupabaseBrowserClient();

		const { data: campaignData, error: campaignError } = await supabase
			.from("campaigns")
			.select("*")
			.eq("slug", slug)
			.single();

		if (campaignError || !campaignData) {
			console.error("Error fetching campaign:", campaignError);
			router.push("/admin/campaigns");
			return;
		}

		// Check ownership
		if (campaignData.created_by !== user?.id) {
			router.push("/admin/campaigns");
			return;
		}

		setCampaign(campaignData as Campaign);

		// Fetch demands
		const { data: demandsData } = await supabase
			.from("campaign_demands")
			.select("*")
			.eq("campaign_id", campaignData.id)
			.order("sort_order");

		setDemands((demandsData as CampaignDemand[]) || []);
		setIsLoading(false);
	}, [slug, user?.id, router]);

	useEffect(() => {
		if (user) {
			fetchCampaign();
		}
	}, [user, fetchCampaign]);

	const handleCampaignChange = (updates: Partial<Campaign>) => {
		if (!campaign) return;
		setCampaign({ ...campaign, ...updates });
		setHasChanges(true);
	};

	const handleDemandsChange = (newDemands: CampaignDemand[]) => {
		setDemands(newDemands);
		setHasChanges(true);
	};

	const handleSave = async () => {
		if (!campaign) return;

		setIsSaving(true);

		try {
			const supabase = getSupabaseBrowserClient();

			// Update campaign
			const { error: campaignError } = await supabase
				.from("campaigns")
				.update({
					name: campaign.name,
					description: campaign.description,
					country_codes: campaign.countryCodes,
					cause_context: campaign.causeContext,
					goal_letters: campaign.goalLetters,
					start_date: campaign.startDate,
					end_date: campaign.endDate,
					status: campaign.status,
				})
				.eq("id", campaign.id);

			if (campaignError) throw campaignError;

			// Update demands - delete existing and insert new
			await supabase
				.from("campaign_demands")
				.delete()
				.eq("campaign_id", campaign.id);

			if (demands.length > 0) {
				const demandInserts = demands.map((demand, index) => ({
					id: demand.id,
					campaign_id: campaign.id,
					title: demand.title,
					description: demand.description,
					brief_text: demand.briefText,
					sort_order: index,
					completed: demand.completed,
					completed_date: demand.completedDate,
				}));

				const { error: demandsError } = await supabase
					.from("campaign_demands")
					.upsert(demandInserts);

				if (demandsError) throw demandsError;
			}

			setHasChanges(false);
		} catch (error) {
			console.error("Error saving campaign:", error);
			alert("Failed to save campaign. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading || !campaign) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
				<div className="h-96 animate-pulse rounded-lg border bg-muted" />
			</div>
		);
	}

	const primaryName =
		(campaign.name as Record<string, string>).en ||
		(campaign.name as Record<string, string>).de ||
		Object.values(campaign.name as Record<string, string>)[0] ||
		"Untitled";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/admin/campaigns">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold">{primaryName}</h1>
							<Badge className={STATUS_COLORS[campaign.status]}>
								{campaign.status}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">/c/{campaign.slug}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<a
							href={`/c/${campaign.slug}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							Preview
						</a>
					</Button>
					<Button onClick={handleSave} disabled={!hasChanges || isSaving}>
						{isSaving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Unsaved changes indicator */}
			{hasChanges && (
				<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
					You have unsaved changes. Click &quot;Save Changes&quot; to save them.
				</div>
			)}

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="demands">Demands</TabsTrigger>
					<TabsTrigger value="prompts">Prompts</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<OverviewTab campaign={campaign} onChange={handleCampaignChange} />
				</TabsContent>

				<TabsContent value="demands" className="mt-6">
					<DemandsTab
						campaignId={campaign.id}
						demands={demands}
						onChange={handleDemandsChange}
					/>
				</TabsContent>

				<TabsContent value="prompts" className="mt-6">
					<PromptsTab campaign={campaign} />
				</TabsContent>

				<TabsContent value="settings" className="mt-6">
					<SettingsTab
						campaign={campaign}
						onChange={handleCampaignChange}
						onDelete={() => router.push("/admin/campaigns")}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
