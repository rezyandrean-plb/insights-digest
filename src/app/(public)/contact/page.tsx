"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, FileText, BarChart3, Rocket, Megaphone, CheckCircle2 } from "lucide-react";
import Newsletter from "@/components/Newsletter";
import ScrollReveal from "@/components/ScrollReveal";
import { articles } from "@/lib/data";

const enquiryTypes = ["Brand / Media Collaboration", "Private Property Advisory"] as const;
const timelineOptions = ["Within 2 weeks", "Within 1 month", "1–3 months", "Exploratory"];
const budgetOptions = ["Below $5,000", "$5,000 – $15,000", "$15,000 – $30,000", "$30,000+", "Prefer to discuss"];
const stageOptions = ["Exploring", "Shortlisting options", "Ready to transact", "Reviewing portfolio strategy"];
const propertyTypeOptions = ["HDB", "Condo", "Landed", "Mixed / Unsure"];

const collaborateItems = [
    { label: "Sponsored Editorial Features", icon: FileText },
    { label: "Market Deep Dives", icon: BarChart3 },
    { label: "New Launch Explainers", icon: Rocket },
    { label: "Multi-Platform Content Campaigns", icon: Megaphone },
];

const CONTACT_EMAIL = "hello@insightsdigest.sg";

function ContactSidebar() {
    return (
        <div className="lg:sticky lg:top-28 flex flex-col gap-5">
            <div className="rounded-2xl bg-[#195F60] p-6 sm:p-8 text-white">
                <h3 className="text-lg font-bold mb-2 font-[var(--font-poppins)]">
                    Get in touch
                </h3>
                <p className="text-sm text-white/70 leading-relaxed mb-5">
                    If you would like to explore a collaboration, reach us at:
                </p>
                <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white/20 transition-colors w-full"
                >
                    <Mail className="w-4 h-4 shrink-0" />
                    {CONTACT_EMAIL}
                </a>
                <div className="mt-6 pt-5 border-t border-white/15">
                    <p className="text-base font-semibold font-[var(--font-poppins)]">
                        Build something worth reading.
                    </p>
                </div>
            </div>
        </div>
    );
}

function RadioGroup({
    name,
    options,
    value,
    onChange,
}: {
    name: string;
    options: string[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const isSelected = value === opt;
                return (
                    <label
                        key={opt}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-all duration-150 ${
                            isSelected
                                ? "border-[#195F60] bg-[#195F60]/5 text-[#195F60] font-medium"
                                : "border-secondary/15 text-secondary/70 hover:border-secondary/30"
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={isSelected}
                            onChange={onChange}
                            className="sr-only"
                        />
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#195F60]" aria-hidden />}
                        {opt}
                    </label>
                );
            })}
        </div>
    );
}

