import { db } from "@/db";
import { articles } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { ArticleCategory } from "@/lib/data";

export type ArticleListItem = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    image: string;
    author: string;
    date: string;
    readTime: string;
    featured: boolean;
    isHero: boolean;
};

export async function getArticlesByCategory(
    category: ArticleCategory
): Promise<ArticleListItem[]> {
    const rows = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: articles.title,
            excerpt: articles.excerpt,
            category: articles.category,
            image: articles.image,
            author: articles.author,
            date: articles.date,
            readTime: articles.readTime,
            featured: articles.featured,
            isHero: articles.isHero,
        })
        .from(articles)
        .where(
            and(eq(articles.published, true), eq(articles.category, category))
        )
        .orderBy(desc(articles.isHero), desc(articles.id));

    return rows.map((r) => ({ ...r, id: String(r.id) }));
}
