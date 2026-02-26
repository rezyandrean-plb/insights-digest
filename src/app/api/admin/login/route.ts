import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 }
            );
        }

        const [user] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.email, email.toLowerCase().trim()))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials." },
                { status: 401 }
            );
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid credentials." },
                { status: 401 }
            );
        }

        const res = NextResponse.json({ ok: true });
        res.headers.set("Set-Cookie", createSessionCookie(user.email));
        return res;
    } catch (err) {
        console.error("[admin/login]", err);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}
