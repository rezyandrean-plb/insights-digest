"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { articles } from "@/lib/data";
import type { ArticleCategory } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import Newsletter from "@/components/Newsletter";

const ARTICLES_PER_PAGE = 9;

type CategoryArticlesPageProps = {
    category: ArticleCategory;
    title: string;
};

export default function CategoryArticlesPage({ category, title }: CategoryArticlesPageProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const filteredArticles = useMemo(
        () => articles.filter((a) => a.category === category),
        [category]
    );

    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE,
        currentPage * ARTICLES_PER_PAGE
    );

    const heroArticle = filteredArticles[0];

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
            {/* Hero Banner */}
            <section className="relative">
                <div className="relative h-[360px] sm:h-[420px] lg:h-[480px] overflow-hidden">
                    {heroArticle ? (
                        <>
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
                                            {title.toUpperCase()}
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
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="container-custom text-center">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-[var(--font-poppins)]">
                                        {title}
                                    </h1>
                                    <p className="text-white/80 mt-3 text-sm sm:text-base">
                                        Articles and insights in this category.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Articles */}
            <section className="py-10 sm:py-12 lg:py-16">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-secondary font-[var(--font-poppins)] shrink-0">
                                {title}
                            </h2>
                            <Link
                                href="/all-articles"
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group shrink-0"
                            >
                                Read All Articles
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </ScrollReveal>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
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

                    {paginatedArticles.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-secondary/50 text-lg">No articles found in this category yet.</p>
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
                </div>
            </section>

            <Newsletter />
        </>
    );
}
