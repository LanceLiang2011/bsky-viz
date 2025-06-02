"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface BackButtonProps {
  locale: string;
}

export default function BackButton({ locale }: BackButtonProps) {
  const t = useTranslations("navigation");

  return (
    <Link href={`/${locale}`}>
      <Button variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToHome")}
      </Button>
    </Link>
  );
}
