import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Market Analysis | Property News & Insights",
    description: "Expert market analysis and insights on Singapore property trends, prices, and investment opportunities.",
};

export default async function MarketAnalysisPage() {
    const articles = await getArticlesByCategory("Market Analysis");
    return <CategoryArticlesPage articles={articles} title="Market Analysis" />;
}
