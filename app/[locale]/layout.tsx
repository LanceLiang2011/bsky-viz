import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "../components/theme-provider";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../globals.css";

// Use consistent font configuration to avoid hydration mismatches
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bluesky Analytics - Visualize Social Media Activity",
    template: "%s | Bluesky Analytics",
  },
  description:
    "Free analytics tool to analyze Bluesky user activity patterns, engagement metrics, and social interactions with interactive visualizations.",
  keywords: [
    "bluesky analytics",
    "social media analytics",
    "activity visualization",
    "engagement metrics",
    "bluesky user analysis",
    "social media insights",
  ],
  authors: [{ name: "Bluesky Analytics" }],
  openGraph: {
    type: "website",
    url: "https://www.bsky-viz.com",
    siteName: "Bluesky Analytics",
    title: "Bluesky Analytics - Visualize Social Media Activity",
    description:
      "Free analytics tool to analyze Bluesky user activity patterns and engagement metrics.",
    images: [
      {
        url: "https://www.bsky-viz.com/logo.png",
        width: 446,
        height: 446,
        alt: "Bluesky Analytics Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bluesky Analytics - Visualize Social Media Activity",
    description:
      "Free analytics tool to analyze Bluesky user activity patterns.",
    images: ["/logo.png"],
  },
  metadataBase: new URL("https://www.bsky-viz.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        rel: "icon",
      },
      {
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        rel: "icon",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  other: {
    "msapplication-TileColor": "#3b82f6",
    "theme-color": "#3b82f6",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "zh-cn")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bluesky Analytics",
    description:
      "Free analytics tool to analyze Bluesky user activity patterns, engagement metrics, and social interactions with interactive visualizations.",
    url: "https://www.bsky-viz.com",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Person",
      name: "Lance",
    },
    featureList: [
      "Activity visualization",
      "Engagement metrics",
      "Interactive charts",
      "Privacy-first analytics",
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
