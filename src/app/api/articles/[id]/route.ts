import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

function mapRow(r: typeof articles.$inferSelect) {
    return {
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        sections: r.sections,
        category: r.category,
        image: r.image,
        author: r.author,
        date: r.date,
        readTime: r.readTime,
        featured: r.featured,
        isHero: r.isHero,
    };
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const numId = Number(id);
        if (!numId) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const [row] = await db
            .select()
            .from(articles)
            .where(eq(articles.id, numId))
            .limit(1);

        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(mapRow(row));
    } catch (err) {
        console.error("[articles/[id] GET]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

/** PATCH — update only the sections field */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const numId = Number(id);
        if (!numId) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const body = await req.json();

        const [updated] = await db
            .update(articles)
            .set({ sections: body.sections ?? null })
            .where(eq(articles.id, numId))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(mapRow(updated));
    } catch (err) {
        console.error("[articles/[id] PATCH]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
