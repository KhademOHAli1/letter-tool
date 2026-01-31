/**
 * CampaignCard component for admin campaign list
 * Phase 5: Frontend Admin Interface
 */

"use client";

import {
	Copy,
	ExternalLink,
	MoreVertical,
	Pause,
	Play,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { CampaignStatus } from "@/lib/types";

export interface CampaignCardData {
	id: string;
	slug: string;
	name: Record<string, string>;
	description: Record<string, string>;
	status: CampaignStatus;
	countryCodes: string[];
	letterCount: number;
	goalLetters: number | null;
	createdAt: string;
}

interface CampaignCardProps {
	campaign: CampaignCardData;
	onStatusChange?: (id: string, status: CampaignStatus) => void;
	onDelete?: (id: string) => void;
	onDuplicate?: (id: string) => void;
}

export function CampaignCard({
	campaign,
	onStatusChange,
	onDelete,
	onDuplicate,
}: CampaignCardProps) {
	const getStatusColor = (status: CampaignStatus) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "draft":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
			case "paused":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "completed":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getCampaignName = (name: Record<string, string>) => {
		return name.en || name.de || Object.values(name)[0] || "Untitled";
	};

	const getDescription = (desc: Record<string, string>) => {
		const text = desc.en || desc.de || Object.values(desc)[0] || "";
		return text.length > 100 ? `${text.slice(0, 100)}...` : text;
	};

	const progress =
		campaign.goalLetters && campaign.goalLetters > 0
			? Math.min((campaign.letterCount / campaign.goalLetters) * 100, 100)
			: 0;

	const countryFlags: Record<string, string> = {
		de: "🇩🇪",
		ca: "🇨🇦",
		uk: "🇬🇧",
		fr: "🇫🇷",
		us: "🇺🇸",
	};

	return (
		<Card className="group relative overflow-hidden">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<CardTitle className="text-lg">
								<Link
									href={`/admin/campaigns/${campaign.slug}`}
									className="hover:underline"
								>
									{getCampaignName(campaign.name)}
								</Link>
							</CardTitle>
							<span
								className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(campaign.status)}`}
							>
								{campaign.status}
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>
								{campaign.countryCodes
									.map((c) => countryFlags[c] || c.toUpperCase())
									.join(" ")}
							</span>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href={`/admin/campaigns/${campaign.slug}`}>
									Edit Campaign
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									href={`/c/${campaign.slug}`}
									target="_blank"
									rel="noopener"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									View Public Page
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{campaign.status === "active" && onStatusChange && (
								<DropdownMenuItem
									onClick={() => onStatusChange(campaign.id, "paused")}
								>
									<Pause className="mr-2 h-4 w-4" />
									Pause Campaign
								</DropdownMenuItem>
							)}
							{(campaign.status === "draft" || campaign.status === "paused") &&
								onStatusChange && (
									<DropdownMenuItem
										onClick={() => onStatusChange(campaign.id, "active")}
									>
										<Play className="mr-2 h-4 w-4" />
										Activate Campaign
									</DropdownMenuItem>
								)}
							{onDuplicate && (
								<DropdownMenuItem onClick={() => onDuplicate(campaign.id)}>
									<Copy className="mr-2 h-4 w-4" />
									Duplicate
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							{onDelete && (
								<DropdownMenuItem
									onClick={() => onDelete(campaign.id)}
									className="text-red-600 focus:text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-sm text-muted-foreground">
					{getDescription(campaign.description)}
				</p>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Progress</span>
						<span className="font-medium">
							{campaign.letterCount.toLocaleString()}
							{campaign.goalLetters && (
								<span className="text-muted-foreground">
									{" "}
									/ {campaign.goalLetters.toLocaleString()}
								</span>
							)}
						</span>
					</div>
					{campaign.goalLetters && campaign.goalLetters > 0 && (
						<Progress value={progress} className="h-2" />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
