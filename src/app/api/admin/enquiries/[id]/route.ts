import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: { status?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const status = body.status?.trim();
    if (!status || !["new", "read", "replied", "archived"].includes(status)) {
        return NextResponse.json(
            { error: "status must be one of: new, read, replied, archived" },
            { status: 400 }
        );
    }

    try {
        const [updated] = await db
            .update(enquiries)
            .set({ status, updatedAt: new Date() })
            .where(eq(enquiries.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: updated.id,
            status: updated.status,
            updatedAt: updated.updatedAt?.toISOString() ?? null,
        });
    } catch (err) {
        console.error("[admin/enquiries PATCH]", err);
        return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
    }
}
