import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookieHeader } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isLoginPage = pathname === "/admin/login";
    const cookieHeader = req.headers.get("cookie");
    const session = await getSessionFromCookieHeader(cookieHeader);

    if (isLoginPage) {
        if (session) {
            return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
