"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    ChevronUp,
    ChevronDown,
    ImageIcon,
    AlignLeft,
    Heading2,
    Loader2,
    Check,
    AlertCircle,
    PlusCircle,
    X,
} from "lucide-react";
import type { ArticleSection } from "@/lib/data";

function generateId() {
    return Math.random().toString(36).slice(2, 9);
}

const emptySection = (): ArticleSection => ({
    id: generateId(),
    heading: "",
    paragraphs: [""],
    image: "",
});

export default function ArticleSectionsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const [articleTitle, setArticleTitle] = useState("");
    const [articleSlug, setArticleSlug] = useState("");
    const [sections, setSections] = useState<ArticleSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Load article ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`/api/articles/${id}`)
            .then((r) => {
                if (!r.ok) throw new Error("Article not found");
                return r.json();
            })
            .then((data) => {
                setArticleTitle(data.title);
                setArticleSlug(data.slug);
                setSections(
                    Array.isArray(data.sections) && data.sections.length > 0
                        ? data.sections
                        : [emptySection()]
                );
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [id]);

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = useCallback(async () => {
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sections }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error ?? "Failed to save");
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    }, [id, sections]);

    // ── Section helpers ───────────────────────────────────────────────────────
    const addSection = () =>
        setSections((prev) => [...prev, emptySection()]);

    const removeSection = (idx: number) =>
        setSections((prev) => prev.filter((_, i) => i !== idx));

    const moveSection = (idx: number, dir: -1 | 1) => {
        setSections((prev) => {
            const next = [...prev];
            const swap = idx + dir;
            if (swap < 0 || swap >= next.length) return prev;
            [next[idx], next[swap]] = [next[swap], next[idx]];
            return next;
        });
    };

    const updateSection = (idx: number, patch: Partial<ArticleSection>) =>
        setSections((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
        );

    const addParagraph = (sIdx: number) =>
        setSections((prev) =>
            prev.map((s, i) =>
                i === sIdx
                    ? { ...s, paragraphs: [...s.paragraphs, ""] }
                    : s
            )
        );

    const updateParagraph = (sIdx: number, pIdx: number, value: string) =>
        setSections((prev) =>
            prev.map((s, i) =>
                i === sIdx
                    ? {
                          ...s,
                          paragraphs: s.paragraphs.map((p, j) =>
                              j === pIdx ? value : p
                          ),
                      }
                    : s
            )
        );

    const removeParagraph = (sIdx: number, pIdx: number) =>
        setSections((prev) =>
            prev.map((s, i) =>
                i === sIdx
                    ? {
                          ...s,
                          paragraphs: s.paragraphs.filter((_, j) => j !== pIdx),
                      }
                    : s
            )
        );

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
        );
    }

    return (
        <div className="py-10 sm:py-14">
            <div className="container-custom max-w-4xl">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href="/admin/articles"
                            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-3"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Articles
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                            {articleTitle || "Article Sections"}
                        </h1>
                        {articleSlug && (
                            <p className="text-xs text-muted mt-0.5 font-mono">
                                /article/{articleSlug}
                            </p>
                        )}
                        <p className="text-sm text-muted mt-1.5">
                            {sections.length} section{sections.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {error && (
                            <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {error}
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : null}
                            {saving ? "Saving…" : saved ? "Saved!" : "Save Sections"}
                        </button>
                    </div>
                </div>

                {/* Sections list */}
                <div className="flex flex-col gap-6">
                    <AnimatePresence initial={false}>
                        {sections.map((section, sIdx) => (
                            <motion.div
                                key={section.id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.22 }}
                                className="bg-white rounded-2xl border border-border/50 overflow-hidden"
                            >
                                {/* Section card header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-section-bg/60">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-muted/40" />
                                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                                            Section {sIdx + 1}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveSection(sIdx, -1)}
                                            disabled={sIdx === 0}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-border/60 disabled:opacity-30 transition-colors"
                                            title="Move up"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveSection(sIdx, 1)}
                                            disabled={sIdx === sections.length - 1}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-border/60 disabled:opacity-30 transition-colors"
                                            title="Move down"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeSection(sIdx)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
                                            title="Remove section"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-5">
                                    {/* Heading */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                                            <Heading2 className="w-3.5 h-3.5 text-primary" />
                                            Heading
                                        </label>
                                        <input
                                            type="text"
                                            value={section.heading}
                                            onChange={(e) =>
                                                updateSection(sIdx, { heading: e.target.value })
                                            }
                                            placeholder="Section heading…"
                                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-section-bg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                                        />
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                            Image URL
                                            <span className="normal-case font-normal text-muted ml-1">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={section.image ?? ""}
                                            onChange={(e) =>
                                                updateSection(sIdx, { image: e.target.value })
                                            }
                                            placeholder="https://…"
                                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-section-bg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition font-mono"
                                        />
                                        {section.image && (
                                            <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-border/50 bg-section-bg">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={section.image}
                                                    alt="Section preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Paragraphs */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                                            <AlignLeft className="w-3.5 h-3.5 text-primary" />
                                            Paragraphs
                                        </label>
                                        <div className="flex flex-col gap-2.5">
                                            <AnimatePresence initial={false}>
                                                {section.paragraphs.map((para, pIdx) => (
                                                    <motion.div
                                                        key={pIdx}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.98 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="relative group"
                                                    >
                                                        <textarea
                                                            value={para}
                                                            onChange={(e) =>
                                                                updateParagraph(sIdx, pIdx, e.target.value)
                                                            }
                                                            placeholder={`Paragraph ${pIdx + 1}…`}
                                                            rows={3}
                                                            className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-border bg-section-bg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition resize-none leading-relaxed"
                                                        />
                                                        {section.paragraphs.length > 1 && (
                                                            <button
                                                                onClick={() => removeParagraph(sIdx, pIdx)}
                                                                className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-muted/40 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                                title="Remove paragraph"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            <button
                                                onClick={() => addParagraph(sIdx)}
                                                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                                            >
                                                <PlusCircle className="w-3.5 h-3.5" />
                                                Add paragraph
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add section */}
                <div className="mt-6">
                    <button
                        onClick={addSection}
                        className="flex items-center gap-2 w-full py-4 px-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Section</span>
                    </button>
                </div>

                {/* Bottom save bar */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
                    <button
                        onClick={() => router.push("/admin/articles")}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                        ← Back to Articles
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saved ? (
                            <Check className="w-4 h-4" />
                        ) : null}
                        {saving ? "Saving…" : saved ? "Saved!" : "Save Sections"}
                    </button>
                </div>

            </div>
        </div>
    );
}
