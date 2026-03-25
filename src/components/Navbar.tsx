"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Search, Loader2 } from "lucide-react";

type SearchResult = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
};

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
        href: "/reels",
        label: "Watch & Listen",
        hasDropdown: true,
        submenu: [
            { href: "/reels", label: "Reels" },
            { href: "/podcast", label: "Podcast" },
        ],
    },
    { href: "/contact", label: "Work With Us", hasDropdown: false },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [watchOpen, setWatchOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const watchRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const closeSearch = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    }, []);

    useEffect(() => {
        if (!mobileOpen) setWatchOpen(false);
    }, [mobileOpen]);

    useEffect(() => {
        setWatchOpen(false);
        closeSearch();
    }, [pathname, closeSearch]);

    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [searchOpen]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (watchRef.current && !watchRef.current.contains(e.target as Node)) {
                setWatchOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                closeSearch();
            }
        }
        if (watchOpen || searchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [watchOpen, searchOpen, closeSearch]);

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") closeSearch();
        }
        if (searchOpen) {
            document.addEventListener("keydown", handleEsc);
            return () => document.removeEventListener("keydown", handleEsc);
        }
    }, [searchOpen, closeSearch]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/articles?q=${encodeURIComponent(value.trim())}`);
                if (!res.ok) throw new Error();
                const data: SearchResult[] = await res.json();
                setSearchResults(data.slice(0, 6));
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    const isWatchActive = pathname === "/reels" || pathname === "/podcast";

    const searchResultsDropdown = (
        <AnimatePresence>
            {searchQuery.trim() && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-[340px] max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-border/50 z-50"
                >
                    {searchLoading && searchResults.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-[#195F60]" />
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-500">No articles found</p>
                            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {searchResults.map((article) => (
                                <button
                                    key={article.id}
                                    onClick={() => {
                                        router.push(`/article/${article.slug}`);
                                        closeSearch();
                                    }}
                                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                >
                                    {article.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={article.image}
                                            alt=""
                                            className="w-14 h-10 rounded-lg object-cover shrink-0 mt-0.5"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                                            {article.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{article.category}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <header className="sticky top-0 z-50 bg-[#195F60]">
            {/* Top section — logo + search */}
            <div className="container-custom flex items-center justify-between py-2">
                {/* Left spacer — matches search bar width on desktop to keep logo centered */}
                <div className="hidden lg:block w-[260px]" />

                <Link href="/" className="inline-block shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/insight-logo-white.webp"
                        alt="Insights"
                        className="h-16 sm:h-18 w-auto block"
                    />
                </Link>

                <div className="flex items-center gap-2">
                    {/* Desktop: always-visible search bar */}
                    <div ref={searchRef} className="relative hidden lg:block">
                        <div className="flex items-center w-[260px] bg-white/15 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
                            <Search className="w-4 h-4 text-white/70 ml-3 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search articles…"
                                className="w-full bg-transparent text-white text-sm placeholder:text-white/50 px-2 py-2 outline-none"
                            />
                            {searchLoading && (
                                <Loader2 className="w-4 h-4 text-white/60 animate-spin mr-2 shrink-0" />
                            )}
                            {searchQuery && (
                                <button
                                    onClick={closeSearch}
                                    className="p-1.5 mr-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                                >
                                    <X className="w-3.5 h-3.5 text-white/70" />
                                </button>
                            )}
                        </div>
                        {searchResultsDropdown}
                    </div>

                    {/* Mobile: toggle search */}
                    <div ref={!searchOpen ? undefined : searchRef} className="relative lg:hidden">
                        <AnimatePresence>
                            {searchOpen ? (
                                <motion.div
                                    initial={{ width: 36, opacity: 0.5 }}
                                    animate={{ width: 260, opacity: 1 }}
                                    exit={{ width: 36, opacity: 0.5 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="flex items-center bg-white/15 backdrop-blur-sm rounded-full overflow-hidden border border-white/20"
                                >
                                    <Search className="w-4 h-4 text-white/70 ml-3 shrink-0" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Search articles…"
                                        className="w-full bg-transparent text-white text-sm placeholder:text-white/50 px-2 py-2 outline-none"
                                    />
                                    {searchLoading && (
                                        <Loader2 className="w-4 h-4 text-white/60 animate-spin mr-2 shrink-0" />
                                    )}
                                    <button
                                        onClick={closeSearch}
                                        className="p-1.5 mr-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5 text-white/70" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="Search articles"
                                >
                                    <Search className="w-5 h-5 text-white" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        {searchOpen && searchResultsDropdown}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
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
