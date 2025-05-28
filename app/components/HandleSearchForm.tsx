"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function HandleSearchForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    const handle = formData.get("handle")?.toString()?.trim();

    if (!handle) {
      return;
    }

    setIsLoading(true);

    // Clean the handle for URL
    let cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
    cleanHandle = cleanHandle
      .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    // Navigate to the dynamic route with locale
    const locale = params.locale || "en";
    router.push(`/${locale}/${cleanHandle}`);
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="handle"
            placeholder={t("form.placeholder")}
            required
            className="w-full"
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("form.loading")}
              </>
            ) : (
              t("form.button")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
