"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ChevronDown,
    Phone,
    Mail,
    Send,
} from "lucide-react";

const exploreLinksLeft = [
    { label: "Buy", href: "#", hasDropdown: true },
    { label: "Sell", href: "#", hasDropdown: true },
    { label: "Read", href: "#", hasDropdown: true },
    { label: "Watch", href: "#", hasDropdown: true },
];

const exploreLinksRight = [
    { label: "Listen", href: "#", hasDropdown: true },
    { label: "Tools", href: "#", hasDropdown: true },
    { label: "About", href: "#", hasDropdown: true },
    { label: "Webinars", href: "#", hasDropdown: true },
];

const socialLinks = [
    {
        label: "Facebook",
        href: "https://www.facebook.com/propertylimbrothers",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/propertylimbrothers",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        label: "YouTube",
        href: "https://www.youtube.com/propertylimbrothers",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
    {
        label: "Twitter",
        href: "https://twitter.com/propertylimbros",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
        ),
    },
    {
        label: "Spotify",
        href: "#",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
        ),
    },
    {
        label: "TikTok",
        href: "#",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        ),
    },
    {
        label: "Podcast",
        href: "#",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4 0 2.753-1.33 5.196-3.384 6.728l-.648-1.584A6.782 6.782 0 0018.6 12c0-3.644-2.956-6.6-6.6-6.6S5.4 8.356 5.4 12c0 1.976.87 3.752 2.247 4.96l-.627 1.614C4.95 17.05 3.6 14.668 3.6 12c0-4.636 3.764-8.4 8.4-8.4zm0 3.6A4.805 4.805 0 007.2 12c0 1.388.59 2.637 1.534 3.514l-.654 1.602A6.387 6.387 0 015.6 12c0-3.528 2.872-6.4 6.4-6.4s6.4 2.872 6.4 6.4a6.39 6.39 0 01-2.484 5.072l-.633-1.548A4.794 4.794 0 0016.8 12 4.805 4.805 0 0012 7.2zm0 3.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm-.6 3.6h1.2l.6 6h-2.4l.6-6z" />
            </svg>
        ),
    },
];

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary-dark shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export default function Footer() {
    const [email, setEmail] = useState("");

    return (
        <footer className="bg-[#c8e6df] text-secondary">
            <div className="container-custom py-10 lg:py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr_1.2fr] gap-8 lg:gap-6">
                    {/* Explore */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-secondary">Explore</h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            <div className="space-y-2">
                                {exploreLinksLeft.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center gap-1 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                    >
                                        {link.label}
                                        {link.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {exploreLinksRight.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center gap-1 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                    >
                                        {link.label}
                                        {link.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PLB Offices */}
                    <div className="space-y-5">
                        <div>
                            <h4 className="text-base font-bold mb-2 text-primary-dark">PLB Apex</h4>
                            <p className="text-sm text-secondary/80 leading-relaxed">
                                HQ Media Production Office<br />
                                62 Ubi Road 1, Oxley BizHub 2, #11-15,<br />
                                Singapore 408734
                            </p>
                        </div>
                        <div>
                            <h4 className="text-base font-bold mb-2 text-primary-dark">PLB Ascent</h4>
                            <p className="text-sm text-secondary/80 leading-relaxed">
                                Studio & Inside Sales Team Office<br />
                                62 Ubi Road 1, Oxley BizHub 2, #01-35,<br />
                                Singapore 408734
                            </p>
                        </div>
                        <div>
                            <h4 className="text-base font-bold mb-2 text-primary-dark">Rent Our Studio</h4>
                            <div className="space-y-1.5">
                                <a
                                    href="mailto:collabs@propertylimbrothers.com"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                >
                                    <Mail className="w-4 h-4 text-primary-dark shrink-0" />
                                    collabs@propertylimbrothers.com
                                </a>
                                <a
                                    href="https://wa.me/6584886988"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                >
                                    <WhatsAppIcon />
                                    +65 8488 6988
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h4 className="text-base font-bold mb-3 text-secondary">Contact Us</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-secondary/60 mb-1.5">
                                    For Property Consultation (Sales/Purchase) Hotline:
                                </p>
                                <a
                                    href="tel:+6562326719"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                >
                                    <Phone className="w-4 h-4 text-primary-dark shrink-0" />
                                    +65 6232 6719
                                </a>
                                <a
                                    href="mailto:collabs@propertylimbrothers.com"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors mt-1.5"
                                >
                                    <Mail className="w-4 h-4 text-primary-dark shrink-0" />
                                    collabs@propertylimbrothers.com
                                </a>
                                <a
                                    href="https://wa.me/6597457388"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors mt-1.5"
                                >
                                    <WhatsAppIcon />
                                    +65 9745 7388
                                </a>
                            </div>
                            <div>
                                <p className="text-xs text-secondary/60 mb-1.5">
                                    For Collaborations / Speaking Engagements / Seminars Hotline:
                                </p>
                                <a
                                    href="mailto:collabs@propertylimbrothers.com"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors"
                                >
                                    <Mail className="w-4 h-4 text-primary-dark shrink-0" />
                                    collabs@propertylimbrothers.com
                                </a>
                                <a
                                    href="https://wa.me/6584886988"
                                    className="flex items-center gap-2 text-sm text-secondary/80 hover:text-primary-dark transition-colors mt-1.5"
                                >
                                    <WhatsAppIcon />
                                    +65 8488 6988
                                </a>
                            </div>
                            <p className="text-xs text-secondary/60">For Careers with PLB:</p>
                        </div>
                    </div>

                    {/* Social & Newsletter */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-primary-dark transition-colors duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        <p className="text-xs font-semibold text-secondary/70 mb-2">
                            For Our Latest Exclusive Content
                        </p>
                        <div className="flex items-center mb-6">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm bg-white border border-secondary/20 rounded-l-full outline-none focus:border-primary-dark transition-colors placeholder:text-secondary/40"
                            />
                            <button
                                type="button"
                                className="px-3 py-2 bg-primary-dark text-white rounded-r-full hover:bg-primary transition-colors"
                                aria-label="Subscribe"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs font-semibold text-secondary/70 mb-2">
                            For Our Latest Exclusive Content
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://play.google.com/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-secondary text-white px-3 py-1.5 rounded-md hover:bg-secondary/90 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707l2.583 1.496a1 1 0 010 1.708l-2.583 1.496-2.54-2.55 2.54-2.55zM5.864 3.458L16.8 9.791l-2.302 2.302-8.634-8.635z" />
                                </svg>
                                <div className="text-left leading-tight">
                                    <span className="text-[7px] block opacity-80">Available on the</span>
                                    <span className="text-[11px] font-semibold">Google Play</span>
                                </div>
                            </a>
                            <a
                                href="https://apps.apple.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-secondary text-white px-3 py-1.5 rounded-md hover:bg-secondary/90 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="text-left leading-tight">
                                    <span className="text-[7px] block opacity-80">Download on the</span>
                                    <span className="text-[11px] font-semibold">App Store</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-secondary/15 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link href="/" className="inline-block">
                        <img
                            src="/images/insights-logo.png"
                            alt="Insights"
                            className="h-16 sm:h-18 w-auto"
                        />
                    </Link>
                    <div className="flex gap-6">
                        <Link
                            href="#"
                            className="text-sm text-secondary/70 hover:text-secondary transition-colors"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="#"
                            className="text-sm text-secondary/70 hover:text-secondary transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="text-sm text-secondary/70 hover:text-secondary transition-colors"
                        >
                            Disclaimers & Copyright
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
