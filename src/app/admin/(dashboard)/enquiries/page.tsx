"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
    Mail,
    X,
    Loader2,
    ChevronRight,
    User,
    Building2,
    Phone,
    FileText,
    CheckCircle2,
    Circle,
    Archive,
    MessageSquare,
} from "lucide-react";
import type { EnquiryListItem } from "@/app/api/admin/enquiries/route";

const STATUS_OPTIONS = [
    { value: "new", label: "New", icon: Circle, color: "bg-amber-100 text-amber-800" },
    { value: "read", label: "Read", icon: CheckCircle2, color: "bg-blue-100 text-blue-800" },
    { value: "replied", label: "Replied", icon: MessageSquare, color: "bg-emerald-100 text-emerald-800" },
    { value: "archived", label: "Archived", icon: Archive, color: "bg-slate-100 text-slate-600" },
] as const;

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatusBadge({ status }: { status: string }) {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
    const Icon = opt.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}
        >
            <Icon className="w-3 h-3" />
            {opt.label}
        </span>
    );
}

export default function AdminEnquiriesPage() {
    const [list, setList] = useState<EnquiryListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryListItem | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const url =
                statusFilter !== "all"
                    ? `/api/admin/enquiries?status=${encodeURIComponent(statusFilter)}`
                    : "/api/admin/enquiries";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setList(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load enquiries.");
            setList([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchEnquiries();
    }, [fetchEnquiries]);

    const openDetail = useCallback((enquiry: EnquiryListItem) => {
        setSelectedEnquiry(enquiry);
        setDetailOpen(true);
    }, []);

    const updateStatus = useCallback(
        async (id: number, status: string) => {
            setUpdatingStatus(true);
            try {
                const res = await fetch(`/api/admin/enquiries/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error ?? "Update failed");
                }
                toast.success("Status updated.");
                setSelectedEnquiry((prev) => (prev ? { ...prev, status } : null));
                fetchEnquiries();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to update status.");
            } finally {
                setUpdatingStatus(false);
            }
        },
        [fetchEnquiries]
    );

    return (
        <div className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Enquiries
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        Contact form submissions from the Work With Us page. Update status as you process them.
                    </p>
                </motion.div>

                {/* Status filter tabs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.08 }}
                    className="flex flex-wrap gap-2 mb-6"
                >
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === "all"
                                ? "bg-primary text-white"
                                : "bg-section-bg text-muted hover:text-foreground"
                        }`}
                    >
                        All
                    </button>
                    {STATUS_OPTIONS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === value
                                    ? "bg-primary text-white"
                                    : "bg-section-bg text-muted hover:text-foreground"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
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
                            <span>Loading enquiries…</span>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted">
                            <Mail className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm font-medium">No enquiries found</p>
                            <p className="text-xs mt-0.5">
                                {statusFilter !== "all"
                                    ? `No enquiries with status "${statusFilter}".`
                                    : "Submissions from /contact will appear here."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border/50">
                            {list.map((enquiry) => (
                                <li key={enquiry.id}>
                                    <button
                                        type="button"
                                        onClick={() => openDetail(enquiry)}
                                        className="w-full flex items-center gap-4 px-4 sm:px-6 py-4 text-left hover:bg-section-bg/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {enquiry.fullName}
                                            </p>
                                            <p className="text-sm text-muted truncate">
                                                {enquiry.email}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-3">
                                            <span className="text-xs text-muted hidden sm:block">
                                                {formatDate(enquiry.createdAt)}
                                            </span>
                                            <StatusBadge status={enquiry.status} />
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
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-border/50 shadow-xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        {selectedEnquiry && (
                            <>
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                    <Dialog.Title asChild>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Enquiry from {selectedEnquiry.fullName}
                                        </h2>
                                    </Dialog.Title>
                                    <Dialog.Close className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-section-bg">
                                        <X className="w-5 h-5" />
                                    </Dialog.Close>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <StatusBadge status={selectedEnquiry.status} />
                                        <span className="text-xs text-muted">
                                            {formatDate(selectedEnquiry.createdAt)}
                                        </span>
                                    </div>
                                    <div className="grid gap-3 text-sm">
                                        <div className="flex gap-3">
                                            <User className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-muted">Full name</p>
                                                <p className="font-medium">{selectedEnquiry.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Mail className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-muted">Email</p>
                                                <a
                                                    href={`mailto:${selectedEnquiry.email}`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {selectedEnquiry.email}
                                                </a>
                                            </div>
                                        </div>
                                        {selectedEnquiry.contactNumber && (
                                            <div className="flex gap-3">
                                                <Phone className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-muted">Contact number</p>
                                                    <p className="font-medium">{selectedEnquiry.contactNumber}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedEnquiry.company && (
                                            <div className="flex gap-3">
                                                <Building2 className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-muted">Company</p>
                                                    <p className="font-medium">{selectedEnquiry.company}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <FileText className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-muted">Enquiry type</p>
                                                <p className="font-medium">{selectedEnquiry.enquiryAbout}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {[
                                        { label: "Context / inquiry", value: selectedEnquiry.inquiryContext },
                                        { label: "Looking to achieve", value: selectedEnquiry.lookingToAchieve },
                                        { label: "Project timeline", value: selectedEnquiry.projectTimeline },
                                        { label: "Estimated budget", value: selectedEnquiry.estimatedBudget },
                                        { label: "Stage", value: selectedEnquiry.stage },
                                        { label: "Property type", value: selectedEnquiry.propertyType },
                                        { label: "Describe situation", value: selectedEnquiry.describeSituation },
                                    ].filter((f) => f.value?.trim()).map(({ label, value }) => (
                                        <div key={label} className="border-t border-border/40 pt-3">
                                            <p className="text-xs text-muted mb-1">{label}</p>
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-4 border-t border-border/50 flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-medium text-muted mr-2 flex items-center gap-1.5">
                                        Update status
                                        {updatingStatus && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                        )}
                                    </span>
                                    {STATUS_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            disabled={updatingStatus || selectedEnquiry.status === value}
                                            onClick={() => updateStatus(selectedEnquiry.id, value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                                selectedEnquiry.status === value
                                                    ? "bg-primary text-white cursor-default"
                                                    : "bg-section-bg text-muted hover:text-foreground hover:bg-border/50"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
