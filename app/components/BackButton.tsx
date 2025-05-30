import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface BackButtonProps {
  locale: string;
}

export default async function BackButton({ locale }: BackButtonProps) {
  const t = await getTranslations("navigation");

  return (
    <Link href={`/${locale}`}>
      <Button variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToHome")}
      </Button>
    </Link>
  );
}
