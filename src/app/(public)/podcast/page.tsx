"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    Clock,
    CalendarDays,
    ExternalLink,
    ChevronDown,
    Music2,
    Mic,
} from "lucide-react";
import Newsletter from "@/components/Newsletter";

const SHOW_ID = "3XFLamzyEFP5FzQwX9lcV0";
const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SHOW_ID}`;

interface SpotifyImage {
    url: string;
    width: number;
    height: number;
}

interface SpotifyEpisode {
    id: string;
    name: string;
    description: string;
    duration_ms: number;
    release_date: string;
    images: SpotifyImage[];
    external_urls: { spotify: string };
}

interface SpotifyShow {
    name: string;
    description: string;
    images: SpotifyImage[];
    publisher: string;
    total_episodes: number;
    external_urls: { spotify: string };
}

function formatDuration(ms: number): string {
    const totalMin = Math.round(ms / 60000);
    if (totalMin < 60) return `${totalMin} min`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const [y, mo, d] = dateStr.split("-").map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function EpisodeSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-border/50 p-5 flex gap-4 animate-pulse">
            <div className="w-20 h-20 bg-section-bg rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5 pt-1">
                <div className="h-4 bg-section-bg rounded w-4/5" />
                <div className="h-3 bg-section-bg rounded w-full" />
                <div className="h-3 bg-section-bg rounded w-3/4" />
                <div className="h-3 bg-section-bg rounded w-1/3 mt-3" />
            </div>
        </div>
    );
}

export default function PodcastPage() {
    const [show, setShow] = useState<SpotifyShow | null>(null);
    const [episodes, setEpisodes] = useState<SpotifyEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        fetch("/api/spotify")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setShow(data.show);
                setEpisodes(data.episodes ?? []);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const showArt = show?.images?.[0]?.url;
    const visibleEpisodes = episodes.slice(0, visibleCount);

    return (
        <div>
            {/* ── Hero ── */}
            <section className="bg-[#195F60]">
                <div className="container-custom py-12 sm:py-16 lg:py-20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-14">
                        {/* Show artwork */}
                        <div className="shrink-0">
                            {showArt ? (
                                <img
                                    src={showArt}
                                    alt={show?.name}
                                    className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl shadow-2xl object-cover"
                                />
                            ) : (
                                <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Mic className="w-16 h-16 text-white/30" />
                                </div>
                            )}
                        </div>

                        {/* Show info */}
                        <div className="flex-1 min-w-0">
                            <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                                Podcast
                            </span>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 leading-tight">
                                {loading ? (
                                    <span className="inline-block w-72 h-9 bg-white/10 rounded animate-pulse" />
                                ) : (
                                    show?.name ?? "Insights Digest"
                                )}
                            </h1>

                            {show?.publisher && (
                                <p className="text-white/50 text-sm mt-1">by {show.publisher}</p>
                            )}

                            <p className="text-white/70 text-sm sm:text-[15px] leading-relaxed mt-3 max-w-2xl line-clamp-3">
                                {loading ? (
                                    <span className="inline-block w-full h-4 bg-white/10 rounded animate-pulse" />
                                ) : (
                                    show?.description
                                )}
                            </p>

                            {show?.total_episodes && (
                                <p className="text-white/40 text-sm mt-2">
                                    {show.total_episodes} episodes
                                </p>
                            )}

                            {/* Listen button */}
                            <div className="flex items-center gap-3 mt-6">
                                <a
                                    href={SPOTIFY_SHOW_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] hover:bg-[#18a349] text-white text-sm font-semibold rounded-full transition-colors shadow-lg"
                                >
                                    {/* Spotify logo */}
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                    </svg>
                                    Follow on Spotify
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spotify compact player for latest episode */}
                <div className="container-custom pb-8">
                    <iframe
                        src={`https://open.spotify.com/embed/show/${SHOW_ID}?utm_source=generator&theme=0`}
                        width="100%"
                        height="232"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-2xl"
                    />
                </div>
            </section>

            {/* ── Episode list ── */}
            <section className="py-10 sm:py-14 lg:py-16">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-secondary">
                                All Episodes
                            </h2>
                            {!loading && episodes.length > 0 && (
                                <p className="text-sm text-muted mt-1">
                                    {episodes.length} episodes loaded
                                </p>
                            )}
                        </div>
                        <a
                            href={SPOTIFY_SHOW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open in Spotify
                        </a>
                    </div>

                    {/* Skeleton */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <EpisodeSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Error fallback */}
                    {error && (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 rounded-full bg-section-bg flex items-center justify-center mx-auto mb-4">
                                <Music2 className="w-8 h-8 text-muted-light" />
                            </div>
                            <p className="text-muted text-sm mb-2">
                                Unable to load episodes at the moment.
                            </p>
                            <p className="text-muted-light text-xs mb-6">
                                Listen to all episodes directly on Spotify.
                            </p>
                            <a
                                href={SPOTIFY_SHOW_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1DB954] hover:bg-[#18a349] text-white text-sm font-semibold rounded-full transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                                Open on Spotify
                            </a>
                        </div>
                    )}

                    {/* Episode grid */}
                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visibleEpisodes.map((ep, idx) => {
                                    const isPlaying = playingId === ep.id;
                                    const epArt = ep.images?.[0]?.url;
                                    return (
                                        <motion.div
                                            key={ep.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(idx, 8) * 0.04 }}
                                            className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-5">
                                                <div className="flex gap-4">
                                                    {/* Artwork */}
                                                    <div className="shrink-0">
                                                        {epArt ? (
                                                            <img
                                                                src={epArt}
                                                                alt={ep.name}
                                                                className="w-20 h-20 rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-20 h-20 rounded-xl bg-section-bg flex items-center justify-center">
                                                                <Mic className="w-8 h-8 text-muted-light" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                                                            {ep.name}
                                                        </h3>
                                                        <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                                                            {ep.description}
                                                        </p>
                                                        <div className="flex items-center flex-wrap gap-3 mt-2.5">
                                                            <span className="flex items-center gap-1 text-xs text-muted-light">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDuration(ep.duration_ms)}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-muted-light">
                                                                <CalendarDays className="w-3 h-3" />
                                                                {formatDate(ep.release_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-border/30">
                                                    <button
                                                        onClick={() =>
                                                            setPlayingId(isPlaying ? null : ep.id)
                                                        }
                                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                            isPlaying
                                                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                                : "bg-primary text-white hover:bg-primary-dark"
                                                        }`}
                                                    >
                                                        {isPlaying ? (
                                                            <>
                                                                <Pause className="w-3 h-3 fill-current" />
                                                                Close Player
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-3 h-3 fill-white" />
                                                                Play Episode
                                                            </>
                                                        )}
                                                    </button>
                                                    <a
                                                        href={ep.external_urls.spotify}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted hover:text-primary hover:border-primary transition-colors"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                        </svg>
                                                        Spotify
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Embedded player – reveals on Play click */}
                                            <AnimatePresence>
                                                {isPlaying && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 pb-5">
                                                            <iframe
                                                                src={`https://open.spotify.com/embed/episode/${ep.id}?utm_source=generator&theme=0`}
                                                                width="100%"
                                                                height="152"
                                                                frameBorder="0"
                                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                                loading="lazy"
                                                                className="rounded-xl"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Load more */}
                            {visibleCount < episodes.length && (
                                <div className="text-center mt-10">
                                    <button
                                        onClick={() => setVisibleCount((c) => c + 12)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:bg-section-bg hover:text-foreground transition-colors"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                        Load More Episodes
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <Newsletter />
        </div>
    );
}
