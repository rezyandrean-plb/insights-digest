import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Home Radar | Design, Tech & Living Trends",
    description: "Smart home tech, interior design trends, and living innovations for modern Singapore homes.",
};

export default async function HomeRadarPage() {
    const articles = await getArticlesByCategory("Home Radar");
    return <CategoryArticlesPage articles={articles} title="Home Radar" />;
}
