import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { reels } from "./schema";
import { reels as mockReels } from "../lib/data";

async function seed() {
    const client = postgres(process.env.DATABASE_URL!, {
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(client);

    const existing = await db.select({ id: reels.id }).from(reels);
    if (existing.length > 0) {
        console.log(
            `Skipping seed — ${existing.length} reels already exist.`
        );
        await client.end();
        return;
    }

    console.log(`Seeding ${mockReels.length} reels...`);

    for (const r of mockReels) {
        await db.insert(reels).values({
            slug: r.slug,
            title: r.title,
            thumbnail: r.thumbnail,
            duration: r.duration,
            category: r.category,
        });
    }

    console.log("Seed complete.");
    await client.end();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
