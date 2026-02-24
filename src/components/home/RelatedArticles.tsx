"use client";

import type { Article } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";
import ScrollReveal from "@/components/ScrollReveal";

interface RelatedArticlesProps {
    articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
    return (
        <section className="py-10 sm:py-14 lg:py-16">
            <div className="container-custom">
                <ScrollReveal>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Related Articles
                    </h2>
                    <p className="text-sm text-muted mb-8">
                        More stories you might be interested in
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, i) => (
                        <ScrollReveal key={article.id} delay={i * 0.1}>
                            <ArticleCard article={article} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
