import { BetaAnalyticsDataClient } from "@google-analytics/data";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID?.trim();
const GA_SERVICE_ACCOUNT_JSON = process.env.GA_SERVICE_ACCOUNT_JSON?.trim();
/** Inclusive start date for lifetime / all-time reports (YYYY-MM-DD). */
const GA_REPORT_START_DATE = (process.env.GA_REPORT_START_DATE?.trim() || "2018-01-01").slice(0, 10);

/** Compatible with GA4 API IRow (dimensionValues/metricValues can be null; value can be null). */
type GaRow = {
    dimensionValues?: Array<{ value?: string | null }> | null;
    metricValues?: Array<{ value?: string | null }> | null;
};

function getGaClient(): BetaAnalyticsDataClient | null {
    if (!GA4_PROPERTY_ID) return null;

    if (GA_SERVICE_ACCOUNT_JSON) {
        try {
            const raw = GA_SERVICE_ACCOUNT_JSON.startsWith("{")
                ? GA_SERVICE_ACCOUNT_JSON
                : Buffer.from(GA_SERVICE_ACCOUNT_JSON, "base64").toString("utf8");
            const key = JSON.parse(raw) as { client_email?: string; private_key?: string };
            if (key.client_email && key.private_key) {
                return new BetaAnalyticsDataClient({
                    credentials: {
                        client_email: key.client_email,
                        private_key: key.private_key.replace(/\\n/g, "\n"),
                    },
                });
            }
        } catch {
            // ignore parse errors
        }
    }

    try {
        return new BetaAnalyticsDataClient();
    } catch {
        return null;
    }
}

const ARTICLE_PREFIX = "/article/";

function mv(row: GaRow, idx: number): number {
    return parseFloat(row.metricValues?.[idx]?.value ?? "0");
}

function dv(row: GaRow, idx: number): string {
    return row.dimensionValues?.[idx]?.value ?? "";
}

