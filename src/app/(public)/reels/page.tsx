import Link from "next/link";
import { Play } from "lucide-react";
import Newsletter from "@/components/Newsletter";

export default function ReelsPage() {
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
                        Watch us go through some of the hottest new launches in the market,
                        some of the hottest finds in the Singapore market, and follow us take a
                        deep dive into condominium projects in Singapore.
                    </p>
                </div>
            </section>

            {/* Coming Soon */}
            <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1400&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-black/70" />
                </div>
                <div className="relative container-custom">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-8">
                            <Play className="w-9 h-9 text-white" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-[var(--font-poppins)]">
                            Coming Soon
                        </h2>
                        <p className="text-white/60 mt-4 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            We&apos;re preparing exciting reels for you. In the meantime, catch our latest content on YouTube and Instagram.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                            <Link
                                href="https://www.youtube.com/@InsightsDigest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#FF0000] text-white text-sm font-semibold hover:bg-[#CC0000] transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                Watch on YouTube
                            </Link>
                            <Link
                                href="https://www.instagram.com/insights_digest/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
                                style={{
                                    background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                                }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                                </svg>
                                Follow on Instagram
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Newsletter />
        </>
    );
}
