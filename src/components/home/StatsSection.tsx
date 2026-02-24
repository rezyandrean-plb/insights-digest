"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Building2, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface AnimatedCounterProps {
    value: string;
    duration?: number;
}

function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [display, setDisplay] = useState("$0");

    useEffect(() => {
        if (!isInView) return;

        // Parse numeric value from string like "$1,620,000"
        const numericStr = value.replace(/[^0-9]/g, "");
        const target = parseInt(numericStr, 10);
        const prefix = value.match(/^[^0-9]*/)?.[0] || "";

        const startTime = Date.now();
        const durationMs = duration * 1000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            setDisplay(prefix + current.toLocaleString());

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    return <span ref={ref}>{display}</span>;
}

export default function StatsSection() {
    return (
        <section className="py-10 sm:py-14 lg:py-16 bg-section-bg">
            <div className="container-custom">
                <ScrollReveal>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Instagram Feed
                    </h2>
                    <p className="text-sm text-muted mb-8">
                        Property Market Highlights
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main stat card */}
                    <ScrollReveal className="lg:col-span-2">
                        <div className="relative bg-white rounded-2xl p-8 sm:p-10 border border-border/50 overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-muted">
                                        Average Transaction Price
                                    </span>
                                </div>

                                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3">
                                    <AnimatedCounter value="$1,620,000" />
                                </div>

                                <p className="text-sm text-muted mb-6">
                                    Singapore Private Property Market — Q1 2026
                                </p>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full w-fit text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+4.2% vs Q4 2025</span>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Side stats */}
                    <div className="flex flex-col gap-6">
                        <ScrollReveal delay={0.1}>
                            <div className="bg-white rounded-2xl p-6 border border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <BarChart3 className="w-5 h-5 text-accent" />
                                    <span className="text-sm font-medium text-muted">
                                        Transactions
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    <AnimatedCounter value="3,247" />
                                </div>
                                <p className="text-xs text-muted mt-1">Units sold in Q1</p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="bg-white rounded-2xl p-6 border border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-muted">
                                        Rental Yield
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-foreground">3.8%</div>
                                <p className="text-xs text-muted mt-1">
                                    Avg. gross yield island-wide
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
