import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { reels } from "./schema";

async function clearReels() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is not set.");
        process.exit(1);
    }

    const client = postgres(connectionString, {
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(client);

    const deleted = await db.delete(reels).returning({ id: reels.id });
    const count = deleted.length;

    console.log(`Deleted ${count} reel(s) from the database.`);
    await client.end();
}

clearReels().catch((err) => {
    console.error("Clear reels failed:", err);
    process.exit(1);
});
