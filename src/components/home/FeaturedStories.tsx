"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Article } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

interface FeaturedStoriesProps {
    articles: Article[];
}

const filters = ["Most Viewed", "Latest", "Editor's Pick"] as const;
const CARDS_PER_PAGE = 3;

export default function FeaturedStories({ articles }: FeaturedStoriesProps) {
    const [activeFilter, setActiveFilter] = useState<string>("Most Viewed");
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(articles.length / CARDS_PER_PAGE);

    const slide = useCallback(
        (direction: "left" | "right") => {
            setPage((prev) => {
                if (direction === "right") return Math.min(prev + 1, totalPages - 1);
                return Math.max(prev - 1, 0);
            });
        },
        [totalPages]
    );

    const visibleArticles = articles.slice(
        page * CARDS_PER_PAGE,
        page * CARDS_PER_PAGE + CARDS_PER_PAGE
    );

    const isFirst = page === 0;
    const isLast = page >= totalPages - 1;

    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-secondary">
                            Featured Stories
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* Filter tabs */}
                            <div className="hidden sm:flex items-center gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => {
                                            setActiveFilter(filter);
                                            setPage(0);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                                            activeFilter === filter
                                                ? "bg-primary text-white"
                                                : "border border-secondary/30 text-secondary/70 hover:border-secondary/60"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Arrow buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => slide("left")}
                                    disabled={isFirst}
                                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                                        isFirst
                                            ? "border-secondary/15 text-secondary/25 cursor-not-allowed"
                                            : "border-secondary/30 text-secondary/70 hover:bg-primary/10"
                                    }`}
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => slide("right")}
                                    disabled={isLast}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                                        isLast
                                            ? "bg-primary/40 text-white/60 cursor-not-allowed"
                                            : "bg-primary text-white hover:bg-primary/90"
                                    }`}
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Carousel */}
                <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                        >
                            {visibleArticles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-secondary/60 mt-2 leading-relaxed line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center text-xs text-secondary/50 mt-3">
                                        <span>{article.category}</span>
                                        <span className="mx-2">|</span>
                                        <span>{article.readTime}</span>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
