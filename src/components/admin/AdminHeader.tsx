"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    Film,
    Rocket,
    Home,
    Settings,
    Menu,
    X,
    ExternalLink,
    Bell,
    CircleUser,
} from "lucide-react";

const adminNav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText, exact: false },
    { href: "/admin/reels", label: "Reels", icon: Film, exact: false },
    { href: "/admin/new-launches", label: "New Launches", icon: Rocket, exact: false },
    { href: "/admin/home-tours", label: "Home Tours", icon: Home, exact: false },
    { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export default function AdminHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (href === "#") return false;
        return exact ? pathname === href : pathname.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-50 bg-secondary border-b border-white/10">
            <div className="container-custom flex items-center justify-between h-14">
                {/* Logo / Brand */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2.5 shrink-0"
                    >
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
                        {adminNav.map((link) => {
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

                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
                    </button>

                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                        <CircleUser className="w-4 h-4" />
                    </button>

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
                            {adminNav.map((link) => {
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
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
