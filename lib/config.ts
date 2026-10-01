export type FeatureName =
	| "listingSearch"
	| "userAccounts"
	| "listingPosting"
	| "propertyImages"
	| "redisEnrichment"
	| "maps"
	| "analytics"
	| "aiReports";

function envFlag(name: string, defaultValue: boolean) {
	const value = process.env[name]?.trim().toLowerCase();
	if (value === undefined || value === "") return defaultValue;
	return ["1", "true", "yes", "on"].includes(value);
}

export const config = {
	authSecret: process.env.AUTH_SECRET ?? "local-development-secret-change-me",
	features: {
		listingSearch: envFlag("FEATURE_LISTING_SEARCH", true),
		userAccounts: envFlag("FEATURE_USER_ACCOUNTS", true),
		listingPosting: envFlag("FEATURE_LISTING_POSTING", true),
		propertyImages: envFlag("FEATURE_PROPERTY_IMAGES", true),
		redisEnrichment: envFlag("FEATURE_REDIS_ENRICHMENT", true),
		maps: envFlag("FEATURE_MAPS", false),
		analytics: envFlag("FEATURE_ANALYTICS", false),
		aiReports: envFlag("FEATURE_AI_REPORTS", false),
	},
} as const;

export function featureEnabled(feature: FeatureName) {
	return config.features[feature];
}
