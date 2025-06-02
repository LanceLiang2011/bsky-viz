"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ActivityHeatmap from "./ActivityHeatmap";
import ActivityByHourChart from "./ActivityByHourChart";
import MostActiveTimeSection from "./MostActiveTimeSection";

export type PostTypeFilter = "all" | "posts" | "replies" | "reposts";

interface ActivityData {
  activityByHour: Record<number, number>;
  activityByHourAndType?: {
    posts: Record<number, number>;
    replies: Record<number, number>;
    reposts: Record<number, number>;
  };
  activityTimeline: Array<{
    date: string;
    posts: number;
    replies: number;
    reposts: number;
    likes: number;
    total: number;
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
  };
}

interface UnifiedActivityProps {
  data: ActivityData;
}

export default function UnifiedActivity({ data }: UnifiedActivityProps) {
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

  return (
    <div className="space-y-6">
      {/* Global Activity Filter */}
      <div className="bg-card p-3 sm:p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            {t("analysis.activityAnalysis")}
          </h2>
          <div className="flex items-center gap-2">
            <label
              htmlFor="activity-type-filter"
              className="text-sm text-muted-foreground"
            >
              {t("analysis.filterBy")}:
            </label>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as PostTypeFilter)}
            >
              <SelectTrigger id="activity-type-filter" className="w-32">
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
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap
        activityTimeline={data.activityTimeline}
        filter={filter}
        className=""
      />

      {/* Hourly Activity Chart */}
      <div className="space-y-4">
        {/* Activity summary */}
        <div className="text-xs sm:text-sm text-muted-foreground bg-card p-3 sm:p-4 rounded-lg border">
          {t("analysis.showingItems", {
            count: filteredActivityData.totalItems,
          })}{" "}
          •{" "}
          {t("analysis.timeZoneNote", {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })}
        </div>

        <ActivityByHourChart
          activityByHour={localizedActivityByHour}
          className=""
        />

        {/* Most active time section */}
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <MostActiveTimeSection
            localizedMostActiveHour={localizedMostActiveHour}
            mostActiveDay={data.insights.mostActiveDay}
            filter={filter}
            className=""
          />
        </div>
      </div>
    </div>
  );
}
