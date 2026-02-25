import postgres from "postgres";

const HERO_SLUG = "singapore-property-market-2026-private-home-prices";
const HERO_TITLE =
    "Singapore Property Market 2026: Private Home Prices Rise 3.3% and HDB Resale Prices Climb 9.6% Amid Strong Q4 Recovery";
const HERO_EXCERPT =
    "Yesterday, a team of analysts departed from the Keppel Bay Tower, embarking on a fact-finding mission to Sentosa Cove. HDB is set to introduce sustainable living concepts in Punggol Northshore with new eco-friendly housing projects.";
const HERO_IMAGE =
    "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1400&q=80";

async function main() {
    const sql = postgres(process.env.DATABASE_URL!, {
        ssl: { rejectUnauthorized: false },
    });

    const existing = await sql`
        SELECT id FROM new_launch_series WHERE slug = ${HERO_SLUG} LIMIT 1
    `;

    let id: number;
    if (existing.length > 0) {
        id = existing[0].id;
        console.log("Hero item already exists, id:", id);
    } else {
        const [inserted] = await sql`
            INSERT INTO new_launch_series (slug, title, excerpt, image, category, read_time, is_hero)
            VALUES (${HERO_SLUG}, ${HERO_TITLE}, ${HERO_EXCERPT}, ${HERO_IMAGE}, 'Most Viewed', '5 mins read', true)
            RETURNING id
        `;
        id = inserted.id;
        console.log("Inserted hero item, id:", id);
    }

    await sql`
        UPDATE new_launch_series SET is_hero = false WHERE id != ${id}
    `;
    await sql`
        UPDATE new_launch_series SET is_hero = true WHERE id = ${id}
    `;

    console.log("Hero set successfully.");
    await sql.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
