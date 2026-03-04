import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

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
        published: r.published,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const category = searchParams.get("category");
        const includeDrafts = searchParams.get("include_drafts") === "true";

        if (slug) {
            const [row] = await db
                .select()
                .from(articles)
                .where(eq(articles.slug, slug))
                .limit(1);

            if (!row) {
                return NextResponse.json(
                    { error: "Article not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(mapRow(row));
        }

        const conditions = [];
        if (!includeDrafts) conditions.push(eq(articles.published, true));
        if (category?.trim()) conditions.push(eq(articles.category, category.trim()));

        const rows =
            conditions.length > 0
                ? await db
                      .select()
                      .from(articles)
                      .where(and(...conditions))
                      .orderBy(desc(articles.isHero), desc(articles.id))
                : await db
                      .select()
                      .from(articles)
                      .orderBy(desc(articles.isHero), desc(articles.id));

        return NextResponse.json(rows.map(mapRow));
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return NextResponse.json(
            { error: "Failed to fetch articles" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [inserted] = await db
            .insert(articles)
            .values({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt || "",
                content: body.content || null,
                sections: body.sections || null,
                category: body.category || "Property",
                image: body.image || "",
                author: body.author || "",
                date: body.date || "",
                readTime: body.readTime || "",
                featured: body.featured ?? false,
                published: body.published ?? true,
            })
            .returning();

        return NextResponse.json(mapRow(inserted), { status: 201 });
    } catch (error) {
        console.error("Failed to create article:", error);
        return NextResponse.json(
            { error: "Failed to create article" },
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
                { error: "Missing article id" },
                { status: 400 }
            );
        }

        // Only update fields that are explicitly provided so we don't
        // accidentally wipe out sections/content when they're not sent.
        const patch: Record<string, unknown> = {};
        if (body.slug !== undefined) patch.slug = body.slug;
        if (body.title !== undefined) patch.title = body.title;
        if (body.excerpt !== undefined) patch.excerpt = body.excerpt;
        if (body.content !== undefined) patch.content = body.content;
        if (body.sections !== undefined) patch.sections = body.sections;
        if (body.category !== undefined) patch.category = body.category;
        if (body.image !== undefined) patch.image = body.image;
        if (body.author !== undefined) patch.author = body.author;
        if (body.date !== undefined) patch.date = body.date;
        if (body.readTime !== undefined) patch.readTime = body.readTime;
        if (body.featured !== undefined) patch.featured = body.featured;
        if (body.published !== undefined) patch.published = body.published;

        const [updated] = await db
            .update(articles)
            .set(patch)
            .where(eq(articles.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(mapRow(updated));
    } catch (error) {
        console.error("Failed to update article:", error);
        return NextResponse.json(
            { error: "Failed to update article" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const idsParam = searchParams.get("ids");
        const singleId = searchParams.get("id");

        const ids: number[] = idsParam
            ? idsParam.split(",").map(Number).filter(Boolean)
            : singleId
              ? [Number(singleId)].filter(Boolean)
              : [];

        if (ids.length === 0) {
            return NextResponse.json(
                { error: "Missing article id(s)" },
                { status: 400 }
            );
        }

        if (ids.length === 1) {
            const [deleted] = await db
                .delete(articles)
                .where(eq(articles.id, ids[0]))
                .returning();
            if (!deleted) {
                return NextResponse.json(
                    { error: "Article not found" },
                    { status: 404 }
                );
            }
        } else {
            await db.delete(articles).where(inArray(articles.id, ids));
        }

        return NextResponse.json({ success: true, deleted: ids.length });
    } catch (error) {
        console.error("Failed to delete article(s):", error);
        return NextResponse.json(
            { error: "Failed to delete article(s)" },
            { status: 500 }
        );
    }
}
