"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [successOpen, setSuccessOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("sending");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
                return;
            }

            setStatus("success");
            setMessage(data.message || "Successfully subscribed!");
            setEmail("");
            setSuccessOpen(true);
        } catch {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    }

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
                        <form onSubmit={handleSubmit} className="flex items-center gap-3 mt-6 max-w-md">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (status !== "idle") {
                                        setStatus("idle");
                                        setMessage("");
                                    }
                                }}
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-4 py-2.5 rounded-lg bg-white text-secondary text-sm placeholder:text-secondary/40 outline-none focus:ring-2 focus:ring-white/30"
                            />
                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="px-5 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-colors shrink-0 disabled:opacity-50"
                            >
                                {status === "sending" ? "Signing up..." : "Sign Up"}
                            </button>
                        </form>
                        {status === "error" && message && (
                            <p className="mt-3 text-sm text-red-300">{message}</p>
                        )}
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

            {/* Success modal */}
            <Dialog.Root open={successOpen} onOpenChange={setSuccessOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        <div className="flex justify-end px-4 pt-4">
                            <Dialog.Close className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-section-bg transition-colors">
                                <X className="w-4 h-4" />
                            </Dialog.Close>
                        </div>
                        <div className="flex flex-col items-center text-center px-6 pb-8 pt-2">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <Dialog.Title className="text-lg font-semibold text-foreground">
                                You&apos;re all set!
                            </Dialog.Title>
                            <p className="text-sm text-muted mt-2 max-w-xs leading-relaxed">
                                {message}
                            </p>
                            <Dialog.Close className="mt-6 px-6 py-2.5 rounded-xl bg-[#195F60] text-white text-sm font-medium hover:bg-[#164e4f] transition-colors">
                                Got it
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </section>
    );
}
