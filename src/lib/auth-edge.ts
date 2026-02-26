/**
 * Edge-runtime compatible auth helpers (Web Crypto API only).
 * Used by src/middleware.ts.
 */

export const SESSION_COOKIE = "admin_session";

interface SessionPayload {
    email: string;
    exp: number;
}

async function getHmacKey(): Promise<CryptoKey> {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
}

/** Decode a base64url string to a Uint8Array (Edge-runtime compatible). */
function b64urlDecode(str: string): Uint8Array {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (b64.length % 4)) % 4;
    const padded = b64 + "=".repeat(pad);
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const [encoded, sig] = token.split(".");
        if (!encoded || !sig) return null;

        const key = await getHmacKey();
        const sigBytes = b64urlDecode(sig);
        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigBytes,
            new TextEncoder().encode(encoded)
        );
        if (!valid) return null;

        const payloadStr = new TextDecoder().decode(b64urlDecode(encoded));
        const payload: SessionPayload = JSON.parse(payloadStr);
        if (Date.now() > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

export function getSessionFromCookieHeader(
    cookieHeader: string | null
): Promise<SessionPayload | null> {
    if (!cookieHeader) return Promise.resolve(null);
    const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    if (!match) return Promise.resolve(null);
    const token = match.slice(SESSION_COOKIE.length + 1);
    return verifyToken(token);
}
