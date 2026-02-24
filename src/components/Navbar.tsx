"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

const navLinks = [
    { href: "#", label: "Buy", hasDropdown: true },
    { href: "#", label: "Sell", hasDropdown: true },
    { href: "/all-articles", label: "PLB Hub", hasDropdown: true },
    { href: "/all-new-launch-series", label: "Tools", hasDropdown: true },
    { href: "/about", label: "About", hasDropdown: true },
    { href: "/all-reels", label: "PropTech", hasDropdown: true },
    { href: "/all-home-tour-series", label: "Webinars", hasDropdown: false },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-[#CBEAED]">
            {/* Top section — centered logo */}
            <div className="container-custom flex items-center justify-center py-2">
                <Link href="/" className="inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/insights-logo.png"
                        alt="Insights"
                        className="h-16 sm:h-18 w-auto block"
                    />
                </Link>

                {/* Mobile menu button — absolute right */}
                <button
                    className="lg:hidden absolute right-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="w-6 h-6 text-secondary" />
                    ) : (
                        <Menu className="w-6 h-6 text-secondary" />
                    )}
                </button>
            </div>

            {/* Desktop Nav — centered links below logo */}
            <nav className="hidden lg:flex items-center justify-center gap-1 pb-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium transition-colors duration-200 hover:text-primary rounded-md ${pathname === link.href
                                ? "text-primary"
                                : "text-secondary/80"
                            }`}
                    >
                        {link.label}
                        {link.hasDropdown && (
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="lg:hidden overflow-hidden bg-[#CBEAED] border-t border-primary/10"
                    >
                        <nav className="container-custom py-4 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center justify-between text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ${pathname === link.href
                                            ? "text-primary bg-primary/5"
                                            : "text-secondary/80 hover:bg-primary/5"
                                        }`}
                                >
                                    <span>{link.label}</span>
                                    {link.hasDropdown && (
                                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
