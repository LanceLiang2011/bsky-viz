"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  const t = useTranslations("loading");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {message || t("analyzing")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">{t("pleaseWait")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