export default function ContactPage() {
    const [enquiryAbout, setEnquiryAbout] = useState<string>("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        contactNumber: "",
        company: "",
        lookingToAchieve: "",
        projectTimeline: "",
        estimatedBudget: "",
        stage: "",
        propertyType: "",
        describeSituation: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const isBrand = enquiryAbout === "Brand / Media Collaboration";
    const isPrivate = enquiryAbout === "Private Property Advisory";

    return (
        <>
            {/* Hero — background image from all-articles, same copy */}
            <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${articles[0]?.image ?? "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1400&q=80"})`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
                <div className="container-custom relative">
                    <ScrollReveal>
                        <span className="inline-block text-sm font-medium text-white/50 tracking-wide uppercase mb-4">
                            Collaboration
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight font-[var(--font-poppins)] max-w-xl">
                            Work With Us
                        </h1>
                        <p className="text-lg sm:text-xl text-white/70 mt-5 max-w-lg leading-relaxed">
                            We create real estate content people trust.
                        </p>
                        <Link
                            href="/all-articles"
                            className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white hover:text-white/90 transition-colors"
                        >
                            Explore our articles
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </ScrollReveal>
                </div>
            </section>

            {/* About + Collaborate */}
            <section className="pt-14 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-14">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-24 items-start">
                        <ScrollReveal direction="left">
                            <span className="inline-block text-xs font-semibold text-[#195F60] tracking-widest uppercase mb-3">
                                About Us
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-secondary leading-snug font-[var(--font-poppins)]">
                                We create real estate content people trust.
                            </h2>
                            <p className="text-base sm:text-lg text-secondary/70 mt-4 leading-relaxed">
                                Insights Digest is an independent editorial platform focused on clear, structured, and data-driven property analysis.
                            </p>
                            <p className="text-base sm:text-lg text-secondary/70 mt-4 leading-relaxed">
                                We partner with brands that value credibility over noise.
                            </p>
                            <p className="text-base sm:text-lg text-secondary/70 mt-4 leading-relaxed">
                                If you are launching, repositioning, or looking to communicate with clarity — let&apos;s talk.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-5 font-[var(--font-poppins)] mt-10 lg:mt-0">
                                What We Collaborate On
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {collaborateItems.map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.4 }}
                                        className="group rounded-xl bg-white border border-border/50 p-4 shadow-sm hover:shadow-md hover:border-[#195F60]/25 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-9 h-9 rounded-lg bg-[#195F60]/10 flex items-center justify-center shrink-0 group-hover:bg-[#195F60]/15 transition-colors">
                                                <item.icon className="w-4 h-4 text-[#195F60]" />
                                            </div>
                                            <span className="text-sm font-medium text-secondary leading-snug pt-1.5">
                                                {item.label}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="container-custom"><div className="border-t border-border/40" /></div>

            {/* Form + Sidebar */}
            <section className="pt-8 sm:pt-12 lg:pt-14 pb-14 sm:pb-20 lg:pb-24">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-lg mx-auto mb-12 sm:mb-16">
                            <span className="inline-block text-xs font-semibold text-[#195F60] tracking-widest uppercase mb-3">
                                Contact
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-[var(--font-poppins)]">
                                Start A Conversation
                            </h2>
                            <p className="text-sm sm:text-base text-secondary/60 mt-3">
                                Tell us a little about what you&apos;re looking for.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-12 items-start">
                        {/* Left — Enquiry Form */}
                        <ScrollReveal direction="left">
                            <div className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-secondary/5 p-6 sm:p-8 lg:p-10">
                                <h3 className="text-lg font-bold text-secondary mb-1 font-[var(--font-poppins)]">
                                    Enquiry Form
                                </h3>
                                <p className="text-sm text-secondary/50 mb-8">
                                    All fields marked with * are required.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-secondary mb-3">
                                            I am enquiring about (Select one): *
                                        </p>
                                        <div className="flex gap-3">
                                            {enquiryTypes.map((option) => {
                                                const isSelected = enquiryAbout === option;
                                                return (
                                                    <label
                                                        key={option}
                                                        className={`relative flex-1 cursor-pointer rounded-xl border-2 p-4 pr-10 text-center text-sm font-medium transition-all duration-150 ${
                                                            isSelected
                                                                ? "border-[#195F60] bg-[#195F60]/5 text-[#195F60]"
                                                                : "border-secondary/10 text-secondary/60 hover:border-secondary/25"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="enquiryAbout"
                                                            value={option}
                                                            checked={isSelected}
                                                            onChange={(e) => setEnquiryAbout(e.target.value)}
                                                            className="sr-only"
                                                        />
                                                        {option}
                                                        {isSelected && (
                                                            <span className="absolute top-3 right-3 text-[#195F60]" aria-hidden>
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-1.5">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-1.5">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-1.5">
                                                Contact Number <span className="text-secondary/40 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleChange}
                                                placeholder="+65 9123 4567"
                                                className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-1.5">
                                                Company <span className="text-secondary/40 font-normal">(if applicable)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                placeholder="Company name"
                                                className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Brand / Media Collaboration fields */}
                                    {isBrand && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6 pt-2 border-t border-dashed border-secondary/10"
                                        >
                                            <div className="pt-4">
                                                <label className="block text-sm font-medium text-secondary mb-1.5">
                                                    What are you looking to achieve?
                                                </label>
                                                <textarea
                                                    name="lookingToAchieve"
                                                    value={formData.lookingToAchieve}
                                                    onChange={handleChange}
                                                    placeholder="Describe your goals..."
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all resize-none"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-secondary mb-3">
                                                    Project Timeline
                                                </p>
                                                <RadioGroup
                                                    name="projectTimeline"
                                                    options={timelineOptions}
                                                    value={formData.projectTimeline}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-secondary mb-3">
                                                    Estimated Budget Range
                                                </p>
                                                <RadioGroup
                                                    name="estimatedBudget"
                                                    options={budgetOptions}
                                                    value={formData.estimatedBudget}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Private Property Advisory fields */}
                                    {isPrivate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6 pt-2 border-t border-dashed border-secondary/10"
                                        >
                                            <div className="pt-4">
                                                <p className="text-sm font-medium text-secondary mb-3">
                                                    What stage are you at?
                                                </p>
                                                <RadioGroup
                                                    name="stage"
                                                    options={stageOptions}
                                                    value={formData.stage}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-secondary mb-3">
                                                    Property Type of Interest
                                                </p>
                                                <RadioGroup
                                                    name="propertyType"
                                                    options={propertyTypeOptions}
                                                    value={formData.propertyType}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary mb-1.5">
                                                    Briefly describe your situation
                                                </label>
                                                <textarea
                                                    name="describeSituation"
                                                    value={formData.describeSituation}
                                                    onChange={handleChange}
                                                    placeholder="Tell us more..."
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl border border-secondary/15 text-sm text-secondary placeholder:text-secondary/35 outline-none focus:border-[#195F60] focus:ring-2 focus:ring-[#195F60]/10 transition-all resize-none"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-[#195F60] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#164E4F] active:scale-[0.99] transition-all duration-150 shadow-sm shadow-[#195F60]/20"
                                    >
                                        Submit Enquiry
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>

                        {/* Right — Sidebar */}
                        <ScrollReveal direction="right">
                            <ContactSidebar />
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            <Newsletter />
        </>
    );
}
