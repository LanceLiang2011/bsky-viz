"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh-cn", name: "Chinese", nativeName: "中文" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">
          {languages.find((lang) => lang.code === locale)?.nativeName}
        </span>
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 z-50 min-w-[120px]">
          <CardContent className="p-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant={locale === language.code ? "default" : "ghost"}
                size="sm"
                onClick={() => switchLanguage(language.code)}
                className="w-full justify-start text-sm"
              >
                {language.nativeName}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
