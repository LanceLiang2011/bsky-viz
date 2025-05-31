"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OpenAISummaryCardProps {
  summary: string;
}

/**
 * OpenAI Summary Card Component
 *
 * NOTE: Always ensure dark mode support in new components by:
 * - Using semantic text colors (text-foreground, text-muted-foreground)
 * - Using semantic background colors (bg-background, bg-card)
 * - Testing in both light and dark themes
 * - Avoiding hardcoded colors like text-gray-700
 */
export default function OpenAISummaryCard({ summary }: OpenAISummaryCardProps) {
  const t = useTranslations();

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>{t("openai.summaryTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
