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
    Star,
    Eye,
    ImageIcon,
    Loader2,
    AlertCircle,
    Crown,
} from "lucide-react";
import type { Article, ArticleCategory } from "@/lib/data";

const CATEGORIES: ArticleCategory[] = [
    "Property",
    "Market",
    "Investment",
    "News",
    "Market Analysis",
    "Real Estate News",
    "Guides",
    "Housing & Life",
    "Project Reviews",
    "Home Decor",
];

const ITEMS_PER_PAGE = 10;

const categoryBadgeClass: Record<string, string> = {
    Property: "bg-[#ebf5f4] text-[#2a9d8f]",
    Market: "bg-[#fef3e6] text-[#e76f51]",
    Investment: "bg-[#eef0f5] text-[#264653]",
    News: "bg-[#f0e6ff] text-[#7c3aed]",
    "Market Analysis": "bg-[#e8f0fe] text-[#1a56db]",
    "Real Estate News": "bg-[#fef3e6] text-[#d97706]",
    Guides: "bg-[#ecfdf5] text-[#059669]",
    "Housing & Life": "bg-[#fdf2f8] text-[#db2777]",
    "Project Reviews": "bg-[#f0f4ff] text-[#4338ca]",
    "Home Decor": "bg-[#fff7ed] text-[#c2410c]",
};

const emptyArticle: Omit<Article, "id"> = {
    slug: "",
    title: "",
    excerpt: "",
    category: "Property",
    image: "",
    author: "",
    date: "",
    readTime: "",
    featured: false,
};

