"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundGradient } from "../components/ui/background-gradient";
import ShareButton from "../components/ShareButton";

export default function TestImageCapture() {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Image Capture Test Page
      </h1>

      {/* Test OpenAISummaryCard-like component */}
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
                Test Summary Card
              </CardTitle>
              <ShareButton
                targetRef={cardRef}
                filename="test-bsky-viz-image"
                variant="ghost"
                size="sm"
                imageOptions={{
                  backgroundColor: "#ffffff",
                  pixelRatio: 2,
                }}
              />
            </CardHeader>
            <CardContent className="pt-0 px-6 sm:px-8 pb-8">
              <div className="max-w-none">
                <div className="text-foreground/90 whitespace-pre-line text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose lg:leading-loose font-normal tracking-wide">
                  This is a test summary card to verify the image capture
                  functionality. The card should capture correctly with: • Solid
                  white background (no grayish tones) • Clear text and proper
                  contrast • Website watermark in bottom-right corner • No
                  transparency artifacts Technical details: - Background
                  classes: bg-background/95 dark:bg-zinc-900/95 - Backdrop
                  filter: backdrop-blur-sm - These should be handled by our
                  enhanced background fixing logic If you can see this text
                  clearly in the downloaded image with a solid white background
                  and the www.bsky-viz.com watermark, then our fixes are working
                  correctly!
                </div>
              </div>
            </CardContent>
          </Card>
        </BackgroundGradient>
      </div>

      {/* Additional test card without BackgroundGradient */}
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Simple Card Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">
            This is a simpler card without BackgroundGradient to test basic
            functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
