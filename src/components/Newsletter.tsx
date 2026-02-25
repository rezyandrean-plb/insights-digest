"use client";

export default function Newsletter() {
    return (
        <section className="bg-[#195F60] py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Left content */}
                    <div className="w-full lg:w-3/5">
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight font-[var(--font-poppins)]">
                            Never miss an update.<br />
                            Get our newsletter.
                        </h2>
                        <p className="text-sm sm:text-base text-white/90 mt-4 max-w-md leading-relaxed">
                            Sign up for our Weekly Newsletter to your email. Receive the latest news and updates regarding the Singapore property market.
                        </p>
                        <div className="flex items-center gap-3 mt-6 max-w-md">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2.5 rounded-lg bg-white text-secondary text-sm placeholder:text-secondary/40 outline-none focus:ring-2 focus:ring-white/30"
                            />
                            <button className="px-5 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-colors shrink-0">
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="hidden lg:flex w-2/5 items-center justify-center">
                        <img
                            src="/images/homepage/newsletter-logo.webp"
                            alt="Newsletter"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
