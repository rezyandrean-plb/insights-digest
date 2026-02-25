import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Guides | Property & Home Buying Guides",
    description: "Practical guides for homebuyers: renovation permits, CPF usage, property tax, and navigating Singapore's property market.",
};

export default function GuidesPage() {
    return <CategoryArticlesPage category="Guides" title="Guides" />;
}
