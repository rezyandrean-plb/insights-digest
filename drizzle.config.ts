import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local (Next.js local env) then .env so drizzle-kit CLI has DATABASE_URL
config({ path: ".env.local" });
config();

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
