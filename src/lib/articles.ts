import { db } from "@/db";
import { articles } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import type { ArticleCategory } from "@/lib/data";

/** Keeps category ISR/RSC payloads under Vercel limits; client pagination covers this many items. */
const DEFAULT_CATEGORY_LIST_LIMIT = 400;
/** List cards only need a short teaser; full excerpt lives on the article page. */
const LIST_EXCERPT_MAX_CHARS = 450;

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
    category: ArticleCategory,
    options?: { limit?: number }
): Promise<ArticleListItem[]> {
    const limit = options?.limit ?? DEFAULT_CATEGORY_LIST_LIMIT;

    const rows = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: articles.title,
            excerpt: sql<string>`LEFT(COALESCE(${articles.excerpt}, ''), ${LIST_EXCERPT_MAX_CHARS})`,
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
        .orderBy(desc(articles.isHero), desc(articles.id))
        .limit(limit);

    return rows.map((r) => ({ ...r, id: String(r.id) }));
}
