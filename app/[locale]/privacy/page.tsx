import { useTranslations } from "next-intl";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Bluesky Analytics - learn how we protect your data and respect your privacy while providing social media analytics.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function Privacy() {
  const t = useTranslations("pages.privacy");

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
          <div className="p-4 bg-muted/50 rounded-lg border mb-8">
            <p className="text-sm font-medium mb-0">
              <strong>{t("lastUpdated")}</strong>{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("overview")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("overviewDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t("dataWeCollect")}
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("publicBlueskyData")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("publicBlueskyDataDescription")}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("publicPosts")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("publicProfile")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("publicEngagement")}</span>
                </li>
              </ul>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-3">
                {t("analyticsData")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("analyticsDataDescription")}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("pageViews")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("location")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("deviceInfo")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t("performance")}</span>
                </li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("whatWeDontCollect")}
          </h2>
          <div className="p-6 border rounded-lg bg-destructive/10 border-destructive/20 mb-8">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("privateMessages")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("passwords")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("personalInfo")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("emailAddresses")}</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("howWeUseData")}
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            {t("howWeUseDataDescription")}
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("generateAnalytics")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("improveService")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("ensureSecurity")}</span>
            </li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("dataStorage")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("dataStorageDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("thirdPartyServices")}
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            {t("thirdPartyServicesDescription")}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">{t("blueskyApi")}</h3>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">{t("vercelService")}</h3>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("yourRights")}
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            {t("yourRightsDescription")}
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("controlProfile")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("contactUs")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>{t("stopUsing")}</span>
            </li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("childrensPrivacy")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("childrensPrivacyDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("changesToPolicy")}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t("changesToPolicyDescription")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t("contactUsTitle")}
          </h2>
          <p className="text-lg leading-relaxed">
            {t("contactUsDescription")}{" "}
            <Link
              href="/help"
              className="text-primary hover:underline font-medium"
            >
              {t("helpPage")}
            </Link>
            .
          </p>
        </div>

        <div className="text-center pt-8">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/">{t("backToAnalytics")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
