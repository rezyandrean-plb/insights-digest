import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { adminUsers } from "./schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
    const client = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } });
    const db = drizzle(client);

    const email = "admin@insights.sg";
    const password = "insightspassword";

    const existing = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

    if (existing.length > 0) {
        console.log("Admin user already exists — skipping.");
        await client.end();
        return;
    }

    const passwordHash = await hashPassword(password);
    await db.insert(adminUsers).values({ email, passwordHash });
    console.log(`Admin user created: ${email}`);
    await client.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
