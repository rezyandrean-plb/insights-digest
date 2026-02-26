"use client";

export default function Newsletter() {
    return (
        <section className="bg-[#195F60] py-6 sm:py-8 lg:py-10">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Left content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight font-[var(--font-poppins)]">
                            Sign up for our Weekly Brief.
                        </h2>
                        <p className="text-sm sm:text-base text-white/90 mt-4 max-w-md leading-relaxed">
                            Get concise, data-backed insights on Singapore's property market — straight to your inbox.
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

                    {/* Right image - expanded */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <img
                            src="/images/homepage/newsletter-logo.webp"
                            alt="Newsletter"
                            className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
