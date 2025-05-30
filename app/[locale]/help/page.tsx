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
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("gettingStarted")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("howToAnalyze")}
              </h3>
              <p className="text-muted-foreground">{t("howToAnalyzeAnswer")}</p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">{t("whatCanISee")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("whatCanISeeAnswer")}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("postingActivity")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("engagementPatterns")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("activityHeatmaps")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("interactiveCharts")}</span>
                </li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("troubleshooting")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("cantFindUser")}
              </h3>
              <p className="text-muted-foreground">{t("cantFindUserAnswer")}</p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("incompleteData")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("incompleteDataAnswer")}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("apiLimits")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("recentChanges")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("networkIssues")}</span>
                </li>
              </ul>
              <p className="text-muted-foreground">{t("tryRefreshing")}</p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("chartsNotLoading")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("chartsNotLoadingAnswer")}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("javascriptDisabled")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("browserCompatibility")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("slowConnection")}</span>
                </li>
              </ul>
              <p className="text-muted-foreground">{t("tryModernBrowser")}</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("privacySecurity")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <h3 className="text-xl font-semibold mb-3">{t("isDataSafe")}</h3>
              <p className="text-muted-foreground">
                {t("isDataSafeAnswer")}{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium"
                >
                  {t("privacyPolicyLink")}
                </Link>
                {t("forMoreDetails")}
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("analyzePrivate")}
              </h3>
              <p className="text-muted-foreground">
                {t("analyzePrivateAnswer")}
              </p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("technicalInfo")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("supportedBrowsers")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("supportedBrowsersAnswer")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="font-medium">{t("chrome")}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="font-medium">{t("firefox")}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="font-medium">{t("safari")}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="font-medium">{t("edge")}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("apiAvailable")}
              </h3>
              <p className="text-muted-foreground">{t("apiAvailableAnswer")}</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("contactSupport")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">{t("reportBug")}</h3>
              <p className="text-muted-foreground">{t("reportBugAnswer")}</p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("commercialUse")}
              </h3>
              <p className="text-muted-foreground">
                {t("commercialUseAnswer")}
              </p>
            </div>
          </div>

          <div className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20 text-center">
            <h2 className="text-xl font-semibold mb-3">{t("stillNeedHelp")}</h2>
            <p className="text-muted-foreground">
              {t("stillNeedHelpAnswer")}{" "}
              <Link
                href="/about"
                className="text-primary hover:underline font-medium"
              >
                {t("aboutPage")}
              </Link>{" "}
              {t("forMoreInfo")}
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/">{t("startAnalyzing")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
