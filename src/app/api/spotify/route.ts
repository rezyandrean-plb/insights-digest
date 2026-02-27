import { NextResponse } from "next/server";

const SHOW_ID = "3XFLamzyEFP5FzQwX9lcV0";
const MARKET = "SG";

async function getSpotifyToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("Spotify credentials not configured");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
        },
        body: "grant_type=client_credentials",
        next: { revalidate: 3500 }, // cache token for ~1 hour
    });

    if (!res.ok) throw new Error("Failed to get Spotify token");
    const data = await res.json();
    return data.access_token;
}

export async function GET() {
    try {
        const token = await getSpotifyToken();
        const fetchOpts = {
            headers: { Authorization: `Bearer ${token}` },
            next: { revalidate: 3600 },
        } as RequestInit;

        // Fetch show info and first 50 episodes in parallel
        const [showRes, epsRes] = await Promise.all([
            fetch(`https://api.spotify.com/v1/shows/${SHOW_ID}?market=${MARKET}`, fetchOpts),
            fetch(
                `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?market=${MARKET}&limit=50&offset=0`,
                fetchOpts
            ),
        ]);

        if (!showRes.ok || !epsRes.ok) throw new Error("Spotify API error");

        const show = await showRes.json();
        const epsData = await epsRes.json();

        return NextResponse.json({
            show,
            episodes: epsData.items ?? [],
            total: epsData.total ?? 0,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
