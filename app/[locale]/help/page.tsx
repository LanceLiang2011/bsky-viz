import { useTranslations } from "next-intl";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description:
    "Get help with Bluesky Analytics - frequently asked questions, troubleshooting, and support for analyzing Bluesky social media activity.",
  alternates: {
    canonical: "/help",
  },
};

export default function Help() {
  const t = useTranslations("pages.help");

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t("gettingStarted")}</h2>

          <h3>{t("howToAnalyze")}</h3>
          <p>{t("howToAnalyzeAnswer")}</p>

          <h3>{t("whatCanISee")}</h3>
          <p>{t("whatCanISeeAnswer")}</p>
          <ul>
            <li>{t("postingActivity")}</li>
            <li>{t("engagementPatterns")}</li>
            <li>{t("activityHeatmaps")}</li>
            <li>{t("interactiveCharts")}</li>
          </ul>

          <h2>{t("troubleshooting")}</h2>

          <h3>{t("cantFindUser")}</h3>
          <p>{t("cantFindUserAnswer")}</p>

          <h3>{t("incompleteData")}</h3>
          <p>{t("incompleteDataAnswer")}</p>
          <ul>
            <li>{t("apiLimits")}</li>
            <li>{t("recentChanges")}</li>
            <li>{t("networkIssues")}</li>
          </ul>
          <p>{t("tryRefreshing")}</p>

          <h3>{t("chartsNotLoading")}</h3>
          <p>{t("chartsNotLoadingAnswer")}</p>
          <ul>
            <li>{t("javascriptDisabled")}</li>
            <li>{t("browserCompatibility")}</li>
            <li>{t("slowConnection")}</li>
          </ul>
          <p>{t("tryModernBrowser")}</p>

          <h2>{t("privacySecurity")}</h2>

          <h3>{t("isDataSafe")}</h3>
          <p>
            {t("isDataSafeAnswer")}{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
              {t("privacyPolicyLink")}
            </Link>
            {t("forMoreDetails")}
          </p>

          <h3>{t("analyzePrivate")}</h3>
          <p>{t("analyzePrivateAnswer")}</p>

          <h2>{t("technicalInfo")}</h2>

          <h3>{t("supportedBrowsers")}</h3>
          <p>{t("supportedBrowsersAnswer")}</p>
          <ul>
            <li>{t("chrome")}</li>
            <li>{t("firefox")}</li>
            <li>{t("safari")}</li>
            <li>{t("edge")}</li>
          </ul>

          <h3>{t("apiAvailable")}</h3>
          <p>{t("apiAvailableAnswer")}</p>

          <h2>{t("contactSupport")}</h2>

          <h3>{t("reportBug")}</h3>
          <p>{t("reportBugAnswer")}</p>

          <h3>{t("commercialUse")}</h3>
          <p>{t("commercialUseAnswer")}</p>

          <h2>{t("stillNeedHelp")}</h2>
          <p>
            {t("stillNeedHelpAnswer")}{" "}
            <Link href="/about" className="text-blue-600 hover:text-blue-800">
              {t("aboutPage")}
            </Link>{" "}
            {t("forMoreInfo")}
          </p>
        </div>

        <div className="text-center">
          <Button asChild>
            <Link href="/">{t("startAnalyzing")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
