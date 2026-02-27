"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Eye,
    ImageIcon,
    Play,
    Clock,
    Loader2,
    AlertCircle,
    UploadCloud,
} from "lucide-react";
import type { Reel } from "@/lib/data";

type ReelCategory = Reel["category"];

const CATEGORIES: ReelCategory[] = ["Most Viewed", "Latest", "Editor's Pick"];

const ITEMS_PER_PAGE = 10;

const categoryBadgeClass: Record<ReelCategory, string> = {
    "Most Viewed": "bg-[#e8f0fe] text-[#1a56db]",
    Latest: "bg-[#ecfdf5] text-[#059669]",
    "Editor's Pick": "bg-[#fff7ed] text-[#c2410c]",
};

const emptyReel: Omit<Reel, "id"> = {
    slug: "",
    title: "",
    thumbnail: "",
    duration: "",
    category: "Most Viewed",
    videoUrl: "",
};

function getVideoEmbedUrl(url: string): string | null {
    const u = url.trim();
    const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
}

function isDirectVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("video/mp4");
}

export default function AdminReelsPage() {
    const [reelsList, setReelsList] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState<ReelCategory | "All">("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingReel, setEditingReel] = useState<Reel | null>(null);
    const [deletingReel, setDeletingReel] = useState<Reel | null>(null);
    const [formData, setFormData] = useState(emptyReel);
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [thumbnailDragOver, setThumbnailDragOver] = useState(false);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const uploadThumbnail = useCallback(async (file: File) => {
        setThumbnailUploading(true);
        const toastId = toast.loading("Uploading thumbnail…");
        try {
            const body = new FormData();
            body.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Upload failed");
            setFormData((prev) => ({ ...prev, thumbnail: data.url }));
            toast.success("Thumbnail uploaded.", { id: toastId });
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Thumbnail upload failed.", { id: toastId });
        } finally {
            setThumbnailUploading(false);
        }
    }, []);

    const fetchReels = useCallback(async () => {
        try {
            const res = await fetch("/api/reels");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setReelsList(data);
        } catch {
            setError("Failed to load reels from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReels();
    }, [fetchReels]);

    const filtered = useMemo(() => {
        let result = reelsList;
        if (filterCategory !== "All") {
            result = result.filter((r) => r.category === filterCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.slug.toLowerCase().includes(q)
            );
        }
        return result;
    }, [reelsList, filterCategory, search]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const pageNumbers = useMemo(() => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    const openCreateDialog = useCallback(() => {
        setEditingReel(null);
        setFormData(emptyReel);
        setDialogOpen(true);
    }, []);

    const openEditDialog = useCallback((reel: Reel) => {
        setEditingReel(reel);
        setFormData({
            slug: reel.slug,
            title: reel.title,
            thumbnail: reel.thumbnail,
            duration: reel.duration,
            category: reel.category,
            videoUrl: reel.videoUrl ?? "",
        });
        setDialogOpen(true);
    }, []);

    const openDeleteDialog = useCallback((reel: Reel) => {
        setDeletingReel(reel);
        setDeleteDialogOpen(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!formData.title.trim() || !formData.slug.trim() || saving) return;
        setSaving(true);
        setError(null);

        try {
            if (editingReel) {
                const res = await fetch("/api/reels", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingReel.id, ...formData }),
                });
                if (!res.ok) throw new Error("Update failed");
                const updated = await res.json();
                setReelsList((prev) =>
                    prev.map((r) => (r.id === editingReel.id ? updated : r))
                );
                toast.success("Reel updated successfully.");
            } else {
                const res = await fetch("/api/reels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Create failed");
                const created = await res.json();
                setReelsList((prev) => [created, ...prev]);
                toast.success("Reel created successfully.");
            }
            setDialogOpen(false);
            setEditingReel(null);
            setFormData(emptyReel);
        } catch {
            setError(
                editingReel
                    ? "Failed to update reel. Please try again."
                    : "Failed to create reel. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }, [editingReel, formData, saving]);

    const handleDelete = useCallback(async () => {
        if (!deletingReel || saving) return;
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/reels?id=${deletingReel.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            setReelsList((prev) =>
                prev.filter((r) => r.id !== deletingReel.id)
            );
            setDeleteDialogOpen(false);
            setDeletingReel(null);
            toast.success("Reel deleted.");
            if (paginated.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
            }
        } catch {
            setError("Failed to delete reel. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [deletingReel, saving, paginated.length, currentPage]);

    const updateField = <K extends keyof typeof formData>(
        key: K,
        value: (typeof formData)[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="py-10 sm:py-14 lg:py-16">
                <div className="container-custom flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-3 text-muted">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm">Loading reels...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                {error && (
                    <div className="mb-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-3"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Manage Reels
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            {reelsList.length} reels total
                        </p>
                    </div>
                    <button
                        onClick={openCreateDialog}
                        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Reel
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by title or slug..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value as ReelCategory | "All");
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-section-bg/50">
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary w-[52px]">
                                        #
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary">
                                        Reel
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden lg:table-cell w-[100px]">
                                        Duration
                                    </th>
                                    <th className="text-right py-3.5 px-4 font-semibold text-secondary w-[140px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="wait">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-16 text-muted"
                                            >
                                                No reels found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((reel, idx) => (
                                            <motion.tr
                                                key={reel.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="border-b border-border/30 last:border-0 hover:bg-section-bg/30 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-muted text-xs">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-section-bg relative">
                                                            {reel.thumbnail ? (
                                                                <>
                                                                    <img
                                                                        src={reel.thumbnail}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow" />
                                                                    </div>
                                                                </>
                                                            ) : (() => {
                                                                const videoLink = reel.videoUrl?.trim();
                                                                const embedUrl = videoLink ? getVideoEmbedUrl(videoLink) : null;
                                                                const directVideo = videoLink && isDirectVideoUrl(videoLink);
                                                                if (videoLink && embedUrl) {
                                                                    return (
                                                                        <>
                                                                            <iframe
                                                                                src={embedUrl}
                                                                                title=""
                                                                                className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                allowFullScreen
                                                                            />
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                                <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow" />
                                                                            </div>
                                                                        </>
                                                                    );
                                                                }
                                                                if (videoLink && directVideo) {
                                                                    return (
                                                                        <>
                                                                            <video
                                                                                src={videoLink}
                                                                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                                                muted
                                                                                playsInline
                                                                                preload="metadata"
                                                                            />
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                                <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow" />
                                                                            </div>
                                                                        </>
                                                                    );
                                                                }
                                                                if (videoLink) {
                                                                    return (
                                                                        <a
                                                                            href={videoLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="absolute inset-0 flex items-center justify-center bg-section-bg hover:bg-primary/10 text-muted-light hover:text-primary transition-colors"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Play className="w-4 h-4" />
                                                                        </a>
                                                                    );
                                                                }
                                                                return (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ImageIcon className="w-4 h-4 text-muted-light" />
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate max-w-[280px] lg:max-w-[400px]">
                                                                {reel.title}
                                                            </p>
                                                            <p className="text-xs text-muted truncate max-w-[280px] lg:max-w-[400px]">
                                                                /{reel.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell">
                                                    <span
                                                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${categoryBadgeClass[reel.category]}`}
                                                    >
                                                        {reel.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 hidden lg:table-cell">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                                                        <Clock className="w-3 h-3" />
                                                        {reel.duration}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/all-reels`}
                                                            target="_blank"
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditDialog(reel)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(reel)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                            <p className="text-xs text-muted hidden sm:block">
                                Showing{" "}
                                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}{" "}
                                of {filtered.length}
                            </p>
                            <div className="flex items-center gap-1 mx-auto sm:mx-0">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted disabled:opacity-30 disabled:cursor-not-allowed hover:bg-section-bg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {pageNumbers.map((p, i) =>
                                    p === "..." ? (
                                        <span
                                            key={`e-${i}`}
                                            className="w-8 h-8 flex items-center justify-center text-xs text-muted"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                                currentPage === p
                                                    ? "bg-primary text-white"
                                                    : "border border-border/50 text-muted hover:bg-section-bg"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted disabled:opacity-30 disabled:cursor-not-allowed hover:bg-section-bg transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create / Edit Dialog */}
                <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <div className="flex items-center justify-between mb-6">
                                <Dialog.Title className="text-xl font-bold text-foreground">
                                    {editingReel ? "Edit Reel" : "New Reel"}
                                </Dialog.Title>
                                <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors">
                                    <X className="w-4 h-4" />
                                </Dialog.Close>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateField("title", e.target.value)}
                                        placeholder="Reel title"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Slug <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) =>
                                            updateField(
                                                "slug",
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9-]/g, "-")
                                                    .replace(/-+/g, "-")
                                            )
                                        }
                                        placeholder="reel-url-slug"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) =>
                                                updateField(
                                                    "category",
                                                    e.target.value as ReelCategory
                                                )
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) =>
                                                updateField("duration", e.target.value)
                                            }
                                            placeholder="3:45"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Thumbnail
                                    </label>

                                    <input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadThumbnail(file);
                                            e.target.value = "";
                                        }}
                                    />

                                    {formData.thumbnail ? (
                                        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-border/50 group">
                                            <img
                                                src={formData.thumbnail}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-foreground hover:bg-white/90 transition-colors"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    Change
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateField("thumbnail", "")}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-red-600 hover:bg-white/90 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setThumbnailDragOver(true); }}
                                            onDragLeave={() => setThumbnailDragOver(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setThumbnailDragOver(false);
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) uploadThumbnail(file);
                                            }}
                                            disabled={thumbnailUploading}
                                            className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                                                thumbnailDragOver
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50 hover:bg-section-bg"
                                            }`}
                                        >
                                            {thumbnailUploading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                    <span className="text-xs text-muted">Uploading…</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className={`w-6 h-6 ${thumbnailDragOver ? "text-primary" : "text-muted"}`} />
                                                    <p className="text-sm font-medium text-foreground">
                                                        {thumbnailDragOver ? "Drop to upload" : "Click to upload"}
                                                    </p>
                                                    <p className="text-xs text-muted">or paste URL below</p>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <input
                                        type="text"
                                        value={formData.thumbnail}
                                        onChange={(e) => updateField("thumbnail", e.target.value)}
                                        placeholder="Or paste thumbnail URL (e.g. https://...)"
                                        className="w-full mt-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    {(formData.thumbnail || formData.videoUrl) && (
                                        <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-border/50 relative bg-section-bg">
                                            {formData.thumbnail ? (
                                                <>
                                                    <img
                                                        src={formData.thumbnail}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Play className="w-4 h-4 text-white fill-white drop-shadow" />
                                                    </div>
                                                </>
                                            ) : (() => {
                                                const vUrl = formData.videoUrl?.trim();
                                                const embed = vUrl ? getVideoEmbedUrl(vUrl) : null;
                                                const direct = vUrl && isDirectVideoUrl(vUrl);
                                                if (embed) {
                                                    return (
                                                        <>
                                                            <iframe
                                                                src={embed}
                                                                title=""
                                                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                <Play className="w-3 h-3 text-white fill-white drop-shadow" />
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                if (direct) {
                                                    return (
                                                        <>
                                                            <video
                                                                src={vUrl}
                                                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                                muted
                                                                playsInline
                                                                preload="metadata"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                <Play className="w-3 h-3 text-white fill-white drop-shadow" />
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                if (vUrl) {
                                                    return (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Play className="w-6 h-6 text-primary/50" />
                                                            <span className="sr-only">Video URL set</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Video URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.videoUrl ?? ""}
                                        onChange={(e) =>
                                            updateField("videoUrl", e.target.value)
                                        }
                                        placeholder="https://youtube.com/... or direct video link"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    <p className="text-xs text-muted mt-1">
                                        Link that opens when the reel is clicked to play the video.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border/30">
                                <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                    Cancel
                                </Dialog.Close>
                                <button
                                    onClick={handleSave}
                                    disabled={
                                        !formData.title.trim() ||
                                        !formData.slug.trim() ||
                                        saving
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {saving && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    {editingReel ? "Save Changes" : "Create Reel"}
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Delete Confirmation Dialog */}
                <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <Dialog.Title className="text-lg font-bold text-foreground mb-2">
                                Delete Reel
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-muted leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-foreground">
                                    &ldquo;{deletingReel?.title}&rdquo;
                                </span>
                                ? This action cannot be undone.
                            </Dialog.Description>

                            <div className="flex items-center justify-end gap-3 mt-8">
                                <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                    Cancel
                                </Dialog.Close>
                                <button
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {saving && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    Delete
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </div>
    );
}
