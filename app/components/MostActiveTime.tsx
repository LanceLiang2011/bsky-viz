"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import type { MostActiveTimeData, MostActiveTimeProps } from "./analysis-types";

export type { MostActiveTimeData, MostActiveTimeProps };

export default function MostActiveTime({
  data,
  localizedMostActiveHour,
  className = "",
}: MostActiveTimeProps) {
  const t = useTranslations();

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-lg border ${className}`}>
      <h3 className="text-base sm:text-lg font-medium mb-2">
        {t("analysis.mostActiveTime")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">
            {t("analysis.mostActiveHour")}
          </p>
          <p className="text-lg sm:text-xl font-semibold">
            {localizedMostActiveHour}:00 - {(localizedMostActiveHour + 1) % 24}
            :00
          </p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">
            {t("analysis.mostActiveDay")}
          </p>
          <p className="text-lg sm:text-xl font-semibold break-words">
            {data.mostActiveDay &&
            !isNaN(new Date(data.mostActiveDay).getTime())
              ? format(new Date(data.mostActiveDay), "PPP")
              : t("analysis.noData")}
          </p>
        </div>
      </div>
    </div>
  );
}
