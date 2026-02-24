"use client";

import { articles, reels, newLaunchSeries, webinars, homeTourSeries } from "@/lib/data";
import HeroSection from "@/components/home/HeroSection";
import LatestPosts from "@/components/home/LatestPosts";
import FeaturedStories from "@/components/home/FeaturedStories";
import LatestNews from "@/components/home/LatestNews";
import OurMethodology from "@/components/home/OurMethodology";
import OurPodcast from "@/components/home/OurPodcast";
import OurHomeTours from "@/components/home/OurHomeTours";
import FeaturedArticles from "@/components/home/FeaturedArticles";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  const heroArticle = articles[0];
  const latestPosts = articles.slice(1, 4);
  const featuredArticles = articles.slice(3, 8);
  const highlightArticle = articles[1];
  const homeTours = homeTourSeries.slice(0, 4);

  return (
    <>
      <HeroSection article={heroArticle} />
      <LatestPosts articles={latestPosts} />
      <FeaturedStories articles={featuredArticles} />
      <LatestNews
        article={highlightArticle}
        reels={reels.slice(0, 4)}
        newLaunchItems={newLaunchSeries.slice(0, 4)}
        webinarItems={webinars.slice(0, 4)}
      />
      <OurMethodology />
      <OurPodcast />
      <OurHomeTours items={homeTours} />
      <FeaturedArticles articles={articles} />
      <Newsletter />
    </>
  );
}

