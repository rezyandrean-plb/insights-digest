"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Login failed.");
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-section-bg px-4">
            <div className="w-full max-w-sm">
                {/* Logo / branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                        <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
                    <p className="text-sm text-muted mt-1">Insights Dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-7">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-xs font-semibold text-foreground uppercase tracking-wider"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@insights.sg"
                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-section-bg placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="password"
                                className="text-xs font-semibold text-foreground uppercase tracking-wider"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-section-bg placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 transition"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
