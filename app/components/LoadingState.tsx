"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeAnimatedText from "@/components/ui/fade-animation";
import GradientAnimatedText from "@/components/ui/gradient-animated-text";
import GSAPLoader from "@/components/ui/gsap-loader";
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
          <CardTitle className="flex items-center justify-center gap-3">
            <GSAPLoader className="scale-75" />
            <GradientAnimatedText
              text={message || t("analyzing")}
              className="font-semibold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <FadeAnimatedText
            text={t("pleaseWait")}
            className="text-sm text-gray-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}
