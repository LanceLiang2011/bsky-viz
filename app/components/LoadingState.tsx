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
  "https://lottie.host/9664b3bf-fca2-44e9-9f4b-380dd3d4c0c0/7bPZzOCDqS.lottie",
  "https://lottie.host/eb0df2de-8195-48ee-aac5-82d6a663ed3a/NMt795RWcr.lottie",
  "https://lottie.host/286b474e-5d4a-4fe7-82a4-10e67b084513/TRpPreN9PC.lottie",
  "https://lottie.host/8a1b4ebe-10de-4741-954e-edda7b12ef5d/UPZgZtfPZg.lottie",
  "https://lottie.host/fe1e8db3-cafd-452b-9a08-5eb75d8f9abd/MuGlhMw0bk.lottie",
  "https://lottie.host/1a64fe0e-1d30-4938-92ac-5c62d0b34434/zXGgXwzSG9.lottie",
  "https://lottie.host/789ba419-1f71-4831-8d34-c7c36f2f107a/7bdEnG4NLw.lottie",
  "https://lottie.host/7185eb3a-f679-481b-af5d-1d28446496d6/qOarOIS2d0.lottie",
  "https://lottie.host/10033523-da5d-4f17-8074-a9ceb9a00b8f/ICxXy91Jyg.lottie",
  "https://lottie.host/7cf2449e-4a12-43f3-928d-b4c9380909be/Fl4090Tyo1.lottie",
  "https://lottie.host/edea6eef-e18a-4c19-9c37-0ce5ab219f82/TBBUwukEKX.lottie",
];

function getRandomAnimationString(): string {
  return animations[Math.floor(Math.random() * animations.length)];
}

const randomAnimation = getRandomAnimationString();

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
            className="text-sm text-muted-foreground"
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
