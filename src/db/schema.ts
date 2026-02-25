import {
    pgTable,
    text,
    boolean,
    timestamp,
    serial,
    jsonb,
} from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const articles = pgTable("articles", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content"),
    sections: jsonb("sections"),
    category: text("category").notNull().default("Property"),
    image: text("image").notNull().default(""),
    author: text("author").notNull().default(""),
    date: text("date").notNull().default(""),
    readTime: text("read_time").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    isHero: boolean("is_hero").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const reels = pgTable("reels", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    thumbnail: text("thumbnail").notNull().default(""),
    duration: text("duration").notNull().default(""),
    category: text("category").notNull().default("Most Viewed"),
    videoUrl: text("video_url").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const newLaunchSeries = pgTable("new_launch_series", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    image: text("image").notNull().default(""),
    category: text("category").notNull().default("Most Viewed"),
    readTime: text("read_time").notNull().default(""),
    isHero: boolean("is_hero").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const homeTourSeries = pgTable("home_tour_series", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    image: text("image").notNull().default(""),
    category: text("category").notNull().default("Condo"),
    readTime: text("read_time").notNull().default(""),
    isHero: boolean("is_hero").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date()),
});
