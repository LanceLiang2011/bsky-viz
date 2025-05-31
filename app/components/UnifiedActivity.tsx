"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PostTypeFilter = "all" | "posts" | "replies" | "reposts";

interface ActivityData {
  activityByHour: Record<number, number>;
  activityByHourAndType?: {
    posts: Record<number, number>;
    replies: Record<number, number>;
    reposts: Record<number, number>;
  };
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

interface UnifiedActivityProps {
  data: ActivityData;
  className?: string;
}

export default function UnifiedActivity({
  data,
  className = "",
}: UnifiedActivityProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<PostTypeFilter>("all");

  // Calculate filtered activity data based on the selected filter
  const filteredActivityData = useMemo(() => {
    if (!data.activityByHourAndType) {
      // Fallback to using existing combined data if type breakdown is not available
      return {
        activityByHour: data.activityByHour,
        mostActiveHour: data.insights.mostActiveHour,
        totalItems:
          data.insights.totalPosts +
          data.insights.totalReplies +
          data.insights.totalReposts,
      };
    }

    const { posts, replies, reposts } = data.activityByHourAndType;

    // Select the activity data based on filter
    let selectedActivity: Record<number, number>;
    let totalItems: number;

    switch (filter) {
      case "posts":
        selectedActivity = posts;
        totalItems = data.insights.totalPosts;
        break;
      case "replies":
        selectedActivity = replies;
        totalItems = data.insights.totalReplies;
        break;
      case "reposts":
        selectedActivity = reposts;
        totalItems = data.insights.totalReposts;
        break;
      case "all":
      default:
        selectedActivity = data.activityByHour;
        totalItems =
          data.insights.totalPosts +
          data.insights.totalReplies +
          data.insights.totalReposts;
        break;
    }

    // Find most active hour for filtered content
    let mostActiveHour = 0;
    let maxCount = 0;
    Object.entries(selectedActivity).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveHour = parseInt(hour);
      }
    });

    return {
      activityByHour: selectedActivity,
      mostActiveHour,
      totalItems,
    };
  }, [filter, data]);

  // Convert UTC-based activity to user's local timezone
  const localizedActivityByHour = useMemo(() => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() / 60; // Offset in hours from UTC

    // Create a new activity object shifted by timezone offset
    const localActivity: Record<number, number> = {};

    // Initialize all hours to 0
    for (let i = 0; i < 24; i++) {
      localActivity[i] = 0;
    }

    // Shift each hour's activity by the timezone offset
    Object.entries(filteredActivityData.activityByHour).forEach(
      ([utcHour, count]) => {
        const hour = parseInt(utcHour);
        // Convert UTC hour to local hour
        const localHour = (hour - utcOffset + 24) % 24;
        localActivity[localHour] = (localActivity[localHour] || 0) + count;
      }
    );

    return localActivity;
  }, [filteredActivityData.activityByHour]);

  // Convert most active hour from UTC to local time
  const localizedMostActiveHour = useMemo(() => {
    const utcOffset = new Date().getTimezoneOffset() / 60;
    return (filteredActivityData.mostActiveHour - utcOffset + 24) % 24;
  }, [filteredActivityData.mostActiveHour]);

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
        <div className="space-y-6 sm:space-y-8">
          {timeSegments.map((segment) => (
            <div key={segment.label} className="space-y-1">
              <div className="text-sm font-medium text-foreground">
                {segment.label}
              </div>
              <div className="grid grid-cols-6 gap-1 sm:gap-2">
                {segment.hours.map((hour) => {
                  const count = activityByHour[hour] || 0;
                  const heightPercentage =
                    count > 0 ? Math.max(10, (count / maxActivity) * 100) : 3;

                  return (
                    <div key={hour} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {count}
                      </div>
                      <div
                        className="bg-blue-500 w-8 sm:w-12 rounded-t-sm"
                        style={{ height: `${heightPercentage}px` }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-1">
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
    <div
      className={`bg-card p-3 sm:p-4 rounded-lg border space-y-4 ${className}`}
    >
      {/* Header with filter selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          {t("analysis.activityByHour")}
        </h3>
        <div className="flex items-center gap-2">
          <label
            htmlFor="post-type-filter"
            className="text-sm text-muted-foreground"
          >
            {t("analysis.filterBy")}:
          </label>
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as PostTypeFilter)}
          >
            <SelectTrigger id="post-type-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("analysis.allActivity")}</SelectItem>
              <SelectItem value="posts">{t("analysis.postsOnly")}</SelectItem>
              <SelectItem value="replies">
                {t("analysis.repliesOnly")}
              </SelectItem>
              <SelectItem value="reposts">
                {t("analysis.repostsOnly")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity summary */}
      <div className="text-xs sm:text-sm text-muted-foreground">
        {t("analysis.showingItems", { count: filteredActivityData.totalItems })}{" "}
        •{" "}
        {t("analysis.timeZoneNote", {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })}
      </div>

      {/* Activity by Hour chart */}
      {renderActivityByHour(localizedActivityByHour)}

      {/* Most active time for filtered data */}
      <div className="border-t pt-4">
        <h4 className="text-sm sm:text-base font-medium mb-2">
          {t("analysis.mostActiveTime")} (
          {filter === "all"
            ? t("analysis.allActivity")
            : t(`analysis.${filter}Only`)}
          )
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("analysis.mostActiveHour")}
            </p>
            <p className="text-lg sm:text-xl font-semibold">
              {localizedMostActiveHour}:00 -{" "}
              {(localizedMostActiveHour + 1) % 24}:00
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("analysis.mostActiveDay")}
            </p>
            <p className="text-lg sm:text-xl font-semibold break-words">
              {data.insights.mostActiveDay &&
              !isNaN(new Date(data.insights.mostActiveDay).getTime())
                ? format(new Date(data.insights.mostActiveDay), "PPP")
                : t("analysis.noData")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
