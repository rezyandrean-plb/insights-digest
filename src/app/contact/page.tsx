"use client";

import { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import Newsletter from "@/components/Newsletter";

const helpOptions = ["Buying", "Selling", "Rental", "Consult with PLB"] as const;

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        message: "",
    });
    const [selectedHelp, setSelectedHelp] = useState<string[]>([]);

    const toggleHelp = (option: string) => {
        setSelectedHelp((prev) =>
            prev.includes(option)
                ? prev.filter((o) => o !== option)
                : [...prev, option]
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <section className="py-10 sm:py-14 lg:py-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        {/* Left — Contact Form */}
                        <div className="bg-white rounded-xl border border-secondary/10 p-6 sm:p-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-[var(--font-poppins)]">
                                Ask us anything!
                            </h1>
                            <p className="text-sm text-secondary/60 mt-2 leading-relaxed">
                                We&apos;d love to assist you in your property journey. Send
                                us your details and we&apos;ll be in touch with you soon!
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name*"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 text-sm text-secondary placeholder:text-secondary/40 outline-none focus:border-primary/50 transition-colors"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Mobile Number*"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 text-sm text-secondary placeholder:text-secondary/40 outline-none focus:border-primary/50 transition-colors"
                                        required
                                    />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email*"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 text-sm text-secondary placeholder:text-secondary/40 outline-none focus:border-primary/50 transition-colors"
                                    required
                                />
                                <textarea
                                    name="message"
                                    placeholder="Message*"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 text-sm text-secondary placeholder:text-secondary/40 outline-none focus:border-primary/50 transition-colors resize-none"
                                    required
                                />

                                <div>
                                    <p className="text-sm font-medium text-secondary mb-3">
                                        What can we help you with?*
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {helpOptions.map((option) => (
                                            <label
                                                key={option}
                                                className="flex items-center gap-2.5 cursor-pointer group"
                                            >
                                                <div
                                                    className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors ${
                                                        selectedHelp.includes(option)
                                                            ? "bg-primary border-primary"
                                                            : "border-secondary/30 group-hover:border-primary/50"
                                                    }`}
                                                    onClick={() => toggleHelp(option)}
                                                >
                                                    {selectedHelp.includes(option) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm text-secondary/70">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#195F60] text-white font-medium text-sm py-3 rounded-full hover:bg-[#195F60]/90 transition-colors"
                                >
                                    Submit
                                </button>
                            </form>

                            <p className="text-xs text-secondary/40 mt-4 leading-relaxed">
                                Upon registering, you agree to receive future marketing
                                materials from PropertyLimBrothers. Your personal
                                information will be used in accordance with our privacy
                                policy.
                            </p>
                        </div>

                        {/* Right — Office Info + Map */}
                        <div className="flex flex-col gap-6">
                            {/* Office Addresses + Hotlines */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6">
                                <div className="space-y-5">
                                    {/* PLB Apex */}
                                    <div className="flex gap-3">
                                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-bold text-secondary">PLB Apex</h3>
                                            <p className="text-xs text-secondary/60 mt-1 leading-relaxed">
                                                HQ Media Production Office<br />
                                                62 Ubi Road 1, Oxley BizHub 2,<br />
                                                #11-15/18, Singapore 408734
                                            </p>
                                        </div>
                                    </div>

                                    {/* PLB Ascent */}
                                    <div className="flex gap-3">
                                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-bold text-secondary">PLB Ascent</h3>
                                            <p className="text-xs text-secondary/60 mt-1 leading-relaxed">
                                                Studio & Inside Sales Team Office<br />
                                                62 Ubi Road 1, Oxley BizHub 2,<br />
                                                #01-35, Singapore 408734
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hotlines */}
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-sm font-bold text-secondary">Sales Enquiries Hotline</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <a href="tel:+6562326719" className="text-sm text-secondary/70 hover:text-primary transition-colors">
                                                +65 6232 6719
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <a href="tel:+6597457388" className="text-sm text-secondary/70 hover:text-primary transition-colors">
                                                +65 9745 7388
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-secondary">Career Hotline</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <a href="tel:+6590993788" className="text-sm text-secondary/70 hover:text-primary transition-colors">
                                                +65 9099 3788
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="rounded-lg overflow-hidden border border-secondary/10 flex-1 min-h-[280px]">
                                <iframe
                                    src="https://maps.google.com/maps?q=Oxley+BizHub+2,+62+Ubi+Rd+1,+Singapore+408734&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="PLB Office Location — Oxley BizHub 2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Newsletter />
        </>
    );
}
