import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const ANALYTICS_KEY = "analyticsId";

/**
 * Returns the Google Analytics measurement ID (e.g. G-XXXXXXXXXX).
 * Uses NEXT_PUBLIC_GA_ID if set, otherwise the value from Admin → Settings → Advanced.
 * Returns null if not set or on error.
 */
export async function getAnalyticsId(): Promise<string | null> {
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
}
