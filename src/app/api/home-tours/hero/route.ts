import { NextResponse } from "next/server";
import { db } from "@/db";
import { homeTourSeries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const [hero] = await db
            .select()
            .from(homeTourSeries)
            .where(eq(homeTourSeries.isHero, true))
            .limit(1);

        if (!hero) {
            return NextResponse.json(null);
        }

        return NextResponse.json({
            id: String(hero.id),
            slug: hero.slug,
            title: hero.title,
            excerpt: hero.excerpt,
            image: hero.image,
            category: hero.category,
            readTime: hero.readTime,
            isHero: hero.isHero,
        });
    } catch (error) {
        console.error("Failed to fetch hero home tour:", error);
        return NextResponse.json(
            { error: "Failed to fetch hero home tour" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { id } = await request.json();
        const itemId = Number(id);
        if (!itemId) {
            return NextResponse.json(
                { error: "Missing item id" },
                { status: 400 }
            );
        }

        await db
            .update(homeTourSeries)
            .set({ isHero: false })
            .where(eq(homeTourSeries.isHero, true));

        const [updated] = await db
            .update(homeTourSeries)
            .set({ isHero: true })
            .where(eq(homeTourSeries.id, itemId))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: String(updated.id),
            slug: updated.slug,
            title: updated.title,
            isHero: updated.isHero,
        });
    } catch (error) {
        console.error("Failed to set hero home tour:", error);
        return NextResponse.json(
            { error: "Failed to set hero home tour" },
            { status: 500 }
        );
    }
}
