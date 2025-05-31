"use client";

import { useTranslations } from "next-intl";
import type { InteractionData, TopInteractionsProps } from "./analysis-types";

export type { InteractionData, TopInteractionsProps };

export default function TopInteractions({
  interactions,
  className = "",
  maxHeight = "max-h-60",
}: TopInteractionsProps) {
  const t = useTranslations();

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-lg border ${className}`}>
      <h3 className="text-base sm:text-lg font-medium mb-2">
        {t("analysis.topInteractions")}
      </h3>
      <div className={`overflow-y-auto ${maxHeight}`}>
        {interactions.map((interaction, index) => (
          <div
            key={interaction.handle}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b last:border-b-0 gap-2 sm:gap-0"
          >
            <div className="flex items-center min-w-0 flex-1">
              <span className="text-gray-400 mr-2 text-sm">#{index + 1}</span>
              <span className="font-medium truncate text-sm sm:text-base">
                {interaction.displayName || interaction.handle}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm ml-2 truncate">
                @{interaction.handle}
              </span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm self-start sm:self-auto whitespace-nowrap">
              {interaction.count} {t("analysis.interactions")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
