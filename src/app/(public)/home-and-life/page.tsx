import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Home & Life | Living & Community",
    description: "Explore home living, community stories, eco-friendly housing, and lifestyle insights for Singapore homeowners.",
};

export default function HomeAndLifePage() {
    return <CategoryArticlesPage category="Home & Life" title="Home & Life" />;
}
