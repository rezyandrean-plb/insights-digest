import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_HOMEPAGE_CONFIG, mergeWithDefault } from "@/lib/homepage-config";
import type { HomepageConfig } from "@/lib/homepage-config";

const HOMEPAGE_KEY = "homepage";

export async function GET() {
    try {
        const [row] = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, HOMEPAGE_KEY))
            .limit(1);

        if (!row || !row.value) {
            return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(row.value) as Partial<HomepageConfig>;
        } catch {
            return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
        }

        const config = mergeWithDefault(parsed as Partial<HomepageConfig> | null);
        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to fetch homepage config:", error);
        return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
    }
}

export async function PUT(request: Request) {
    try {
        const body = (await request.json()) as Partial<HomepageConfig>;
        const config = mergeWithDefault(body);
        const value = JSON.stringify(config);

        await db
            .insert(siteSettings)
            .values({ key: HOMEPAGE_KEY, value })
            .onConflictDoUpdate({
                target: siteSettings.key,
                set: { value, updatedAt: new Date() },
            });

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to save homepage config:", error);
        return NextResponse.json(
            { error: "Failed to save homepage config" },
            { status: 500 }
        );
    }
}
