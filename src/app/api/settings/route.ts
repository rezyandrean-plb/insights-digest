import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS: Record<string, string> = {
    siteTitle: "Insights — Singapore Real Estate News & Analysis",
    siteDescription:
        "Your trusted source for Singapore real estate news, market analysis, property trends, and investment insights.",
    siteUrl: "https://insights.example.com",
    logoUrl: "/images/insights-logo.png",
    primaryColor: "#2a9d8f",
    enableSearch: "true",
    articlesPerPage: "9",
    enableNewsletter: "true",
    newsletterHeading: "Stay Informed with PLB Insights",
    newsletterSubtext:
        "Get the latest property market analysis, investment tips, and exclusive content delivered to your inbox.",
    enableNotifications: "true",
    emailRecipient: "admin@insights.example.com",
    metaTitle: "Insights — Singapore Real Estate News & Analysis",
    metaDescription:
        "Your trusted source for Singapore real estate news, market analysis, property trends, and investment insights.",
    ogImage:
        "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&q=80",
    analyticsId: "",
    headerScript: "",
};

export async function GET() {
    try {
        const rows = await db.select().from(siteSettings);

        const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
        for (const row of rows) {
            settings[row.key] = row.value;
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json(DEFAULT_SETTINGS);
    }
}

export async function PUT(request: Request) {
    try {
        const body: Record<string, string> = await request.json();

        const entries = Object.entries(body).filter(
            ([key]) => key in DEFAULT_SETTINGS
        );

        for (const [key, value] of entries) {
            await db
                .insert(siteSettings)
                .values({ key, value })
                .onConflictDoUpdate({
                    target: siteSettings.key,
                    set: { value, updatedAt: new Date() },
                });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        );
    }
}
