import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Market Analysis | Property News & Insights",
    description: "Expert market analysis and insights on Singapore property trends, prices, and investment opportunities.",
};

export default function MarketAnalysisPage() {
    return <CategoryArticlesPage category="Market Analysis" title="Market Analysis" />;
}
