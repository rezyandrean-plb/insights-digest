import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";

export const metadata: Metadata = {
    title: "Admin — Insights",
    description: "Insights admin panel for managing content, users, and settings.",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AdminHeader />
            <main className="min-h-[calc(100vh-56px-57px)]">{children}</main>
            <AdminFooter />
        </>
    );
}
