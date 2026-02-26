"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import type { Article, Reel, NewLaunchItem, WebinarItem } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

interface LatestNewsProps {
    article: Article;
    reels: Reel[];
    newLaunchItems: NewLaunchItem[];
    webinarItems: WebinarItem[];
}

function VideoColumn({
    title,
    seeAllHref,
    featured,
    smallItems,
}: {
    title: string;
    seeAllHref: string;
    featured: { thumbnail: string; title: string; slug: string };
    smallItems: { id: string; thumbnail: string; title: string; slug: string }[];
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-primary font-[var(--font-poppins)]">
                    {title}
                </h3>
                <Link
                    href={seeAllHref}
                    className="text-xs sm:text-sm text-secondary/50 hover:text-primary transition-colors"
                >
                    see all &gt;
                </Link>
            </div>

            <Link href="#" className="group block">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                        src={featured.thumbnail}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                </div>
                <p className="text-sm text-secondary font-medium text-center mt-4 leading-snug line-clamp-2 h-[2.625rem] group-hover:text-primary transition-colors">
                    {featured.title}
                </p>
            </Link>

            <div className="mt-4">
                {smallItems.map((item) => (
                    <Link
                        key={item.id}
                        href="#"
                        className="flex items-center gap-3 py-4 border-t border-secondary/15 group/thumb"
                    >
                        <div className="w-[72px] h-[50px] sm:w-20 sm:h-14 rounded-md overflow-hidden shrink-0">
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-black leading-snug line-clamp-2 group-hover/thumb:text-primary transition-colors">
                            {item.title}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function LatestNews({ article, reels, newLaunchItems, webinarItems }: LatestNewsProps) {
    const featuredReel = reels[0];
    const smallReels = reels.slice(1, 4);

    const featuredLaunch = newLaunchItems[0];
    const smallLaunches = newLaunchItems.slice(1, 4);

    const featuredWebinar = webinarItems[0];
    const smallWebinars = webinarItems.slice(1, 4);

    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                {/* Section title */}
                <ScrollReveal>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary mb-8">
                        Latest News
                    </h2>
                </ScrollReveal>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    {/* Image */}
                    <ScrollReveal className="w-full lg:w-1/2" direction="left">
                        <Link href={`/article/${article.slug}`}>
                            <motion.div
                                className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </motion.div>
                        </Link>
                    </ScrollReveal>

                    {/* Content */}
                    <ScrollReveal className="w-full lg:w-1/2" direction="right">
                        <h3 className="text-[42px] font-bold text-secondary leading-[125%] font-[var(--font-poppins)]">
                            {article.title}
                        </h3>
                        <p className="text-sm sm:text-base text-black mt-5 leading-relaxed">
                            {article.excerpt}
                        </p>

                        <Link
                            href={`/article/${article.slug}`}
                            className="inline-flex items-center gap-2 mt-6 text-primary font-medium text-sm hover:text-primary transition-colors group"
                        >
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Meta: category | read time */}
                        <div className="flex items-center flex-wrap gap-0 mt-6 text-xs sm:text-sm">
                            <span className="text-primary font-medium">Singapore Real Estate</span>
                            <span className="mx-2 text-black/60">|</span>
                            <span className="text-black">{article.readTime}</span>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Reels / New Launch Series / Webinars */}
                <ScrollReveal>
                    <div className="mt-12 sm:mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                            <VideoColumn
                                title="Reels"
                                seeAllHref="/all-reels"
                                featured={{
                                    thumbnail: featuredReel.thumbnail,
                                    title: featuredReel.title,
                                    slug: featuredReel.slug,
                                }}
                                smallItems={smallReels.map((r) => ({
                                    id: r.id,
                                    thumbnail: r.thumbnail,
                                    title: r.title,
                                    slug: r.slug,
                                }))}
                            />

                            <VideoColumn
                                title="New Launch Series"
                                seeAllHref="/all-new-launch-series"
                                featured={{
                                    thumbnail: featuredLaunch.image,
                                    title: featuredLaunch.title,
                                    slug: featuredLaunch.slug,
                                }}
                                smallItems={smallLaunches.map((l) => ({
                                    id: l.id,
                                    thumbnail: l.image,
                                    title: l.title,
                                    slug: l.slug,
                                }))}
                            />

                            <VideoColumn
                                title="Webinars"
                                seeAllHref="#"
                                featured={{
                                    thumbnail: featuredWebinar.thumbnail,
                                    title: featuredWebinar.title,
                                    slug: featuredWebinar.slug,
                                }}
                                smallItems={smallWebinars.map((w) => ({
                                    id: w.id,
                                    thumbnail: w.thumbnail,
                                    title: w.title,
                                    slug: w.slug,
                                }))}
                            />
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
