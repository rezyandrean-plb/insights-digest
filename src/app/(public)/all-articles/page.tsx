"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { articles, trendingTopics } from "@/lib/data";
import type { ArticleCategory } from "@/lib/data";

import ScrollReveal from "@/components/ScrollReveal";
import Newsletter from "@/components/Newsletter";

const filterTabs: { label: string; value: ArticleCategory | "All" }[] = [
    { label: "All", value: "All" },
    { label: "Market Analysis", value: "Market Analysis" },
    { label: "Real Estate News", value: "Real Estate News" },
    { label: "Guides", value: "Guides" },
    { label: "Home & Life", value: "Home & Life" },
    { label: "Project Reviews", value: "Project Reviews" },
    { label: "Home Radar", value: "Home Radar" },
];

const ARTICLES_PER_PAGE = 9;

export default function AllArticlesPage() {
    const [activeFilter, setActiveFilter] = useState<ArticleCategory | "All">("All");
    const [currentPage, setCurrentPage] = useState(1);
    const trendingScrollRef = useRef<HTMLDivElement>(null);
    const [activeDot, setActiveDot] = useState(0);

    const CARD_WIDTH = 220;
    const CARD_GAP = 16;
    const VISIBLE_CARDS = 5;
    const totalDots = Math.max(1, trendingTopics.length - VISIBLE_CARDS + 1);

    const heroArticle = articles[0];

    const filteredArticles = useMemo(() => {
        if (activeFilter === "All") return articles;
        return articles.filter((a) => a.category === activeFilter);
    }, [activeFilter]);

    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE,
        currentPage * ARTICLES_PER_PAGE
    );

    const handleFilterChange = (value: ArticleCategory | "All") => {
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

    const updateDotFromScroll = useCallback(() => {
        if (!trendingScrollRef.current) return;
        const scrollLeft = trendingScrollRef.current.scrollLeft;
        const step = CARD_WIDTH + CARD_GAP;
        const index = Math.round(scrollLeft / step);
        setActiveDot(Math.min(index, totalDots - 1));
    }, [totalDots]);

    useEffect(() => {
        const el = trendingScrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateDotFromScroll, { passive: true });
        return () => el.removeEventListener("scroll", updateDotFromScroll);
    }, [updateDotFromScroll]);

    const scrollTrending = (direction: "left" | "right") => {
        if (!trendingScrollRef.current) return;
        const step = CARD_WIDTH + CARD_GAP;
        trendingScrollRef.current.scrollBy({
            left: direction === "right" ? step : -step,
            behavior: "smooth",
        });
    };

    const scrollToTrendingDot = (dotIndex: number) => {
        if (!trendingScrollRef.current) return;
        const step = CARD_WIDTH + CARD_GAP;
        trendingScrollRef.current.scrollTo({
            left: dotIndex * step,
            behavior: "smooth",
        });
    };

    return (
        <>
            {/* Hero Banner */}
            <section className="relative">
                <div className="relative h-[360px] sm:h-[420px] lg:h-[480px] overflow-hidden">
                    <img
                        src={heroArticle.image}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
                    <div className="absolute inset-0 flex items-center">
                        <div className="container-custom">
                            <div className="max-w-xl">
                                <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                    LATEST NEWS
                                </span>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight font-[var(--font-poppins)]">
                                    {heroArticle.title}
                                </h1>
                                <p className="text-sm sm:text-base text-white/70 mt-3 leading-relaxed line-clamp-2">
                                    {heroArticle.excerpt}
                                </p>
                                <Link
                                    href={`/article/${heroArticle.slug}`}
                                    className="inline-flex items-center gap-2 mt-5 text-white font-medium text-sm hover:text-primary-light transition-colors group"
                                >
                                    Read More
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Topics */}
            <section className="py-10 sm:py-12 lg:py-14">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-secondary font-[var(--font-poppins)]">
                                Trending Topics
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollTrending("left")}
                                    className="w-8 h-8 rounded-full border border-secondary/20 flex items-center justify-center text-secondary/60 hover:bg-primary/10 transition-colors"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => scrollTrending("right")}
                                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div
                        ref={trendingScrollRef}
                        className="flex gap-4 overflow-x-auto featured-scroll pb-2 -mx-1 px-1"
                    >
                        {trendingTopics.map((topic) => (
                            <Link
                                key={topic.id}
                                href="#"
                                className="group shrink-0 w-[200px] sm:w-[220px]"
                            >
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                                        <img
                                            src={topic.image}
                                            alt={topic.label}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                        <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-snug">
                                            {topic.label}
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Dot indicators */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                        {Array.from({ length: totalDots }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToTrendingDot(i)}
                                className={`rounded-full transition-all duration-300 ${
                                    activeDot === i
                                        ? "w-6 h-2 bg-primary"
                                        : "w-2 h-2 bg-secondary/20 hover:bg-secondary/40"
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* All Articles */}
            <section className="pb-10 sm:pb-14 lg:pb-16">
                <div className="container-custom">
                    {/* Header row: title + filter tabs inline */}
                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-secondary font-[var(--font-poppins)] shrink-0">
                                All Articles
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleFilterChange(tab.value)}
                                        className={`px-3.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                            activeFilter === tab.value
                                                ? "bg-[#195F60] text-white"
                                                : "border border-secondary/20 text-secondary/70 hover:border-[#195F60]/50 hover:text-secondary"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Articles Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeFilter}-${currentPage}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12"
                        >
                            {paginatedArticles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    className="group block"
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-secondary/50 mt-1.5 leading-relaxed line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center text-xs text-secondary/50 mt-2.5">
                                            <span className="text-primary font-medium">{article.category}</span>
                                            <span className="mx-2 text-secondary/30">|</span>
                                            <span>{article.readTime}</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {paginatedArticles.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-secondary/50 text-lg">No articles found for this category.</p>
                        </div>
                    )}

                    {/* Pagination */}
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
                </div>
            </section>

            <Newsletter />
        </>
    );
}
