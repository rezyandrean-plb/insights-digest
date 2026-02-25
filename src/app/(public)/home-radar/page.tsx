import type { Metadata } from "next";
import CategoryArticlesPage from "@/components/CategoryArticlesPage";

export const metadata: Metadata = {
    title: "Home Radar | Design, Tech & Living Trends",
    description: "Smart home tech, interior design trends, and living innovations for modern Singapore homes.",
};

export default function HomeRadarPage() {
    return <CategoryArticlesPage category="Home Radar" title="Home Radar" />;
}
