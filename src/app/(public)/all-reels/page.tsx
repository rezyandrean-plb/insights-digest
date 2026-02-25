"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Search, Loader2 } from "lucide-react";
import type { Reel } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import Newsletter from "@/components/Newsletter";

const filterTabs = ["Most Viewed", "Latest", "Editor's Pick"] as const;
type ReelFilter = (typeof filterTabs)[number];

const REELS_PER_PAGE = 12;

function getVideoEmbedUrl(url: string): string | null {
    const u = url.trim();
    const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
}

function isDirectVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("video/mp4");
}

export default function AllReelsPage() {
    const [reelsList, setReelsList] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<ReelFilter>("Most Viewed");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch("/api/reels")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch reels");
                return res.json();
            })
            .then((data: Reel[] | { error?: string }) => {
                if (Array.isArray(data)) {
                    setReelsList(data);
                } else {
                    setReelsList([]);
                }
            })
            .catch(() => setReelsList([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredReels = useMemo(() => {
        let result: Reel[] = reelsList.filter((r) => r.category === activeFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((r) => r.title.toLowerCase().includes(q));
        }
        return result;
    }, [reelsList, activeFilter, searchQuery]);

    const totalPages = Math.ceil(filteredReels.length / REELS_PER_PAGE);
    const paginatedReels = filteredReels.slice(
        (currentPage - 1) * REELS_PER_PAGE,
        currentPage * REELS_PER_PAGE
    );

    const handleFilterChange = (value: ReelFilter) => {
        setActiveFilter(value);
        setCurrentPage(1);
    };

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
            <section className="relative bg-[#195F60] overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1400&q=80"
                        alt="Reels Series"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#000000C7]" />
                </div>
                <div className="relative container-custom py-16 sm:py-20 lg:py-24 text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[var(--font-poppins)]">
                        Reels Series
                    </h1>
                    <p className="text-sm sm:text-base text-white/70 mt-4 max-w-2xl mx-auto leading-relaxed">
                        Read us go through some of the hottest new launches in the market,
                        some of the hottest finds in the Singapore market, and follow us take a
                        deep dive into condominium projects in Singapore.
                    </p>
                </div>
            </section>

            {/* Reels Grid Section */}
            <section className="py-10 sm:py-14 lg:py-16">
                <div className="container-custom">
                    {/* Header row: title + filters + search */}
                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-primary font-[var(--font-poppins)] shrink-0">
                                Reels
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleFilterChange(tab)}
                                        className={`px-3.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                            activeFilter === tab
                                                ? "bg-[#195F60] text-white"
                                                : "border border-secondary/20 text-secondary/70 hover:border-[#195F60]/50 hover:text-secondary"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                                <div className="relative ml-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/40" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-8 pr-3 py-1 rounded-lg border border-secondary/20 text-xs sm:text-sm text-secondary bg-transparent placeholder:text-secondary/40 outline-none focus:border-[#195F60]/50 w-28 sm:w-36 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#195F60]" />
                            <p className="text-secondary/70 text-sm">Loading reels...</p>
                        </div>
                    )}

                    {/* Reels Grid */}
                    {!loading && (
                    <>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeFilter}-${currentPage}-${searchQuery}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 lg:gap-x-8 lg:gap-y-10"
                        >
                            {paginatedReels.map((reel) => {
                                const videoLink = reel.videoUrl?.trim();
                                const hasThumbnail = Boolean(reel.thumbnail?.trim());
                                const showVideoInstead =
                                    !hasThumbnail && videoLink;
                                const embedUrl = videoLink
                                    ? getVideoEmbedUrl(videoLink)
                                    : null;
                                const directVideo =
                                    videoLink && isDirectVideoUrl(videoLink);

                                const mediaBlock = hasThumbnail ? (
                                    <img
                                        src={reel.thumbnail}
                                        alt={reel.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : showVideoInstead && embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        title={reel.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : showVideoInstead && directVideo ? (
                                    <video
                                        src={videoLink}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        controls
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : showVideoInstead && videoLink ? (
                                    <a
                                        href={videoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 transition-colors"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all">
                                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                        </div>
                                        <span className="sr-only">Play video</span>
                                    </a>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
                                        <Play className="w-12 h-12 text-secondary/30" />
                                    </div>
                                );

                                const content = (
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-secondary/5">
                                            {mediaBlock}
                                            {hasThumbnail && (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                                        </div>
                                                    </div>
                                                    {reel.duration && (
                                                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                                                            {reel.duration}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {showVideoInstead && reel.duration && (
                                                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                                                    {reel.duration}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {reel.title}
                                        </p>
                                    </motion.div>
                                );

                                if (hasThumbnail && videoLink) {
                                    return (
                                        <a
                                            key={reel.id}
                                            href={videoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group cursor-pointer block"
                                        >
                                            {content}
                                        </a>
                                    );
                                }
                                if (showVideoInstead && !embedUrl && !directVideo && videoLink) {
                                    return (
                                        <a
                                            key={reel.id}
                                            href={videoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group cursor-pointer block"
                                        >
                                            {content}
                                        </a>
                                    );
                                }
                                return (
                                    <div key={reel.id} className="group block">
                                        {content}
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {paginatedReels.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-secondary/50 text-lg">No reels found.</p>
                        </div>
                    )}

                    {/* Pagination */}
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
                    </>
                    )}
                </div>
            </section>

            <Newsletter />
        </>
    );
}
