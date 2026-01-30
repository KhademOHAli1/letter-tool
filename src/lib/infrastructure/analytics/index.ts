/**
 * Analytics Infrastructure
 * Phase 7: Backend Analytics & Tracking
 *
 * Central export for analytics provider.
 * Currently uses Postgres, swap to Tinybird when scaling past 500K users/day.
 */

export { PostgresAnalyticsProvider } from "./postgres";
export type {
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

// Export a default instance for convenience
import { PostgresAnalyticsProvider } from "./postgres";

/**
 * Default analytics provider instance
 *
 * Usage:
 * ```ts
 * import { analytics } from '@/lib/infrastructure/analytics';
 * const stats = await analytics.getCampaignAnalytics(campaignId);
 * ```
 *
 * To swap implementation at scale:
 * ```ts
 * // In this file, change to:
 * // export const analytics: AnalyticsProvider = new TinybirdAnalyticsProvider();
 * ```
 */
export const analytics: PostgresAnalyticsProvider =
	new PostgresAnalyticsProvider();
