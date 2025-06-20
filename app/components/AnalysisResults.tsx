"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import WordCloud from "./WordCloud";
import ChineseWordCloud from "./ChineseWordCloud";
import UnifiedActivity from "./UnifiedActivity";
import { KeyInsights, TopInteractions } from "./analysis-components";
import { ProcessedFeedData } from "../types/bluesky";

interface AnalysisResultsProps {
  processedFeed: ProcessedFeedData;
  currentUser?: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
}

export default function AnalysisResults({
  processedFeed,
  currentUser,
}: AnalysisResultsProps) {
  const t = useTranslations();

  return (
    <Card className="mx-auto max-w-4xl w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">
          {t("analysis.title")}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t("analysis.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Key insights section */}
        <KeyInsights insights={processedFeed.insights} />

        {/* Unified Activity component with filtering */}
        <UnifiedActivity
          data={{
            activityByHour: processedFeed.activityByHour,
            activityByHourAndType: processedFeed.activityByHourAndType,
            activityByMinute: processedFeed.activityByMinute,
            activityTimeline: processedFeed.activityTimeline,
            insights: processedFeed.insights,
          }}
        />

        {/* Top interactions */}
        <TopInteractions
          interactions={processedFeed.topInteractions.filter(
            (i) => i.did && i.handle // Filter out any interactions without did or handle
          )}
          currentUser={currentUser}
        />

        {/* Word Cloud */}
        {processedFeed.isChineseContent && processedFeed.rawText ? (
          <ChineseWordCloud
            rawText={processedFeed.rawText}
            title={t("analysis.wordCloud")}
            subtitle={t("analysis.wordCloudSubtitle")}
            config={{
              maxWords: 100,
              minFontSize: 12,
              maxFontSize: 48,
              showControls: true,
            }}
            onWordClick={(word: { text: string; value: number }) => {
              // Open Bluesky compose page with the clicked word as a hashtag
              const hashtag = word.text.startsWith("#")
                ? word.text.substring(1)
                : word.text;
              const composeUrl = `https://bsky.app/intent/compose?text=%23${encodeURIComponent(
                hashtag
              )}`;
              window.open(composeUrl, "_blank");
            }}
          />
        ) : (
          <WordCloud
            rawText={processedFeed.rawText}
            title={t("analysis.wordCloud")}
            subtitle={t("analysis.wordCloudSubtitle")}
            config={{
              maxWords: 100,
              minFontSize: 12,
              maxFontSize: 48,
              showControls: true,
            }}
            onWordClick={(word: { text: string; value: number }) => {
              // Open Bluesky compose page with the clicked word as a hashtag
              const hashtag = word.text.startsWith("#")
                ? word.text.substring(1)
                : word.text;
              const composeUrl = `https://bsky.app/intent/compose?text=%23${encodeURIComponent(
                hashtag
              )}`;
              window.open(composeUrl, "_blank");
            }}
          />
        )}
      </CardContent>
      <CardFooter className="px-4 sm:px-6">
        <details className="cursor-pointer w-full">
          <summary className="text-sm font-medium text-foreground mb-2">
            {t("analysis.viewRawData")}
          </summary>
          <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-auto text-xs sm:text-sm mt-2 max-h-96">
            {JSON.stringify(processedFeed, null, 2)}
          </pre>
        </details>
      </CardFooter>
    </Card>
  );
}
