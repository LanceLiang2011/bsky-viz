"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ShareButton from "./ShareButton";

interface ActivityByHourChartProps {
  activityByHour: Record<number, number>;
  activityByMinute?: Array<{
    hour: number;
    minute: number;
    timestamp: number;
    type: "post" | "reply" | "repost";
    createdAt: string;
  }>;
  className?: string;
}

export default function ActivityByHourChart({
  activityByHour,
  activityByMinute,
  className = "",
}: ActivityByHourChartProps) {
  const t = useTranslations();
  const activityByHourRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("bar");

  // Transform minute data for scatter plot with memoization for performance
  const scatterData = useMemo(() => {
    if (!activityByMinute || activityByMinute.length === 0) return [];

    // Group by timestamp to count occurrences at the same time
    const timeCountMap = new Map<
      number,
      {
        hour: number;
        minute: number;
        timestamp: number;
        count: number;
        types: { post: number; reply: number; repost: number };
      }
    >();

    activityByMinute.forEach((item) => {
      const key = item.timestamp;
      if (!timeCountMap.has(key)) {
        timeCountMap.set(key, {
          hour: item.hour,
          minute: item.minute,
          timestamp: item.timestamp,
          count: 0,
          types: { post: 0, reply: 0, repost: 0 },
        });
      }
      const entry = timeCountMap.get(key)!;
      entry.count++;
      entry.types[item.type]++;
    });

    return Array.from(timeCountMap.values()).map((item) => ({
      ...item,
      // Convert timestamp back to decimal hour for Y-axis (0-24)
      timeDecimal: item.timestamp / 60,
      // Determine dominant type for coloring
      dominantType:
        item.types.post >= item.types.reply &&
        item.types.post >= item.types.repost
          ? "post"
          : item.types.reply >= item.types.repost
          ? "reply"
          : "repost",
    }));
  }, [activityByMinute]);

  // Color mapping for post types
  const getColor = (type: string) => {
    switch (type) {
      case "post":
        return "#3b82f6"; // blue
      case "reply":
        return "#10b981"; // green
      case "repost":
        return "#f59e0b"; // amber
      default:
        return "#6b7280"; // gray
    }
  };

  // Render function for activity by hour visualization
  const renderActivityByHour = useMemo(() => {
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
  }, [activityByHour, t]);

  return (
    <div
      className={`bg-card p-4 rounded-lg border space-y-4 ${className}`}
      ref={activityByHourRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("analysis.activityByHour")}</h3>
        <ShareButton
          targetRef={activityByHourRef}
          filename="activity-by-hour"
          variant="ghost"
          size="sm"
        />
      </div>

      {/* Tabs for switching between chart types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bar">{t("analysis.barChart")}</TabsTrigger>
          <TabsTrigger value="scatter" disabled={!activityByMinute}>
            {t("analysis.scatterPlot")}{" "}
            {!activityByMinute
              ? `(${t("analysis.noData")})`
              : `(${activityByMinute.length} ${t("analysis.points")})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="mt-4">
          {renderActivityByHour}
        </TabsContent>

        <TabsContent value="scatter" className="mt-4">
          {activityByMinute ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {t("analysis.scatterPlotDescription")}
              </div>
              <div className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={scatterData}
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="count"
                      type="number"
                      name={t("analysis.postCount")}
                      label={{
                        value: t("analysis.postCount"),
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      dataKey="timeDecimal"
                      type="number"
                      domain={[0, 24]}
                      name={t("analysis.time")}
                      label={{
                        value: t("analysis.time24h"),
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tickFormatter={(value) =>
                        `${Math.floor(value)}:${String(
                          Math.floor((value % 1) * 60)
                        ).padStart(2, "0")}`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => {
                        const hours = Math.floor(label);
                        const minutes = Math.floor((label % 1) * 60);
                        return `${t("analysis.time")}: ${hours}:${String(
                          minutes
                        ).padStart(2, "0")}`;
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">
                                {t("analysis.time")}:{" "}
                                {Math.floor(data.timeDecimal)}:
                                {String(
                                  Math.floor((data.timeDecimal % 1) * 60)
                                ).padStart(2, "0")}
                              </p>
                              <p>
                                {t("analysis.totalPosts")}: {data.count}
                              </p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  {t("analysis.posts")}: {data.types.post}
                                </p>
                                <p className="text-sm">
                                  {t("analysis.replies")}: {data.types.reply}
                                </p>
                                <p className="text-sm">
                                  {t("analysis.reposts")}: {data.types.repost}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="count">
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColor(entry.dominantType)}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span>{t("analysis.posts")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span>{t("analysis.replies")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span>{t("analysis.reposts")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("analysis.noScatterData")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { ActivityByHourChart };
