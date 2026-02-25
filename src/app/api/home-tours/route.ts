import { NextResponse } from "next/server";
import { db } from "@/db";
import { homeTourSeries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function mapRow(r: typeof homeTourSeries.$inferSelect) {
    return {
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        image: r.image,
        category: r.category,
        readTime: r.readTime,
        isHero: r.isHero,
    };
}

export async function GET() {
    try {
        const rows = await db
            .select()
            .from(homeTourSeries)
            .orderBy(desc(homeTourSeries.isHero), desc(homeTourSeries.id));

        return NextResponse.json(rows.map(mapRow));
    } catch (error) {
        console.error("Failed to fetch home tour series:", error);
        return NextResponse.json(
            { error: "Failed to fetch home tour series" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [inserted] = await db
            .insert(homeTourSeries)
            .values({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt ?? "",
                image: body.image ?? "",
                category: body.category ?? "Condo",
                readTime: body.readTime ?? "",
            })
            .returning();

        return NextResponse.json(mapRow(inserted), { status: 201 });
    } catch (error) {
        console.error("Failed to create home tour:", error);
        return NextResponse.json(
            { error: "Failed to create home tour" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const id = Number(body.id);
        if (!id) {
            return NextResponse.json(
                { error: "Missing item id" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(homeTourSeries)
            .set({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt ?? "",
                image: body.image ?? "",
                category: body.category ?? "Condo",
                readTime: body.readTime ?? "",
            })
            .where(eq(homeTourSeries.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(mapRow(updated));
    } catch (error) {
        console.error("Failed to update home tour:", error);
        return NextResponse.json(
            { error: "Failed to update home tour" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get("id"));
        if (!id) {
            return NextResponse.json(
                { error: "Missing item id" },
                { status: 400 }
            );
        }

        const [deleted] = await db
            .delete(homeTourSeries)
            .where(eq(homeTourSeries.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete home tour:", error);
        return NextResponse.json(
            { error: "Failed to delete home tour" },
            { status: 500 }
        );
    }
}
