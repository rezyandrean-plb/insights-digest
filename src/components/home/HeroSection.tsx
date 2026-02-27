"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/data";

interface HeroSectionProps {
    article: Article;
}

export default function HeroSection({ article }: HeroSectionProps) {
    return (
        <section className="py-8 sm:py-10 lg:py-14 bg-[#195F60]">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    {/* Left: Text content */}
                    <motion.div
                        className="w-full lg:w-1/2 flex flex-col justify-center"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold text-white leading-[1.1] tracking-tight">
                            {article.title}
                        </h1>

                        <p className="text-sm sm:text-base text-white/90 mt-5 leading-relaxed max-w-md">
                            {article.excerpt}
                        </p>

                        <Link
                            href={`/article/${article.slug}`}
                            className="inline-flex items-center gap-2 mt-6 text-white font-medium text-sm hover:text-white/90 transition-colors group"
                        >
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Meta line with pipe separators */}
                        <div className="flex items-center gap-0 mt-6 text-xs sm:text-sm text-white/60 flex-wrap">
                            <span>Singapore&apos;s Coastal Property Frontier</span>
                            <span className="mx-2 sm:mx-3">|</span>
                            <span>{article.date}</span>
                        </div>
                    </motion.div>

                    {/* Right: Image */}
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Small watermark badge */}
                            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded flex items-center">
                                <img
                                    src="/images/insights-logo.webp"
                                    alt="Insights Digest"
                                    className="h-5 w-auto"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
