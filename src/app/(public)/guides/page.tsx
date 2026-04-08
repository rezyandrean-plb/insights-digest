import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Guides | Property & Home Buying Guides",
    description: "Practical guides for homebuyers: renovation permits, CPF usage, property tax, and navigating Singapore's property market.",
};

export default async function GuidesPage() {
    const articles = await getArticlesByCategory("Guides");
    return <CategoryArticlesPage articles={articles} title="Guides" />;
}
