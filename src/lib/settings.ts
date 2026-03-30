import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

const ANALYTICS_KEY = "analyticsId";

/**
 * Returns the Google Analytics measurement ID (e.g. G-XXXXXXXXXX).
 * Uses NEXT_PUBLIC_GA_ID if set, otherwise the value from Admin → Settings → Advanced.
 * Returns null if not set or on error.
 */
export const getAnalyticsId = unstable_cache(
    async (): Promise<string | null> => {
        const envId = process.env.NEXT_PUBLIC_GA_ID?.trim();
        if (envId) return envId;

        try {
            const rows = await db
                .select({ value: siteSettings.value })
                .from(siteSettings)
                .where(eq(siteSettings.key, ANALYTICS_KEY));
            const value = rows[0]?.value?.trim();
            return value && value.length > 0 ? value : null;
        } catch {
            return null;
        }
    },
    ["analytics-id"],
    { revalidate: 300 }
);
