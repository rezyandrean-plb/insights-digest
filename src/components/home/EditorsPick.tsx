"use client";

import type { Article } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";
import ScrollReveal from "@/components/ScrollReveal";

interface EditorsPickProps {
    articles: Article[];
}

export default function EditorsPick({ articles }: EditorsPickProps) {
    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <ScrollReveal>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Editor&apos;s Pick
                    </h2>
                    <p className="text-sm text-muted mb-8">
                        Hand-picked stories by our editorial team for you to enjoy
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: large card */}
                    <ScrollReveal direction="left">
                        <ArticleCard article={articles[0]} />
                    </ScrollReveal>

                    {/* Right: stacked horizontal cards */}
                    <div className="flex flex-col gap-2">
                        {articles.slice(1, 4).map((article, i) => (
                            <ScrollReveal key={article.id} direction="right" delay={i * 0.1}>
                                <ArticleCard article={article} variant="horizontal" />
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
