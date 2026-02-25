"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Globe,
    Palette,
    Search as SearchIcon,
    Bell,
    Code,
    Save,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";

interface SettingsState {
    siteTitle: string;
    siteDescription: string;
    siteUrl: string;
    logoUrl: string;
    primaryColor: string;
    enableSearch: boolean;
    articlesPerPage: string;
    enableNewsletter: boolean;
    newsletterHeading: string;
    newsletterSubtext: string;
    enableNotifications: boolean;
    emailRecipient: string;
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    analyticsId: string;
    headerScript: string;
}

const BOOLEAN_KEYS: (keyof SettingsState)[] = [
    "enableSearch",
    "enableNewsletter",
    "enableNotifications",
];

function parseApiResponse(data: Record<string, string>): SettingsState {
    const parsed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (BOOLEAN_KEYS.includes(key as keyof SettingsState)) {
            parsed[key] = value === "true";
        } else {
            parsed[key] = value;
        }
    }
    return parsed as unknown as SettingsState;
}

function serializeForApi(settings: SettingsState): Record<string, string> {
    const serialized: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
        serialized[key] = String(value);
    }
    return serialized;
}

type SettingsTab = "general" | "appearance" | "newsletter" | "seo" | "advanced";

const tabs: { id: SettingsTab; label: string; icon: typeof Globe }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "newsletter", label: "Newsletter", icon: Bell },
    { id: "seo", label: "SEO & Meta", icon: SearchIcon },
    { id: "advanced", label: "Advanced", icon: Code },
];

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const [settings, setSettings] = useState<SettingsState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                setSettings(parseApiResponse(data));
            } catch {
                setError("Failed to load settings from server.");
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const updateSetting = <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
    ) => {
        setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
        setSaved(false);
    };

    const handleSave = useCallback(async () => {
        if (!settings || saving) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(serializeForApi(settings)),
            });
            if (!res.ok) throw new Error("Save failed");
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            setError("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [settings, saving]);

    const inputClass =
        "w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

    const labelClass = "block text-sm font-medium text-foreground mb-1.5";

    return (
        <div className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
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
                            Site Settings
                        </h1>
                        <p className="text-sm text-muted mt-1">
                            Configure site appearance, content, and integrations.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading || !settings}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                            saved
                                ? "bg-emerald-500 text-white"
                                : "bg-primary text-white hover:bg-primary-dark"
                        }`}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-56 shrink-0">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                        activeTab === tab.id
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-muted hover:bg-white hover:text-foreground"
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 min-w-0">
                        {error && (
                            <div className="mb-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-16 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3 text-muted">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="text-sm">Loading settings...</span>
                                </div>
                            </div>
                        ) : !settings ? (
                            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-16 text-center text-muted">
                                Failed to load settings.
                            </div>
                        ) : (
                        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 sm:p-8">
                            {/* General */}
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground mb-1">
                                            General Settings
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Basic site information and configuration.
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Site Title</label>
                                        <input
                                            type="text"
                                            value={settings.siteTitle}
                                            onChange={(e) =>
                                                updateSetting("siteTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Site Description</label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={(e) =>
                                                updateSetting("siteDescription", e.target.value)
                                            }
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Site URL</label>
                                            <input
                                                type="text"
                                                value={settings.siteUrl}
                                                onChange={(e) =>
                                                    updateSetting("siteUrl", e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Articles Per Page
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.articlesPerPage}
                                                onChange={(e) =>
                                                    updateSetting(
                                                        "articlesPerPage",
                                                        e.target.value
                                                    )
                                                }
                                                min={1}
                                                max={50}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableSearch}
                                            onChange={(e) =>
                                                updateSetting("enableSearch", e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                                        />
                                        <span className="text-sm text-foreground">
                                            Enable site-wide search
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Appearance */}
                            {activeTab === "appearance" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground mb-1">
                                            Appearance
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Customise the look and feel of your site.
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Logo URL</label>
                                        <input
                                            type="text"
                                            value={settings.logoUrl}
                                            onChange={(e) =>
                                                updateSetting("logoUrl", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                        {settings.logoUrl && (
                                            <div className="mt-3 h-14 bg-section-bg rounded-xl flex items-center justify-center px-4">
                                                <img
                                                    src={settings.logoUrl}
                                                    alt="Logo preview"
                                                    className="h-10 w-auto"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Primary Colour</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={settings.primaryColor}
                                                onChange={(e) =>
                                                    updateSetting(
                                                        "primaryColor",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings.primaryColor}
                                                onChange={(e) =>
                                                    updateSetting(
                                                        "primaryColor",
                                                        e.target.value
                                                    )
                                                }
                                                className={`${inputClass} max-w-[160px] font-mono`}
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border border-border/50"
                                                style={{
                                                    backgroundColor: settings.primaryColor,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Newsletter */}
                            {activeTab === "newsletter" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground mb-1">
                                            Newsletter
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Configure the newsletter section and email
                                            notifications.
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNewsletter}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "enableNewsletter",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                                        />
                                        <span className="text-sm text-foreground">
                                            Enable newsletter signup section
                                        </span>
                                    </label>
                                    <div>
                                        <label className={labelClass}>
                                            Newsletter Heading
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.newsletterHeading}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "newsletterHeading",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Newsletter Subtext
                                        </label>
                                        <textarea
                                            value={settings.newsletterSubtext}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "newsletterSubtext",
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <hr className="border-border/30" />
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNotifications}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "enableNotifications",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                                        />
                                        <span className="text-sm text-foreground">
                                            Send email notifications for new signups
                                        </span>
                                    </label>
                                    <div>
                                        <label className={labelClass}>
                                            Notification Email Recipient
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.emailRecipient}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "emailRecipient",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="admin@example.com"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SEO & Meta */}
                            {activeTab === "seo" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground mb-1">
                                            SEO & Meta Tags
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Default meta tags for search engines and social
                                            sharing.
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Meta Title</label>
                                        <input
                                            type="text"
                                            value={settings.metaTitle}
                                            onChange={(e) =>
                                                updateSetting("metaTitle", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                        <p className="text-xs text-muted mt-1.5">
                                            {settings.metaTitle.length}/60 characters
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={settings.metaDescription}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "metaDescription",
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                        <p className="text-xs text-muted mt-1.5">
                                            {settings.metaDescription.length}/160 characters
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Default OG Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.ogImage}
                                            onChange={(e) =>
                                                updateSetting("ogImage", e.target.value)
                                            }
                                            placeholder="https://..."
                                            className={inputClass}
                                        />
                                        {settings.ogImage && (
                                            <div className="mt-2 w-48 h-24 rounded-lg overflow-hidden border border-border/50">
                                                <img
                                                    src={settings.ogImage}
                                                    alt="OG preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Advanced */}
                            {activeTab === "advanced" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground mb-1">
                                            Advanced Settings
                                        </h2>
                                        <p className="text-sm text-muted">
                                            Analytics, custom scripts, and integrations.
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Google Analytics ID
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.analyticsId}
                                            onChange={(e) =>
                                                updateSetting("analyticsId", e.target.value)
                                            }
                                            placeholder="G-XXXXXXXXXX"
                                            className={`${inputClass} font-mono`}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Custom Header Script
                                        </label>
                                        <textarea
                                            value={settings.headerScript}
                                            onChange={(e) =>
                                                updateSetting("headerScript", e.target.value)
                                            }
                                            rows={6}
                                            placeholder={"<!-- Paste tracking scripts here -->"}
                                            className={`${inputClass} resize-none font-mono text-xs`}
                                        />
                                        <p className="text-xs text-muted mt-1.5">
                                            Injected into the &lt;head&gt; of every page.
                                            Use with caution.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
