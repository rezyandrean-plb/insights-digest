import { NextResponse } from "next/server";
import { db } from "@/db";
import { newLaunchSeries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function mapRow(r: typeof newLaunchSeries.$inferSelect) {
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
            .from(newLaunchSeries)
            .orderBy(desc(newLaunchSeries.isHero), desc(newLaunchSeries.id));

        return NextResponse.json(rows.map(mapRow));
    } catch (error) {
        console.error("Failed to fetch new launch series:", error);
        return NextResponse.json(
            { error: "Failed to fetch new launch series" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [inserted] = await db
            .insert(newLaunchSeries)
            .values({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt ?? "",
                image: body.image ?? "",
                category: body.category ?? "Most Viewed",
                readTime: body.readTime ?? "",
            })
            .returning();

        return NextResponse.json(mapRow(inserted), { status: 201 });
    } catch (error) {
        console.error("Failed to create new launch item:", error);
        return NextResponse.json(
            { error: "Failed to create new launch item" },
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
            .update(newLaunchSeries)
            .set({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt ?? "",
                image: body.image ?? "",
                category: body.category ?? "Most Viewed",
                readTime: body.readTime ?? "",
            })
            .where(eq(newLaunchSeries.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(mapRow(updated));
    } catch (error) {
        console.error("Failed to update new launch item:", error);
        return NextResponse.json(
            { error: "Failed to update new launch item" },
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
            .delete(newLaunchSeries)
            .where(eq(newLaunchSeries.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete new launch item:", error);
        return NextResponse.json(
            { error: "Failed to delete new launch item" },
            { status: 500 }
        );
    }
}
