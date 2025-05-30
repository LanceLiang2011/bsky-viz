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
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t("whatIs")}</h2>
          <p>{t("whatIsDescription")}</p>

          <h2>{t("features")}</h2>
          <ul>
            <li>
              <strong>{t("activityVisualization")}</strong>
            </li>
            <li>
              <strong>{t("engagementMetrics")}</strong>
            </li>
            <li>
              <strong>{t("interactiveCharts")}</strong>
            </li>
            <li>
              <strong>{t("privacyFirst")}</strong>
            </li>
          </ul>

          <h2>{t("howItWorks")}</h2>
          <p>{t("howItWorksDescription")}</p>

          <h2>{t("privacyData")}</h2>
          <p>
            {t("privacyDataDescription")}{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
              {t("privacyPolicy")}
            </Link>
            .
          </p>

          <h2>{t("openSource")}</h2>
          <p>{t("openSourceDescription")}</p>
        </div>

        <div className="text-center">
          <Button asChild>
            <Link href="/">{t("tryAnalytics")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
