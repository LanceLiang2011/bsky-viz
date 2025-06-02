"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { PostTypeFilter } from "./UnifiedActivity";

interface MostActiveTimeSectionProps {
  localizedMostActiveHour: number;
  mostActiveDay: string;
  filter: PostTypeFilter;
  className?: string;
}

export default function MostActiveTimeSection({
  localizedMostActiveHour,
  mostActiveDay,
  filter,
  className = "",
}: MostActiveTimeSectionProps) {
  const t = useTranslations();

  return (
    <div className={`border-t pt-4 ${className}`}>
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
            {localizedMostActiveHour}:00 - {(localizedMostActiveHour + 1) % 24}
            :00
          </p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("analysis.mostActiveDay")}
          </p>
          <p className="text-lg sm:text-xl font-semibold break-words">
            {mostActiveDay && !isNaN(new Date(mostActiveDay).getTime())
              ? format(new Date(mostActiveDay), "PPP")
              : t("analysis.noData")}
          </p>
        </div>
      </div>
    </div>
  );
}

export { MostActiveTimeSection };
