import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Project Reviews | Development & Launch Reviews",
    description: "In-depth reviews of new property developments, mixed-use projects, and residential launches across Singapore.",
};

export default function ProjectReviewsPage() {
    return <CategoryArticlesPage category="Project Reviews" title="Project Reviews" />;
}
