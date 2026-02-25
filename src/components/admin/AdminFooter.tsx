import Link from "next/link";

export default function AdminFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border/50 bg-white/60">
            <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
                <p className="text-xs text-muted">
                    &copy; {year} Insights Admin Panel. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        target="_blank"
                        className="text-xs text-muted hover:text-primary transition-colors"
                    >
                        View Public Site
                    </Link>
                    <Link
                        href="/admin"
                        className="text-xs text-muted hover:text-primary transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </footer>
    );
}