export default function AdminArticlesPage() {
    const [articlesList, setArticlesList] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState<ArticleCategory | "All">("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [heroDialogOpen, setHeroDialogOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
    const [heroCandidate, setHeroCandidate] = useState<Article | null>(null);
    const [formData, setFormData] = useState(emptyArticle);

    const fetchArticles = useCallback(async () => {
        try {
            const res = await fetch("/api/articles");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setArticlesList(data);
        } catch {
            setError("Failed to load articles from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const filtered = useMemo(() => {
        let result = articlesList;
        if (filterCategory !== "All") {
            result = result.filter((a) => a.category === filterCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.author.toLowerCase().includes(q) ||
                    a.slug.toLowerCase().includes(q)
            );
        }
        return result;
    }, [articlesList, filterCategory, search]);

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
        setEditingArticle(null);
        setFormData(emptyArticle);
        setDialogOpen(true);
    }, []);

    const openEditDialog = useCallback((article: Article) => {
        setEditingArticle(article);
        setFormData({
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            image: article.image,
            author: article.author,
            date: article.date,
            readTime: article.readTime,
            featured: article.featured,
        });
        setDialogOpen(true);
    }, []);

    const openDeleteDialog = useCallback((article: Article) => {
        setDeletingArticle(article);
        setDeleteDialogOpen(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!formData.title.trim() || !formData.slug.trim() || saving) return;
        setSaving(true);
        setError(null);

        try {
            if (editingArticle) {
                const res = await fetch("/api/articles", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingArticle.id, ...formData }),
                });
                if (!res.ok) throw new Error("Update failed");
                const updated = await res.json();
                setArticlesList((prev) =>
                    prev.map((a) => (a.id === editingArticle.id ? updated : a))
                );
            } else {
                const res = await fetch("/api/articles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Create failed");
                const created = await res.json();
                setArticlesList((prev) => [created, ...prev]);
            }
            setDialogOpen(false);
            setEditingArticle(null);
            setFormData(emptyArticle);
        } catch {
            setError(
                editingArticle
                    ? "Failed to update article. Please try again."
                    : "Failed to create article. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }, [editingArticle, formData, saving]);

    const handleDelete = useCallback(async () => {
        if (!deletingArticle || saving) return;
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/articles?id=${deletingArticle.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            setArticlesList((prev) =>
                prev.filter((a) => a.id !== deletingArticle.id)
            );
            setDeleteDialogOpen(false);
            setDeletingArticle(null);
            if (paginated.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
            }
        } catch {
            setError("Failed to delete article. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [deletingArticle, saving, paginated.length, currentPage]);

    const toggleFeatured = useCallback(
        async (article: Article) => {
            setError(null);
            try {
                const res = await fetch("/api/articles", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: article.id,
                        slug: article.slug,
                        title: article.title,
                        excerpt: article.excerpt,
                        category: article.category,
                        image: article.image,
                        author: article.author,
                        date: article.date,
                        readTime: article.readTime,
                        featured: !article.featured,
                    }),
                });
                if (!res.ok) throw new Error("Toggle failed");
                const updated = await res.json();
                setArticlesList((prev) =>
                    prev.map((a) => (a.id === article.id ? updated : a))
                );
            } catch {
                setError("Failed to toggle featured status.");
            }
        },
        []
    );

    const openHeroDialog = useCallback((article: Article) => {
        setHeroCandidate(article);
        setHeroDialogOpen(true);
    }, []);

    const confirmSetHero = useCallback(async () => {
        if (!heroCandidate || saving) return;
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/articles/hero", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: heroCandidate.id }),
            });
            if (!res.ok) throw new Error("Failed to set hero");

            setArticlesList((prev) =>
                prev.map((a) => ({
                    ...a,
                    isHero: a.id === heroCandidate.id,
                }))
            );
            setHeroDialogOpen(false);
            setHeroCandidate(null);
        } catch {
            setError("Failed to set hero article. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [heroCandidate, saving]);

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
                        <span className="text-sm">Loading articles...</span>
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
                            Manage Articles
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            {articlesList.length} articles total &middot;{" "}
                            {articlesList.filter((a) => a.featured).length} featured
                        </p>
                    </div>
                    <button
                        onClick={openCreateDialog}
                        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Article
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or slug..."
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
                            setFilterCategory(e.target.value as ArticleCategory | "All");
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
                                        Article
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden lg:table-cell">
                                        Author
                                    </th>
                                    <th className="text-left py-3.5 px-4 font-semibold text-secondary hidden lg:table-cell">
                                        Date
                                    </th>
                                    <th className="text-center py-3.5 px-4 font-semibold text-secondary w-[80px]">
                                        Featured
                                    </th>
                                    <th className="text-center py-3.5 px-4 font-semibold text-secondary w-[80px]">
                                        Hero
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
                                                colSpan={8}
                                                className="text-center py-16 text-muted"
                                            >
                                                No articles found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((article, idx) => (
                                            <motion.tr
                                                key={article.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="border-b border-border/30 last:border-0 hover:bg-section-bg/30 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-muted text-xs">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE +
                                                        idx +
                                                        1}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-section-bg">
                                                            {article.image ? (
                                                                <img
                                                                    src={article.image}
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
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-foreground truncate max-w-[250px] lg:max-w-[320px]">
                                                                    {article.title}
                                                                </p>
                                                                {article.isHero && (
                                                                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                                                                        <Crown className="w-2.5 h-2.5" />
                                                                        Hero
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted truncate max-w-[280px] lg:max-w-[360px]">
                                                                /{article.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell">
                                                    <span
                                                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                                                            categoryBadgeClass[
                                                                article.category
                                                            ] || "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {article.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-muted hidden lg:table-cell">
                                                    {article.author}
                                                </td>
                                                <td className="py-3 px-4 text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                                                    {article.date}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            toggleFeatured(article)
                                                        }
                                                        className="inline-flex items-center justify-center"
                                                        title="Toggle featured"
                                                    >
                                                        <Star
                                                            className={`w-4 h-4 transition-colors ${
                                                                article.featured
                                                                    ? "text-amber-400 fill-amber-400"
                                                                    : "text-muted-light"
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            if (!article.isHero)
                                                                openHeroDialog(article);
                                                        }}
                                                        className={`inline-flex items-center justify-center ${
                                                            article.isHero
                                                                ? "cursor-default"
                                                                : "cursor-pointer"
                                                        }`}
                                                        title={
                                                            article.isHero
                                                                ? "Current hero article"
                                                                : "Set as homepage hero"
                                                        }
                                                    >
                                                        <Crown
                                                            className={`w-4 h-4 transition-colors ${
                                                                article.isHero
                                                                    ? "text-purple-500 fill-purple-500"
                                                                    : "text-muted-light hover:text-purple-300"
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/article/${article.slug}`}
                                                            target="_blank"
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                openEditDialog(article)
                                                            }
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteDialog(article)
                                                            }
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
                                {Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    filtered.length
                                )}{" "}
                                of {filtered.length}
                            </p>
                            <div className="flex items-center gap-1 mx-auto sm:mx-0">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(1, p - 1))
                                    }
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
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1)
                                        )
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
                                    {editingArticle ? "Edit Article" : "New Article"}
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
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                        placeholder="Article title"
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
                                        placeholder="article-url-slug"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Excerpt
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) =>
                                            updateField("excerpt", e.target.value)
                                        }
                                        placeholder="Brief description of the article..."
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
                                                    e.target.value as ArticleCategory
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
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) =>
                                                updateField("author", e.target.value)
                                            }
                                            placeholder="Author name"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Date
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.date}
                                            onChange={(e) =>
                                                updateField("date", e.target.value)
                                            }
                                            placeholder="Feb 24, 2026"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
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
                                            placeholder="5 min read"
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
                                        onChange={(e) =>
                                            updateField("image", e.target.value)
                                        }
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    {formData.image && (
                                        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-border/50">
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

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured ?? false}
                                        onChange={(e) =>
                                            updateField("featured", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                                    />
                                    <span className="text-sm text-foreground">
                                        Mark as featured article
                                    </span>
                                </label>
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
                                    {editingArticle ? "Save Changes" : "Create Article"}
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Delete Confirmation Dialog */}
                <Dialog.Root
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <Dialog.Title className="text-lg font-bold text-foreground mb-2">
                                Delete Article
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-muted leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-foreground">
                                    &ldquo;{deletingArticle?.title}&rdquo;
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

                {/* Set as Hero Confirmation Dialog */}
                <Dialog.Root
                    open={heroDialogOpen}
                    onOpenChange={setHeroDialogOpen}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-purple-600" />
                                </div>
                                <Dialog.Title className="text-lg font-bold text-foreground">
                                    Set as Homepage Hero
                                </Dialog.Title>
                            </div>
                            <Dialog.Description className="text-sm text-muted leading-relaxed">
                                Set{" "}
                                <span className="font-medium text-foreground">
                                    &ldquo;{heroCandidate?.title}&rdquo;
                                </span>{" "}
                                as the main hero article on the homepage? This will replace the
                                current hero article.
                            </Dialog.Description>

                            <div className="flex items-center justify-end gap-3 mt-8">
                                <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:bg-section-bg transition-colors">
                                    Cancel
                                </Dialog.Close>
                                <button
                                    onClick={confirmSetHero}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {saving && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    Set as Hero
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </div>
    );
}
