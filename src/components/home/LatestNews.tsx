"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { Reel } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

interface LatestNewsProps {
    reels: Reel[];
}

function ReelCard({ reel }: { reel: Reel }) {
    return (
        <Link
            href={`/reel/${reel.slug}`}
            className="group block rounded-2xl overflow-hidden border border-secondary/15 bg-white shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {reel.thumbnail ? (
                    <img
                        src={reel.thumbnail}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary/10" aria-hidden />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-5">
                <p className="text-sm sm:text-base text-secondary font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {reel.title}
                </p>
            </div>
        </Link>
    );
}

export default function LatestNews({ reels }: LatestNewsProps) {
    const displayReels = reels.slice(0, 3);

    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary">
                            Reels
                        </h2>
                        <Link
                            href="/reels"
                            className="text-xs sm:text-sm text-secondary/50 hover:text-primary transition-colors"
                        >
                            see all &gt;
                        </Link>
                    </div>
                </ScrollReveal>

                <ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                        {displayReels.map((reel) => (
                            <ReelCard key={reel.id} reel={reel} />
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
