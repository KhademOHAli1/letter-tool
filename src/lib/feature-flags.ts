/**
 * Feature Flags System
 *
 * Centralized feature flags for A/B testing, gradual rollouts, and tracking.
 * Flags can be controlled via environment variables for easy configuration.
 *
 * Usage:
 *   import { flags, isEnabled } from '@/lib/feature-flags';
 *   if (isEnabled('streamingGeneration')) { ... }
 */

export type FeatureFlag =
	| "streamingGeneration" // Enable streaming letter generation
	| "showCampaignGoal" // Show campaign goal progress bar
	| "showImpactStats" // Show impact statistics section
	| "enableMultiLanguage" // Enable DE/EN language switcher
	| "enableDarkMode" // Enable theme toggle
	| "showWhyBoxes" // Show "Why we ask" explanations in form
	| "enableShareFeature" // Enable social sharing on success page
	| "debugMode" // Enable debug logging
	| "mobileOptimizations"; // Enable mobile-specific optimizations

interface FeatureFlagConfig {
	defaultValue: boolean;
	description: string;
	envVar?: string; // Optional env var override
}

const flagConfigs: Record<FeatureFlag, FeatureFlagConfig> = {
	streamingGeneration: {
		defaultValue: true,
		description: "Enable streaming letter generation for better UX",
		envVar: "NEXT_PUBLIC_FLAG_STREAMING",
	},
	showCampaignGoal: {
		defaultValue: true,
		description: "Show campaign goal progress bar on home page",
		envVar: "NEXT_PUBLIC_FLAG_CAMPAIGN_GOAL",
	},
	showImpactStats: {
		defaultValue: true,
		description: "Show impact statistics after first letter is sent",
		envVar: "NEXT_PUBLIC_FLAG_IMPACT_STATS",
	},
	enableMultiLanguage: {
		defaultValue: true,
		description: "Enable German/English language switcher",
		envVar: "NEXT_PUBLIC_FLAG_MULTI_LANGUAGE",
	},
	enableDarkMode: {
		defaultValue: true,
		description: "Enable dark mode theme toggle",
		envVar: "NEXT_PUBLIC_FLAG_DARK_MODE",
	},
	showWhyBoxes: {
		defaultValue: true,
		description: 'Show explanatory "Why we ask" boxes in form steps',
		envVar: "NEXT_PUBLIC_FLAG_WHY_BOXES",
	},
	enableShareFeature: {
		defaultValue: true,
		description: "Enable social sharing options on success page",
		envVar: "NEXT_PUBLIC_FLAG_SHARE",
	},
	debugMode: {
		defaultValue: process.env.NODE_ENV === "development",
		description: "Enable debug logging and dev tools",
		envVar: "NEXT_PUBLIC_FLAG_DEBUG",
	},
	mobileOptimizations: {
		defaultValue: true,
		description: "Enable mobile-specific UI optimizations",
		envVar: "NEXT_PUBLIC_FLAG_MOBILE_OPT",
	},
};

/**
 * Get all feature flags with their current values
 */
export function getFlags(): Record<FeatureFlag, boolean> {
	const flags = {} as Record<FeatureFlag, boolean>;

	for (const [key, config] of Object.entries(flagConfigs)) {
		const flagKey = key as FeatureFlag;

		// Check environment variable override
		if (config.envVar && typeof process !== "undefined") {
			const envValue = process.env[config.envVar];
			if (envValue !== undefined) {
				flags[flagKey] = envValue === "true" || envValue === "1";
				continue;
			}
		}

		flags[flagKey] = config.defaultValue;
	}

	return flags;
}

/**
 * Check if a specific feature flag is enabled
 */
export function isEnabled(flag: FeatureFlag): boolean {
	const config = flagConfigs[flag];

	// Check environment variable override
	if (config.envVar && typeof process !== "undefined") {
		const envValue = process.env[config.envVar];
		if (envValue !== undefined) {
			return envValue === "true" || envValue === "1";
		}
	}

	return config.defaultValue;
}

/**
 * Get feature flag configuration (for admin/debugging)
 */
export function getFlagConfig(flag: FeatureFlag): FeatureFlagConfig {
	return flagConfigs[flag];
}

/**
 * All available flags (for iteration)
 */
export const flags = getFlags();

/**
 * Track feature flag usage for analytics
 * Call this when a flag influences user behavior
 */
export function trackFlagUsage(
	flag: FeatureFlag,
	variant: "enabled" | "disabled",
): void {
	if (typeof window !== "undefined" && isEnabled("debugMode")) {
		console.log(`[FeatureFlag] ${flag}: ${variant}`);
	}

	// In production, you could send this to analytics:
	// analytics.track('feature_flag_used', { flag, variant });
}
