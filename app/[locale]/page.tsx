import { useTranslations } from "next-intl";
import BlueskyAnalyzer from "../components/BlueskyAnalyzer";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("app.title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("app.description")}
          </p>
        </div>

        <BlueskyAnalyzer />
      </div>
    </div>
  );
}
