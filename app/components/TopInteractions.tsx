"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAvatarFallbackChar,
  isValidAvatarUrl,
} from "@/app/utils/avatarUtils";
import type { InteractionData, TopInteractionsProps } from "./analysis-types";

export type { InteractionData, TopInteractionsProps };

export default function TopInteractions({
  interactions,
  className = "",
  maxHeight = "max-h-60",
}: TopInteractionsProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleUserClick = (handle: string) => {
    // Navigate to the user's handle page with current locale
    router.push(`/${encodeURIComponent(handle)}`);
  };

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-lg border ${className}`}>
      <h3 className="text-base sm:text-lg font-medium mb-2">
        {t("analysis.topInteractions")}
      </h3>
      <div className={`overflow-y-auto ${maxHeight}`}>
        {interactions.map((interaction, index) => (
          <div
            key={interaction.handle}
            onClick={() => handleUserClick(interaction.handle)}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b last:border-b-0 gap-2 sm:gap-0 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-sm"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUserClick(interaction.handle);
              }
            }}
            aria-label={`View profile of ${
              interaction.displayName || interaction.handle
            }`}
            title={`Click to view ${
              interaction.displayName || interaction.handle
            }'s profile`}
          >
            <div className="flex items-center min-w-0 flex-1 gap-3">
              <span className="text-gray-400 mr-2 text-sm">#{index + 1}</span>
              <Avatar className="size-8 shrink-0">
                {isValidAvatarUrl(interaction.avatar) && (
                  <AvatarImage
                    src={interaction.avatar}
                    alt={interaction.displayName || interaction.handle}
                  />
                )}
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  {getAvatarFallbackChar(
                    interaction.displayName,
                    interaction.handle
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate text-sm sm:text-base">
                  {interaction.displayName || interaction.handle}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm truncate">
                  @{interaction.handle}
                </span>
              </div>
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
