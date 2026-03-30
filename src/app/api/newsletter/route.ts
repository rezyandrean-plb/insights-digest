import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    let body: { email?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
            { error: "Please enter a valid email address." },
            { status: 400 }
        );
    }

    try {
        const existing = await db
            .select()
            .from(newsletterSubscribers)
            .where(eq(newsletterSubscribers.email, email))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ ok: true, message: "You're already subscribed!" });
        }

        await db.insert(newsletterSubscribers).values({ email });
        return NextResponse.json({ ok: true, message: "Successfully subscribed!" });
    } catch (err) {
        console.error("Newsletter subscribe: failed to save", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
