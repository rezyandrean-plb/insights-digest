import { NextResponse } from "next/server";
import { getWeeklyAdminReport } from "@/lib/weekly-admin-report";
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
 * GET/POST /api/cron/weekly-admin-report
 *
 * Sends a weekly admin summary (articles added/updated, new enquiries, other content) to Telegram.
 * Call weekly (e.g. Monday 9am); uses same TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID as daily report.
 *
 * Protection: CRON_SECRET in header or query.
 */
export async function GET(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await getWeeklyAdminReport();
    if (!report) {
        return NextResponse.json(
            { error: "Weekly report failed (DB error)." },
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

    return NextResponse.json({ ok: true, message: "Weekly report sent to Telegram." });
}

export async function POST(request: Request) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await getWeeklyAdminReport();
    if (!report) {
        return NextResponse.json(
            { error: "Weekly report failed (DB error)." },
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

    return NextResponse.json({ ok: true, message: "Weekly report sent to Telegram." });
}
