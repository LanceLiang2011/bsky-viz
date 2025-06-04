"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundGradient } from "./ui/background-gradient";
import ShareButton from "./ShareButton";

interface OpenAISummaryCardProps {
  summary: string;
  handle: string;
  username?: string;
}

/**
 * OpenAI Summary Card Component with BackgroundGradient Integration
 *
 * Features optimized typography and animated gradient background:
 * - **Animated Background**: Uses BackgroundGradient with "subtle" preset for text readability
 * - **Glass Effect**: Semi-transparent background with backdrop-blur for modern aesthetics
 * - **Dark Mode Ready**: Full compatibility with theme switching
 * - **Responsive Typography**: text-base → sm:text-lg → lg:text-xl progression
 * - **Progressive Titles**: text-xl → sm:text-2xl → lg:text-3xl scaling
 * - **Enhanced Readability**: leading-relaxed → sm:leading-loose → lg:leading-loose
 * - **Character Definition**: tracking-wide for improved letter spacing
 * - **High Contrast**: text-foreground/90 for optimal reading experience
 * - **Generous Spacing**: px-6 sm:px-8 for comfortable content layout
 * - **Professional Depth**: shadow-xl with backdrop-blur for visual hierarchy
 *
 * BackgroundGradient Features:
 * - Smooth motion animations with 5-second cycles
 * - Subtle gradient colors optimized for text content
 * - Hardware-accelerated transformations
 * - Hover opacity transitions for interactive feedback
 *
 * NOTE: Always ensure dark mode support in new components by:
 * - Using semantic text colors (text-foreground, text-muted-foreground)
 * - Using semantic background colors (bg-background, bg-card)
 * - Including dark mode overrides (dark:bg-zinc-900/95)
 * - Testing in both light and dark themes
 * - Avoiding hardcoded colors like text-gray-700
 */
export default function OpenAISummaryCard({
  summary,
  username,
  handle,
}: OpenAISummaryCardProps) {
  const t = useTranslations();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleBeforeCapture = () => {
    setShowUserInfo(true);
  };

  const handleAfterCapture = () => {
    // Reset after a longer delay to ensure capture is completely finished
    setTimeout(() => {
      setShowUserInfo(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <BackgroundGradient
        className="rounded-[22px] bg-background dark:bg-zinc-900"
        gradientColors="subtle"
        animate={true}
      >
        <Card
          ref={cardRef}
          className="bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border-border/50 shadow-xl"
        >
          <CardHeader className="pb-6 px-6 sm:px-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
              {showUserInfo ? (
                <div className="flex flex-col gap-1">
                  {username && (
                    <span className="text-xl sm:text-2xl lg:text-3xl">
                      {username}
                    </span>
                  )}
                  <span className="text-sm sm:text-base lg:text-lg text-muted-foreground font-normal">
                    @{handle}
                  </span>
                </div>
              ) : (
                t("openai.summaryTitle")
              )}
            </CardTitle>
            <ShareButton
              targetRef={cardRef}
              filename="bsky-viz-summary"
              variant="ghost"
              size="sm"
              beforeCapture={handleBeforeCapture}
              afterCapture={handleAfterCapture}
            />
          </CardHeader>
          
          {/* Bias Warning - Very Apparent */}
          <div className="px-6 sm:px-8 pb-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm sm:text-base font-medium text-center">
                {t("openai.biasWarning")}
              </p>
            </div>
          </div>
          
          <CardContent className="pt-0 px-6 sm:px-8 pb-8">
            <div className="max-w-none">
              <div className="text-foreground/90 whitespace-pre-line text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose lg:leading-loose font-normal tracking-wide">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>
      </BackgroundGradient>
    </div>
  );
}
