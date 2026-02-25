"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomepagePodcast, HomepageNugget } from "@/lib/homepage-config";

const defaultPodcastData: HomepagePodcast = {
    label: "Latest Podcast",
    title: "Who Really Controls Property Valuations? And How to Spot Undervalued Units Today | NOTG S3 Ep 121",
    description:
        "Property valuations—who decides? In this episode of NOTG, Alfred, Jesley, and Yu Rong from PropertyLimBrothers break down the real story behind property valuations—and why they often don't match what you see on paper. They talk about how valuations are formed, what influences them, and when it makes sense to challenge the numbers.",
    thumbnail: "/images/homepage/our-podcasts.webp",
    slug: "notg-s3-ep121-property-valuations",
};

const nuggets = [
    {
        id: "1",
        title: "Resale vs. New Launch: Navigating the 2025–2028 Shift | NOTG S4 Ep31...",
        description: "Exploring the life of a digital nomad and the places they visit.",
        avatar: "/images/homepage/george-peng.webp",
        slug: "resale-vs-new-launch-notg-s4-ep31",
    },
    {
        id: "2",
        title: "From Budgeting to Design: Expert Advice on Building Your Dream Home | NOTG S4 Ep 29...",
        description: "Discover the culinary delights and fascinating tales from various cultures.",
        avatar: "/images/homepage/ong-yurong.webp",
        slug: "budgeting-to-design-notg-s4-ep29",
    },
    {
        id: "3",
        title: "The 3-Investor Strategy Behind High-Yield Property Returns | NOTG S4 Ep22...",
        description: "Savor the flavors and stories from different corners of the globe.",
        avatar: "/images/homepage/ong-yurong.webp",
        slug: "3-investor-strategy-notg-s4-ep22",
    },
    {
        id: "4",
        title: "Freehold Underdogs and Exit Quantum: What Investors Miss | NOTG S4 Ep28...",
        description: "Dive into the adventures of a digital nomad and the incredible destinations the...",
        avatar: "/images/homepage/george-peng.webp",
        slug: "freehold-underdogs-notg-s4-ep28",
    },
    {
        id: "5",
        title: "What Does It Take to Grow From HDB to $6.5M in Value? | NOTG S4 Ep21...",
        description: "Uncover the journey of a digital nomad and the amazing places they experien...",
        avatar: "/images/homepage/george-peng.webp",
        slug: "hdb-to-6-5m-notg-s4-ep21",
    },
    {
        id: "6",
        title: "The 6 Steps to Making Smart Property Investments | NOTG S4 Ep25...",
        description: "Taste the world through captivating recipes and food narratives.",
        avatar: "/images/homepage/ong-yurong.webp",
        slug: "6-steps-smart-property-notg-s4-ep25",
    },
];

interface OurPodcastProps {
    title?: string;
    podcast?: HomepagePodcast;
    nuggetsTitle?: string;
    nuggets?: HomepageNugget[];
}

export default function OurPodcast({ title, podcast: podcastProp, nuggetsTitle: nuggetsTitleProp, nuggets: nuggetsProp }: OurPodcastProps) {
    const podcastData = podcastProp ?? defaultPodcastData;
    const sectionLabel = title ?? podcastData.label;
    const nuggetsTitle = nuggetsTitleProp ?? "Nuggets On The Go";
    const nuggetsList = nuggetsProp && nuggetsProp.length > 0 ? nuggetsProp : nuggets;
    return (
        <section className="py-0">
            <ScrollReveal>
                <div className="flex flex-col-reverse lg:flex-row min-h-[280px] sm:min-h-[320px] overflow-hidden">
                    {/* Left: dark teal content area */}
                    <div className="flex-1 bg-[#195F60] flex flex-col sm:flex-row gap-0 py-8 sm:py-10">
                        <div className="sm:w-[35%] flex flex-col justify-center ml-0 pl-6 pr-6 sm:ml-6 sm:pl-8 sm:pr-8 lg:ml-[calc((100vw-1280px)/2+2rem)] border-l border-r border-white/15">
                            <span className="text-primary text-xs sm:text-sm font-medium tracking-wide">
                                {sectionLabel}
                            </span>
                            <h3 className="text-[20px] font-medium text-white leading-[125%] mt-3 font-[var(--font-poppins)] max-w-none sm:max-w-[220px]">
                                {podcastData.title}
                            </h3>
                        </div>
                        <div className="sm:w-[65%] flex flex-col justify-center px-6 sm:px-8 lg:px-10 mt-6 sm:mt-0 border-r border-white/15">
                            <p className="text-[14px] font-normal text-white/90 leading-[22px] font-[var(--font-poppins)] max-w-none sm:max-w-[280px]">
                                {podcastData.description}
                            </p>
                        </div>
                    </div>

                    {/* Right: video thumbnail */}
                    <Link
                        href={`#`}
                        className="lg:w-[40%] shrink-0 relative group block"
                    >
                        <img
                            src={podcastData.thumbnail}
                            alt={podcastData.title}
                            className="w-full h-full object-cover min-h-[220px] sm:min-h-[280px] lg:min-h-0 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
                            </div>
                        </div>
                    </Link>
                </div>
            </ScrollReveal>

            {/* Nuggets On The Go */}
            <div className="container-custom py-10 sm:py-14 lg:py-16">
                <ScrollReveal>
                    <div className="border-t border-primary/30 pt-8 sm:pt-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl sm:text-2xl font-medium text-secondary font-[var(--font-poppins)]">
                                {nuggetsTitle}
                            </h3>
                            <Link
                                href="#"
                                className="text-xs sm:text-sm text-black hover:text-primary transition-colors"
                            >
                                see all &gt;
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-6 sm:gap-y-8">
                            {nuggetsList.map((item) => (
                                <Link
                                    key={item.id}
                                    href="#"
                                    className="block group"
                                >
                                    <h4 className="text-sm sm:text-[15px] font-bold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-black mt-1.5 leading-relaxed line-clamp-1">
                                        {item.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
