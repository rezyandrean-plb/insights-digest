import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Home & Life | Living & Community",
    description: "Explore home living, community stories, eco-friendly housing, and lifestyle insights for Singapore homeowners.",
};

export default async function HomeAndLifePage() {
    const articles = await getArticlesByCategory("Home & Life");
    return <CategoryArticlesPage articles={articles} title="Home & Life" />;
}
