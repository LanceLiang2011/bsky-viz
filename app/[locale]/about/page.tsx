import { useTranslations } from "next-intl";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Bluesky Analytics - a free tool for analyzing Bluesky social media activity patterns, engagement metrics, and user interactions.",
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  const t = useTranslations("pages.about");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="prose prose-lg prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("whatIs")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("whatIsDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("features")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg mb-2">
                  {t("activityVisualization")}
                </h3>
                <p className="text-muted-foreground">
                  Track your posting patterns and activity trends over time.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg mb-2">
                  {t("engagementMetrics")}
                </h3>
                <p className="text-muted-foreground">
                  Analyze likes, reposts, and replies to understand your reach.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg mb-2">
                  {t("interactiveCharts")}
                </h3>
                <p className="text-muted-foreground">
                  Explore your data with dynamic, interactive visualizations.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg mb-2">
                  {t("privacyFirst")}
                </h3>
                <p className="text-muted-foreground">
                  All analysis happens locally - your data never leaves your
                  device.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("howItWorks")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("howItWorksDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("privacyData")}
          </h2>
          <p className="text-lg leading-relaxed mb-2">
            {t("privacyDataDescription")}{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              {t("privacyPolicy")}
            </Link>
            .
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("openSource")}
          </h2>
          <p className="text-lg leading-relaxed">
            {t("openSourceDescription")}
          </p>
        </div>

        <div className="text-center pt-8">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/">{t("tryAnalytics")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
