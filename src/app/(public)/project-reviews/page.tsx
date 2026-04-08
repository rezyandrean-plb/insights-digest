import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Project Reviews | Development & Launch Reviews",
    description: "In-depth reviews of new property developments, mixed-use projects, and residential launches across Singapore.",
};

export default async function ProjectReviewsPage() {
    const articles = await getArticlesByCategory("Project Reviews");
    return <CategoryArticlesPage articles={articles} title="Project Reviews" />;
}
