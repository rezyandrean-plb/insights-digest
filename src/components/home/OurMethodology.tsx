"use client";

import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomepageMethodologyItem } from "@/lib/homepage-config";

const defaultMethodologyItems: HomepageMethodologyItem[] = [
    {
        id: "1",
        title: "PLB Signature Home Tour Videos: Why Home Tours Are Important In Selling Properties",
        description:
            "Discover the wonders of Singapore with SkyLiving! Our platform seamlessly integrates with all major VR devices, allowing you to embark on exciting virtual tours of the city's most stunning condos and luxurious locations. From breathtaking skyline views to exquisite interiors, immerse yourself in the beauty of Singapore's real estate like never before!",
        thumbnail:
            "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
        slug: "plb-signature-home-tour-videos",
    },
    {
        id: "2",
        title: "Selling Homes the Right Way: PropertyLimBrothers' Game-Changing Home Tour Videos",
        description:
            "Experience the vibrant essence of Singapore through SkyLiving! Our service is designed to work with all leading VR devices, offering you engaging virtual tours of the city's most iconic condos and upscale properties. Get ready to be amazed by the spectacular sights and luxurious living spaces that await you!",
        thumbnail:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        slug: "selling-homes-the-right-way",
    },
    {
        id: "3",
        title: "PLB Signature Home Tour Videos: Why Home Tours Can Sell Homes Better & Faster For Sellers",
        description:
            "Step into the future of real estate with SkyLiving! Fully compatible with all top VR devices, our platform invites you to explore Singapore's most remarkable condos and luxury properties through immersive virtual tours. Enjoy stunning views and discover the elegance of urban living in this vibrant city!",
        thumbnail:
            "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&q=80",
        slug: "plb-home-tours-sell-faster",
    },
];

interface OurMethodologyProps {
    title?: string;
    items?: HomepageMethodologyItem[];
}

export default function OurMethodology({ title = "Our Methodology", items }: OurMethodologyProps) {
    const methodologyItems = items && items.length > 0 ? items : defaultMethodologyItems;

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-[#F1EDEB]">
            <div className="container-custom">
                <ScrollReveal>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary text-center mb-10 sm:mb-14 font-[var(--font-poppins)]">
                        {title}
                    </h2>
                </ScrollReveal>

                <div className="flex flex-col gap-8 sm:gap-10">
                    {methodologyItems.map((item, index) => (
                        <ScrollReveal key={item.id} delay={index * 0.1}>
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                                <Link
                                    href={`/method/${item.slug}`}
                                    className="w-full md:w-[38%] shrink-0 group block"
                                >
                                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/40 group-hover:scale-110 transition-all duration-300">
                                                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-secondary leading-snug font-[var(--font-poppins)]">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-black mt-3 leading-relaxed">
                                        {item.description}
                                    </p>
                                    <Link
                                        href={`/method/${item.slug}`}
                                        className="inline-flex items-center gap-2 mt-4 text-secondary font-medium text-sm hover:text-primary transition-colors group/link"
                                    >
                                        Read More
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
