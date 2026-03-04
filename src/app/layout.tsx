import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: "Insights — Singapore Real Estate News & Analysis",
  description:
    "Your trusted source for Singapore real estate news, market analysis, property trends, and investment insights.",
  icons: {
    icon: "/images/insightsdigest-icon.webp",
    apple: "/images/insightsdigest-icon.webp",
  },
  openGraph: {
    title: "Insights — Singapore Real Estate News & Analysis",
    description:
      "Your trusted source for Singapore real estate news, market analysis, property trends, and investment insights.",
    images: [{ url: "/images/insightsdigest-icon.webp", width: 512, height: 512, alt: "Insights Digest" }],
  },
  twitter: {
    card: "summary",
    title: "Insights — Singapore Real Estate News & Analysis",
    description:
      "Your trusted source for Singapore real estate news, market analysis, property trends, and investment insights.",
    images: ["/images/insightsdigest-icon.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
