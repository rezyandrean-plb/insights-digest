"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
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
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    AlignLeft,
    Heading2,
    Loader2,
    Check,
    AlertCircle,
    UploadCloud,
    X,
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Undo2,
    Redo2,
    GalleryHorizontalEnd,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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

function paragraphsToHtml(paragraphs: string[]): string {
    if (!paragraphs.length) return "";
    return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

function htmlToParagraphs(html: string): string[] {
    const div = document.createElement("div");
    div.innerHTML = html;
    const paras: string[] = [];
    div.querySelectorAll("p").forEach((p) => {
        const text = p.textContent?.trim();
        if (text) paras.push(p.innerHTML);
    });
    return paras.length > 0 ? paras : [""];
}

function ToolbarBtn({ active, onClick, title, children }: {
    active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                active ? "bg-primary text-white" : "text-muted hover:bg-border/60 hover:text-foreground"
            }`}
        >
            {children}
        </button>
    );
}

function RichTextEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialHtml,
        immediatelyRender: false,
        onUpdate({ editor }) { onChange(editor.getHTML()); },
        editorProps: { attributes: { class: "outline-none min-h-[120px] text-sm text-foreground" } },
    });
    if (!editor) return null;
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-section-bg/40 flex-wrap">
                <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
                <div className="w-px h-5 bg-border/60 mx-1" />
                <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
                <div className="w-px h-5 bg-border/60 mx-1" />
                <ToolbarBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="w-3.5 h-3.5" /></ToolbarBtn>
            </div>
            <EditorContent editor={editor}
                className="p-3 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_s]:line-through [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic"
            />
        </div>
    );
}

function SectionImagesUploader({
    images,
    onImagesChange,
}: {
    images: string[];
    onImagesChange: (imgs: string[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const upload = async (files: FileList | File[]) => {
        setUploading(true);
        setUploadError(null);
        const newUrls: string[] = [];
        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) continue;
                const form = new FormData();
                form.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: form });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Upload failed");
                newUrls.push(data.url);
            }
            onImagesChange([...images, ...newUrls]);
        } catch (e: unknown) {
            setUploadError(e instanceof Error ? e.message : "Upload failed");
            if (newUrls.length > 0) onImagesChange([...images, ...newUrls]);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (idx: number) =>
        onImagesChange(images.filter((_, i) => i !== idx));

    const moveImage = (idx: number, dir: -1 | 1) => {
        const swap = idx + dir;
        if (swap < 0 || swap >= images.length) return;
        const next = [...images];
        [next[idx], next[swap]] = [next[swap], next[idx]];
        onImagesChange(next);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files);
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) upload(e.target.files);
                    e.target.value = "";
                }}
            />

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div key={`${img}-${idx}`} className="relative group rounded-xl overflow-hidden border border-border/50 aspect-[4/3]">
                            <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                                    className="w-6 h-6 rounded bg-white/90 flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-white transition-colors"
                                    title="Move left"
                                ><ChevronLeft className="w-3.5 h-3.5" /></button>
                                <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                                    className="w-6 h-6 rounded bg-white/90 flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-white transition-colors"
                                    title="Move right"
                                ><ChevronRight className="w-3.5 h-3.5" /></button>
                                <button type="button" onClick={() => removeImage(idx)}
                                    className="w-6 h-6 rounded bg-white/90 flex items-center justify-center text-red-600 hover:bg-white transition-colors"
                                    title="Remove"
                                ><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                                {idx + 1}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`w-full py-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 text-muted ${
                    dragOver
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-section-bg/40"
                }`}
            >
                {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                    <UploadCloud className="w-5 h-5" />
                )}
                <span className="text-xs">
                    {uploading ? "Uploading…" : images.length > 0 ? "Add more images" : "Click or drag images here"}
                </span>
                <span className="text-[10px] text-muted/60">JPEG, PNG, WebP, GIF · Max 5 MB each · Multiple files OK</span>
            </button>

            {uploadError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {uploadError}
                </p>
            )}
        </div>
    );
}

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

    const updateParagraphsFromHtml = (sIdx: number, html: string) =>
        setSections((prev) =>
            prev.map((s, i) =>
                i === sIdx ? { ...s, paragraphs: htmlToParagraphs(html) } : s
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

                                    {/* Images */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                            Images
                                            <span className="normal-case font-normal text-muted ml-1">(optional)</span>
                                        </label>
                                        <SectionImagesUploader
                                            images={section.images ?? (section.image ? [section.image] : [])}
                                            onImagesChange={(imgs) => updateSection(sIdx, { images: imgs, image: imgs[0] ?? "" })}
                                        />
                                        {(section.images ?? (section.image ? [section.image] : [])).length > 1 && (
                                            <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={section.imagesCarousel ?? false}
                                                        onChange={(e) => updateSection(sIdx, { imagesCarousel: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-9 h-5 rounded-full transition-colors ${section.imagesCarousel ? "bg-primary" : "bg-muted/40"}`}>
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${section.imagesCarousel ? "translate-x-4" : "translate-x-0.5"}`} />
                                                    </div>
                                                </div>
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                    <GalleryHorizontalEnd className="w-3.5 h-3.5 text-primary" />
                                                    Scrollable carousel
                                                </span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                                            <AlignLeft className="w-3.5 h-3.5 text-primary" />
                                            Content
                                        </label>
                                        <RichTextEditor
                                            key={section.id}
                                            initialHtml={paragraphsToHtml(section.paragraphs)}
                                            onChange={(html) => updateParagraphsFromHtml(sIdx, html)}
                                        />
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
