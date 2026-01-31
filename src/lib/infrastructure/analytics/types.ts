/**
 * Analytics Provider Interface
 * Phase 7: Backend Analytics & Tracking
 *
 * Scale-ready abstraction for analytics queries.
 * Currently uses Postgres views, can swap to Tinybird at scale.
 *
 * @see /docs/campaign-platform-plan.md - Appendix D.4
 */

/**
 * Date range for analytics queries
 */
export interface DateRange {
	start: Date;
	end: Date;
}

/**
 * Campaign-level statistics
 */
export interface CampaignAnalytics {
	campaignId: string;
	totalLetters: number;
	uniqueRepresentatives: number;
	countriesActive: number;
	goalProgress: number | null;
	firstLetterAt: string | null;
	lastLetterAt: string | null;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
	date: string;
	count: number;
	country?: string;
}

/**
 * Demand popularity data
 */
export interface DemandStats {
	demandId: string;
	selectionCount: number;
}

/**
 * Representative contact data
 */
export interface RepresentativeStats {
	id: string;
	name: string;
	party: string | null;
	district: string | null;
	country: string;
	letterCount: number;
}

/**
 * Geographic/party breakdown
 */
export interface GeoStats {
	country: string;
	party: string | null;
	letterCount: number;
	uniqueReps: number;
	uniqueDistricts: number;
}

/**
 * Platform-wide statistics
 */
export interface PlatformAnalytics {
	totalLetters: number;
	totalRepresentatives: number;
	activeCampaigns: number;
	countriesActive: number;
	firstLetterAt: string | null;
	lastLetterAt: string | null;
}

/**
 * Analytics event for tracking
 */
export interface AnalyticsEvent {
	type: "letter_generated" | "letter_shared" | "campaign_viewed";
	campaignId?: string;
	country?: string;
	metadata?: Record<string, unknown>;
	timestamp?: Date;
}

/**
 * Analytics Provider Interface
 *
 * Abstraction layer for analytics queries.
 * Implementations can use Postgres views, Redis caching, or OLAP databases.
 */
export interface AnalyticsProvider {
	/**
	 * Get analytics for a specific campaign
	 */
	getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null>;

	/**
	 * Get time series data for a campaign
	 * @param campaignId - Campaign to query
	 * @param range - Date range for the query
	 * @param country - Optional country filter
	 */
	getTimeSeries(
		campaignId: string,
		range: DateRange,
		country?: string,
	): Promise<TimeSeriesPoint[]>;

	/**
	 * Get demand popularity for a campaign
	 * @param campaignId - Campaign to query
	 * @param limit - Max number of demands to return
	 */
	getTopDemands(campaignId: string, limit?: number): Promise<DemandStats[]>;

	/**
	 * Get top representatives contacted for a campaign
	 * @param campaignId - Campaign to query
	 * @param limit - Max number of reps to return
	 * @param country - Optional country filter
	 */
	getTopRepresentatives(
		campaignId: string,
		limit?: number,
		country?: string,
	): Promise<RepresentativeStats[]>;

	/**
	 * Get geographic/party breakdown for a campaign
	 * @param campaignId - Campaign to query
	 */
	getGeoStats(campaignId: string): Promise<GeoStats[]>;

	/**
	 * Get platform-wide analytics
	 */
	getPlatformAnalytics(): Promise<PlatformAnalytics>;

	/**
	 * Track an analytics event
	 * @param event - Event to track
	 */
	trackEvent(event: AnalyticsEvent): Promise<void>;
}
