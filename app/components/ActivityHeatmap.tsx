"use client";

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { format, eachDayOfInterval, getDay, subDays } from "date-fns";
import ShareButton from "./ShareButton";

export type PostTypeFilter = "all" | "posts" | "replies" | "reposts";

interface ActivityDay {
  date: string;
  posts: number;
  replies: number;
  reposts: number;
  likes: number;
  total: number;
}

interface ActivityHeatmapProps {
  activityTimeline: ActivityDay[];
  filter: PostTypeFilter;
  className?: string;
}

export default function ActivityHeatmap({
  activityTimeline,
  filter,
  className = "",
}: ActivityHeatmapProps) {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Debug logging for activityTimeline
  console.log("🔥 ActivityHeatmap Debug:");
  console.log("  activityTimeline length:", activityTimeline?.length || 0);
  console.log("  Sample timeline data:", activityTimeline?.slice(0, 3));
  console.log("  Timeline date range:", {
    first: activityTimeline?.[0]?.date,
    last: activityTimeline?.[activityTimeline.length - 1]?.date,
  });
  console.log("  Current filter:", filter);

  // Use real data directly - test data generator removed since we have working data
  const effectiveActivityTimeline = activityTimeline;

  // Process the activity data into a heatmap-friendly format
  const heatmapData = useMemo(() => {
    // Function to get activity count based on filter
    const getFilteredActivityCount = (day: ActivityDay): number => {
      switch (filter) {
        case "posts":
          return day.posts;
        case "replies":
          return day.replies;
        case "reposts":
          return day.reposts;
        case "all":
        default:
          return day.total;
      }
    };

    // Create a map for quick lookup of activity by date
    const activityMap = new Map<string, ActivityDay>();
    effectiveActivityTimeline.forEach((day) => {
      activityMap.set(day.date, day);
    });

    // Determine the actual end date from the data, or fall back to current date
    const dataEndDates = effectiveActivityTimeline.map((d) => new Date(d.date));
    const actualDataEnd =
      dataEndDates.length > 0
        ? new Date(Math.max(...dataEndDates.map((d) => d.getTime())))
        : new Date(2025, 4, 31); // May 31, 2025 fallback

    // Use the actual data end date, but cap it at current date to avoid future dates
    const endDate = actualDataEnd > new Date() ? new Date() : actualDataEnd;
    const startDate = subDays(endDate, 364); // Exactly 365 days (364 days back + today)

    // Find the Sunday before start date to align with week grid
    const startSunday = subDays(startDate, getDay(startDate));

    // Find the Saturday after end date to complete the week
    const endSaturday = subDays(endDate, -(6 - getDay(endDate)));

    // Generate all days from start Sunday to end Saturday for complete weeks
    const allDays = eachDayOfInterval({
      start: startSunday,
      end: endSaturday,
    });

    console.log("📅 Heatmap date range:", {
      startSunday: format(startSunday, "yyyy-MM-dd"),
      endSaturday: format(endSaturday, "yyyy-MM-dd"),
      actualDataEnd: format(endDate, "yyyy-MM-dd"),
      totalDays: allDays.length,
      totalWeeks: Math.ceil(allDays.length / 7),
    });

    // Create the heatmap data with activity counts
    const heatmapDays = allDays.map((date) => {
      const dateString = format(date, "yyyy-MM-dd");
      const activity = activityMap.get(dateString);
      const isWithinDataRange = date <= endDate && date >= startDate;

      // Get filtered activity count
      const filteredCount = activity ? getFilteredActivityCount(activity) : 0;

      return {
        date: dateString,
        displayDate: date,
        total: (activity?.total || 0) * (isWithinDataRange ? 1 : 0), // Keep total for reference
        posts: (activity?.posts || 0) * (isWithinDataRange ? 1 : 0),
        replies: (activity?.replies || 0) * (isWithinDataRange ? 1 : 0),
        reposts: (activity?.reposts || 0) * (isWithinDataRange ? 1 : 0),
        filteredCount: filteredCount * (isWithinDataRange ? 1 : 0), // Add filtered count
        dayOfWeek: getDay(date), // 0 = Sunday, 1 = Monday, etc.
        weekIndex: Math.floor(
          (date.getTime() - startSunday.getTime()) / (7 * 24 * 60 * 60 * 1000)
        ),
        isWithinDataRange,
      };
    });

    // Calculate max activity for color intensity (only from actual data range)
    const maxActivity = Math.max(
      ...heatmapDays
        .filter((d) => d.isWithinDataRange)
        .map((d) => d.filteredCount),
      1
    );

    // Group into weeks for proper layout
    const weeks: Array<typeof heatmapDays> = [];
    for (
      let weekIndex = 0;
      weekIndex < Math.ceil(heatmapDays.length / 7);
      weekIndex++
    ) {
      const weekStart = weekIndex * 7;
      const weekDays = heatmapDays.slice(weekStart, weekStart + 7);
      if (weekDays.length === 7) {
        // Only include complete weeks
        weeks.push(weekDays);
      }
    }

    return {
      heatmapDays,
      maxActivity,
      weeks,
      startDate: startSunday,
      endDate: endSaturday,
      actualDataEnd: endDate,
    };
  }, [effectiveActivityTimeline, filter]);

  // Get color intensity based on activity count
  const getColorIntensity = (
    count: number,
    maxCount: number,
    isWithinDataRange: boolean
  ): string => {
    if (!isWithinDataRange) return "bg-muted/30 border-border/30"; // Faded for out-of-range days
    if (count === 0) return "bg-muted border-border";

    const intensity = count / maxCount;
    if (intensity <= 0.25)
      return "bg-blue-200 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700";
    if (intensity <= 0.5)
      return "bg-blue-300 dark:bg-blue-800/60 border-blue-400 dark:border-blue-600";
    if (intensity <= 0.75)
      return "bg-blue-400 dark:bg-blue-700/80 border-blue-500 dark:border-blue-500";
    return "bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-400";
  };

  const weekDayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Generate month labels based on actual weeks in the data - improved positioning
  const monthLabels = useMemo(() => {
    const { weeks } = heatmapData;
    const labels: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      if (week.length === 7) {
        // Use the first day of the week to determine month
        const firstDayOfWeek = week[0].displayDate;
        const month = firstDayOfWeek.getMonth();

        // Add month label if it's a new month and it's the first occurrence of that month
        // or if it's the first week
        if (
          month !== lastMonth &&
          (weekIndex === 0 || firstDayOfWeek.getDate() <= 7)
        ) {
          labels.push({
            label: format(firstDayOfWeek, "MMM"),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [heatmapData]);

  // Generate months data for responsive grid layout
  const monthsData = useMemo(() => {
    const months: Array<{
      month: number;
      year: number;
      days: Array<(typeof heatmapData.heatmapDays)[0]>;
      monthKey: string;
    }> = [];

    // Get all days within data range
    const allDays = heatmapData.heatmapDays.filter((d) => d.isWithinDataRange);

    // Group days by month
    const monthMap = new Map<
      string,
      Array<(typeof heatmapData.heatmapDays)[0]>
    >();
    allDays.forEach((day) => {
      const month = day.displayDate.getMonth();
      const year = day.displayDate.getFullYear();
      // Use padded month for proper string sorting (01, 02, ..., 10, 11, 12)
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(day);
    });

    // Convert to sorted array - now proper chronological order
    Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([monthKey, days]) => {
        const [year, month] = monthKey.split("-").map(Number);
        months.push({
          month,
          year,
          days,
          monthKey,
        });
      });

    return months;
  }, [heatmapData]);

  // Helper function to get month name and activity summary
  const getMonthDisplayInfo = (monthData: (typeof monthsData)[0]) => {
    const monthName = format(
      new Date(monthData.year, monthData.month),
      "MMM yyyy"
    );
    const totalActivity = monthData.days.reduce(
      (sum: number, day) => sum + (day?.filteredCount || 0),
      0
    );
    return { monthName, totalActivity };
  };

  return (
    <div
      ref={heatmapRef}
      className={`bg-card p-4 rounded-lg border space-y-4 ${className}`}
      data-heatmap-container
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {filter === "all"
            ? t("analysis.activityHeatmap")
            : `${t("analysis.activityHeatmap")} - ${t(
                `analysis.${filter}Only`
              )}`}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t("analysis.less")}</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted border border-border"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-300 dark:bg-blue-800/60 border border-blue-400 dark:border-blue-600"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-700/80 border border-blue-500 dark:border-blue-500"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 dark:bg-blue-600 border border-blue-600 dark:border-blue-400"></div>
            </div>
            <span>{t("analysis.more")}</span>
          </div>
          <ShareButton
            targetRef={heatmapRef}
            filename={`activity-heatmap-${filter}`}
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      {/* Extra Large Layout - Traditional Horizontal heatmap */}
      <div className="relative hidden xl:block" data-heatmap-container>
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{
            maxWidth: "100%",
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(156 163 175) transparent",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          <div
            className="pb-2"
            style={{
              width: `${heatmapData.weeks.length * 14 + 24}px`,
              height: "auto",
            }}
            data-heatmap-content
          >
            {/* Month labels */}
            <div className="flex mb-4">
              <div className="w-6"></div>
              <div className="flex-1 relative">
                {monthLabels.map((monthData) => (
                  <span
                    key={`${monthData.label}-${monthData.weekIndex}`}
                    className="absolute text-xs text-muted-foreground font-medium"
                    style={{
                      left: `${monthData.weekIndex * 14 + 2}px`,
                      top: "-4px",
                    }}
                  >
                    {monthData.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex">
              {/* Day of week labels */}
              <div className="w-6 flex flex-col">
                {weekDayLabels.map((label, index) => (
                  <div
                    key={`day-label-${index}`}
                    className="h-3 flex items-center mb-0.5"
                  >
                    {index % 2 === 1 && (
                      <span className="text-xs text-muted-foreground text-right w-full pr-1">
                        {label}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Heatmap weeks */}
              <div className="flex gap-0.5">
                {heatmapData.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = week.find((d) => d.dayOfWeek === dayIndex);

                      if (!day) {
                        return (
                          <div
                            key={`empty-${weekIndex}-${dayIndex}`}
                            className="w-3 h-3"
                          />
                        );
                      }

                      const colorClass = getColorIntensity(
                        day.filteredCount,
                        heatmapData.maxActivity,
                        day.isWithinDataRange
                      );

                      return (
                        <div
                          key={day.date}
                          className={`w-3 h-3 rounded-sm border cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 ${colorClass}`}
                          title={`${format(day.displayDate, "MMM d, yyyy")}${
                            !day.isWithinDataRange
                              ? " (outside data range)"
                              : day.filteredCount > 0
                              ? filter === "all"
                                ? `: ${day.total} activities (${day.posts} posts, ${day.replies} replies, ${day.reposts} reposts)`
                                : `: ${day.filteredCount} ${filter}${
                                    day.filteredCount !== 1 ? "s" : ""
                                  }`
                              : ": No activity"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Grid Layout for smaller screens */}
      <div className="relative xl:hidden" data-heatmap-content>
        <div className="space-y-6">
          {/* Simple flexible grid without forced empty slots */}
          <div
            className={`
              grid gap-4 auto-rows-max
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
            `}
          >
            {monthsData.map((monthData) => {
              const { monthName, totalActivity } =
                getMonthDisplayInfo(monthData);

              return (
                <div key={monthData.monthKey} className="space-y-2">
                  {/* Month name and activity count */}
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground">
                      {monthName}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      {totalActivity > 0
                        ? `${totalActivity} ${
                            filter === "all" ? "activities" : filter
                          }`
                        : "No activity"}
                    </div>
                  </div>

                  {/* Month mini heatmap */}
                  <div className="flex flex-wrap gap-0.5 justify-center max-w-[84px] mx-auto">
                    {monthData.days.map((day) => {
                      const colorClass = getColorIntensity(
                        day.filteredCount,
                        heatmapData.maxActivity,
                        day.isWithinDataRange
                      );

                      return (
                        <div
                          key={day.date}
                          className={`w-2 h-2 rounded-sm border cursor-pointer transition-all hover:ring-1 hover:ring-blue-400 hover:ring-opacity-50 ${colorClass}`}
                          title={`${format(day.displayDate, "MMM d, yyyy")}${
                            !day.isWithinDataRange
                              ? " (outside data range)"
                              : day.filteredCount > 0
                              ? filter === "all"
                                ? `: ${day.total} activities (${day.posts} posts, ${day.replies} replies, ${day.reposts} reposts)`
                                : `: ${day.filteredCount} ${filter}${
                                    day.filteredCount !== 1 ? "s" : ""
                                  }`
                              : ": No activity"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-lg">
              {
                heatmapData.weeks
                  .flat()
                  .filter((d) => d.isWithinDataRange && d.filteredCount > 0)
                  .length
              }
            </div>
            <div className="text-muted-foreground text-xs">
              {t("analysis.activeDays")}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {Math.round(
                (heatmapData.weeks
                  .flat()
                  .filter((d) => d.isWithinDataRange)
                  .reduce((sum, d) => sum + d.filteredCount, 0) /
                  365) *
                  10
              ) / 10}
            </div>
            <div className="text-muted-foreground text-xs">
              {t("analysis.avgPerDay")}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {Math.max(
                ...heatmapData.weeks
                  .flat()
                  .filter((d) => d.isWithinDataRange)
                  .map((d) => d.filteredCount),
                0
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {t("analysis.maxDay")}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {heatmapData.weeks
                .flat()
                .filter((d) => d.isWithinDataRange)
                .reduce((sum, d) => sum + d.filteredCount, 0)}
            </div>
            <div className="text-muted-foreground text-xs">
              {filter === "all"
                ? t("analysis.totalYear")
                : `${t("analysis.total")} ${filter}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
