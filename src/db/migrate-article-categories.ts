/**
 * One-off migration: rename article categories in the database.
 * - "Housing & Life" → "Home & Life"
 * - "Home Decor" → "Home Radar"
 *
 * Run with: npm run db:migrate-categories
 * Loads DATABASE_URL from .env.local if not set.
 */
import postgres from "postgres";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
    if (process.env.DATABASE_URL) return;
    const path = resolve(process.cwd(), ".env.local");
    if (!existsSync(path)) return;
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
        const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
}

loadEnvLocal();

async function migrate() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error(
            "DATABASE_URL is not set. Add it to .env.local or run:\n  DATABASE_URL='your-connection-string' npm run db:migrate-categories"
        );
        process.exit(1);
    }

    const client = postgres(url, {
        ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
    });

    try {
        const r1 = await client`
            UPDATE articles SET category = 'Home & Life' WHERE category = 'Housing & Life' RETURNING id
        `;
        const r2 = await client`
            UPDATE articles SET category = 'Home Radar' WHERE category = 'Home Decor' RETURNING id
        `;

        console.log(
            `Updated categories: ${r1.length} rows "Housing & Life" → "Home & Life", ${r2.length} rows "Home Decor" → "Home Radar".`
        );
    } finally {
        await client.end();
    }
}

migrate().catch((err) => {
    if (err?.code === "ECONNREFUSED") {
        console.error(
            "Could not connect to the database (ECONNREFUSED).\n" +
                "  - If using a local DB, start PostgreSQL (e.g. brew services start postgresql).\n" +
                "  - Set DATABASE_URL (e.g. export from .env.local or run: set -a && source .env.local && set +a && npm run db:migrate-categories)."
        );
    } else {
        console.error("Migration failed:", err);
    }
    process.exit(1);
});
