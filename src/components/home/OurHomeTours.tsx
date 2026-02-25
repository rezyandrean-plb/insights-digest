"use client";

import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import type { HomeTourItem } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

interface OurHomeToursProps {
    items: HomeTourItem[];
    title?: string;
}

const sideItemTitles = [
    "Springside View - Freehold 6-Bedroom Inter-Terrace in District 26 | $4,690,000 | Yu Rong",
    "Riverfront Residences - 3-Bedroom with 1,066sqft in D19 | 99-Year Leasehold| $2,180,000 | Cheryl Loh",
    "Parc Emily - Freehold 1-Bedroom with 549sqft in District 9 | $1,200,000 | Eunice Lam",
];

const sideItemImages = [
    "/images/homepage/our-hometours-1.webp",
    "/images/homepage/our-hometours-2.webp",
    "/images/homepage/our-hometours-3.webp",
];

export default function OurHomeTours({ items, title = "Our Home Tours" }: OurHomeToursProps) {
    const featured = items[0];
    const sideItems = items.slice(1, 4);

    return (
        <section className="bg-secondary py-12 sm:py-16 lg:py-20">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl font-medium text-white font-[var(--font-poppins)]">
                            {title}
                        </h2>
                        <Link
                            href="/all-home-tour-series"
                            className="text-xs sm:text-sm text-white/50 hover:text-primary transition-colors"
                        >
                            see all &gt;
                        </Link>
                    </div>
                </ScrollReveal>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                    {/* Left: featured large video */}
                    <ScrollReveal className="w-full lg:w-1/2" direction="left">
                        <Link href={`#`} className="group block">
                            <div className="relative rounded-xl overflow-hidden">
                                <img
                                    src="/images/homepage/our-hometours-3.webp"
                                    alt={featured.title}
                                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                        <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <h3 className="text-[28px] font-medium text-white leading-[125%] mt-5 font-[var(--font-poppins)]">
                            Treasure at Tampines - Top Floor 2-Bedroom with 614sqft in District 18 | $1,250,000 | George Peng
                        </h3>
                        <p className="text-[14px] font-normal text-white/60 leading-[150%] mt-3 font-[var(--font-poppins)]">
                            The latest residential project in Singapore has successfully passed all regulatory checks, setting the stage for The latest residential project in Singapore has successfully The latest residential project in Singapore has successfully passed all regulatory
                        </p>
                        <Link
                            href={`#`}
                            className="inline-flex items-center gap-2 mt-4 text-white/80 font-medium text-sm hover:text-primary transition-colors group/link"
                        >
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </ScrollReveal>

                    {/* Right: 3 stacked items */}
                    <ScrollReveal className="w-full lg:w-1/2 flex flex-col gap-6 sm:gap-7" direction="right">
                        {sideItems.map((item, index) => (
                            <div key={item.id} className="flex gap-4 sm:gap-5">
                                <Link
                                    href={`#`}
                                    className="w-[45%] shrink-0 group block"
                                >
                                    <div className="relative rounded-lg overflow-hidden">
                                        <img
                                            src={sideItemImages[index]}
                                            alt={sideItemTitles[index] ?? item.title}
                                            className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <h4 className="text-[20px] font-medium text-white leading-[100%] line-clamp-3 font-[var(--font-poppins)]">
                                        {sideItemTitles[index] ?? item.title}
                                    </h4>
                                    <Link
                                        href={`#`}
                                        className="inline-flex items-center gap-2 mt-3 text-white/60 font-medium text-xs sm:text-sm hover:text-primary transition-colors group/link"
                                    >
                                        Read More
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}
