import type { ArticleCategory } from "@/lib/data";

interface CategoryBadgeProps {
    category: ArticleCategory;
    size?: "sm" | "md";
}

const categoryStyles: Record<string, string> = {
    Property: "badge-property",
    Market: "badge-market",
    Investment: "badge-investment",
    News: "badge-news",
    "Market Analysis": "badge-market-analysis",
    "Real Estate News": "badge-real-estate-news",
    Guides: "badge-guides",
    "Home & Life": "badge-home-life",
    "Project Reviews": "badge-project-reviews",
    "Home Radar": "badge-home-radar",
};

export default function CategoryBadge({
    category,
    size = "md",
}: CategoryBadgeProps) {
    return (
        <span
            className={`inline-block font-medium rounded-full ${categoryStyles[category]
                } ${size === "sm"
                    ? "text-[10px] px-2 py-0.5"
                    : "text-xs px-2.5 py-1"
                }`}
        >
            {category}
        </span>
    );
}
