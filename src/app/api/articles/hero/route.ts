import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const [hero] = await db
            .select()
            .from(articles)
            .where(eq(articles.isHero, true))
            .limit(1);

        if (!hero) {
            return NextResponse.json(null);
        }

        return NextResponse.json({
            id: String(hero.id),
            slug: hero.slug,
            title: hero.title,
            excerpt: hero.excerpt,
            content: hero.content,
            sections: hero.sections,
            category: hero.category,
            image: hero.image,
            author: hero.author,
            date: hero.date,
            readTime: hero.readTime,
            featured: hero.featured,
            isHero: hero.isHero,
        });
    } catch (error) {
        console.error("Failed to fetch hero article:", error);
        return NextResponse.json(
            { error: "Failed to fetch hero article" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { id } = await request.json();
        const articleId = Number(id);
        if (!articleId) {
            return NextResponse.json(
                { error: "Missing article id" },
                { status: 400 }
            );
        }

        await db
            .update(articles)
            .set({ isHero: false })
            .where(eq(articles.isHero, true));

        const [updated] = await db
            .update(articles)
            .set({ isHero: true })
            .where(eq(articles.id, articleId))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: String(updated.id),
            slug: updated.slug,
            title: updated.title,
            isHero: updated.isHero,
        });
    } catch (error) {
        console.error("Failed to set hero article:", error);
        return NextResponse.json(
            { error: "Failed to set hero article" },
            { status: 500 }
        );
    }
}
