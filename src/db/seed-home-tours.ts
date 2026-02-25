import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { homeTourSeries } from "./schema";
import { homeTourSeries as mockItems } from "../lib/data";

async function seed() {
    const client = postgres(process.env.DATABASE_URL!, {
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(client);

    const existing = await db.select({ id: homeTourSeries.id }).from(homeTourSeries);
    if (existing.length > 0) {
        console.log(
            `Skipping seed — ${existing.length} home tour items already exist.`
        );
        await client.end();
        return;
    }

    console.log(`Seeding ${mockItems.length} home tour items...`);

    for (let i = 0; i < mockItems.length; i++) {
        await db.insert(homeTourSeries).values({
            slug: mockItems[i].slug,
            title: mockItems[i].title,
            excerpt: mockItems[i].excerpt,
            image: mockItems[i].image,
            category: mockItems[i].category,
            readTime: mockItems[i].readTime,
            isHero: i === 0,
        });
    }

    console.log("Seed complete.");
    await client.end();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
