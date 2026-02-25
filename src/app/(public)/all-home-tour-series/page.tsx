"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Search, ArrowRight, Loader2 } from "lucide-react";
import type { HomeTourCategory, HomeTourItem } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import Newsletter from "@/components/Newsletter";

const filterTabs: HomeTourCategory[] = ["Condo", "HDB", "Landed", "Apartment", "Commercial"];

const ITEMS_PER_PAGE = 12;

const DEFAULT_HERO: HomeTourItem = {
    id: "",
    slug: "",
    title: "Springdale View – Freehold 6-Bedroom Inter-Terrace in District 26",
    excerpt: "Explore this freehold inter-terrace in District 26 with 6 bedrooms and generous living spaces.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    category: "Condo",
    readTime: "5 mins read",
};

export default function AllHomeTourSeriesPage() {
    const [itemsList, setItemsList] = useState<HomeTourItem[]>([]);
    const [heroItem, setHeroItem] = useState<HomeTourItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<HomeTourCategory>("Condo");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const displayHero = heroItem ?? DEFAULT_HERO;

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/home-tours").then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            }),
            fetch("/api/home-tours/hero").then((res) => res.json()),
        ])
            .then(([listData, heroData]: [HomeTourItem[] | { error?: string }, HomeTourItem | null]) => {
                setItemsList(Array.isArray(listData) ? listData : []);
                setHeroItem(heroData && heroData.id ? heroData : null);
            })
            .catch(() => {
                setItemsList([]);
                setHeroItem(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredItems = useMemo(() => {
        let result: HomeTourItem[] = itemsList.filter((item) => item.category === activeFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((item) => item.title.toLowerCase().includes(q));
        }
        return result;
    }, [itemsList, activeFilter, searchQuery]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (value: HomeTourCategory) => {
        setActiveFilter(value);
        setCurrentPage(1);
    };

    const pageNumbers = useMemo(() => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <>
            {/* Hero Banner + Featured Video */}
            <section className="relative overflow-hidden bg-white">
                <div className="absolute inset-x-0 top-0 h-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"
                        alt="Home Tour Series"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#000000C7]" />
                </div>
                <div className="relative container-custom py-12 sm:py-16 lg:py-20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[var(--font-poppins)]">
                            Home Tour Series
                        </h1>
                        <p className="text-sm sm:text-base text-white/70 mt-4 max-w-2xl mx-auto leading-relaxed">
                            Join us as we explore the latest and most exciting launches in the
                            Singapore market. We&apos;ll take a closer look at some standout
                            condominium projects and uncover the hottest finds in the area.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer">
                            <img
                                src={displayHero.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"}
                                alt={displayHero.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded">
                                    {displayHero.category}
                                </span>
                                <p className="text-white text-xs mt-1.5 drop-shadow-lg">
                                    {displayHero.readTime}
                                </p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                                </div>
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary/90 text-white text-sm font-bold px-3 py-1.5 rounded line-clamp-1 max-w-[200px] sm:max-w-none">
                                    {displayHero.title}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto mt-6 text-center">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary leading-snug font-[var(--font-poppins)]">
                            {displayHero.title}
                        </h2>
                        <p className="text-sm text-secondary/50 mt-3 max-w-xl mx-auto leading-relaxed">
                            {displayHero.excerpt}
                        </p>
                        <Link
                            href={displayHero.slug ? `/all-home-tour-series#${displayHero.slug}` : "/all-home-tour-series"}
                            className="inline-flex items-center gap-2 mt-4 text-primary font-medium text-sm hover:text-primary-dark transition-colors group"
                        >
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* All Home Tour Series Grid */}
            <section className="py-10 sm:py-14 lg:py-16">
                <div className="container-custom">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#195F60]" />
                            <p className="text-secondary/70 text-sm">Loading home tours...</p>
                        </div>
                    )}
                    {!loading && (
                    <>
                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-primary font-[var(--font-poppins)] shrink-0">
                                All Home Tour Series
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleFilterChange(tab)}
                                        className={`px-3.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                            activeFilter === tab
                                                ? "bg-[#195F60] text-white"
                                                : "border border-secondary/20 text-secondary/70 hover:border-[#195F60]/50 hover:text-secondary"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                                <div className="relative ml-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/40" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-8 pr-3 py-1 rounded-lg border border-secondary/20 text-xs sm:text-sm text-secondary bg-transparent placeholder:text-secondary/40 outline-none focus:border-[#195F60]/50 w-28 sm:w-36 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeFilter}-${currentPage}-${searchQuery}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12"
                        >
                            {paginatedItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.slug ? `/article/${item.slug}` : "#"}
                                    className="group block"
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-secondary/50 mt-1.5 leading-relaxed line-clamp-2">
                                            {item.excerpt}
                                        </p>
                                        <div className="flex items-center text-xs text-secondary/50 mt-2.5">
                                            <span className="text-primary font-medium">{item.category}</span>
                                            <span className="mx-2 text-secondary/30">|</span>
                                            <span>{item.readTime}</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {paginatedItems.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-secondary/50 text-lg">No items found.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-14">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                                    currentPage === 1
                                        ? "border-secondary/15 text-secondary/25 cursor-not-allowed"
                                        : "border-secondary/30 text-secondary/70 hover:bg-[#195F60]/10"
                                }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {pageNumbers.map((page, idx) =>
                                page === "..." ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="w-9 h-9 flex items-center justify-center text-sm text-secondary/40"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? "bg-[#195F60] text-white"
                                                : "border border-secondary/20 text-secondary/70 hover:border-[#195F60]/50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                    currentPage === totalPages
                                        ? "bg-[#195F60]/40 text-white/60 cursor-not-allowed"
                                        : "bg-[#195F60] text-white hover:bg-[#195F60]/90"
                                }`}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    </>
                    )}
                </div>
            </section>

            <Newsletter />
        </>
    );
}
