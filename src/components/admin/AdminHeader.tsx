"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    Globe,
    FileText,
    Film,
    Rocket,
    Home,
    Settings,
    SlidersHorizontal,
    Menu,
    X,
    ExternalLink,
    CircleUser,
    LogOut,
    ChevronDown,
} from "lucide-react";

const adminNav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText, exact: false },
    { href: "/admin/reels", label: "Reels", icon: Film, exact: false },
    { href: "/admin/new-launches", label: "New Launches", icon: Rocket, exact: false },
    { href: "/admin/home-tours", label: "Home Tours", icon: Home, exact: false },
];

const manageItems = [
    { href: "/admin/homepage", label: "Homepage", icon: Globe, description: "Manage homepage content & sections" },
    { href: "/admin/settings", label: "Settings", icon: Settings, description: "Site settings & configuration" },
];

export default function AdminHeader({ email }: { email: string }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const manageMenuRef = useRef<HTMLDivElement>(null);

    const isActive = (href: string, exact: boolean) => {
        if (href === "#") return false;
        return exact ? pathname === href : pathname.startsWith(href);
    };

    const isManageActive = manageItems.some((item) => pathname.startsWith(item.href));

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
            if (manageMenuRef.current && !manageMenuRef.current.contains(e.target as Node)) {
                setManageOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-50 bg-secondary border-b border-white/10">
            <div className="container-custom flex items-center justify-between h-14">
                {/* Logo / Brand */}
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-sm font-semibold text-white leading-none">
                                Insights
                            </span>
                            <span className="text-[10px] text-white/50 block leading-tight">
                                Admin Panel
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-0.5">
                        {/* Dashboard */}
                        {adminNav.slice(0, 1).map((link) => {
                            const active = isActive(link.href, link.exact);
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-white/15 text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/8"
                                    }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Manage dropdown */}
                        <div className="relative" ref={manageMenuRef}>
                            <button
                                onClick={() => setManageOpen((v) => !v)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    isManageActive
                                        ? "bg-white/15 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/8"
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Manage
                                <ChevronDown
                                    className={`w-3 h-3 transition-transform duration-150 ${
                                        manageOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            <AnimatePresence>
                                {manageOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute left-0 mt-1.5 w-56 bg-white rounded-xl border border-border/60 shadow-lg overflow-hidden z-50"
                                    >
                                        <div className="p-1">
                                            {manageItems.map((item) => {
                                                const active = pathname.startsWith(item.href);
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setManageOpen(false)}
                                                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                            active
                                                                ? "bg-primary/8 text-primary"
                                                                : "text-foreground hover:bg-section-bg"
                                                        }`}
                                                    >
                                                        <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? "text-primary" : "text-muted"}`} />
                                                        <div>
                                                            <p className="text-sm font-medium leading-none mb-0.5">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-xs text-muted leading-snug">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Remaining nav items */}
                        {adminNav.slice(1).map((link) => {
                            const active = isActive(link.href, link.exact);
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-white/15 text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/8"
                                    }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                    >
                        View Site
                        <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen((v) => !v)}
                            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <CircleUser className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-medium max-w-[140px] truncate">
                                {email}
                            </span>
                            <ChevronDown
                                className={`w-3 h-3 transition-transform duration-150 ${
                                    userMenuOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl border border-border/60 shadow-lg overflow-hidden z-50"
                                >
                                    {/* Account info */}
                                    <div className="px-3.5 py-3 border-b border-border/50">
                                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-0.5">
                                            Signed in as
                                        </p>
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {email}
                                        </p>
                                    </div>

                                    {/* Logout */}
                                    <div className="p-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Sign out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="lg:hidden overflow-hidden border-t border-white/10"
                    >
                        <nav className="container-custom py-3 flex flex-col gap-0.5">
                            {/* Dashboard */}
                            {adminNav.slice(0, 1).map((link) => {
                                const active = isActive(link.href, link.exact);
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                                            active
                                                ? "bg-white/15 text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/8"
                                        }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            {/* Manage group */}
                            <div className="mt-1 pt-2 border-t border-white/10">
                                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-1">
                                    Manage
                                </p>
                                {manageItems.map((item) => {
                                    const active = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                                                active
                                                    ? "bg-white/15 text-white"
                                                    : "text-white/60 hover:text-white hover:bg-white/8"
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Remaining nav items */}
                            {adminNav.slice(1).map((link) => {
                                const active = isActive(link.href, link.exact);
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                                            active
                                                ? "bg-white/15 text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/8"
                                        }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <Link
                                href="/"
                                target="_blank"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg text-white/40 hover:text-white/70 transition-colors mt-1 border-t border-white/10 pt-3"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Public Site
                            </Link>

                            {/* Mobile logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
