"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
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
    Clock,
    Loader2,
    AlertCircle,
    Crown,
} from "lucide-react";
import type { HomeTourItem, HomeTourCategory } from "@/lib/data";

const CATEGORIES: HomeTourCategory[] = [
    "Condo",
    "HDB",
    "Landed",
    "Apartment",
    "Commercial",
];

const ITEMS_PER_PAGE = 10;

const categoryBadgeClass: Record<HomeTourCategory, string> = {
    Condo: "bg-[#ebf5f4] text-[#2a9d8f]",
    HDB: "bg-[#e8f0fe] text-[#1a56db]",
    Landed: "bg-[#fff7ed] text-[#c2410c]",
    Apartment: "bg-[#f0e6ff] text-[#7c3aed]",
    Commercial: "bg-[#fef3e6] text-[#d97706]",
};

const emptyItem: Omit<HomeTourItem, "id"> = {
    slug: "",
    title: "",
    excerpt: "",
    image: "",
    category: "Condo",
    readTime: "",
};

export default function AdminHomeToursPage() {
    const [itemsList, setItemsList] = useState<HomeTourItem[]>([]);
    const [heroItem, setHeroItem] = useState<HomeTourItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState<HomeTourCategory | "All">("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HomeTourItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<HomeTourItem | null>(null);
    const [formData, setFormData] = useState(emptyItem);

    const fetchItems = useCallback(async () => {
        try {
            const [listRes, heroRes] = await Promise.all([
                fetch("/api/home-tours"),
                fetch("/api/home-tours/hero"),
            ]);
            if (!listRes.ok) throw new Error("Failed to fetch");
            const listData = await listRes.json();
            setItemsList(listData);
            const heroData = await heroRes.json();
            setHeroItem(heroData && heroData.id ? heroData : null);
        } catch {
            setError("Failed to load home tours from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const setHero = useCallback(
        async (itemId: string) => {
            if (!itemId || saving) return;
            setSaving(true);
            setError(null);
            try {
                const res = await fetch("/api/home-tours/hero", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: itemId }),
                });
                if (!res.ok) throw new Error("Failed to set hero");
                const item = itemsList.find((i) => i.id === itemId);
                setHeroItem(item ?? null);
                setItemsList((prev) =>
                    prev.map((i) => ({ ...i, isHero: i.id === itemId }))
                );
            } catch {
                setError("Failed to set hero. Please try again.");
            } finally {
                setSaving(false);
            }
        },
        [saving, itemsList]
    );

    const filtered = useMemo(() => {
        let result = itemsList;
        if (filterCategory !== "All") {
            result = result.filter((i) => i.category === filterCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (i) =>
                    i.title.toLowerCase().includes(q) ||
                    i.slug.toLowerCase().includes(q) ||
                    i.excerpt.toLowerCase().includes(q)
            );
        }
        return result;
    }, [itemsList, filterCategory, search]);

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
        setEditingItem(null);
        setFormData(emptyItem);
        setDialogOpen(true);
    }, []);

    const openEditDialog = useCallback((item: HomeTourItem) => {
        setEditingItem(item);
        setFormData({
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            image: item.image,
            category: item.category,
            readTime: item.readTime,
        });
        setDialogOpen(true);
    }, []);

    const openDeleteDialog = useCallback((item: HomeTourItem) => {
        setDeletingItem(item);
        setDeleteDialogOpen(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!formData.title.trim() || !formData.slug.trim() || saving) return;
        setSaving(true);
        setError(null);

        try {
            if (editingItem) {
                const res = await fetch("/api/home-tours", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingItem.id, ...formData }),
                });
                if (!res.ok) throw new Error("Update failed");
                const updated = await res.json();
                setItemsList((prev) =>
                    prev.map((i) => (i.id === editingItem.id ? updated : i))
                );
            } else {
                const res = await fetch("/api/home-tours", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Create failed");
                const created = await res.json();
                setItemsList((prev) => [created, ...prev]);
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData(emptyItem);
        } catch {
            setError(
                editingItem
                    ? "Failed to update home tour. Please try again."
                    : "Failed to create home tour. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }, [editingItem, formData, saving]);

    const handleDelete = useCallback(async () => {
        if (!deletingItem || saving) return;
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/home-tours?id=${deletingItem.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            setItemsList((prev) =>
                prev.filter((i) => i.id !== deletingItem.id)
            );
            setDeleteDialogOpen(false);
            setDeletingItem(null);
            if (paginated.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
            }
        } catch {
            setError("Failed to delete home tour. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [deletingItem, saving, paginated.length, currentPage]);

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
                        <span className="text-sm">Loading home tours...</span>
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
                            Manage Home Tours
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            {itemsList.length} tours total &middot;{" "}
                            {CATEGORIES.map(
                                (c) =>
                                    `${itemsList.filter((i) => i.category === c).length} ${c}`
                            ).join(", ")}
                        </p>
                    </div>
                    <button
                        onClick={openCreateDialog}
                        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Home Tour
                    </button>
                </div>

                {/* Hero card - manage hero content for /all-home-tour-series */}
                <div className="mb-8 rounded-2xl border border-border/50 bg-white p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-purple-600" />
                        </div>
                        <h2 className="text-base font-bold text-foreground">
                            Page Hero
                        </h2>
                    </div>
                    <p className="text-sm text-muted mb-4">
                        This item is shown in the hero section on the Home Tour Series page. Choose an item below to set as hero.
                    </p>
                    {heroItem ? (
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                            <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-section-bg">
                                {heroItem.image ? (
                                    <img
                                        src={heroItem.image}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-muted-light" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                    {heroItem.title}
                                </p>
                                <p className="text-xs text-muted mt-0.5 line-clamp-2">
                                    {heroItem.excerpt}
                                </p>
                            </div>
                            <div className="w-full sm:w-56 shrink-0">
                                <label className="block text-xs font-medium text-muted mb-1.5">
                                    Change hero
                                </label>
                                <select
                                    value={heroItem.id}
                                    onChange={(e) => setHero(e.target.value)}
                                    disabled={saving}
                                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                                >
                                    {itemsList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.title.length > 50
                                                ? item.title.slice(0, 47) + "..."
                                                : item.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            <p className="text-sm text-muted">
                                No hero set. Select an item to display in the hero section.
                            </p>
                            <select
                                value=""
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v) setHero(v);
                                }}
                                disabled={saving || itemsList.length === 0}
                                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                            >
                                <option value="">Select item as hero...</option>
                                {itemsList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.title.length > 55
                                            ? item.title.slice(0, 52) + "..."
                                            : item.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by title, slug, or excerpt..."
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
                            setFilterCategory(e.target.value as HomeTourCategory | "All");
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
                                        Home Tour
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden lg:table-cell w-[120px]">
                                        Read Time
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
                                                No home tours found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, idx) => (
                                            <motion.tr
                                                key={item.id}
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
                                                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-section-bg">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ImageIcon className="w-4 h-4 text-muted-light" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate max-w-[240px] lg:max-w-[380px]">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-xs text-muted truncate max-w-[240px] lg:max-w-[380px]">
                                                                {item.excerpt}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell">
                                                    <span
                                                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${categoryBadgeClass[item.category]}`}
                                                    >
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 hidden lg:table-cell">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                                                        <Clock className="w-3 h-3" />
                                                        {item.readTime}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href="/all-home-tour-series"
                                                            target="_blank"
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditDialog(item)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(item)}
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
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <div className="flex items-center justify-between mb-6">
                                <Dialog.Title className="text-xl font-bold text-foreground">
                                    {editingItem ? "Edit Home Tour" : "New Home Tour"}
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
                                        placeholder="Home tour title"
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
                                        placeholder="home-tour-slug"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Excerpt
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => updateField("excerpt", e.target.value)}
                                        placeholder="Brief description of the home tour..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
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
                                                    e.target.value as HomeTourCategory
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
                                            Read Time
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.readTime}
                                            onChange={(e) =>
                                                updateField("readTime", e.target.value)
                                            }
                                            placeholder="5 mins read"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => updateField("image", e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    {formData.image && (
                                        <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-border/50">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}
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
                                    {editingItem ? "Save Changes" : "Create Tour"}
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
                                Delete Home Tour
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-muted leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-foreground">
                                    &ldquo;{deletingItem?.title}&rdquo;
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
