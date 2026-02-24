"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function CTABanner() {
    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <ScrollReveal>
                    <motion.div
                        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-secondary p-8 sm:p-12 lg:p-16"
                        whileHover={{ scale: 1.005 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                                    Small REITs Eyeing Bigger Scholarships?
                                    <br />
                                    <span className="text-white/70">
                                        What&apos;s Going On?
                                    </span>
                                </h3>
                                <p className="text-sm text-white/60 mt-3 max-w-md">
                                    Discover the surprising trend of smaller real estate investment
                                    trusts entering the education sponsorship space.
                                </p>
                            </div>
                            <motion.a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors shrink-0 text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Read More
                                <ExternalLink className="w-4 h-4" />
                            </motion.a>
                        </div>
                    </motion.div>
                </ScrollReveal>
            </div>
        </section>
    );
}
