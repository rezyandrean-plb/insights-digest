"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    FileText,
    Film,
    Settings,
    LayoutDashboard,
    ArrowRight,
    TrendingUp,
    Loader2,
    ChevronRight,
    Mail,
} from "lucide-react";

interface Counts {
    articles: number | null;
    reels: number | null;
    enquiries: number | null;
}

const NAV_SECTIONS = [
    {
        icon: LayoutDashboard,
        title: "Homepage Content",
        description: "Manage section visibility, titles, item limits, and hero blocks.",
        href: "/admin/homepage",
        color: "text-primary",
        bg: "bg-primary/10",
        hoverBg: "group-hover:bg-primary/20",
        accent: "border-l-primary",
    },
    {
        icon: FileText,
        title: "Articles",
        description: "Create, edit, and publish articles and market reports.",
        href: "/admin/articles",
        color: "text-secondary",
        bg: "bg-secondary/10",
        hoverBg: "group-hover:bg-secondary/20",
        accent: "border-l-secondary",
        countKey: "articles" as keyof Counts,
        countLabel: "articles",
    },
    {
        icon: Film,
        title: "Reels",
        description: "Upload, organise, and manage video reels and thumbnails.",
        href: "/admin/reels",
        color: "text-accent",
        bg: "bg-accent/10",
        hoverBg: "group-hover:bg-accent/20",
        accent: "border-l-accent",
        countKey: "reels" as keyof Counts,
        countLabel: "reels",
    },
    {
        icon: Mail,
        title: "Enquiries",
        description: "View and manage contact form submissions from the Work With Us page.",
        href: "/admin/enquiries",
        color: "text-accent",
        bg: "bg-accent/10",
        hoverBg: "group-hover:bg-accent/20",
        accent: "border-l-accent",
        countKey: "enquiries" as keyof Counts,
        countLabel: "enquiries",
    },
    {
        icon: Settings,
        title: "Site Settings",
        description: "Configure site appearance, SEO metadata, and integrations.",
        href: "/admin/settings",
        color: "text-muted",
        bg: "bg-muted/10",
        hoverBg: "group-hover:bg-muted/20",
        accent: "border-l-muted",
    },
];

const STAT_CARDS = [
    { key: "articles" as keyof Counts, label: "Articles", icon: FileText, color: "text-secondary", bg: "bg-secondary/10" },
    { key: "reels" as keyof Counts, label: "Reels", icon: Film, color: "text-accent", bg: "bg-accent/10" },
    { key: "enquiries" as keyof Counts, label: "Enquiries", icon: Mail, color: "text-accent", bg: "bg-accent/10" },
];

function getTodayLabel() {
    return new Date().toLocaleDateString("en-SG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function AdminPage() {
    const [counts, setCounts] = useState<Counts>({
        articles: null,
        reels: null,
        enquiries: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/articles").then((r) => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/reels").then((r) => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/admin/enquiries").then((r) => r.ok ? r.json() : []).catch(() => []),
        ]).then(([articles, reels, enquiries]) => {
            setCounts({
                articles: Array.isArray(articles) ? articles.length : 0,
                reels: Array.isArray(reels) ? reels.length : 0,
                enquiries: Array.isArray(enquiries) ? enquiries.length : 0,
            });
            setLoading(false);
        });
    }, []);

    return (
        <div className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">

                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium text-muted uppercase tracking-widest mb-1">
                                {getTodayLabel()}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-muted mt-1">
                                Overview of your site content and quick access to all management tools.
                            </p>
                        </div>
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary/40 transition-colors"
                        >
                            View public site
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
                >
                    {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
                        <div
                            key={key}
                            className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col gap-3"
                        >
                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div>
                                {loading ? (
                                    <div className="flex items-center gap-1.5">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted" />
                                        <span className="text-xs text-muted">Loading…</span>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-foreground leading-none">
                                        {counts[key] ?? 0}
                                    </p>
                                )}
                                <p className="text-xs text-muted mt-1">{label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.14 }}
                    className="flex items-center gap-2 mb-5"
                >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Management</span>
                    <div className="flex-1 h-px bg-border/60" />
                </motion.div>

                {/* Nav cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NAV_SECTIONS.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.18 + i * 0.06 }}
                        >
                            <Link href={section.href} className="group block h-full">
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    transition={{ duration: 0.18 }}
                                    className={`bg-white rounded-2xl border border-border/50 border-l-4 ${section.accent} p-5 h-full flex flex-col gap-4 hover:shadow-md hover:border-r-border/50 hover:border-t-border/50 hover:border-b-border/50 transition-shadow duration-200`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={`w-10 h-10 rounded-xl ${section.bg} ${section.hoverBg} flex items-center justify-center transition-colors`}>
                                            <section.icon className={`w-5 h-5 ${section.color}`} />
                                        </div>
                                        {section.countKey && (
                                            <span className="text-xs font-medium text-muted bg-section-bg px-2.5 py-1 rounded-full">
                                                {loading ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    </span>
                                                ) : (
                                                    `${counts[section.countKey] ?? 0} ${section.countLabel}`
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-foreground mb-1">
                                            {section.title}
                                        </h3>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {section.description}
                                        </p>
                                    </div>

                                    <div className={`flex items-center gap-1 text-xs font-medium ${section.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        Open
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
