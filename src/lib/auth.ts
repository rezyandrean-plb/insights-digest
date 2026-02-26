import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

function getSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error("ADMIN_SESSION_SECRET env var is not set");
    return secret;
}

// ── Password hashing ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    const [salt, storedKey] = hash.split(":");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(storedKey, "hex");
    return timingSafeEqual(derivedKey, storedBuffer);
}

// ── Session token (HMAC-signed payload) ───────────────────────────────────

interface SessionPayload {
    email: string;
    exp: number;
}

function signToken(payload: SessionPayload): string {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
    return `${encoded}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
    try {
        const [encoded, sig] = token.split(".");
        if (!encoded || !sig) return null;
        const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
        const expectedBuf = Buffer.from(expected);
        const sigBuf = Buffer.from(sig);
        if (expectedBuf.length !== sigBuf.length) return null;
        if (!timingSafeEqual(expectedBuf, sigBuf)) return null;
        const payload: SessionPayload = JSON.parse(
            Buffer.from(encoded, "base64url").toString()
        );
        if (Date.now() > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

// ── Cookie helpers ─────────────────────────────────────────────────────────

export function createSessionCookie(email: string): string {
    const payload: SessionPayload = {
        email,
        exp: Date.now() + SESSION_MAX_AGE * 1000,
    };
    const token = signToken(payload);
    return [
        `${SESSION_COOKIE}=${token}`,
        `Path=/`,
        `HttpOnly`,
        `SameSite=Lax`,
        `Max-Age=${SESSION_MAX_AGE}`,
        process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
        .filter(Boolean)
        .join("; ");
}

export function clearSessionCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionFromCookie(
    cookieHeader: string | null
): SessionPayload | null {
    if (!cookieHeader) return null;
    const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    if (!match) return null;
    const token = match.slice(SESSION_COOKIE.length + 1);
    return verifyToken(token);
}

export { SESSION_COOKIE };
