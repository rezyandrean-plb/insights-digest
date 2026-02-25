import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { newLaunchSeries } from "./schema";
import { newLaunchSeries as mockItems } from "../lib/data";

async function seed() {
    const client = postgres(process.env.DATABASE_URL!, {
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(client);

    const existing = await db.select({ id: newLaunchSeries.id }).from(newLaunchSeries);
    if (existing.length > 0) {
        console.log(
            `Skipping seed — ${existing.length} new launch items already exist.`
        );
        await client.end();
        return;
    }

    console.log(`Seeding ${mockItems.length} new launch items...`);

    for (const item of mockItems) {
        await db.insert(newLaunchSeries).values({
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            image: item.image,
            category: item.category,
            readTime: item.readTime,
        });
    }

    console.log("Seed complete.");
    await client.end();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
