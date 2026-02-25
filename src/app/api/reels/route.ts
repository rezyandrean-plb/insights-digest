import { NextResponse } from "next/server";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function mapRow(r: typeof reels.$inferSelect) {
    return {
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        thumbnail: r.thumbnail,
        duration: r.duration,
        category: r.category,
        videoUrl: r.videoUrl || "",
    };
}

export async function GET() {
    try {
        const rows = await db
            .select()
            .from(reels)
            .orderBy(desc(reels.id));

        return NextResponse.json(rows.map(mapRow));
    } catch (error) {
        console.error("Failed to fetch reels:", error);
        return NextResponse.json(
            { error: "Failed to fetch reels" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [inserted] = await db
            .insert(reels)
            .values({
                slug: body.slug,
                title: body.title,
                thumbnail: body.thumbnail ?? "",
                duration: body.duration ?? "",
                category: body.category ?? "Most Viewed",
                videoUrl: body.videoUrl ?? "",
            })
            .returning();

        return NextResponse.json(mapRow(inserted), { status: 201 });
    } catch (error) {
        console.error("Failed to create reel:", error);
        return NextResponse.json(
            { error: "Failed to create reel" },
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
                { error: "Missing reel id" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(reels)
            .set({
                slug: body.slug,
                title: body.title,
                thumbnail: body.thumbnail ?? "",
                duration: body.duration ?? "",
                category: body.category ?? "Most Viewed",
                videoUrl: body.videoUrl ?? "",
            })
            .where(eq(reels.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Reel not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(mapRow(updated));
    } catch (error) {
        console.error("Failed to update reel:", error);
        return NextResponse.json(
            { error: "Failed to update reel" },
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
                { error: "Missing reel id" },
                { status: 400 }
            );
        }

        const [deleted] = await db
            .delete(reels)
            .where(eq(reels.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Reel not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete reel:", error);
        return NextResponse.json(
            { error: "Failed to delete reel" },
            { status: 500 }
        );
    }
}
