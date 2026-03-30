"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
    Mail,
    X,
    Loader2,
    ChevronRight,
    Trash2,
    Download,
} from "lucide-react";
import type { NewsletterSubscriber } from "@/app/api/admin/newsletter/route";

function formatDate(iso: string | null): string {
    if (!iso) return "\u2014";
    const d = new Date(iso);
    return d.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminNewsletterPage() {
    const [list, setList] = useState<NewsletterSubscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<NewsletterSubscriber | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/newsletter");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setList(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load subscribers.");
            setList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    const openDetail = useCallback((subscriber: NewsletterSubscriber) => {
        setSelected(subscriber);
        setDetailOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (id: number) => {
            setDeleting(true);
            try {
                const res = await fetch(`/api/admin/newsletter/${id}`, {
                    method: "DELETE",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error ?? "Delete failed");
                }
                toast.success("Subscriber removed.");
                setDetailOpen(false);
                setSelected(null);
                fetchSubscribers();
            } catch (e) {
                toast.error(
                    e instanceof Error ? e.message : "Failed to delete subscriber."
                );
            } finally {
                setDeleting(false);
            }
        },
        [fetchSubscribers]
    );

    const exportCSV = useCallback(() => {
        if (list.length === 0) return;
        const header = "Email,Subscribed Date";
        const rows = list.map(
            (s) =>
                `${s.email},${s.createdAt ? new Date(s.createdAt).toISOString() : ""}`
        );
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [list]);

    return (
        <div className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Newsletter
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            Email subscribers from the Weekly Brief sign-up form.
                            {!loading && (
                                <span className="ml-1 font-medium">
                                    {list.length} subscriber{list.length !== 1 ? "s" : ""} total.
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={exportCSV}
                        disabled={list.length === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-section-bg transition-colors disabled:opacity-50 shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </motion.div>

                {/* List */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="bg-white rounded-2xl border border-border/50 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-muted">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading subscribers&hellip;</span>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted">
                            <Mail className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm font-medium">No subscribers yet</p>
                            <p className="text-xs mt-0.5">
                                Sign-ups from the newsletter form will appear here.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border/50">
                            {list.map((subscriber) => (
                                <li key={subscriber.id}>
                                    <button
                                        type="button"
                                        onClick={() => openDetail(subscriber)}
                                        className="w-full flex items-center gap-4 px-4 sm:px-6 py-4 text-left hover:bg-section-bg/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {subscriber.email}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-3">
                                            <span className="text-xs text-muted hidden sm:block">
                                                {formatDate(subscriber.createdAt)}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted" />
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>

            {/* Detail dialog */}
            <Dialog.Root open={detailOpen} onOpenChange={setDetailOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-border/50 shadow-xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        {selected && (
                            <>
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                    <Dialog.Title asChild>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Subscriber details
                                        </h2>
                                    </Dialog.Title>
                                    <Dialog.Close className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-section-bg">
                                        <X className="w-5 h-5" />
                                    </Dialog.Close>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    <div className="grid gap-3 text-sm">
                                        <div className="flex gap-3">
                                            <Mail className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-muted">Email</p>
                                                <a
                                                    href={`mailto:${selected.email}`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {selected.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-border/40 pt-3">
                                        <p className="text-xs text-muted mb-1">
                                            Subscribed on
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatDate(selected.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
                                    <button
                                        onClick={() => handleDelete(selected.id)}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                        Remove subscriber
                                    </button>
                                    <Dialog.Close className="px-4 py-1.5 rounded-lg text-sm font-medium bg-section-bg text-muted hover:text-foreground hover:bg-border/50 transition-colors">
                                        Close
                                    </Dialog.Close>
                                </div>
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
