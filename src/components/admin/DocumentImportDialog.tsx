"use client";

import { useState, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    X,
    FileText,
    Upload,
    Loader2,
    Plus,
    Minus,
    UploadCloud,
    Calendar,
    ClipboardPaste,
    CheckCircle2,
    ChevronLeft,
    Bold,
    Italic,
    List,
    ListOrdered,
    Strikethrough,
    Undo2,
    Redo2,
    Pencil,
    Eye,
    Trash2,
    ImageIcon,
} from "lucide-react";
import type { Article, ArticleSection, ArticleCategory } from "@/lib/data";

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayDisplayDate(): string {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}
function displayDateToInputValue(d: string): string {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function inputValueToDisplayDate(v: string): string {
    if (!v) return "";
    const [y, mo, d] = v.split("-").map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function parseReadMinutes(rt: string): number {
    const m = rt.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 5;
}
function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}
function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: ArticleCategory[] = [
    "Property", "Market", "Investment", "News", "Market Analysis",
    "Real Estate News", "Guides", "Home & Life", "Project Reviews", "Home Radar",
];

// ─── Parser ───────────────────────────────────────────────────────────────────
interface ParsedDoc {
    title: string;
    excerpt: string;
    sections: ArticleSection[];
    suggestedCover?: string; // First image found in the document
}

function hasHtmlTags(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
}

function parseHtml(html: string): ParsedDoc {
    const doc = new DOMParser().parseFromString(html, "text/html");
    let title = "";
    let suggestedCover = "";
    const sections: ArticleSection[] = [];
    let current: { heading: string; paragraphs: string[]; image?: string } | null = null;

    const extractImg = (el: Element): string => {
        if (el.tagName.toLowerCase() === "img") return (el as HTMLImageElement).src || el.getAttribute("src") || "";
        const img = el.querySelector("img");
        return img ? img.src || img.getAttribute("src") || "" : "";
    };

    // Determine the semantic heading level of an element:
    //   - native h1–h6 tags
    //   - Google Docs <p role="heading" aria-level="N"> format
    // Returns 0 if the element is not a heading.
    const headingLevel = (el: Element): number => {
        const tag = el.tagName.toLowerCase();
        const m = tag.match(/^h([1-6])$/);
        if (m) return parseInt(m[1], 10);
        if (el.getAttribute("role") === "heading") {
            const level = parseInt(el.getAttribute("aria-level") ?? "0", 10);
            if (level >= 1 && level <= 6) return level;
        }
        return 0;
    };

    const pushCurrentSection = () => {
        if (current && current.paragraphs.length > 0) {
            sections.push({ id: crypto.randomUUID(), ...current });
            current = null;
        }
    };

    // Google Docs wraps all content in <b id="docs-internal-guid-...">
    // Use the GUID attribute to find it regardless of how many siblings exist (e.g. <style> tags)
    const bodyEl: Element =
        doc.querySelector('[id^="docs-internal-guid-"]') ??
        (doc.body.children.length === 1 && ["b", "span"].includes(doc.body.children[0].tagName.toLowerCase())
            ? doc.body.children[0]
            : doc.body);

    for (const el of Array.from(bodyEl.children)) {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim() ?? "";
        const imgSrc = extractImg(el);
        const hLevel = headingLevel(el);

        // Track first image for cover suggestion
        if (imgSrc && !suggestedCover) suggestedCover = imgSrc;

        if (hLevel === 1 && !title) {
            // First H1 → article title
            title = text;
        } else if (hLevel === 1 || hLevel === 2 || hLevel === 3 || hLevel === 4) {
            // H2/H3/H4 → section heading; subsequent H1s also become section headings
            pushCurrentSection();
            if (current && current.paragraphs.length === 0) {
                current.heading = text;
            } else {
                current = { heading: text, paragraphs: [] };
            }
        } else if (tag === "img" || (imgSrc && !text)) {
            // Standalone image — attach to current section
            if (current && !current.image) current.image = imgSrc;
        } else if (tag === "p" || tag === "div" || tag === "li" || tag === "figure") {
            if (!current) current = { heading: "", paragraphs: [] };
            if (text) current.paragraphs.push(text);
            if (imgSrc && !current.image) current.image = imgSrc;
        }
    }

    pushCurrentSection();

    const excerpt = sections[0]?.paragraphs[0] ?? "";
    return { title, excerpt, sections, suggestedCover };
}

function parsePlainText(text: string): ParsedDoc {
    const lines = text.split("\n");
    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
    if (nonEmpty.length === 0) return { title: "", excerpt: "", sections: [] };
    const title = nonEmpty[0];
    const sections: ArticleSection[] = [];
    let current: { heading: string; paragraphs: string[] } = { heading: "", paragraphs: [] };
    for (let i = 1; i < nonEmpty.length; i++) {
        const line = nonEmpty[i];
        const isShort = line.length < 80;
        const noEndPunct = !line.endsWith(".") && !line.endsWith(",") && !line.endsWith("?") && !line.endsWith("!");
        const prevWasEmpty = i > 1 && nonEmpty[i - 1] === "";
        if (isShort && noEndPunct && prevWasEmpty) {
            if (current.paragraphs.length > 0) sections.push({ id: crypto.randomUUID(), ...current });
            current = { heading: line, paragraphs: [] };
        } else {
            current.paragraphs.push(line);
        }
    }
    if (current.paragraphs.length > 0) sections.push({ id: crypto.randomUUID(), ...current });
    return { title, excerpt: sections[0]?.paragraphs[0] ?? "", sections };
}

function parseContent(content: string): ParsedDoc {
    const trimmed = content.trim();
    if (!trimmed) return { title: "", excerpt: "", sections: [] };
    return hasHtmlTags(trimmed) ? parseHtml(trimmed) : parsePlainText(trimmed);
}

function sectionToEditorHtml(section: ArticleSection): string {
    if (section.paragraphs.length === 0) return "<p></p>";
    const first = section.paragraphs[0];
    if (first.trim().startsWith("<")) return section.paragraphs.join("");
    return section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

function editorHtmlToParagraphs(html: string): string[] {
    if (!html || html === "<p></p>") return [];
    return [html];
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ImportTab = "paste" | "upload";
type Step = "import" | "preview";
type PreviewMode = "preview" | "edit";

interface Metadata {
    slug: string;
    author: string;
    category: ArticleCategory;
    date: string;
    readTime: string;
    image: string;
    featured: boolean;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (article: Article) => void;
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarBtn({ active, onClick, title, children }: {
    active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
    return (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={title}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${active ? "bg-primary text-white" : "text-muted hover:bg-border/60 hover:text-foreground"}`}
        >
            {children}
        </button>
    );
}

// ─── Section editor (TipTap) ──────────────────────────────────────────────────
function SectionEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialHtml,
        immediatelyRender: false,
        onUpdate({ editor }) { onChange(editor.getHTML()); },
        editorProps: { attributes: { class: "outline-none min-h-[100px] text-sm text-foreground" } },
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

// ─── Section image uploader ────────────────────────────────────────────────────
function SectionImageUploader({ image, onUpload, onRemove }: {
    image?: string;
    onUpload: (file: File) => void;
    onRemove: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Section Image (optional)</label>
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
            />
            {image ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-border/50 group">
                    <img src={image} alt="Section" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => ref.current?.click()}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-foreground hover:bg-white/90 transition-colors"
                        ><UploadCloud className="w-3 h-3" /> Change</button>
                        <button type="button" onClick={onRemove}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-red-600 hover:bg-white/90 transition-colors"
                        ><X className="w-3 h-3" /> Remove</button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()}
                    className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-section-bg/40 transition-all flex items-center justify-center gap-2 text-muted text-xs"
                >
                    <ImageIcon className="w-4 h-4" /> Upload section image
                </button>
            )}
        </div>
    );
}

// ─── Edit content panel ───────────────────────────────────────────────────────
function EditContentPanel({ parsedDoc, onUpdateDoc, onUploadSectionImage }: {
    parsedDoc: ParsedDoc;
    onUpdateDoc: (doc: ParsedDoc) => void;
    onUploadSectionImage: (file: File, sectionId: string) => Promise<void>;
}) {
    const updateTitle = (title: string) => onUpdateDoc({ ...parsedDoc, title });
    const updateSectionHeading = (id: string, heading: string) =>
        onUpdateDoc({ ...parsedDoc, sections: parsedDoc.sections.map((s) => s.id === id ? { ...s, heading } : s) });
    const updateSectionContent = (id: string, html: string) =>
        onUpdateDoc({ ...parsedDoc, sections: parsedDoc.sections.map((s) => s.id === id ? { ...s, paragraphs: editorHtmlToParagraphs(html) } : s) });
    const updateSectionImage = (id: string, image: string) =>
        onUpdateDoc({ ...parsedDoc, sections: parsedDoc.sections.map((s) => s.id === id ? { ...s, image } : s) });
    const removeSection = (id: string) =>
        onUpdateDoc({ ...parsedDoc, sections: parsedDoc.sections.filter((s) => s.id !== id) });
    const addSection = () =>
        onUpdateDoc({ ...parsedDoc, sections: [...parsedDoc.sections, { id: crypto.randomUUID(), heading: "New Section", paragraphs: [""] }] });

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Title</label>
                <input type="text" value={parsedDoc.title} onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Article title"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-base font-semibold text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {parsedDoc.sections.map((section, idx) => (
                <div key={section.id} className="border border-border/60 rounded-2xl p-4 space-y-3 bg-section-bg/20">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Section {idx + 1}</span>
                        <button type="button" onClick={() => removeSection(section.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors" title="Remove section"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={section.heading} onChange={(e) => updateSectionHeading(section.id, e.target.value)}
                        placeholder="Section heading (optional)"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm font-medium text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <SectionEditor key={section.id} initialHtml={sectionToEditorHtml(section)} onChange={(html) => updateSectionContent(section.id, html)} />
                    <SectionImageUploader
                        image={section.image}
                        onUpload={(file) => onUploadSectionImage(file, section.id)}
                        onRemove={() => updateSectionImage(section.id, "")}
                    />
                </div>
            ))}

            <button type="button" onClick={addSection}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-medium text-muted hover:text-primary transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Section
            </button>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DocumentImportDialog({ open, onOpenChange, onCreated }: Props) {
    const [step, setStep] = useState<Step>("import");
    const [tab, setTab] = useState<ImportTab>("paste");

    // Import step
    const [pasteContent, setPasteContent] = useState("");
    const [clipboardHtml, setClipboardHtml] = useState(""); // captured from paste event
    const [docxFile, setDocxFile] = useState<File | null>(null);
    const [docxDragOver, setDocxDragOver] = useState(false);
    const [parsing, setParsing] = useState(false);
    const docxInputRef = useRef<HTMLInputElement>(null);

    // Preview step
    const [parsedDoc, setParsedDoc] = useState<ParsedDoc | null>(null);
    const [previewMode, setPreviewMode] = useState<PreviewMode>("preview");
    const [metadata, setMetadata] = useState<Metadata>({
        slug: "", author: "", category: "Property",
        date: todayDisplayDate(), readTime: "5 min read", image: "", featured: false,
    });
    const [imageUploading, setImageUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);

    const updateMeta = <K extends keyof Metadata>(key: K, value: Metadata[K]) =>
        setMetadata((prev) => ({ ...prev, [key]: value }));

    const resetDialog = useCallback(() => {
        setStep("import"); setTab("paste");
        setPasteContent(""); setClipboardHtml(""); setDocxFile(null);
        setParsedDoc(null); setPreviewMode("preview");
        setMetadata({ slug: "", author: "", category: "Property", date: todayDisplayDate(), readTime: "5 min read", image: "", featured: false });
    }, []);

    const handleOpenChange = useCallback((val: boolean) => {
        if (!val) resetDialog();
        onOpenChange(val);
    }, [onOpenChange, resetDialog]);

    const goToPreview = useCallback((doc: ParsedDoc) => {
        setParsedDoc(doc);
        setMetadata((prev) => ({
            ...prev,
            slug: slugify(doc.title),
            // Auto-suggest first document image as cover if none set
            image: prev.image || doc.suggestedCover || "",
        }));
        setStep("preview");
        setPreviewMode("preview");
    }, []);

    const handleParsePaste = useCallback(async () => {
        if (!pasteContent.trim() && !clipboardHtml.trim()) {
            toast.error("Please paste some content first."); return;
        }
        setParsing(true);
        try {
            // Try HTML (preserves structure + images) first, fall back to plain text
            for (const content of [clipboardHtml, pasteContent].filter(s => s.trim())) {
                const doc = parseContent(content);
                if (doc.title || doc.sections.length > 0) {
                    if (doc.suggestedCover) {
                        toast.success(`Parsed with ${doc.sections.length} sections and ${doc.sections.filter(s => s.image).length} images.`);
                    }
                    goToPreview(doc);
                    return;
                }
            }
            toast.error("Could not parse any content. Try copying the document again.");
        } finally { setParsing(false); }
    }, [pasteContent, clipboardHtml, goToPreview]);

    const handleParseDocx = useCallback(async () => {
        if (!docxFile) { toast.error("Please select a .docx file first."); return; }
        setParsing(true);
        const toastId = toast.loading("Parsing document and uploading images…");
        try {
            const body = new FormData();
            body.append("file", docxFile);
            const res = await fetch("/api/articles/parse", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Parse failed");
            toast.dismiss(toastId);
            const doc = parseContent(data.html);
            if (!doc.title && doc.sections.length === 0) {
                toast.error("Could not extract content from the document."); return;
            }
            const imgCount = doc.sections.filter(s => s.image).length + (doc.suggestedCover ? 1 : 0);
            if (imgCount > 0) toast.success(`Parsed with ${doc.sections.length} sections and images extracted.`);
            goToPreview(doc);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to parse document.", { id: toastId });
        } finally { setParsing(false); }
    }, [docxFile, goToPreview]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDocxDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".docx")) setDocxFile(file);
        else toast.error("Please drop a .docx file.");
    }, []);

    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        const toastId = toast.loading("Uploading image…");
        try {
            const body = new FormData();
            body.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Upload failed");
            toast.success("Image uploaded.", { id: toastId });
            return data.url as string;
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Image upload failed.", { id: toastId });
            return null;
        }
    }, []);

    const handleCoverUpload = useCallback(async (file: File) => {
        setImageUploading(true);
        const url = await uploadImage(file);
        if (url) updateMeta("image", url);
        setImageUploading(false);
    }, [uploadImage]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSectionImageUpload = useCallback(async (file: File, sectionId: string) => {
        const url = await uploadImage(file);
        if (url && parsedDoc) {
            setParsedDoc({ ...parsedDoc, sections: parsedDoc.sections.map((s) => s.id === sectionId ? { ...s, image: url } : s) });
        }
    }, [uploadImage, parsedDoc]);

    const handlePublish = useCallback(async () => {
        if (!parsedDoc || saving) return;
        if (!parsedDoc.title.trim() || !metadata.slug.trim()) {
            toast.error("Title and slug are required."); return;
        }
        setSaving(true);
        try {
            const createRes = await fetch("/api/articles", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: parsedDoc.title, slug: metadata.slug, excerpt: parsedDoc.excerpt,
                    category: metadata.category, author: metadata.author, date: metadata.date,
                    readTime: metadata.readTime, image: metadata.image, featured: metadata.featured,
                }),
            });
            if (!createRes.ok) { const err = await createRes.json().catch(() => ({})); throw new Error(err.error ?? "Failed to create article"); }
            const created = await createRes.json();
            if (parsedDoc.sections.length > 0) {
                const patchRes = await fetch(`/api/articles/${created.id}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sections: parsedDoc.sections }),
                });
                onCreated(patchRes.ok ? await patchRes.json() : created);
            } else { onCreated(created); }
            toast.success(`"${parsedDoc.title}" published successfully.`);
            handleOpenChange(false);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to publish article.");
        } finally { setSaving(false); }
    }, [parsedDoc, metadata, saving, onCreated, handleOpenChange]);

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                <Dialog.Content className="fixed top-[4vh] left-1/2 -translate-x-1/2 z-50 w-[98vw] max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-xl overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                    <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            {step === "preview" && (
                                <button onClick={() => setStep("import")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                            <div>
                                <Dialog.Title className="text-lg font-bold text-foreground">
                                    {step === "import" ? "Import from Document" : "Preview & Publish"}
                                </Dialog.Title>
                                <p className="text-xs text-muted mt-0.5">
                                    {step === "import" ? "Paste content or upload a .docx file — images included automatically" : "Review, edit content, and fill in metadata"}
                                </p>
                            </div>
                        </div>
                        <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-bg transition-colors">
                            <X className="w-4 h-4" />
                        </Dialog.Close>
                    </div>

                    {step === "import" ? (
                        <ImportStep
                            tab={tab} setTab={setTab}
                            pasteContent={pasteContent} setPasteContent={setPasteContent}
                            onPasteCapture={(html) => setClipboardHtml(html)}
                            clipboardHasImages={hasHtmlImages(clipboardHtml)}
                            docxFile={docxFile} setDocxFile={setDocxFile}
                            docxDragOver={docxDragOver} setDocxDragOver={setDocxDragOver}
                            docxInputRef={docxInputRef} parsing={parsing}
                            onParsePaste={handleParsePaste} onParseDocx={handleParseDocx}
                            onDrop={handleDrop}
                        />
                    ) : (
                        <PreviewStep
                            parsedDoc={parsedDoc!} onUpdateDoc={setParsedDoc}
                            previewMode={previewMode} setPreviewMode={setPreviewMode}
                            metadata={metadata} updateMeta={updateMeta}
                            imageUploading={imageUploading} imageInputRef={imageInputRef}
                            onUploadCover={handleCoverUpload}
                            onUploadSectionImage={handleSectionImageUpload}
                            saving={saving} onPublish={handlePublish}
                        />
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function hasHtmlImages(html: string): boolean {
    return /<img\s/i.test(html);
}

// ─── Import Step ──────────────────────────────────────────────────────────────
function ImportStep({
    tab, setTab, pasteContent, setPasteContent, onPasteCapture, clipboardHasImages,
    docxFile, setDocxFile, docxDragOver, setDocxDragOver, docxInputRef,
    parsing, onParsePaste, onParseDocx, onDrop,
}: {
    tab: ImportTab; setTab: (t: ImportTab) => void;
    pasteContent: string; setPasteContent: (v: string) => void;
    onPasteCapture: (html: string) => void;
    clipboardHasImages: boolean;
    docxFile: File | null; setDocxFile: (f: File | null) => void;
    docxDragOver: boolean; setDocxDragOver: (v: boolean) => void;
    docxInputRef: React.RefObject<HTMLInputElement | null>;
    parsing: boolean; onParsePaste: () => void; onParseDocx: () => void;
    onDrop: (e: React.DragEvent) => void;
}) {
    return (
        <div className="p-6 space-y-5">
            <div className="flex gap-1 bg-section-bg/60 p-1 rounded-xl w-fit">
                {(["paste", "upload"] as ImportTab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
                    >
                        {t === "paste" ? <ClipboardPaste className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {t === "paste" ? "Paste Content" : "Upload .docx"}
                    </button>
                ))}
            </div>

            {tab === "paste" ? (
                <div className="space-y-4">
                    <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-primary">How to copy from Google Docs</p>
                            <ol className="text-muted space-y-0.5 list-decimal list-inside">
                                <li>Open your Google Doc (with text <em>and</em> images)</li>
                                <li>Press <kbd className="px-1 py-0.5 bg-white border border-border rounded text-xs">Ctrl+A</kbd> to select all</li>
                                <li>Press <kbd className="px-1 py-0.5 bg-white border border-border rounded text-xs">Ctrl+C</kbd> to copy</li>
                                <li>Click in the box below and press <kbd className="px-1 py-0.5 bg-white border border-border rounded text-xs">Ctrl+V</kbd></li>
                            </ol>
                        </div>
                    </div>

                    {/* Image detected badge */}
                    {clipboardHasImages && (
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                            Images detected in clipboard — they will be imported automatically.
                        </div>
                    )}

                    <textarea value={pasteContent} onChange={(e) => setPasteContent(e.target.value)}
                        onPaste={(e) => {
                            // Capture HTML version to preserve images and formatting
                            const html = e.clipboardData?.getData("text/html") ?? "";
                            if (html) onPasteCapture(html);
                        }}
                        placeholder="Paste your document content here…" rows={14}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted">
                            {pasteContent.trim() ? `${pasteContent.trim().split(/\s+/).length} words` : "No content yet"}
                        </p>
                        <button onClick={onParsePaste} disabled={!pasteContent.trim() || parsing}
                            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Parse Document
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <Upload className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-primary">How to export from Google Docs</p>
                            <ol className="text-muted space-y-0.5 list-decimal list-inside">
                                <li>Open your Google Doc</li>
                                <li>Click <strong>File</strong> → <strong>Download</strong> → <strong>Microsoft Word (.docx)</strong></li>
                                <li>Drop or select the downloaded file below</li>
                            </ol>
                            <p className="text-green-700 font-medium mt-1 flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" /> Embedded images are extracted and uploaded automatically.
                            </p>
                        </div>
                    </div>
                    <input ref={docxInputRef} type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setDocxFile(f); e.target.value = ""; }}
                    />
                    <div onDragOver={(e) => { e.preventDefault(); setDocxDragOver(true); }}
                        onDragLeave={() => setDocxDragOver(false)} onDrop={onDrop}
                        onClick={() => docxInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-3 h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all ${docxDragOver ? "border-primary bg-primary/5" : docxFile ? "border-green-400 bg-green-50" : "border-border hover:border-primary/50 hover:bg-section-bg/40"}`}
                    >
                        {docxFile ? (
                            <>
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">{docxFile.name}</p>
                                    <p className="text-xs text-muted mt-1">{(docxFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setDocxFile(null); }}
                                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-border text-muted hover:text-red-500 transition-colors"
                                ><X className="w-3.5 h-3.5" /></button>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-muted-light" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">Drop your .docx file here</p>
                                    <p className="text-xs text-muted mt-1">or click to browse</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={onParseDocx} disabled={!docxFile || parsing}
                            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Parse Document
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Preview Step ─────────────────────────────────────────────────────────────
function PreviewStep({
    parsedDoc, onUpdateDoc, previewMode, setPreviewMode,
    metadata, updateMeta, imageUploading, imageInputRef, onUploadCover,
    onUploadSectionImage, saving, onPublish,
}: {
    parsedDoc: ParsedDoc;
    onUpdateDoc: (doc: ParsedDoc) => void;
    previewMode: PreviewMode;
    setPreviewMode: (m: PreviewMode) => void;
    metadata: Metadata;
    updateMeta: <K extends keyof Metadata>(key: K, value: Metadata[K]) => void;
    imageUploading: boolean;
    imageInputRef: React.RefObject<HTMLInputElement | null>;
    onUploadCover: (file: File) => void;
    onUploadSectionImage: (file: File, sectionId: string) => Promise<void>;
    saving: boolean;
    onPublish: () => void;
}) {
    const totalImages = parsedDoc.sections.filter(s => s.image).length + (metadata.image ? 1 : 0);

    return (
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            {/* Left: Metadata */}
            <div className="lg:w-[380px] shrink-0 p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Article Metadata</h3>

                <div>
                    <label className="block text-xs font-medium text-muted mb-1">Title (from document)</label>
                    <p className="text-sm font-semibold text-foreground bg-section-bg/50 px-3 py-2.5 rounded-xl truncate">
                        {parsedDoc.title || <span className="text-muted-light italic font-normal">No title detected</span>}
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Slug <span className="text-red-400">*</span></label>
                    <input type="text" value={metadata.slug}
                        onChange={(e) => updateMeta("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
                        placeholder="article-url-slug"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Author</label>
                    <input type="text" value={metadata.author} onChange={(e) => updateMeta("author", e.target.value)} placeholder="Author name"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
                    <select value={metadata.category} onChange={(e) => updateMeta("category", e.target.value as ArticleCategory)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light pointer-events-none z-10" />
                            <input type="date" value={displayDateToInputValue(metadata.date)} onChange={(e) => updateMeta("date", inputValueToDisplayDate(e.target.value))}
                                className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-border bg-white text-xs text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">Read Time</label>
                        <div className="flex items-center gap-1 px-2 py-2 rounded-xl border border-border bg-white">
                            <button type="button" onClick={() => { const m = Math.max(1, parseReadMinutes(metadata.readTime) - 1); updateMeta("readTime", `${m} min read`); }} className="w-6 h-6 flex items-center justify-center rounded-md bg-muted/60 hover:bg-muted transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="flex-1 text-center text-xs font-medium text-foreground">{parseReadMinutes(metadata.readTime)} min</span>
                            <button type="button" onClick={() => { const m = Math.min(60, parseReadMinutes(metadata.readTime) + 1); updateMeta("readTime", `${m} min read`); }} className="w-6 h-6 flex items-center justify-center rounded-md bg-muted/60 hover:bg-muted transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Cover Image</label>
                    <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadCover(f); e.target.value = ""; }}
                    />
                    {metadata.image ? (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-border/50 group">
                            <img src={metadata.image} alt="Cover preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-foreground hover:bg-white/90 transition-colors"><UploadCloud className="w-3 h-3" /> Change</button>
                                <button type="button" onClick={() => updateMeta("image", "")} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-red-600 hover:bg-white/90 transition-colors"><X className="w-3 h-3" /> Remove</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                            className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-section-bg/40 transition-all flex flex-col items-center justify-center gap-1.5 text-muted disabled:opacity-50"
                        >
                            {imageUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <><UploadCloud className="w-5 h-5" /><span className="text-xs">Upload cover image</span></>}
                        </button>
                    )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" checked={metadata.featured} onChange={(e) => updateMeta("featured", e.target.checked)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full transition-colors ${metadata.featured ? "bg-primary" : "bg-muted/40"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${metadata.featured ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">Mark as featured</span>
                </label>

                <div className="bg-section-bg/60 rounded-xl p-3 text-xs text-muted">
                    <span className="font-medium text-foreground">{parsedDoc.sections.length}</span> sections
                    &nbsp;&middot;&nbsp;
                    <span className="font-medium text-foreground">{totalImages}</span> image{totalImages !== 1 ? "s" : ""}
                </div>

                <button onClick={onPublish} disabled={!parsedDoc.title.trim() || !metadata.slug.trim() || saving}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? "Publishing…" : "Publish Article"}
                </button>
            </div>

            {/* Right: Preview / Edit */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-section-bg/20 shrink-0">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">
                        {previewMode === "preview" ? "Article Preview" : "Edit Content"}
                    </h3>
                    <div className="flex gap-1 bg-white border border-border/50 p-0.5 rounded-lg">
                        <button onClick={() => setPreviewMode("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewMode === "preview" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button onClick={() => setPreviewMode("edit")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewMode === "edit" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {previewMode === "edit" ? (
                        <EditContentPanel parsedDoc={parsedDoc} onUpdateDoc={onUpdateDoc} onUploadSectionImage={onUploadSectionImage} />
                    ) : (
                        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border/50 shadow-sm p-6 sm:p-8 space-y-6">
                            {metadata.image && (
                                <div className="w-full h-48 rounded-xl overflow-hidden">
                                    <img src={metadata.image} alt="Cover" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{metadata.category}</span>
                                {metadata.date && <span>{metadata.date}</span>}
                                {metadata.readTime && <span>{metadata.readTime}</span>}
                                {metadata.author && <span>by {metadata.author}</span>}
                            </div>
                            <h1 className="text-2xl font-bold text-foreground leading-tight">
                                {parsedDoc.title || <span className="text-muted-light italic font-normal">No title</span>}
                            </h1>
                            {parsedDoc.excerpt && (
                                <p className="text-base text-muted leading-relaxed border-l-4 border-primary/30 pl-4 italic">{parsedDoc.excerpt}</p>
                            )}
                            {parsedDoc.sections.map((section, i) => (
                                <div key={section.id} className="space-y-3">
                                    {section.heading && <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>}
                                    {section.paragraphs.map((p, j) => {
                                        if (i === 0 && j === 0 && !section.heading) return null;
                                        return p.trim().startsWith("<") ? (
                                            <div key={j}
                                                className="text-sm text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_s]:line-through [&_p]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic"
                                                dangerouslySetInnerHTML={{ __html: p }}
                                            />
                                        ) : (
                                            <p key={j} className="text-sm text-foreground leading-relaxed">{p}</p>
                                        );
                                    })}
                                    {section.image && (
                                        <div className="w-full rounded-xl overflow-hidden">
                                            <img src={section.image} alt={section.heading || "Section image"} className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {parsedDoc.sections.length === 0 && (
                                <p className="text-sm text-muted-light italic">No sections were parsed.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
