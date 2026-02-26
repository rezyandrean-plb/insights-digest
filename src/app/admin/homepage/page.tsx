"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Loader2, AlertCircle, Layout, Type, Hash, List, Mic, Pencil, X, Trash2, Headphones } from "lucide-react";
import {
    DEFAULT_HOMEPAGE_CONFIG,
    mergeWithDefault,
    type HomepageConfig,
    type HomepageMethodologyItem,
    type HomepagePodcast,
    type HomepageNugget,
} from "@/lib/homepage-config";

const SECTION_KEYS = [
    { key: "hero", label: "Hero" },
    { key: "latestPosts", label: "Latest Posts" },
    { key: "featuredStories", label: "Featured Stories" },
    { key: "latestNews", label: "Latest News" },
    { key: "ourMethodology", label: "Our Methodology" },
    { key: "ourPodcast", label: "Our Podcast" },
    { key: "listen", label: "Listen (Nuggets On The Go)" },
    { key: "ourHomeTours", label: "Our Home Tours" },
    { key: "featuredArticles", label: "Featured Articles" },
    { key: "newsletter", label: "Newsletter" },
] as const;

const TITLE_KEYS = [
    { key: "latestPosts", label: "Latest Posts heading" },
    { key: "featuredStories", label: "Featured Stories heading" },
    { key: "ourMethodology", label: "Our Methodology heading" },
    { key: "ourPodcast", label: "Our Podcast heading" },
    { key: "listen", label: "Listen (Nuggets on the go) heading" },
    { key: "ourHomeTours", label: "Our Home Tours heading" },
    { key: "featuredArticles", label: "Featured Articles heading" },
] as const;

function MethodologyImagePreview({ src }: { src: string }) {
    const [error, setError] = useState(false);
    useEffect(() => setError(false), [src]);
    const showPlaceholder = !src || error;
    if (showPlaceholder) {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted bg-muted/50">
                No image
            </div>
        );
    }
    return (
        <>
            <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        </>
    );
}

const LIMIT_KEYS = [
    { key: "latestPosts", label: "Latest posts count" },
    { key: "featuredStories", label: "Featured stories count" },
    { key: "reels", label: "Reels in Latest News" },
    { key: "newLaunches", label: "New launches in Latest News" },
    { key: "webinars", label: "Webinars in Latest News" },
    { key: "homeTours", label: "Home tours on homepage" },
] as const;

const emptyMethodologyItem = (id: string): HomepageMethodologyItem => ({
    id,
    title: "",
    description: "",
    thumbnail: "",
    slug: "",
});

const emptyNugget = (id: string): HomepageNugget => ({
    id,
    title: "",
    description: "",
    avatar: "",
    slug: "",
});

