import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { getSessionFromCookie } from "@/lib/auth";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");
        const session = getSessionFromCookie(cookieHeader);
        if (!session?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deleted = await db.delete(reels).returning({ id: reels.id });
        const count = deleted.length;

        return NextResponse.json({ success: true, deleted: count });
    } catch (error) {
        console.error("Failed to clear reels:", error);
        return NextResponse.json(
            { error: "Failed to clear reels" },
            { status: 500 }
        );
    }
}
