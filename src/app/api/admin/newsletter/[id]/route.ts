import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
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

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const [deleted] = await db
            .delete(newsletterSubscribers)
            .where(eq(newsletterSubscribers.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[admin/newsletter DELETE]", err);
        return NextResponse.json(
            { error: "Failed to delete subscriber" },
            { status: 500 }
        );
    }
}