export default function AdminHomepagePage() {
    const [config, setConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [methodologyDialogOpen, setMethodologyDialogOpen] = useState(false);
    const [editingMethodologyIndex, setEditingMethodologyIndex] = useState<number | null>(null);
    const [methodologyForm, setMethodologyForm] = useState<HomepageMethodologyItem>(emptyMethodologyItem("1"));
    const [podcastDialogOpen, setPodcastDialogOpen] = useState(false);
    const [podcastForm, setPodcastForm] = useState<HomepagePodcast>(DEFAULT_HOMEPAGE_CONFIG.podcast);
    const [nuggetsDialogOpen, setNuggetsDialogOpen] = useState(false);
    const [editingNuggetIndex, setEditingNuggetIndex] = useState<number | null>(null);
    const [nuggetForm, setNuggetForm] = useState<HomepageNugget>(emptyNugget("1"));
    const [editingTitleKey, setEditingTitleKey] = useState<keyof HomepageConfig["titles"] | null>(null);
    const [titleDialogValue, setTitleDialogValue] = useState("");

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/homepage");
            const data = await res.json();
            setConfig(mergeWithDefault(data));
        } catch {
            setError("Failed to load homepage config.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const updateSections = (key: keyof HomepageConfig["sections"], value: boolean) => {
        setConfig((prev) => ({
            ...prev,
            sections: { ...prev.sections, [key]: value },
        }));
    };

    const updateTitles = (key: keyof HomepageConfig["titles"], value: string) => {
        setConfig((prev) => ({
            ...prev,
            titles: { ...prev.titles, [key]: value },
        }));
    };

    const openTitleDialog = (key: keyof HomepageConfig["titles"]) => {
        setEditingTitleKey(key);
        setTitleDialogValue(config.titles[key]);
    };

    const closeTitleDialog = () => {
        setEditingTitleKey(null);
        setTitleDialogValue("");
    };

    const saveTitleFromDialog = () => {
        if (editingTitleKey !== null) {
            const nextTitles = { ...config.titles, [editingTitleKey]: titleDialogValue };
            const nextConfig = { ...config, titles: nextTitles };
            updateTitles(editingTitleKey, titleDialogValue);
            closeTitleDialog();
            handleSave(nextConfig);
        }
    };

    const updateLimits = (key: keyof HomepageConfig["limits"], value: number) => {
        setConfig((prev) => ({
            ...prev,
            limits: { ...prev.limits, [key]: Math.max(0, Math.min(50, value)) },
        }));
    };

    const removeMethodologyItem = (index: number) => {
        setConfig((prev) => ({
            ...prev,
            methodology: prev.methodology.filter((_, i) => i !== index),
        }));
    };

    const openMethodologyDialog = (index: number | null) => {
        if (index !== null) {
            setMethodologyForm({ ...config.methodology[index] });
            setEditingMethodologyIndex(index);
        } else {
            const nextId = String(Math.max(0, ...config.methodology.map((m) => parseInt(m.id, 10) || 0)) + 1);
            setMethodologyForm(emptyMethodologyItem(nextId));
            setEditingMethodologyIndex(null);
        }
        setMethodologyDialogOpen(true);
    };

    const saveMethodologyFromDialog = () => {
        if (editingMethodologyIndex !== null) {
            setConfig((prev) => {
                const next = [...prev.methodology];
                next[editingMethodologyIndex] = methodologyForm;
                return { ...prev, methodology: next };
            });
        } else {
            setConfig((prev) => ({
                ...prev,
                methodology: [...prev.methodology, methodologyForm],
            }));
        }
        setMethodologyDialogOpen(false);
    };

    const removeMethodologyFromDialog = () => {
        if (editingMethodologyIndex !== null) {
            removeMethodologyItem(editingMethodologyIndex);
            setMethodologyDialogOpen(false);
        }
    };

    const openPodcastDialog = () => {
        setPodcastForm({ ...config.podcast });
        setPodcastDialogOpen(true);
    };

    const savePodcastFromDialog = () => {
        setConfig((prev) => ({ ...prev, podcast: podcastForm }));
        setPodcastDialogOpen(false);
    };

    const removeNuggetItem = (index: number) => {
        setConfig((prev) => ({
            ...prev,
            nuggets: prev.nuggets.filter((_, i) => i !== index),
        }));
    };

    const openNuggetDialog = (index: number | null) => {
        if (index !== null) {
            setNuggetForm({ ...config.nuggets[index] });
            setEditingNuggetIndex(index);
        } else {
            const nextId = String(Math.max(0, ...config.nuggets.map((n) => parseInt(n.id, 10) || 0)) + 1);
            setNuggetForm(emptyNugget(nextId));
            setEditingNuggetIndex(null);
        }
        setNuggetsDialogOpen(true);
    };

    const saveNuggetFromDialog = () => {
        if (editingNuggetIndex !== null) {
            setConfig((prev) => {
                const next = [...prev.nuggets];
                next[editingNuggetIndex] = nuggetForm;
                return { ...prev, nuggets: next };
            });
        } else {
            setConfig((prev) => ({ ...prev, nuggets: [...prev.nuggets, nuggetForm] }));
        }
        setNuggetsDialogOpen(false);
    };

    const removeNuggetFromDialog = () => {
        if (editingNuggetIndex !== null) {
            removeNuggetItem(editingNuggetIndex);
            setNuggetsDialogOpen(false);
        }
    };

    const handleSave = async (configOverride?: HomepageConfig) => {
        setSaving(true);
        setError(null);
        setSaved(false);
        const payload = configOverride ?? config;
        try {
            const res = await fetch("/api/homepage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error((errBody as { error?: string }).error ?? "Failed to save");
            }
            const data = await res.json();
            setConfig(mergeWithDefault(data));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-16 sm:py-20">
                <div className="container-custom flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 sm:py-20 lg:py-24">
            <div className="container-custom">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Admin
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Homepage Content
                    </h1>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                "Saved"
                            ) : (
                                "Save changes"
                            )}
                        </button>
                        <p className="text-xs text-muted">
                            Click to persist all edits to the server
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm mb-8">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Section visibility */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Section visibility</h2>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {SECTION_KEYS.map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.sections[key]}
                                        onChange={(e) => updateSections(key, e.target.checked)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-foreground">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section titles */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Type className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Section titles</h2>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="space-y-3">
                            {TITLE_KEYS.map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 last:pb-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-muted">{label}</div>
                                        <div className="text-sm text-foreground mt-0.5 truncate">
                                            {config.titles[key] || "—"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openTitleDialog(key)}
                                        className="shrink-0 p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                        title="Edit title"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Dialog.Root open={editingTitleKey !== null} onOpenChange={(open) => !open && closeTitleDialog()}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-xl p-6 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <Dialog.Title className="text-lg font-bold text-foreground">
                                        {editingTitleKey !== null ? TITLE_KEYS.find((t) => t.key === editingTitleKey)?.label ?? "Edit section title" : "Edit section title"}
                                    </Dialog.Title>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors shrink-0">
                                        <X className="w-4 h-4" />
                                    </Dialog.Close>
                                </div>
                                <input
                                    type="text"
                                    value={titleDialogValue}
                                    onChange={(e) => setTitleDialogValue(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-6"
                                    placeholder="Section title"
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={saveTitleFromDialog}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                        Cancel
                                    </Dialog.Close>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </section>

                {/* Item limits */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Hash className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Item limits</h2>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {LIMIT_KEYS.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-muted mb-1">{label}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={50}
                                        value={config.limits[key]}
                                        onChange={(e) => updateLimits(key, parseInt(e.target.value, 10) || 0)}
                                        className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Methodology */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <List className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Our Methodology items</h2>
                        <button
                            type="button"
                            onClick={() => openMethodologyDialog(null)}
                            className="ml-2 text-xs font-medium text-primary hover:underline"
                        >
                            + Add item
                        </button>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                            {config.methodology.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-border/50 overflow-hidden bg-section-bg/30 hover:border-primary/30 transition-colors flex flex-col"
                                >
                                    <div className="aspect-video bg-muted/30 overflow-hidden">
                                        <MethodologyImagePreview src={item.thumbnail} />
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col min-h-0">
                                        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                                            {item.title || "Untitled"}
                                        </h3>
                                        <div className="mt-auto flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openMethodologyDialog(index)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof window !== "undefined" && window.confirm("Remove this item?")) {
                                                        removeMethodologyItem(index);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Methodology edit dialog */}
                    <Dialog.Root open={methodologyDialogOpen} onOpenChange={setMethodologyDialogOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <Dialog.Title className="text-xl font-bold text-foreground">
                                        {editingMethodologyIndex !== null ? "Edit methodology item" : "Add methodology item"}
                                    </Dialog.Title>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors shrink-0">
                                        <X className="w-4 h-4" />
                                    </Dialog.Close>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div className="sm:w-80 shrink-0">
                                        <label className="block text-xs text-muted mb-1.5">Preview</label>
                                        <div className="aspect-video rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
                                            <MethodologyImagePreview src={methodologyForm.thumbnail} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={methodologyForm.title}
                                                onChange={(e) => setMethodologyForm((f) => ({ ...f, title: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Description</label>
                                            <textarea
                                                value={methodologyForm.description}
                                                onChange={(e) => setMethodologyForm((f) => ({ ...f, description: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Thumbnail URL</label>
                                                <input
                                                    type="text"
                                                    value={methodologyForm.thumbnail}
                                                    onChange={(e) => setMethodologyForm((f) => ({ ...f, thumbnail: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Slug</label>
                                                <input
                                                    type="text"
                                                    value={methodologyForm.slug}
                                                    onChange={(e) => setMethodologyForm((f) => ({ ...f, slug: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={saveMethodologyFromDialog}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                        Cancel
                                    </Dialog.Close>
                                    {editingMethodologyIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof window !== "undefined" && window.confirm("Remove this item?")) {
                                                    removeMethodologyFromDialog();
                                                }
                                            }}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors ml-auto"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </section>

                {/* Our Podcast */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Mic className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Our Podcast (featured block)</h2>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="rounded-xl border border-border/50 overflow-hidden bg-section-bg/30 hover:border-primary/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="sm:w-80 shrink-0 aspect-video sm:aspect-[4/3] bg-muted/30 overflow-hidden">
                                <MethodologyImagePreview src={config.podcast.thumbnail} />
                            </div>
                            <div className="p-4 sm:p-0 flex-1 min-w-0 flex flex-col gap-3">
                                <span className="text-xs font-medium text-primary">{config.podcast.label || "Latest Podcast"}</span>
                                <h3 className="text-base font-semibold text-foreground line-clamp-2">
                                    {config.podcast.title || "Untitled"}
                                </h3>
                                <p className="text-sm text-muted line-clamp-2">{config.podcast.description || "No description."}</p>
                                <button
                                    type="button"
                                    onClick={openPodcastDialog}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors w-fit"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Podcast edit dialog */}
                    <Dialog.Root open={podcastDialogOpen} onOpenChange={setPodcastDialogOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <Dialog.Title className="text-xl font-bold text-foreground">
                                        Edit Our Podcast (featured block)
                                    </Dialog.Title>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors shrink-0">
                                        <X className="w-4 h-4" />
                                    </Dialog.Close>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                    <div className="sm:w-80 shrink-0">
                                        <label className="block text-xs text-muted mb-1.5">Preview</label>
                                        <div className="aspect-video rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
                                            <MethodologyImagePreview src={podcastForm.thumbnail} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={podcastForm.label}
                                                onChange={(e) => setPodcastForm((f) => ({ ...f, label: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={podcastForm.title}
                                                onChange={(e) => setPodcastForm((f) => ({ ...f, title: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Description</label>
                                            <textarea
                                                value={podcastForm.description}
                                                onChange={(e) => setPodcastForm((f) => ({ ...f, description: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Thumbnail URL</label>
                                                <input
                                                    type="text"
                                                    value={podcastForm.thumbnail}
                                                    onChange={(e) => setPodcastForm((f) => ({ ...f, thumbnail: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Slug</label>
                                                <input
                                                    type="text"
                                                    value={podcastForm.slug}
                                                    onChange={(e) => setPodcastForm((f) => ({ ...f, slug: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={savePodcastFromDialog}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                        Cancel
                                    </Dialog.Close>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </section>

                {/* Listen (nuggets) */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Headphones className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Listen</h2>
                        <button
                            type="button"
                            onClick={() => openNuggetDialog(null)}
                            className="ml-2 text-xs font-medium text-primary hover:underline"
                        >
                            + Add item
                        </button>
                    </div>
                    <div className="bg-white border border-border/50 rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {config.nuggets.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-border/50 overflow-hidden bg-section-bg/30 hover:border-primary/30 transition-colors p-4 flex items-center gap-3"
                                >
                                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-muted/30">
                                        <MethodologyImagePreview src={item.avatar} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-0.5">
                                            {item.title || "Untitled"}
                                        </h3>
                                        <p className="text-xs text-muted line-clamp-1">{item.description || "—"}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openNuggetDialog(index)}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof window !== "undefined" && window.confirm("Remove this nugget?")) {
                                                        removeNuggetItem(index);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nugget edit dialog */}
                    <Dialog.Root open={nuggetsDialogOpen} onOpenChange={setNuggetsDialogOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <Dialog.Title className="text-xl font-bold text-foreground">
                                        {editingNuggetIndex !== null ? "Edit nugget" : "Add nugget"}
                                    </Dialog.Title>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors shrink-0">
                                        <X className="w-4 h-4" />
                                    </Dialog.Close>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                    <div className="sm:w-36 shrink-0">
                                        <label className="block text-xs text-muted mb-1.5">Avatar preview</label>
                                        <div className="aspect-square rounded-full overflow-hidden border border-border/50 bg-muted/30">
                                            <MethodologyImagePreview src={nuggetForm.avatar} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={nuggetForm.title}
                                                onChange={(e) => setNuggetForm((f) => ({ ...f, title: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Description</label>
                                            <textarea
                                                value={nuggetForm.description}
                                                onChange={(e) => setNuggetForm((f) => ({ ...f, description: e.target.value }))}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Avatar URL</label>
                                                <input
                                                    type="text"
                                                    value={nuggetForm.avatar}
                                                    onChange={(e) => setNuggetForm((f) => ({ ...f, avatar: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Slug</label>
                                                <input
                                                    type="text"
                                                    value={nuggetForm.slug}
                                                    onChange={(e) => setNuggetForm((f) => ({ ...f, slug: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={saveNuggetFromDialog}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                        Cancel
                                    </Dialog.Close>
                                    {editingNuggetIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof window !== "undefined" && window.confirm("Remove this nugget?")) {
                                                    removeNuggetFromDialog();
                                                }
                                            }}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors ml-auto"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </section>
            </div>
        </div>
    );
}
