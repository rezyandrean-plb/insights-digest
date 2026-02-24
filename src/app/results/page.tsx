"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const results = [
    {
        metric: "Property Price Index",
        value: "189.4",
        change: "+3.2%",
        trend: "up" as const,
        period: "Q1 2026",
    },
    {
        metric: "Rental Index",
        value: "142.7",
        change: "+1.8%",
        trend: "up" as const,
        period: "Q1 2026",
    },
    {
        metric: "Transaction Volume",
        value: "8,432",
        change: "-2.1%",
        trend: "down" as const,
        period: "Q1 2026",
    },
    {
        metric: "New Launches",
        value: "12",
        change: "0%",
        trend: "neutral" as const,
        period: "Q1 2026",
    },
    {
        metric: "Average PSF (CCR)",
        value: "$2,847",
        change: "+5.1%",
        trend: "up" as const,
        period: "Q1 2026",
    },
    {
        metric: "Average PSF (OCR)",
        value: "$1,423",
        change: "+2.7%",
        trend: "up" as const,
        period: "Q1 2026",
    },
];

const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
};

const trendColor = {
    up: "text-green-600 bg-green-50",
    down: "text-red-500 bg-red-50",
    neutral: "text-muted bg-section-bg",
};

export default function ResultsPage() {
    return (
        <div className="py-16 sm:py-20 lg:py-24">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                            Market Results
                        </h1>
                        <p className="text-base text-muted mt-4 leading-relaxed">
                            Key performance metrics from Singapore&apos;s property market.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {results.map((r, i) => {
                        const Icon = trendIcon[r.trend];
                        return (
                            <ScrollReveal key={r.metric} delay={i * 0.1}>
                                <motion.div
                                    className="bg-white p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-shadow"
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="text-sm text-muted mb-1">{r.metric}</p>
                                    <p className="text-3xl font-bold text-foreground mb-3">
                                        {r.value}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${trendColor[r.trend]}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {r.change}
                                        </span>
                                        <span className="text-xs text-muted">{r.period}</span>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
