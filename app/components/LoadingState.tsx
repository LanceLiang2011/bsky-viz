"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeAnimatedText from "@/components/ui/fade-animation";
import GradientAnimatedText from "@/components/ui/gradient-animated-text";
import GSAPLoader from "@/components/ui/gsap-loader";
import { useTranslations } from "next-intl";
import Image from "next/image";

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

      {/* Loading Animation */}
      <div className="flex justify-center items-center w-full">
        <div className="relative w-[600px] h-[338px] sm:w-[800px] sm:h-[450px] md:w-[1000px] md:h-[563px] lg:w-[1200px] lg:h-[675px]">
          <Image
            src="/loading-animation.webp"
            alt="Loading animation"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 600px, (max-width: 768px) 800px, (max-width: 1024px) 1000px, 1200px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
