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
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p>
            <strong>{t("lastUpdated")}</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>

          <h2>{t("overview")}</h2>
          <p>{t("overviewDescription")}</p>

          <h2>{t("dataWeCollect")}</h2>
          <h3>{t("publicBlueskyData")}</h3>
          <p>{t("publicBlueskyDataDescription")}</p>
          <ul>
            <li>{t("publicPosts")}</li>
            <li>{t("publicProfile")}</li>
            <li>{t("publicEngagement")}</li>
          </ul>

          <h3>{t("analyticsData")}</h3>
          <p>{t("analyticsDataDescription")}</p>
          <ul>
            <li>{t("pageViews")}</li>
            <li>{t("location")}</li>
            <li>{t("deviceInfo")}</li>
            <li>{t("performance")}</li>
          </ul>

          <h2>{t("whatWeDontCollect")}</h2>
          <ul>
            <li>{t("privateMessages")}</li>
            <li>{t("passwords")}</li>
            <li>{t("personalInfo")}</li>
            <li>{t("emailAddresses")}</li>
          </ul>

          <h2>{t("howWeUseData")}</h2>
          <p>{t("howWeUseDataDescription")}</p>
          <ul>
            <li>{t("generateAnalytics")}</li>
            <li>{t("improveService")}</li>
            <li>{t("ensureSecurity")}</li>
          </ul>

          <h2>{t("dataStorage")}</h2>
          <p>{t("dataStorageDescription")}</p>

          <h2>{t("thirdPartyServices")}</h2>
          <p>{t("thirdPartyServicesDescription")}</p>
          <ul>
            <li>
              <strong>{t("blueskyApi")}</strong>
            </li>
            <li>
              <strong>{t("vercelService")}</strong>
            </li>
          </ul>

          <h2>{t("yourRights")}</h2>
          <p>{t("yourRightsDescription")}</p>
          <ul>
            <li>{t("controlProfile")}</li>
            <li>{t("contactUs")}</li>
            <li>{t("stopUsing")}</li>
          </ul>

          <h2>{t("childrensPrivacy")}</h2>
          <p>{t("childrensPrivacyDescription")}</p>

          <h2>{t("changesToPolicy")}</h2>
          <p>{t("changesToPolicyDescription")}</p>

          <h2>{t("contactUsTitle")}</h2>
          <p>
            {t("contactUsDescription")}{" "}
            <Link href="/help" className="text-blue-600 hover:text-blue-800">
              {t("helpPage")}
            </Link>
            .
          </p>
        </div>

        <div className="text-center">
          <Button asChild>
            <Link href="/">{t("backToAnalytics")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