function fmtDuration(sec: number): string {
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.floor(sec / 60)}m${String(Math.round(sec % 60)).padStart(2, "0")}s`;
}

function fmtDate(d: Date): string {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function slugFromPath(path: string): string {
    return path.replace(ARTICLE_PREFIX, "").replace(/\/$/, "");
}

function pad(s: string, len: number): string {
    return s.padEnd(len);
}

function padStart(s: string, len: number): string {
    return s.padStart(len);
}

type DateRange = { startDate: string; endDate: string };

const articlePathFilter = {
    dimensionFilter: {
        filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "BEGINS_WITH" as const, value: ARTICLE_PREFIX },
        },
    },
};

/** Top Articles, Trending, Engagement — same GA windows as the scheduled daily report (7d / 30d vs yesterday). */
async function appendDailyStyleArticleSections(
    client: BetaAnalyticsDataClient,
    prop: string,
    lines: string[]
): Promise<void> {
    try {
        const [topArt7] = await client.runReport({
            property: prop,
            dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }, { name: "userEngagementDuration" }],
            ...articlePathFilter,
            limit: 10,
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        });

        const [topArt30] = await client.runReport({
            property: prop,
            dateRanges: [{ startDate: "30daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            ...articlePathFilter,
            limit: 100,
        });

        const views30ByPath = new Map<string, number>();
        for (const r of topArt30.rows ?? []) {
            views30ByPath.set(dv(r, 0), mv(r, 0));
        }

        if (topArt7.rows?.length) {
            lines.push("", "📝 Top Articles", "");
            lines.push("7d | 30d | Avg Read | Article");

            for (const r of topArt7.rows.slice(0, 10)) {
                const path = dv(r, 0);
                const views7 = mv(r, 0);
                const dur7 = mv(r, 1);
                const views30 = views30ByPath.get(path) ?? 0;
                const avgRead = views7 > 0 ? dur7 / views7 : 0;
                const slug = slugFromPath(path);

                lines.push(
                    `${padStart(String(views7), 3)} | ${padStart(String(views30), 3)} | ${pad(fmtDuration(avgRead), 8)} | ${slug}`
                );
            }
        }
    } catch (e) {
        console.warn("Top articles failed:", e);
    }

    try {
        const [trendCurr] = await client.runReport({
            property: prop,
            dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            ...articlePathFilter,
            limit: 50,
        });
        const [trendPrev] = await client.runReport({
            property: prop,
            dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            ...articlePathFilter,
            limit: 50,
        });
        const prevByPath = new Map<string, number>();
        for (const r of trendPrev.rows ?? []) prevByPath.set(dv(r, 0), mv(r, 0));

        const trending: Array<{ slug: string; growth: number }> = [];
        for (const r of trendCurr.rows ?? []) {
            const path = dv(r, 0);
            const curr = mv(r, 0);
            const prev = prevByPath.get(path) ?? 0;
            const growth = curr - prev;
            if (growth > 0) trending.push({ slug: slugFromPath(path), growth });
        }
        trending.sort((a, b) => b.growth - a.growth);

        if (trending.length > 0) {
            lines.push("", "", "🔥 Trending Articles", "");
            for (const t of trending.slice(0, 5)) {
                lines.push(`+${t.growth}  ${t.slug}`);
            }
        }
    } catch (e) {
        console.warn("Trending articles failed:", e);
    }

    try {
        const [engRes] = await client.runReport({
            property: prop,
            dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }, { name: "userEngagementDuration" }],
            ...articlePathFilter,
            limit: 20,
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        });

        if (engRes.rows?.length) {
            const engaged: Array<{ slug: string; avgSec: number }> = [];
            for (const r of engRes.rows) {
                const views = mv(r, 0);
                const dur = mv(r, 1);
                if (views >= 3) {
                    engaged.push({ slug: slugFromPath(dv(r, 0)), avgSec: dur / views });
                }
            }
            engaged.sort((a, b) => b.avgSec - a.avgSec);

            if (engaged.length > 0) {
                lines.push("", "⏱️ Highest Engagement Articles", "");
                for (const e of engaged.slice(0, 5)) {
                    lines.push(`${pad(fmtDuration(e.avgSec), 7)}  ${e.slug}`);
                }
            }
        }
    } catch (e) {
        console.warn("Engagement articles failed:", e);
    }
}

export async function getDailyAnalyticsReport(): Promise<string | null> {
    const client = getGaClient();
    if (!client || !GA4_PROPERTY_ID) return null;

    const prop = `properties/${GA4_PROPERTY_ID}`;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);

    let range: DateRange = { startDate: dateStr, endDate: dateStr };
    let periodLabel = fmtDate(yesterday);
    let fallbackNote = "";

    try {
        // --- 1. Overview ---
        const [overviewRes] = await client.runReport({
            property: prop,
            dateRanges: [range],
            dimensions: [{ name: "date" }],
            metrics: [
                { name: "activeUsers" },
                { name: "screenPageViews" },
            ],
        });

        let oRow = overviewRes.rows?.[0];

        if (!oRow?.metricValues?.length) {
            range = { startDate: "7daysAgo", endDate: "yesterday" };
            periodLabel = fmtDate(yesterday) + " (last 7 days)";
            fallbackNote = "\n\n⚠ Yesterday had no data yet — showing last 7 days.";

            const [res7] = await client.runReport({
                property: prop,
                dateRanges: [range],
                metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            });
            oRow = res7.rows?.[0];
        }

        if (!oRow?.metricValues?.length) {
            return await getRealtimeFallback(client, yesterday);
        }

        const totalUsers = mv(oRow, 0);
        const totalViews = mv(oRow, 1);

        // --- 2. Article views (filter /article/*) ---
        let articleViews = 0;
        try {
            const [artRes] = await client.runReport({
                property: prop,
                dateRanges: [range],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }],
                dimensionFilter: {
                    filter: {
                        fieldName: "pagePath",
                        stringFilter: { matchType: "BEGINS_WITH", value: ARTICLE_PREFIX },
                    },
                },
            });
            for (const r of artRes.rows ?? []) articleViews += mv(r, 0);
        } catch (e) {
            console.warn("Article views failed:", e);
        }

        const artPct = totalViews > 0 ? Math.round((articleViews / totalViews) * 100) : 0;

        const lines: string[] = [
            "📊 Daily Analytics",
            periodLabel,
            "",
            `Users: ${totalUsers}`,
            `Page Views: ${totalViews}`,
            `Articles: ${articleViews} views (${artPct}%)`,
        ];

        // --- 3. Top Pages ---
        try {
            const [topPages] = await client.runReport({
                property: prop,
                dateRanges: [range],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }],
                limit: 5,
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            });
            if (topPages.rows?.length) {
                lines.push("", "Top Pages (Views)");
                const maxViews = String(mv(topPages.rows[0], 0)).length;
                for (const r of topPages.rows.slice(0, 5)) {
                    const views = String(mv(r, 0));
                    const path = dv(r, 0) || "/";
                    lines.push(`${padStart(views, maxViews)}  ${path}`);
                }
            }
        } catch (e) {
            console.warn("Top pages failed:", e);
        }

        await appendDailyStyleArticleSections(client, prop, lines);

        return lines.join("\n") + fallbackNote;
    } catch (err) {
        console.error("GA report error:", err);
        return null;
    }
}

/**
 * One-time / on-demand report: all-time totals + Top Pages (all-time), then the same article blocks as the daily report (7d→yesterday).
 */
export async function getLifetimeAnalyticsReport(): Promise<string | null> {
    const client = getGaClient();
    if (!client || !GA4_PROPERTY_ID) return null;

    const prop = `properties/${GA4_PROPERTY_ID}`;
    const range: DateRange = { startDate: GA_REPORT_START_DATE, endDate: "today" };
    const today = new Date();
    const periodLabel = `${fmtDate(new Date(GA_REPORT_START_DATE + "T12:00:00"))} → ${fmtDate(today)}`;

    try {
        const [overviewRes] = await client.runReport({
            property: prop,
            dateRanges: [range],
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        });

        const oRow = overviewRes.rows?.[0];
        if (!oRow?.metricValues?.length) {
            return `📊 Overall Analytics\n${periodLabel}\n\nNo data for this date range.`;
        }

        const totalUsers = mv(oRow, 0);
        const totalViews = mv(oRow, 1);

        let articleViews = 0;
        try {
            const [artRes] = await client.runReport({
                property: prop,
                dateRanges: [range],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }],
                ...articlePathFilter,
            });
            for (const r of artRes.rows ?? []) articleViews += mv(r, 0);
        } catch (e) {
            console.warn("Lifetime article views failed:", e);
        }

        const artPct = totalViews > 0 ? Math.round((articleViews / totalViews) * 100) : 0;

        const lines: string[] = [
            "📊 Overall Analytics",
            `${periodLabel} (all-time totals)`,
            "",
            `Users: ${totalUsers}`,
            `Page Views: ${totalViews}`,
            `Articles: ${articleViews} views (${artPct}%)`,
        ];

        try {
            const [topPages] = await client.runReport({
                property: prop,
                dateRanges: [range],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }],
                limit: 5,
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            });
            if (topPages.rows?.length) {
                lines.push("", "Top Pages (Views)");
                const maxViews = String(mv(topPages.rows[0], 0)).length;
                for (const r of topPages.rows.slice(0, 5)) {
                    const views = String(mv(r, 0));
                    const path = dv(r, 0) || "/";
                    lines.push(`${padStart(views, maxViews)}  ${path}`);
                }
            }
        } catch (e) {
            console.warn("Lifetime top pages failed:", e);
        }

        await appendDailyStyleArticleSections(client, prop, lines);

        return lines.join("\n");
    } catch (err) {
        console.error("Lifetime GA report error:", err);
        return null;
    }
}

/**
 * Realtime fallback when no historical data exists yet (new property / tag just added).
 */
async function getRealtimeFallback(
    client: BetaAnalyticsDataClient,
    date: Date
): Promise<string> {
    const dateLabel = fmtDate(date);
    try {
        const [overview] = await client.runRealtimeReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            metrics: [
                { name: "activeUsers" },
                { name: "screenPageViews" },
                { name: "eventCount" },
            ],
        });

        const oRow = overview.rows?.[0];
        const activeUsers = oRow?.metricValues?.[0]?.value ?? "0";
        const pageViews = oRow?.metricValues?.[1]?.value ?? "0";

        const lines = [
            "📊 Daily Analytics",
            dateLabel + " (Realtime — last 30 min)",
            "",
            `Users: ${activeUsers}`,
            `Page Views: ${pageViews}`,
        ];

        try {
            const [pageReport] = await client.runRealtimeReport({
                property: `properties/${GA4_PROPERTY_ID}`,
                dimensions: [{ name: "unifiedScreenName" }],
                metrics: [{ name: "screenPageViews" }],
                limit: 5,
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            });
            if (pageReport.rows?.length) {
                lines.push("", "Top Pages (Views)");
                for (const row of pageReport.rows.slice(0, 5)) {
                    const title = dv(row, 0) || "(no title)";
                    const views = String(mv(row, 0));
                    lines.push(`${padStart(views, 4)}  ${title}`);
                }
            }
        } catch (e) {
            console.warn("Realtime top pages failed:", e);
        }

        lines.push(
            "",
            "⚠ Historical data not available yet.",
            "GA4 takes 24–48h to process. Full report starts tomorrow."
        );

        return lines.join("\n");
    } catch (err) {
        console.error("Realtime fallback error:", err);
        return [
            "📊 Daily Analytics",
            dateLabel,
            "",
            "No data available yet.",
            "",
            "• GA4 can take 24–48h to process.",
            "• Ensure the site has the Measurement ID and had some traffic.",
        ].join("\n");
    }
}
