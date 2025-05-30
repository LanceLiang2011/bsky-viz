import { useTranslations } from "next-intl";
import HandleSearchForm from "../components/HandleSearchForm";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("app.title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("app.description")}
          </p>
        </div>

        <HandleSearchForm />

        {/* Minimal SEO content - subtle and collapsible */}
        <div className="text-center">
          <details className="group">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none">
              <span className="inline-flex items-center">
                {t("app.whatIsTitle")}
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </summary>
            <div className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              <p>
                {t("app.whatIsDescription")}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
