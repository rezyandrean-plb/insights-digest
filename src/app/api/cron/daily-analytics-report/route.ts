import { NextResponse } from "next/server";
import { getDailyAnalyticsReport } from "@/lib/analytics-report";
import { sendTelegramMessage } from "@/lib/telegram";

const CRON_SECRET = process.env.CRON_SECRET?.trim();

function checkAuth(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : new URL(request.url).searchParams.get("secret");
    return !!CRON_SECRET && token === CRON_SECRET;
}

async function runReport() {
    const report = await getDailyAnalyticsReport();
    if (!report) {
        return NextResponse.json(
            { error: "Analytics report unavailable (check GA4_PROPERTY_ID and GA credentials)." },
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
    return NextResponse.json({ ok: true, message: "Report sent to Telegram." });
}

/**
 * GET/POST /api/cron/daily-analytics-report
 *
 * Fetches yesterday's GA4 metrics and sends a summary to the configured Telegram channel.
 * Call daily (Vercel Cron uses GET with Authorization: Bearer CRON_SECRET).
 *
 * Protection: CRON_SECRET in header (Authorization: Bearer <CRON_SECRET>) or query (?secret=<CRON_SECRET>).
 */
export async function GET(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return runReport();
}

export async function POST(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return runReport();
}
