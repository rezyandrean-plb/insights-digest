"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Article } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

const filterTabs = ["Market Analysis", "Real Estate News", "Guides"] as const;
type FeaturedFilter = (typeof filterTabs)[number];

interface FeaturedArticlesProps {
    articles: Article[];
}

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
    const [activeFilter, setActiveFilter] = useState<FeaturedFilter>("Market Analysis");

    const filteredArticles = useMemo(() => {
        return articles
            .filter((a) => a.category === activeFilter)
            .slice(0, 6);
    }, [activeFilter, articles]);

    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl font-medium text-primary font-[var(--font-poppins)]">
                            Featured Articles
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFilter(tab)}
                                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                        activeFilter === tab
                                            ? "bg-[#195F60] text-white"
                                            : "border border-secondary/25 text-secondary/70 hover:border-[#195F60]/50 hover:text-secondary"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <Link
                                href="/all-articles"
                                className="text-xs sm:text-sm text-secondary/50 hover:text-primary transition-colors ml-2"
                            >
                                see all &gt;
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12"
                    >
                        {filteredArticles.map((article) => (
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
                                    <h3 className="text-base font-bold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors font-[var(--font-poppins)]">
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

                {filteredArticles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-secondary/50 text-lg">No articles found for this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
