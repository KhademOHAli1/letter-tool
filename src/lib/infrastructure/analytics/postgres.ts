/**
 * Postgres Analytics Provider
 * Phase 7: Backend Analytics & Tracking
 *
 * Implementation using Postgres views for analytics.
 * Works well up to ~500K users/day, then swap to Tinybird.
 */

import { createServerSupabaseClient } from "@/lib/supabase";
import type {
	AnalyticsEvent,
	AnalyticsProvider,
	CampaignAnalytics,
	DateRange,
	DemandStats,
	GeoStats,
	PlatformAnalytics,
	RepresentativeStats,
	TimeSeriesPoint,
} from "./types";

export class PostgresAnalyticsProvider implements AnalyticsProvider {
	async getCampaignAnalytics(
		campaignId: string,
	): Promise<CampaignAnalytics | null> {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_goal_progress")
			.select("*")
			.eq("campaign_id", campaignId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No data yet
				return {
					campaignId,
					totalLetters: 0,
					uniqueRepresentatives: 0,
					countriesActive: 0,
					goalProgress: null,
					firstLetterAt: null,
					lastLetterAt: null,
				};
			}
			console.error("[ANALYTICS] Campaign analytics error:", error);
			return null;
		}

		return {
			campaignId: data.campaign_id,
			totalLetters: data.current_letters,
			uniqueRepresentatives: data.unique_representatives ?? 0,
			countriesActive: data.countries_active ?? 0,
			goalProgress: data.progress_percentage,
			firstLetterAt: data.first_letter_at,
			lastLetterAt: data.last_letter_at,
		};
	}

	async getTimeSeries(
		campaignId: string,
		range: DateRange,
		country?: string,
	): Promise<TimeSeriesPoint[]> {
		const supabase = createServerSupabaseClient();

		let query = supabase
			.from("campaign_letters_by_day")
			.select("*")
			.eq("campaign_id", campaignId)
			.gte("date", range.start.toISOString().split("T")[0])
			.lte("date", range.end.toISOString().split("T")[0])
			.order("date", { ascending: true });

		if (country) {
			query = query.eq("country", country);
		}

		const { data, error } = await query;

		if (error) {
			console.error("[ANALYTICS] Time series error:", error);
			return [];
		}

		return (data || []).map((row) => ({
			date: row.date,
			count: row.letter_count,
			country: row.country,
		}));
	}

	async getTopDemands(campaignId: string, limit = 10): Promise<DemandStats[]> {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_demand_stats")
			.select("*")
			.eq("campaign_id", campaignId)
			.order("selection_count", { ascending: false })
			.limit(limit);

		if (error) {
			console.error("[ANALYTICS] Top demands error:", error);
			return [];
		}

		return (data || []).map((row) => ({
			demandId: row.demand_id,
			selectionCount: row.selection_count,
		}));
	}

	async getTopRepresentatives(
		campaignId: string,
		limit = 20,
		country?: string,
	): Promise<RepresentativeStats[]> {
		const supabase = createServerSupabaseClient();

		let query = supabase
			.from("campaign_top_representatives")
			.select("*")
			.eq("campaign_id", campaignId)
			.order("letter_count", { ascending: false })
			.limit(limit);

		if (country) {
			query = query.eq("country", country);
		}

		const { data, error } = await query;

		if (error) {
			console.error("[ANALYTICS] Top representatives error:", error);
			return [];
		}

		return (data || []).map((row) => ({
			id: row.mdb_id,
			name: row.mdb_name,
			party: row.mdb_party,
			district: row.wahlkreis_name,
			country: row.country,
			letterCount: row.letter_count,
		}));
	}

	async getGeoStats(campaignId: string): Promise<GeoStats[]> {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("campaign_geographic_stats")
			.select("*")
			.eq("campaign_id", campaignId)
			.order("letter_count", { ascending: false });

		if (error) {
			console.error("[ANALYTICS] Geo stats error:", error);
			return [];
		}

		return (data || []).map((row) => ({
			country: row.country,
			party: row.party,
			letterCount: row.letter_count,
			uniqueReps: row.unique_reps,
			uniqueDistricts: row.unique_districts,
		}));
	}

	async getPlatformAnalytics(): Promise<PlatformAnalytics> {
		const supabase = createServerSupabaseClient();

		const { data, error } = await supabase
			.from("platform_stats")
			.select("*")
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No data yet
				return {
					totalLetters: 0,
					totalRepresentatives: 0,
					activeCampaigns: 0,
					countriesActive: 0,
					firstLetterAt: null,
					lastLetterAt: null,
				};
			}
			console.error("[ANALYTICS] Platform analytics error:", error);
			throw error;
		}

		return {
			totalLetters: data.total_letters,
			totalRepresentatives: data.total_representatives,
			activeCampaigns: data.active_campaigns,
			countriesActive: data.countries_active,
			firstLetterAt: data.first_letter_at,
			lastLetterAt: data.last_letter_at,
		};
	}

	async trackEvent(event: AnalyticsEvent): Promise<void> {
		// For now, events are tracked via letter_generations table
		// In the future, this could write to a separate events table
		// or send to an external analytics service
		console.log("[ANALYTICS] Event tracked:", event.type, event.campaignId);

		// Placeholder for future implementation
		// Could write to analytics_events table or send to Tinybird
	}
}
