"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, TrendingUp, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
    {
        icon: Lightbulb,
        title: "Research & Analysis",
        description:
            "Deep-dive into market data, property transactions, and economic indicators to identify emerging trends.",
    },
    {
        icon: Target,
        title: "Expert Curation",
        description:
            "Our editorial team selects the most impactful stories and verifies all information through multiple sources.",
    },
    {
        icon: BarChart3,
        title: "Data Visualization",
        description:
            "Complex market data is transformed into clear, actionable insights through our proprietary analytics tools.",
    },
    {
        icon: TrendingUp,
        title: "Actionable Insights",
        description:
            "Every article is designed to help readers make informed decisions about their real estate investments.",
    },
];

export default function MethodPage() {
    return (
        <div className="py-16 sm:py-20 lg:py-24">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                            Our Method
                        </h1>
                        <p className="text-base text-muted mt-4 leading-relaxed">
                            How we deliver the most reliable and insightful real estate
                            coverage in Singapore.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {steps.map((step, i) => (
                        <ScrollReveal key={step.title} delay={i * 0.15}>
                            <motion.div
                                className="bg-white p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-shadow duration-300"
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <step.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    );
}
