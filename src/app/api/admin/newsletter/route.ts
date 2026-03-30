import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSessionFromCookie } from "@/lib/auth";

async function requireAdmin() {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
    const session = getSessionFromCookie(cookieHeader);
    if (!session?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

function mapSubscriber(row: typeof newsletterSubscribers.$inferSelect) {
    return {
        id: row.id,
        email: row.email,
        createdAt: row.createdAt?.toISOString() ?? null,
    };
}

export type NewsletterSubscriber = ReturnType<typeof mapSubscriber>;

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const rows = await db
            .select()
            .from(newsletterSubscribers)
            .orderBy(desc(newsletterSubscribers.createdAt));
        return NextResponse.json(rows.map(mapSubscriber));
    } catch (err) {
        console.error("[admin/newsletter GET]", err);
        return NextResponse.json(
            { error: "Failed to fetch subscribers" },
            { status: 500 }
        );
    }
}
