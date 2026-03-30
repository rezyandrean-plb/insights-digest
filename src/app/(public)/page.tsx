import { db } from "@/db";
import { articles, homeTourSeries, siteSettings } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { Article } from "@/lib/data";
import type { HomeTourItem } from "@/lib/data";
import type { HomepageConfig } from "@/lib/homepage-config";
import { DEFAULT_HOMEPAGE_CONFIG, mergeWithDefault } from "@/lib/homepage-config";
import HeroSection from "@/components/home/HeroSection";
import LatestPosts from "@/components/home/LatestPosts";
import FeaturedStories from "@/components/home/FeaturedStories";
import OurMethodology from "@/components/home/OurMethodology";
import OurPodcast from "@/components/home/OurPodcast";
import OurHomeTours from "@/components/home/OurHomeTours";
import FeaturedArticles from "@/components/home/FeaturedArticles";
import Newsletter from "@/components/Newsletter";

function mapArticle(r: typeof articles.$inferSelect): Article {
  return {
    id: String(r.id),
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    sections: r.sections,
    category: r.category,
    image: r.image,
    author: r.author,
    date: r.date,
    readTime: r.readTime,
    featured: r.featured,
    isHero: r.isHero,
    published: r.published,
  } as Article;
}

function mapHomeTour(r: typeof homeTourSeries.$inferSelect): HomeTourItem {
  return {
    id: String(r.id),
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    image: r.image,
    category: r.category,
    readTime: r.readTime,
    isHero: r.isHero,
  } as HomeTourItem;
}

export const dynamic = "force-dynamic";

async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "homepage"))
      .limit(1);

    if (!row || !row.value) return DEFAULT_HOMEPAGE_CONFIG;

    try {
      const parsed = JSON.parse(row.value) as Partial<HomepageConfig>;
      return mergeWithDefault(parsed);
    } catch {
      return DEFAULT_HOMEPAGE_CONFIG;
    }
  } catch {
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

const homepageColumns = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  excerpt: articles.excerpt,
  category: articles.category,
  image: articles.image,
  author: articles.author,
  date: articles.date,
  readTime: articles.readTime,
  featured: articles.featured,
  isHero: articles.isHero,
  published: articles.published,
};

async function getHeroArticle(): Promise<Article | null> {
  try {
    const [hero] = await db
      .select(homepageColumns)
      .from(articles)
      .where(and(eq(articles.isHero, true), eq(articles.published, true)))
      .limit(1);

    return hero ? mapArticle(hero as typeof articles.$inferSelect) : null;
  } catch {
    return null;
  }
}

async function getArticles(): Promise<Article[]> {
  try {
    const rows = await db
      .select(homepageColumns)
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.isHero), desc(articles.id))
      .limit(10);

    return rows.map((r) => mapArticle(r as typeof articles.$inferSelect));
  } catch {
    return [];
  }
}

async function getHomeTours(): Promise<HomeTourItem[]> {
  try {
    const rows = await db
      .select()
      .from(homeTourSeries)
      .orderBy(desc(homeTourSeries.isHero), desc(homeTourSeries.id))
      .limit(10);

    return rows.map(mapHomeTour);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [config, heroArticle, articlesList, homeToursList] =
    await Promise.all([
      getHomepageConfig(),
      getHeroArticle(),
      getArticles(),
      getHomeTours(),
    ]);

  const cfg = config;
  const limits = cfg.limits;
  const titles = cfg.titles;
  const sections = cfg.sections;

  const latestPosts = articlesList.slice(1, 1 + limits.latestPosts);
  const featuredArticlesList = articlesList.slice(3, 3 + limits.featuredStories);
  const homeTours = homeToursList.slice(0, limits.homeTours);

  const heroForDisplay = heroArticle ?? articlesList[0];

  return (
    <>
      {sections.hero && heroForDisplay ? (
        <HeroSection article={heroForDisplay} />
      ) : null}
      {sections.latestPosts && latestPosts.length > 0 ? (
        <LatestPosts articles={latestPosts} title={titles.latestPosts} />
      ) : null}
      {sections.featuredStories && featuredArticlesList.length > 0 ? (
        <FeaturedStories articles={featuredArticlesList} title={titles.featuredStories} />
      ) : null}
      {sections.ourMethodology ? (
        <OurMethodology
          title={titles.ourMethodology}
          items={cfg.methodology.length > 0 ? cfg.methodology : undefined}
        />
      ) : null}
      {sections.ourPodcast ? (
        <OurPodcast
          title={titles.ourPodcast}
          podcast={cfg.podcast}
          nuggetsTitle={titles.listen ?? cfg.nuggetsTitle}
          nuggets={cfg.nuggets.length > 0 ? cfg.nuggets : undefined}
          showNuggets={sections.listen}
        />
      ) : null}
      {sections.ourHomeTours && homeTours.length > 0 ? (
        <OurHomeTours items={homeTours} title={titles.ourHomeTours} />
      ) : null}
      {sections.featuredArticles ? (
        <FeaturedArticles title={titles.featuredArticles} />
      ) : null}
      {sections.newsletter ? <Newsletter /> : null}
    </>
  );
}
