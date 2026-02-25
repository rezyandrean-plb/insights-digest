"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Film, Rocket, Home, Settings, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface AdminSection {
    icon: LucideIcon;
    title: string;
    description: string;
    count: string;
    href: string;
}

export default function AdminPage() {
    const [sections, setSections] = useState<AdminSection[]>([
        {
            icon: LayoutDashboard,
            title: "Homepage Content",
            description: "Manage section visibility, titles, limits, and hero blocks.",
            count: "",
            href: "/admin/homepage",
        },
        {
            icon: FileText,
            title: "Content Management",
            description: "Create, edit, and publish articles and market reports.",
            count: "—",
            href: "/admin/articles",
        },
        {
            icon: Film,
            title: "Reels Management",
            description: "Upload, organise, and manage video reels and thumbnails.",
            count: "—",
            href: "/admin/reels",
        },
        {
            icon: Rocket,
            title: "New Launch Series",
            description: "Manage new property launch listings, descriptions, and images.",
            count: "—",
            href: "/admin/new-launches",
        },
        {
            icon: Home,
            title: "Home Tour Series",
            description: "Manage home tour listings across Condo, HDB, Landed, and more.",
            count: "—",
            href: "/admin/home-tours",
        },
        {
            icon: Settings,
            title: "Site Settings",
            description: "Configure site appearance, SEO, and integrations.",
            count: "",
            href: "/admin/settings",
        },
    ]);

    useEffect(() => {
        Promise.all([
            fetch("/api/articles").then((r) => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/reels").then((r) => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/new-launches").then((r) => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/home-tours").then((r) => r.ok ? r.json() : []).catch(() => []),
        ]).then(([articles, reels, newLaunches, homeTours]) => {
            setSections((prev) =>
                prev.map((s) => {
                    if (s.title === "Content Management") return { ...s, count: `${Array.isArray(articles) ? articles.length : 0} articles` };
                    if (s.title === "Reels Management") return { ...s, count: `${Array.isArray(reels) ? reels.length : 0} reels` };
                    if (s.title === "New Launch Series") return { ...s, count: `${Array.isArray(newLaunches) ? newLaunches.length : 0} items` };
                    if (s.title === "Home Tour Series") return { ...s, count: `${Array.isArray(homeTours) ? homeTours.length : 0} tours` };
                    return s;
                })
            );
        });
    }, []);

    return (
        <div className="py-16 sm:py-20 lg:py-24">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="max-w-2xl mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                            Admin Dashboard
                        </h1>
                        <p className="text-base text-muted mt-3">
                            Manage content, users, and site settings.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
                    {sections.map((section, i) => (
                        <ScrollReveal key={section.title} delay={i * 0.1}>
                            <Link href={section.href}>
                                <motion.div
                                    className="bg-white p-6 rounded-2xl border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group"
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <section.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        {section.count && (
                                            <span className="text-xs font-medium text-muted bg-section-bg px-2.5 py-1 rounded-full">
                                                {section.count}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground mb-1.5">
                                        {section.title}
                                    </h3>
                                    <p className="text-sm text-muted leading-relaxed">
                                        {section.description}
                                    </p>
                                </motion.div>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    );
}
