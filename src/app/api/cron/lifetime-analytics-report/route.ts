import { NextResponse } from "next/server";
import { getLifetimeAnalyticsReport } from "@/lib/analytics-report";
import { sendTelegramMessage } from "@/lib/telegram";

const CRON_SECRET = process.env.CRON_SECRET?.trim();

function checkAuth(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : new URL(request.url).searchParams.get("secret");
    return !!CRON_SECRET && token === CRON_SECRET;
}

/**
 * GET/POST /api/cron/lifetime-analytics-report
 *
 * Sends all-time GA4 summary (GA_REPORT_START_DATE → today) in the same layout as the daily report.
 * Manual / on-demand only — not scheduled in vercel.json by default.
 */
export async function GET(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await getLifetimeAnalyticsReport();
    if (!report) {
        return NextResponse.json(
            { error: "Lifetime report unavailable (check GA4_PROPERTY_ID and GA credentials)." },
            { status: 503 }
        );
    }

    const sent = await sendTelegramMessage(report);
    if (!sent) {
        return NextResponse.json(
            { error: "Failed to send to Telegram (check TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID)." },
            { status: 503 }
        );
    }

    return NextResponse.json({ ok: true, message: "Lifetime report sent to Telegram." });
}

export async function POST(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await getLifetimeAnalyticsReport();
    if (!report) {
        return NextResponse.json(
            { error: "Lifetime report unavailable (check GA4_PROPERTY_ID and GA credentials)." },
            { status: 503 }
        );
    }

    const sent = await sendTelegramMessage(report);
    if (!sent) {
        return NextResponse.json(
            { error: "Failed to send to Telegram (check TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID)." },
            { status: 503 }
        );
    }

    return NextResponse.json({ ok: true, message: "Lifetime report sent to Telegram." });
}
