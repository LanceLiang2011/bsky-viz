"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import ShareButton from "./ShareButton";

interface ActivityByHourChartProps {
  activityByHour: Record<number, number>;
  className?: string;
}

export default function ActivityByHourChart({
  activityByHour,
  className = "",
}: ActivityByHourChartProps) {
  const t = useTranslations();
  const activityByHourRef = useRef<HTMLDivElement>(null);

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
      className={`bg-card p-3 sm:p-4 rounded-lg border space-y-4 ${className}`}
      ref={activityByHourRef}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          {t("analysis.activityByHour")}
        </h3>
        <ShareButton
          targetRef={activityByHourRef}
          filename={"activity-by-hour"}
          variant="ghost"
          size="sm"
        />
      </div>

      {/* Activity by Hour chart */}
      {renderActivityByHour}
    </div>
  );
}

export { ActivityByHourChart };
