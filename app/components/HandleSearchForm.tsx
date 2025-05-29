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
  const [inputValue, setInputValue] = useState("");

  // Function to clean input in real-time, removing invisible characters but keeping @ symbol
  function cleanInput(value: string): string {
    return (
      value
        // Remove invisible Unicode characters that break URLs
        .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g, "")
        // Remove other problematic invisible characters
        .replace(/[\u00AD\u034F\u061C\u180E\u2000-\u200A\u2028\u2029]/g, "")
        // Keep @ symbol and other visible characters
        .trim()
    );
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleanedValue = cleanInput(e.target.value);
    setInputValue(cleanedValue);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    setIsLoading(true);

    // Clean the handle for URL - remove @ symbol and ensure clean format
    let cleanHandle = inputValue.startsWith("@")
      ? inputValue.slice(1)
      : inputValue;
    cleanHandle = cleanHandle.replace(/\s+/g, "").toLowerCase();

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={inputValue}
            onChange={handleInputChange}
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
