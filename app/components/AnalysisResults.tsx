"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import WordCloud from "./WordCloud";

interface ProcessedFeedData {
  activityByHour: Record<number, number>;
  activityTimeline: Array<{
    date: string;
    posts: number;
    replies: number;
    reposts: number;
    likes: number;
    total: number;
  }>;
  topInteractions: Array<{
    did: string;
    handle: string;
    displayName: string;
    count: number;
  }>;
  commonHashtags: Array<{
    tag: string;
    count: number;
  }>;
  wordCloudData: Array<{
    text: string;
    value: number;
  }>;
  insights: {
    totalPosts: number;
    totalReplies: number;
    totalReposts: number;
    averagePostLength: number;
    mostActiveHour: number;
    mostActiveDay: string;
    postsWithMedia: number;
    postsWithLinks: number;
    languagesUsed: Record<string, number>;
  };
}

interface AnalysisResultsProps {
  processedFeed: ProcessedFeedData;
}

export default function AnalysisResults({
  processedFeed,
}: AnalysisResultsProps) {
  const t = useTranslations();

  // Render function for activity by hour visualization
  function renderActivityByHour(activityByHour: Record<number, number>) {
    const maxActivity = Math.max(...Object.values(activityByHour), 1);

    const timeSegments = [
      { label: t("analysis.morning"), hours: [6, 7, 8, 9, 10, 11] },
      { label: t("analysis.afternoon"), hours: [12, 13, 14, 15, 16, 17] },
      { label: t("analysis.evening"), hours: [18, 19, 20, 21, 22, 23] },
      { label: t("analysis.night"), hours: [0, 1, 2, 3, 4, 5] },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("analysis.activityByHour")}</h3>

        <div className="text-sm text-gray-500 mb-2">
          {t("analysis.timeZoneNote", {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })}
        </div>

        <div className="space-y-8">
          {timeSegments.map((segment) => (
            <div key={segment.label} className="space-y-1">
              <div className="text-sm font-medium text-gray-700">
                {segment.label}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {segment.hours.map((hour) => {
                  const count = activityByHour[hour] || 0;
                  const heightPercentage =
                    count > 0 ? Math.max(10, (count / maxActivity) * 100) : 3;

                  return (
                    <div key={hour} className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">{count}</div>
                      <div
                        className="bg-blue-500 w-12 rounded-t-sm"
                        style={{ height: `${heightPercentage}px` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">
                        {hour}:00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>{t("analysis.title")}</CardTitle>
        <CardDescription>{t("analysis.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key insights section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">
              {t("analysis.posts")}
            </h4>
            <p className="text-2xl font-bold">
              {processedFeed.insights.totalPosts}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">
              {t("analysis.replies")}
            </h4>
            <p className="text-2xl font-bold">
              {processedFeed.insights.totalReplies}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">
              {t("analysis.reposts")}
            </h4>
            <p className="text-2xl font-bold">
              {processedFeed.insights.totalReposts}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">
              {t("analysis.avgLength")}
            </h4>
            <p className="text-2xl font-bold">
              {processedFeed.insights.averagePostLength} {t("analysis.chars")}
            </p>
          </div>
        </div>

        {/* Activity by Hour chart */}
        <div className="bg-white p-4 rounded-lg border">
          {renderActivityByHour(processedFeed.activityByHour)}
        </div>

        {/* Most active time */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">
            {t("analysis.mostActiveTime")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {t("analysis.mostActiveHour")}
              </p>
              <p className="text-xl font-semibold">
                {processedFeed.insights.mostActiveHour}:00 -{" "}
                {processedFeed.insights.mostActiveHour + 1}:00
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("analysis.mostActiveDay")}
              </p>
              <p className="text-xl font-semibold">
                {processedFeed.insights.mostActiveDay &&
                !isNaN(new Date(processedFeed.insights.mostActiveDay).getTime())
                  ? format(
                      new Date(processedFeed.insights.mostActiveDay),
                      "PPP"
                    )
                  : t("analysis.noData")}
              </p>
            </div>
          </div>
        </div>

        {/* Languages used */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">
            {t("analysis.languagesUsed")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(processedFeed.insights.languagesUsed).map(
              ([lang, count]) => (
                <Badge key={lang} variant="secondary">
                  {lang} ({count})
                </Badge>
              )
            )}
          </div>
        </div>

        {/* Top interactions */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">
            {t("analysis.topInteractions")}
          </h3>
          <div className="overflow-y-auto max-h-60">
            {processedFeed.topInteractions.map((interaction, index) => (
              <div
                key={interaction.handle}
                className="flex justify-between items-center p-2 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">#{index + 1}</span>
                  <span className="font-medium">
                    {interaction.displayName || interaction.handle}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    @{interaction.handle}
                  </span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {interaction.count} {t("analysis.interactions")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Word Cloud */}
        <WordCloud
          words={processedFeed.wordCloudData}
          title={t("analysis.wordCloud")}
          subtitle={t("analysis.wordCloudSubtitle")}
          config={{
            maxWords: 100,
            minFontSize: 12,
            maxFontSize: 48,
            showControls: true,
          }}
          onWordClick={(word: { text: string; value: number }) => {
            console.log("Clicked word:", word);
          }}
        />
      </CardContent>
      <CardFooter>
        <details className="cursor-pointer w-full">
          <summary className="text-sm font-medium text-gray-700 mb-2">
            {t("analysis.viewRawData")}
          </summary>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm mt-2 max-h-96">
            {JSON.stringify(processedFeed, null, 2)}
          </pre>
        </details>
      </CardFooter>
    </Card>
  );
}
