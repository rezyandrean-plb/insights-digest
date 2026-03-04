import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
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

function mapEnquiry(row: typeof enquiries.$inferSelect) {
    return {
        id: row.id,
        enquiryAbout: row.enquiryAbout,
        fullName: row.fullName,
        email: row.email,
        contactNumber: row.contactNumber ?? "",
        company: row.company ?? "",
        inquiryContext: row.inquiryContext ?? "",
        lookingToAchieve: row.lookingToAchieve ?? "",
        projectTimeline: row.projectTimeline ?? "",
        estimatedBudget: row.estimatedBudget ?? "",
        stage: row.stage ?? "",
        propertyType: row.propertyType ?? "",
        describeSituation: row.describeSituation ?? "",
        status: row.status,
        createdAt: row.createdAt?.toISOString() ?? null,
        updatedAt: row.updatedAt?.toISOString() ?? null,
    };
}

export type EnquiryListItem = ReturnType<typeof mapEnquiry>;

export async function GET(request: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // optional filter: new | read | replied | archived
        const idParam = searchParams.get("id");

        if (idParam) {
            const id = parseInt(idParam, 10);
            if (Number.isNaN(id)) {
                return NextResponse.json({ error: "Invalid id" }, { status: 400 });
            }
            const [row] = await db
                .select()
                .from(enquiries)
                .where(eq(enquiries.id, id))
                .limit(1);
            if (!row) {
                return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
            }
            return NextResponse.json(mapEnquiry(row));
        }

        const statusFilter = status?.trim();
        const query =
            statusFilter && ["new", "read", "replied", "archived"].includes(statusFilter)
                ? db
                      .select()
                      .from(enquiries)
                      .where(eq(enquiries.status, statusFilter))
                      .orderBy(desc(enquiries.createdAt))
                : db.select().from(enquiries).orderBy(desc(enquiries.createdAt));

        const rows = await query;
        return NextResponse.json(rows.map(mapEnquiry));
    } catch (err) {
        console.error("[admin/enquiries GET]", err);
        return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
    }
}
