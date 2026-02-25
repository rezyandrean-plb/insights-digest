"use client";

import { motion } from "framer-motion";
import { Users, Award, Globe, BookOpen } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const values = [
    {
        icon: Users,
        title: "Community First",
        description: "We put the needs of Singapore's property community at the heart of everything we do.",
    },
    {
        icon: Award,
        title: "Editorial Excellence",
        description: "Every story is fact-checked, verified, and held to the highest journalistic standards.",
    },
    {
        icon: Globe,
        title: "Global Perspective",
        description: "We connect local market movements with international trends for richer analysis.",
    },
    {
        icon: BookOpen,
        title: "Education",
        description: "Empowering readers with the knowledge they need to make confident property decisions.",
    },
];

export default function AboutPage() {
    return (
        <div className="py-16 sm:py-20 lg:py-24">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                            About Insights
                        </h1>
                        <p className="text-base text-muted mt-4 leading-relaxed">
                            Singapore&apos;s leading real estate intelligence platform, trusted by
                            industry professionals and investors since 2020.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Story section */}
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto mb-20">
                        <div className="bg-section-bg rounded-2xl p-8 sm:p-12">
                            <h2 className="text-xl font-bold text-foreground mb-4">
                                Our Story
                            </h2>
                            <p className="text-muted leading-relaxed mb-4">
                                Founded in 2020, Insights was born from a simple observation: Singapore&apos;s
                                dynamic real estate market lacked a dedicated, data-driven news platform
                                that spoke to both professionals and aspiring investors.
                            </p>
                            <p className="text-muted leading-relaxed">
                                Today, we&apos;re read by over 50,000 monthly readers and have become the
                                go-to source for property market intelligence in the region.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Values */}
                <ScrollReveal>
                    <h2 className="text-2xl font-bold text-foreground text-center mb-10">
                        Our Values
                    </h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {values.map((v, i) => (
                        <ScrollReveal key={v.title} delay={i * 0.1}>
                            <motion.div
                                className="text-center p-6"
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <v.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {v.title}
                                </h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {v.description}
                                </p>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    );
}
