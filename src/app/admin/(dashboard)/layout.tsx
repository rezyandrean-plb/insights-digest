import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";
import { getSessionFromCookie } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Admin — Insights",
    description: "Insights admin panel for managing content, users, and settings.",
};

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
    const session = getSessionFromCookie(cookieHeader);
    const email = session?.email ?? "";

    return (
        <>
            <AdminHeader email={email} />
            <main className="min-h-[calc(100vh-56px-57px)]">{children}</main>
            <AdminFooter />
            <Toaster position="bottom-right" richColors closeButton />
        </>
    );
}
