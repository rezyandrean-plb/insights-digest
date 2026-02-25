"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

type NavLink = {
    href: string;
    label: string;
    hasDropdown: boolean;
    submenu?: { href: string; label: string }[];
};

const navLinks: NavLink[] = [
    { href: "/market-analysis", label: "Market Analysis", hasDropdown: false },
    { href: "/real-estate-news", label: "Real Estate News", hasDropdown: false },
    { href: "/guides", label: "Guides", hasDropdown: false },
    { href: "/home-and-life", label: "Home & Life", hasDropdown: false },
    { href: "/project-reviews", label: "Project Reviews", hasDropdown: false },
    { href: "/home-radar", label: "Home Radar", hasDropdown: false },
    {
        href: "/all-reels",
        label: "Watch",
        hasDropdown: true,
        submenu: [
            { href: "/all-reels", label: "Reels" },
            { href: "/podcast", label: "Podcast" },
        ],
    },
    { href: "/contact", label: "Work With Us", hasDropdown: false },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [watchOpen, setWatchOpen] = useState(false);
    const pathname = usePathname();
    const watchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mobileOpen) setWatchOpen(false);
    }, [mobileOpen]);

    useEffect(() => {
        setWatchOpen(false);
    }, [pathname]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (watchRef.current && !watchRef.current.contains(e.target as Node)) {
                setWatchOpen(false);
            }
        }
        if (watchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [watchOpen]);

    const isWatchActive = pathname === "/all-reels" || pathname === "/podcast";

    return (
        <header className="sticky top-0 z-50 bg-[#195F60]">
            {/* Top section — centered logo */}
            <div className="container-custom flex items-center justify-center py-2">
                <Link href="/" className="inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/insight-logo-white.webp"
                        alt="Insights"
                        className="h-16 sm:h-18 w-auto block"
                    />
                </Link>

                {/* Mobile menu button — absolute right */}
                <button
                    className="lg:hidden absolute right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </button>
            </div>

            {/* Desktop Nav — centered links below logo */}
            <nav className="hidden lg:flex items-center justify-center gap-1 pb-4">
                {navLinks.map((link) =>
                    link.submenu && link.submenu.length > 0 ? (
                        <div
                            key={link.label}
                            ref={link.label === "Watch" ? watchRef : undefined}
                            className="relative group"
                        >
                            <button
                                type="button"
                                className={`inline-flex items-center gap-1 px-4 py-1.5 text-base font-semibold transition-colors duration-200 rounded-md ${isWatchActive ? "text-white" : "text-white/80 hover:text-white"}`}
                                onClick={() => setWatchOpen((o) => !o)}
                                aria-expanded={watchOpen}
                                aria-haspopup="true"
                            >
                                {link.label}
                                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${watchOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {watchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-1/2 top-full -translate-x-1/2 pt-1 z-50"
                                    >
                                        <div className="bg-white rounded-lg shadow-lg border border-border/50 py-1 min-w-[140px]">
                                            {link.submenu.map((item) => (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-base font-semibold text-secondary/80 hover:text-primary hover:bg-[#195F60]/5 first:rounded-t-lg last:rounded-b-lg"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`inline-flex items-center gap-1 px-4 py-1.5 text-base font-semibold transition-colors duration-200 rounded-md ${pathname === link.href ? "text-white" : "text-white/80 hover:text-white"}`}
                        >
                            {link.label}
                        </Link>
                    )
                )}
            </nav>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="lg:hidden overflow-hidden bg-[#195F60] border-t border-white/20"
                    >
                        <nav className="container-custom py-4 flex flex-col gap-1">
                            {navLinks.map((link) =>
                                link.submenu && link.submenu.length > 0 ? (
                                    <div key={link.label} className="flex flex-col gap-0.5">
                                        <span className="text-base font-semibold text-white/80 py-2.5 px-4">
                                            {link.label}
                                        </span>
                                        {link.submenu.map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`text-base font-semibold py-2 px-4 pl-6 rounded-lg transition-colors ${pathname === item.href
                                                        ? "text-white bg-white/10"
                                                        : "text-white/80 hover:bg-white/10"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between text-base font-semibold py-2.5 px-4 rounded-lg transition-colors ${pathname === link.href
                                                ? "text-white bg-white/10"
                                                : "text-white/80 hover:bg-white/10"
                                            }`}
                                    >
                                        <span>{link.label}</span>
                                    </Link>
                                )
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
