import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { articles } from "./schema";
import { articles as mockArticles } from "../lib/data";

async function seed() {
    const client = postgres(process.env.DATABASE_URL!, {
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(client);

    const existing = await db.select({ id: articles.id }).from(articles);
    if (existing.length > 0) {
        console.log(
            `Skipping seed — ${existing.length} articles already exist.`
        );
        await client.end();
        return;
    }

    console.log(`Seeding ${mockArticles.length} articles...`);

    for (const a of mockArticles) {
        await db.insert(articles).values({
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content ?? null,
            sections: a.sections ?? null,
            category: a.category,
            image: a.image,
            author: a.author,
            date: a.date,
            readTime: a.readTime,
            featured: a.featured ?? false,
        });
    }

    console.log("Seed complete.");
    await client.end();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
