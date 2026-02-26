"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/data";
import CategoryBadge from "./CategoryBadge";

interface ArticleCardProps {
    article: Article;
    variant?: "default" | "compact" | "horizontal";
    index?: number;
}

export default function ArticleCard({
    article,
    variant = "default",
    index = 0,
}: ArticleCardProps) {
    if (variant === "horizontal") {
        return (
            <Link href={`/article/${article.slug}`}>
                <motion.article
                    className="group flex gap-4 p-3 rounded-xl hover:bg-section-bg transition-colors duration-200"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <CategoryBadge category={article.category} size="sm" />
                        <h3 className="text-sm font-semibold text-foreground mt-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                            <span>{article.date}</span>
                            <span>·</span>
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                        </div>
                    </div>
                </motion.article>
            </Link>
        );
    }

    if (variant === "compact") {
        return (
            <Link href={`/article/${article.slug}`}>
                <motion.article
                    className="group shrink-0 w-64 sm:w-72"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                            <CategoryBadge category={article.category} />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
                        <span>{article.date}</span>
                    </div>
                </motion.article>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/article/${article.slug}`}>
            <motion.article
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
            >
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                        <CategoryBadge category={article.category} />
                    </div>
                </div>
                <div className="p-4 sm:p-5">
                    <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                    </h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                    </p>
                    <div className="flex items-center justify-end mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                        </div>
                    </div>
                </div>
            </motion.article>
        </Link>
    );
}
