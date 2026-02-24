"use client";

import Link from "next/link";
import type { Article } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

interface LatestPostsProps {
    articles: Article[];
}

export default function LatestPosts({ articles }: LatestPostsProps) {
    return (
        <section className="pb-10 sm:pb-14 lg:pb-16 bg-[#CBEAED]">
            <div className="container-custom">
                {/* Divider */}
                <div className="border-t border-black mb-8" />

                <ScrollReveal>
                    <h2 className="text-lg sm:text-xl font-bold text-secondary mb-6">
                        Latest Post
                    </h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {articles.map((article, i) => (
                        <ScrollReveal key={article.id} delay={i * 0.1}>
                            <Link href={`/article/${article.slug}`} className="group block">
                                {/* Author & date */}
                                <div className="flex items-center text-xs text-secondary/50 mb-2">
                                    <span>{article.author}</span>
                                    <span className="mx-2">|</span>
                                    <span>{article.date}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-semibold text-secondary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

                                {/* Category & read time */}
                                <div className="flex items-center text-xs text-secondary/40 mt-2">
                                    <span>{article.category}</span>
                                    <span className="mx-2">|</span>
                                    <span>{article.readTime}</span>
                                </div>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
