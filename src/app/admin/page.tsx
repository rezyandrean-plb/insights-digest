"use client";

import { motion } from "framer-motion";
import { Shield, FileText, Users, Settings } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const adminSections = [
    {
        icon: FileText,
        title: "Content Management",
        description: "Create, edit, and publish articles and market reports.",
        count: "24 drafts",
    },
    {
        icon: Users,
        title: "User Management",
        description: "Manage subscriber accounts, roles, and permissions.",
        count: "1,247 users",
    },
    {
        icon: Settings,
        title: "Site Settings",
        description: "Configure site appearance, SEO, and integrations.",
        count: "12 settings",
    },
    {
        icon: Shield,
        title: "Security",
        description: "Monitor access logs, API usage, and security alerts.",
        count: "0 alerts",
    },
];

export default function AdminPage() {
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
                    {adminSections.map((section, i) => (
                        <ScrollReveal key={section.title} delay={i * 0.1}>
                            <motion.div
                                className="bg-white p-6 rounded-2xl border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group"
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <section.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-muted bg-section-bg px-2.5 py-1 rounded-full">
                                        {section.count}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1.5">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {section.description}
                                </p>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    );
}
