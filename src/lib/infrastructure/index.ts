/**
 * Infrastructure Module
 * Phase 7+: Scale-Ready Abstractions
 *
 * Central configuration for all infrastructure providers.
 * Swap implementations here when scaling.
 *
 * @see /docs/campaign-platform-plan.md - Appendix D
 */

export {
	type AnalyticsEvent,
	type AnalyticsProvider,
	analytics,
	type CampaignAnalytics,
	type DateRange,
	type DemandStats,
	type GeoStats,
	type PlatformAnalytics,
	PostgresAnalyticsProvider,
	type RepresentativeStats,
	type TimeSeriesPoint,
} from "./analytics";

/**
 * Infrastructure instances
 *
 * All infrastructure is accessed through these exports.
 * To swap implementations, change the exports here.
 *
 * Current implementations:
 * - analytics: PostgresAnalyticsProvider (swap to Tinybird at 500K users/day)
 *
 * Future implementations (add when needed):
 * - cache: MemoryCacheProvider → RedisCacheProvider at 5K users/day
 * - rateLimiter: MemoryRateLimiter → UpstashRateLimiter at multi-region
 * - queue: SyncJobQueue → QStashJobQueue at 100K users/day
 */
