import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Real Estate News | Latest Property Updates",
    description: "Stay updated with the latest real estate news, developer launches, and property market updates in Singapore.",
};

export default async function RealEstateNewsPage() {
    const articles = await getArticlesByCategory("Real Estate News");
    return <CategoryArticlesPage articles={articles} title="Real Estate News" />;
}
