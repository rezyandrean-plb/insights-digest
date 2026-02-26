"use client";

import { useState, useEffect } from "react";
import { webinars } from "@/lib/data";
import type { Article, Reel, NewLaunchItem, WebinarItem } from "@/lib/data";
import type { HomeTourItem } from "@/lib/data";
import type { HomepageConfig } from "@/lib/homepage-config";
import HeroSection from "@/components/home/HeroSection";
import LatestPosts from "@/components/home/LatestPosts";
import FeaturedStories from "@/components/home/FeaturedStories";
import LatestNews from "@/components/home/LatestNews";
import OurMethodology from "@/components/home/OurMethodology";
import OurPodcast from "@/components/home/OurPodcast";
import OurHomeTours from "@/components/home/OurHomeTours";
import FeaturedArticles from "@/components/home/FeaturedArticles";
import Newsletter from "@/components/Newsletter";
import { DEFAULT_HOMEPAGE_CONFIG, mergeWithDefault } from "@/lib/homepage-config";

export default function HomePage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reelsList, setReelsList] = useState<Reel[]>([]);
  const [newLaunchItems, setNewLaunchItems] = useState<NewLaunchItem[]>([]);
  const [homeToursList, setHomeToursList] = useState<HomeTourItem[]>([]);

  useEffect(() => {
    fetch("/api/homepage", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setConfig(mergeWithDefault(data)))
      .catch(() => setConfig(DEFAULT_HOMEPAGE_CONFIG));
  }, []);

  useEffect(() => {
    fetch("/api/articles/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setHeroArticle(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/articles").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/reels").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/new-launches").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/home-tours").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([a, r, n, h]) => {
        setArticles(Array.isArray(a) ? a : []);
        setReelsList(Array.isArray(r) ? r : []);
        setNewLaunchItems(Array.isArray(n) ? n : []);
        setHomeToursList(Array.isArray(h) ? h : []);
      })
      .catch(() => {});
  }, []);

  // While config is loading, hide Our Methodology (and other admin-toggled sections) so we
  // don't flash content the admin has hidden when navigating to the homepage from another page.
  const cfg =
    config ??
    ({
      ...DEFAULT_HOMEPAGE_CONFIG,
      sections: { ...DEFAULT_HOMEPAGE_CONFIG.sections, ourMethodology: false },
    } as HomepageConfig);
  const limits = cfg.limits;
  const titles = cfg.titles;
  const sections = cfg.sections;

  const latestPosts = articles.slice(1, 1 + limits.latestPosts);
  const featuredArticles = articles.slice(3, 3 + limits.featuredStories);
  const highlightArticle = articles[1] ?? articles[0];
  const reelsSlice = reelsList.slice(0, limits.reels);
  const newLaunchSlice = newLaunchItems.slice(0, limits.newLaunches);
  const webinarsSlice = webinars.slice(0, limits.webinars) as WebinarItem[];
  const homeTours = homeToursList.slice(0, limits.homeTours);

  const heroForDisplay = heroArticle ?? articles[0];

  return (
    <>
      {sections.hero && heroForDisplay ? (
        <HeroSection article={heroForDisplay} />
      ) : null}
      {sections.latestPosts && latestPosts.length > 0 ? (
        <LatestPosts articles={latestPosts} title={titles.latestPosts} />
      ) : null}
      {sections.featuredStories && featuredArticles.length > 0 ? (
        <FeaturedStories articles={featuredArticles} title={titles.featuredStories} />
      ) : null}
      {sections.latestNews && highlightArticle ? (
        <LatestNews
          article={highlightArticle}
          reels={reelsSlice}
          newLaunchItems={newLaunchSlice}
          webinarItems={webinarsSlice}
        />
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
      {sections.featuredArticles && articles.length > 0 ? (
        <FeaturedArticles articles={articles} title={titles.featuredArticles} />
      ) : null}
      {sections.newsletter ? <Newsletter /> : null}
    </>
  );
}
