"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BackButton() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("navigation");

  const handleBack = () => {
    const locale = params.locale || "en";
    router.push(`/${locale}`);
  };

  return (
    <Button variant="outline" onClick={handleBack} className="mb-6">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t("backToHome")}
    </Button>
  );
}
