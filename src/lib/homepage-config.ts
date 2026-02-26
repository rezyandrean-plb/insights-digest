export interface HomepageMethodologyItem {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
}

export interface HomepagePodcast {
    label: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
}

export interface HomepageNugget {
    id: string;
    title: string;
    description: string;
    avatar: string;
    slug: string;
}

export interface HomepageConfig {
    sections: {
        hero: boolean;
        latestPosts: boolean;
        featuredStories: boolean;
        latestNews: boolean;
        ourMethodology: boolean;
        ourPodcast: boolean;
        listen: boolean;
        ourHomeTours: boolean;
        featuredArticles: boolean;
        newsletter: boolean;
    };
    titles: {
        latestPosts: string;
        featuredStories: string;
        ourMethodology: string;
        ourPodcast: string;
        listen: string;
        ourHomeTours: string;
        featuredArticles: string;
    };
    limits: {
        latestPosts: number;
        featuredStories: number;
        reels: number;
        newLaunches: number;
        webinars: number;
        homeTours: number;
    };
    methodology: HomepageMethodologyItem[];
    podcast: HomepagePodcast;
    nuggetsTitle: string;
    nuggets: HomepageNugget[];
}

const defaultMethodology: HomepageMethodologyItem[] = [
    {
        id: "1",
        title: "PLB Signature Home Tour Videos: Why Home Tours Are Important In Selling Properties",
        description:
            "Discover the wonders of Singapore with SkyLiving! Our platform seamlessly integrates with all major VR devices, allowing you to embark on exciting virtual tours of the city's most stunning condos and luxurious locations.",
        thumbnail: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
        slug: "plb-signature-home-tour-videos",
    },
    {
        id: "2",
        title: "Selling Homes the Right Way: PropertyLimBrothers' Game-Changing Home Tour Videos",
        description:
            "Experience the vibrant essence of Singapore through SkyLiving! Our service is designed to work with all leading VR devices, offering you engaging virtual tours of the city's most iconic condos and upscale properties.",
        thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        slug: "selling-homes-the-right-way",
    },
    {
        id: "3",
        title: "PLB Signature Home Tour Videos: Why Home Tours Can Sell Homes Better & Faster For Sellers",
        description:
            "Step into the future of real estate with SkyLiving! Fully compatible with all top VR devices, our platform invites you to explore Singapore's most remarkable condos and luxury properties through immersive virtual tours.",
        thumbnail: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&q=80",
        slug: "plb-home-tours-sell-faster",
    },
];

const defaultPodcast: HomepagePodcast = {
    label: "Latest Podcast",
    title: "Who Really Controls Property Valuations? And How to Spot Undervalued Units Today | NOTG S3 Ep 121",
    description:
        "Property valuations—who decides? In this episode of NOTG, Alfred, Jesley, and Yu Rong from PropertyLimBrothers break down the real story behind property valuations—and why they often don't match what you see on paper.",
    thumbnail: "/images/homepage/our-podcasts.webp",
    slug: "notg-s3-ep121-property-valuations",
};

const defaultNuggets: HomepageNugget[] = [
    { id: "1", title: "Resale vs. New Launch: Navigating the 2025–2028 Shift | NOTG S4 Ep31...", description: "Exploring the life of a digital nomad and the places they visit.", avatar: "/images/homepage/george-peng.webp", slug: "resale-vs-new-launch-notg-s4-ep31" },
    { id: "2", title: "From Budgeting to Design: Expert Advice on Building Your Dream Home | NOTG S4 Ep 29...", description: "Discover the culinary delights and fascinating tales from various cultures.", avatar: "/images/homepage/ong-yurong.webp", slug: "budgeting-to-design-notg-s4-ep29" },
    { id: "3", title: "The 3-Investor Strategy Behind High-Yield Property Returns | NOTG S4 Ep22...", description: "Savor the flavors and stories from different corners of the globe.", avatar: "/images/homepage/ong-yurong.webp", slug: "3-investor-strategy-notg-s4-ep22" },
    { id: "4", title: "Freehold Underdogs and Exit Quantum: What Investors Miss | NOTG S4 Ep28...", description: "Dive into the adventures of a digital nomad and the incredible destinations the...", avatar: "/images/homepage/george-peng.webp", slug: "freehold-underdogs-notg-s4-ep28" },
    { id: "5", title: "What Does It Take to Grow From HDB to $6.5M in Value? | NOTG S4 Ep21...", description: "Uncover the journey of a digital nomad and the amazing places they experien...", avatar: "/images/homepage/george-peng.webp", slug: "hdb-to-6-5m-notg-s4-ep21" },
    { id: "6", title: "The 6 Steps to Making Smart Property Investments | NOTG S4 Ep25...", description: "Taste the world through captivating recipes and food narratives.", avatar: "/images/homepage/ong-yurong.webp", slug: "6-steps-smart-property-notg-s4-ep25" },
];

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
    sections: {
        hero: true,
        latestPosts: true,
        featuredStories: true,
        latestNews: true,
        ourMethodology: true,
        ourPodcast: true,
        listen: true,
        ourHomeTours: true,
        featuredArticles: true,
        newsletter: true,
    },
    titles: {
        latestPosts: "Latest Post",
        featuredStories: "Featured Stories",
        ourMethodology: "Our Methodology",
        ourPodcast: "Latest Podcast",
        listen: "Listen",
        ourHomeTours: "Watch",
        featuredArticles: "Featured Articles",
    },
    limits: {
        latestPosts: 3,
        featuredStories: 6,
        reels: 4,
        newLaunches: 4,
        webinars: 4,
        homeTours: 4,
    },
    methodology: defaultMethodology,
    podcast: defaultPodcast,
    nuggetsTitle: "Listen",
    nuggets: defaultNuggets,
};

export function mergeWithDefault(partial: Partial<HomepageConfig> | null): HomepageConfig {
    if (!partial) return DEFAULT_HOMEPAGE_CONFIG;
    const mergedTitles = { ...DEFAULT_HOMEPAGE_CONFIG.titles, ...partial.titles };
    if (typeof partial.nuggetsTitle === "string" && !partial.titles?.listen) {
        mergedTitles.listen = partial.nuggetsTitle;
    }
    return {
        sections: { ...DEFAULT_HOMEPAGE_CONFIG.sections, ...partial.sections },
        titles: mergedTitles,
        limits: { ...DEFAULT_HOMEPAGE_CONFIG.limits, ...partial.limits },
        methodology: Array.isArray(partial.methodology) ? partial.methodology : DEFAULT_HOMEPAGE_CONFIG.methodology,
        podcast: partial.podcast && typeof partial.podcast === "object"
            ? { ...DEFAULT_HOMEPAGE_CONFIG.podcast, ...partial.podcast }
            : DEFAULT_HOMEPAGE_CONFIG.podcast,
        nuggetsTitle: typeof partial.nuggetsTitle === "string" ? partial.nuggetsTitle : DEFAULT_HOMEPAGE_CONFIG.nuggetsTitle,
        nuggets: Array.isArray(partial.nuggets) ? partial.nuggets : DEFAULT_HOMEPAGE_CONFIG.nuggets,
    };
}
