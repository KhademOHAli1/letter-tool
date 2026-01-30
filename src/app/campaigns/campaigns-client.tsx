/**
 * Client-side content for campaigns directory
 * Handles filtering and search interactively
 * Phase 6: Frontend Public Campaign Experience
 */

"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CampaignPublicCard } from "@/components/campaign-public-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Campaign, CampaignDemand } from "@/lib/types";

interface CampaignWithStats extends Campaign {
	demands?: CampaignDemand[];
	letterCount?: number;
}

interface CampaignsClientContentProps {
	campaigns: CampaignWithStats[];
	initialCountry?: string;
	initialSearch?: string;
}

const COUNTRIES = [
	{ code: "all", name: "All Countries", flag: "🌍" },
	{ code: "de", name: "Germany", flag: "🇩🇪" },
	{ code: "ca", name: "Canada", flag: "🇨🇦" },
	{ code: "uk", name: "United Kingdom", flag: "🇬🇧" },
	{ code: "us", name: "United States", flag: "🇺🇸" },
	{ code: "fr", name: "France", flag: "🇫🇷" },
];

export function CampaignsClientContent({
	campaigns,
	initialCountry,
	initialSearch,
}: CampaignsClientContentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const [searchQuery, setSearchQuery] = useState(initialSearch || "");
	const [countryFilter, setCountryFilter] = useState(initialCountry || "all");

	// Filter campaigns client-side for instant feedback
	const filteredCampaigns = useMemo(() => {
		return campaigns.filter((campaign) => {
			// Country filter
			if (
				countryFilter !== "all" &&
				!campaign.countryCodes.includes(countryFilter)
			) {
				return false;
			}

			// Search filter (search in name and description)
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const nameMatch = Object.values(campaign.name).some((n) =>
					n.toLowerCase().includes(query),
				);
				const descMatch = Object.values(campaign.description || {}).some((d) =>
					d.toLowerCase().includes(query),
				);
				if (!nameMatch && !descMatch) {
					return false;
				}
			}

			return true;
		});
	}, [campaigns, countryFilter, searchQuery]);

	const handleCountryChange = (value: string) => {
		setCountryFilter(value);
		// Update URL params
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (value === "all") {
				params.delete("country");
			} else {
				params.set("country", value);
			}
			router.push(`/campaigns?${params.toString()}`, { scroll: false });
		});
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		// Debounce URL update
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (value.trim()) {
				params.set("q", value);
			} else {
				params.delete("q");
			}
			router.push(`/campaigns?${params.toString()}`, { scroll: false });
		});
	};

	return (
		<div>
			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 mb-8">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search campaigns..."
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Country filter */}
				<Select value={countryFilter} onValueChange={handleCountryChange}>
					<SelectTrigger className="w-full sm:w-48">
						<SelectValue placeholder="Select country" />
					</SelectTrigger>
					<SelectContent>
						{COUNTRIES.map((country) => (
							<SelectItem key={country.code} value={country.code}>
								<span className="flex items-center gap-2">
									<span>{country.flag}</span>
									<span>{country.name}</span>
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Results count */}
			<div className="mb-4 text-sm text-muted-foreground">
				{filteredCampaigns.length === 1
					? "1 campaign"
					: `${filteredCampaigns.length} campaigns`}
				{countryFilter !== "all" &&
					` in ${COUNTRIES.find((c) => c.code === countryFilter)?.name}`}
				{searchQuery && ` matching "${searchQuery}"`}
			</div>

			{/* Campaign grid */}
			<div
				className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isPending ? "opacity-50" : ""}`}
			>
				{filteredCampaigns.map((campaign) => (
					<CampaignPublicCard
						key={campaign.id}
						campaign={campaign}
						letterCount={campaign.letterCount}
					/>
				))}
			</div>

			{/* No results */}
			{filteredCampaigns.length === 0 && campaigns.length > 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No campaigns match your filters.
					</p>
					<button
						type="button"
						onClick={() => {
							setSearchQuery("");
							setCountryFilter("all");
							router.push("/campaigns", { scroll: false });
						}}
						className="mt-2 text-sm text-primary hover:underline"
					>
						Clear filters
					</button>
				</div>
			)}
		</div>
	);
}
