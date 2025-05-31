"use client";

import { useTranslations } from "next-intl";
import type { InsightsData, KeyInsightsProps } from "./analysis-types";

export type { InsightsData, KeyInsightsProps };

export default function KeyInsights({
  insights,
  className = "",
}: KeyInsightsProps) {
  const t = useTranslations();

  const insightItems = [
    {
      key: "posts",
      value: insights.totalPosts,
      label: t("analysis.posts"),
    },
    {
      key: "replies",
      value: insights.totalReplies,
      label: t("analysis.replies"),
    },
    {
      key: "reposts",
      value: insights.totalReposts,
      label: t("analysis.reposts"),
    },
    {
      key: "avgLength",
      value: insights.averagePostLength,
      label: t("analysis.avgLength"),
      suffix: t("analysis.chars"),
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}
    >
      {insightItems.map((item) => (
        <div key={item.key} className="bg-muted p-3 sm:p-4 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {item.label}
          </h4>
          <p className="text-lg sm:text-2xl font-bold">
            {item.value}
            {item.suffix && (
              <span className="text-sm sm:text-base ml-1">{item.suffix}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
