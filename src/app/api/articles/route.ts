import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

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

        const rows = await db
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

        const [updated] = await db
            .update(articles)
            .set({
                slug: body.slug,
                title: body.title,
                excerpt: body.excerpt ?? "",
                content: body.content ?? null,
                sections: body.sections ?? null,
                category: body.category ?? "Property",
                image: body.image ?? "",
                author: body.author ?? "",
                date: body.date ?? "",
                readTime: body.readTime ?? "",
                featured: body.featured ?? false,
            })
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
        const id = Number(searchParams.get("id"));
        if (!id) {
            return NextResponse.json(
                { error: "Missing article id" },
                { status: 400 }
            );
        }

        const [deleted] = await db
            .delete(articles)
            .where(eq(articles.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete article:", error);
        return NextResponse.json(
            { error: "Failed to delete article" },
            { status: 500 }
        );
    }
}
