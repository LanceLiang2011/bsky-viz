"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { analyzeUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import ProfileCard from "./ProfileCard";
import { analyzeFeed } from "@/app/utils/feedAnalyzer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string;
  associated?: {
    lists: number;
    feedgens: number;
    starterPacks: number;
    labeler: boolean;
  };
  pinnedPost?: {
    cid: string;
    uri: string;
  };
}

interface ProcessedFeed {
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
  // Add other properties as needed
}

interface AnalysisResult {
  success?: boolean;
  error?: string;
  profile?: BlueskyProfile;
  feed?: unknown;
  processedFeed?: ProcessedFeed;
}

export default function BlueskyAnalyzer() {
  const t = useTranslations();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeUser(formData);

      // Process the feed data if available
      if (response.success && response.feed) {
        const processedFeed = analyzeFeed(response.feed);

        // Create a new object with all existing properties plus processedFeed
        setResult({
          ...response,
          processedFeed,
        });
      } else {
        setResult(response);
      }
    } catch (e) {
      console.error(e);
      setResult({ error: t("errors.unexpected") });
    } finally {
      setLoading(false);
    }
  }

  // Updated renderActivityByHour function
  function renderActivityByHour(activityByHour: Record<number, number>) {
    // Find the max value for scaling
    const maxActivity = Math.max(...Object.values(activityByHour), 1); // Prevent division by zero

    // Create time segments for better readability
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
                  // Calculate height percentage - min 5% for visibility when there's data
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
    <div className="space-y-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
          <CardDescription>{t("form.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input
              name="handle"
              placeholder={t("form.placeholder")}
              required
              className="w-full"
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("form.loading") : t("form.button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.error ? (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6">
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  <strong>{t("results.error")}:</strong> {result.error}
                </div>
              </CardContent>
            </Card>
          ) : result.success && result.profile ? (
            <div className="space-y-6">
              <ProfileCard profile={result.profile} />

              {result.processedFeed && (
                <Card className="mx-auto max-w-4xl">
                  <CardHeader>
                    <CardTitle>{t("analysis.title")}</CardTitle>
                    <CardDescription>
                      {t("analysis.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key insights section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("analysis.posts")}
                        </h4>
                        <p className="text-2xl font-bold">
                          {result.processedFeed.insights.totalPosts}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("analysis.replies")}
                        </h4>
                        <p className="text-2xl font-bold">
                          {result.processedFeed.insights.totalReplies}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("analysis.reposts")}
                        </h4>
                        <p className="text-2xl font-bold">
                          {result.processedFeed.insights.totalReposts}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">
                          {t("analysis.avgLength")}
                        </h4>
                        <p className="text-2xl font-bold">
                          {result.processedFeed.insights.averagePostLength}{" "}
                          {t("analysis.chars")}
                        </p>
                      </div>
                    </div>

                    {/* Activity by Hour chart */}
                    <div className="bg-white p-4 rounded-lg border">
                      {renderActivityByHour(
                        result.processedFeed.activityByHour
                      )}
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
                            {result.processedFeed.insights.mostActiveHour}:00 -{" "}
                            {result.processedFeed.insights.mostActiveHour + 1}
                            :00
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {t("analysis.mostActiveDay")}
                          </p>
                          <p className="text-xl font-semibold">
                            {format(
                              new Date(
                                result.processedFeed.insights.mostActiveDay
                              ),
                              "PPP"
                            )}
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
                        {Object.entries(
                          result.processedFeed.insights.languagesUsed
                        ).map(([lang, count]) => (
                          <Badge key={lang} variant="secondary">
                            {lang} ({count})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Top interactions */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="text-lg font-medium mb-2">
                        {t("analysis.topInteractions")}
                      </h3>
                      <div className="overflow-y-auto max-h-60">
                        {result.processedFeed.topInteractions.map(
                          (interaction, index) => (
                            <div
                              key={interaction.handle}
                              className="flex justify-between items-center p-2 border-b last:border-b-0"
                            >
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">
                                  #{index + 1}
                                </span>
                                <span className="font-medium">
                                  {interaction.displayName ||
                                    interaction.handle}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  @{interaction.handle}
                                </span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {interaction.count} {t("analysis.interactions")}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <details className="cursor-pointer w-full">
                      <summary className="text-sm font-medium text-gray-700 mb-2">
                        {t("analysis.viewRawData")}
                      </summary>
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm mt-2 max-h-96">
                        {JSON.stringify(result.processedFeed, null, 2)}
                      </pre>
                    </details>
                  </CardFooter>
                </Card>
              )}

              <Card className="mx-auto max-w-4xl">
                <CardHeader>
                  <CardTitle>{t("results.feedData")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-700 mb-2">
                      {t("analysis.viewRawFeedData")}
                    </summary>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm mt-2">
                      {/* Add type assertion to resolve the unknown type issue */}
                      {JSON.stringify(result.feed, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6">
                <div className="text-gray-600">{t("results.noData")}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
