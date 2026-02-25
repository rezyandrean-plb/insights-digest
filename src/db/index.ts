import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as {
    pgClient: ReturnType<typeof postgres> | undefined;
};

const client =
    globalForDb.pgClient ??
    postgres(connectionString, {
        prepare: false,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idle_timeout: 20,
        connect_timeout: 30,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
