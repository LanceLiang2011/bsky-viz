"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeAnimatedText from "@/components/ui/fade-animation";
import GradientAnimatedText from "@/components/ui/gradient-animated-text";
import GSAPLoader from "@/components/ui/gsap-loader";
import { useTranslations } from "next-intl";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingStateProps {
  message?: string;
}

const animations = [
  "https://lottie.host/b883c118-ab24-4b1a-8d0b-be5cfa787c01/UhSy2uwf6k.lottie",
  "https://lottie.host/973b4528-4617-4295-9000-fa576ba5a01d/SsXbMe1O68.lottie",
];

function getRandomAnimationString(): string {
  return animations[Math.floor(Math.random() * animations.length)];
}

export default function LoadingState({ message }: LoadingStateProps) {
  const t = useTranslations("loading");

  const randomAnimation = getRandomAnimationString();

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

      <div className="">
        <DotLottieReact src={randomAnimation} loop autoplay />
      </div>
    </div>
  );
}
