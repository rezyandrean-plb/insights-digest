import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Real Estate News | Latest Property Updates",
    description: "Stay updated with the latest real estate news, developer launches, and property market updates in Singapore.",
};

export default function RealEstateNewsPage() {
    return <CategoryArticlesPage category="Real Estate News" title="Real Estate News" />;
}
