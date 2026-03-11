import { and, count, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import {
    articles,
    enquiries,
    reels,
    newLaunchSeries,
    homeTourSeries,
} from "@/db/schema";

/**
 * Returns a plain-text weekly admin report: articles added/updated, new enquiries,
 * and other content counts for the last 7 days. Returns null on DB error.
 */
export async function getWeeklyAdminReport(): Promise<string | null> {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 7);

    try {
        // Articles: added (created in last 7 days) and updated (updated in last 7 days, created before that)
        const [articlesAdded] = await db
            .select({ count: count() })
            .from(articles)
            .where(gte(articles.createdAt, since));

        const [articlesUpdated] = await db
            .select({ count: count() })
            .from(articles)
            .where(
                and(
                    gte(articles.updatedAt, since),
                    lt(articles.createdAt, since)
                )
            );

        // New enquiries (created in last 7 days)
        const [enquiriesNew] = await db
            .select({ count: count() })
            .from(enquiries)
            .where(gte(enquiries.createdAt, since));

        // Reels added
        const [reelsAdded] = await db
            .select({ count: count() })
            .from(reels)
            .where(gte(reels.createdAt, since));

        // New launch series added
        const [newLaunchesAdded] = await db
            .select({ count: count() })
            .from(newLaunchSeries)
            .where(gte(newLaunchSeries.createdAt, since));

        // Home tour series added
        const [homeToursAdded] = await db
            .select({ count: count() })
            .from(homeTourSeries)
            .where(gte(homeTourSeries.createdAt, since));

        const added = Number(articlesAdded?.count ?? 0);
        const updated = Number(articlesUpdated?.count ?? 0);
        const enquiriesCount = Number(enquiriesNew?.count ?? 0);
        const reelsCount = Number(reelsAdded?.count ?? 0);
        const launchesCount = Number(newLaunchesAdded?.count ?? 0);
        const toursCount = Number(homeToursAdded?.count ?? 0);

        const periodEnd = now.toISOString().slice(0, 10);
        const periodStart = since.toISOString().slice(0, 10);

        const lines = [
            "📋 Weekly Admin Report",
            `${periodStart} → ${periodEnd}`,
            "",
            "📝 Articles",
            "  Added: " + added,
            "  Updated: " + updated,
            "",
            "📬 New enquiries: " + enquiriesCount,
            "",
            "📦 Other content added",
            "  Reels: " + reelsCount,
            "  New launches: " + launchesCount,
            "  Home tours: " + toursCount,
        ];

        return lines.join("\n");
    } catch (err) {
        console.error("Weekly admin report error:", err);
        return null;
    }
}
