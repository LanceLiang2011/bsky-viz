"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAvatarFallbackChar,
  isValidAvatarUrl,
} from "@/app/utils/avatarUtils";
import type { InteractionData } from "./analysis-types";

interface InteractionsListProps {
  interactions: InteractionData[];
  maxHeight?: string;
  maxItems?: number;
}

export default function InteractionsList({
  interactions,
  maxHeight = "max-h-60",
  maxItems = 30,
}: InteractionsListProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleUserClick = (handle: string) => {
    // Navigate to the user's handle page with current locale
    router.push(`/${encodeURIComponent(handle)}`);
  };

  // Show only the specified number of interactions in the list
  const listInteractions = interactions.slice(0, maxItems);

  return (
    <div className={`overflow-y-auto ${maxHeight}`}>
      {listInteractions.map((interaction, index) => (
        <div
          key={interaction.handle}
          onClick={() => handleUserClick(interaction.handle)}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b last:border-b-0 gap-2 sm:gap-0 cursor-pointer hover:bg-muted/50 transition-colors duration-200 rounded-sm"
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
            <span className="text-muted-foreground mr-2 text-sm">
              #{index + 1}
            </span>
            <Avatar className="size-8 shrink-0">
              {isValidAvatarUrl(interaction.avatar) && (
                <AvatarImage
                  src={interaction.avatar}
                  alt={interaction.displayName || interaction.handle}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
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
              <span className="text-muted-foreground text-xs sm:text-sm truncate">
                @{interaction.handle}
              </span>
            </div>
          </div>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs sm:text-sm self-start sm:self-auto whitespace-nowrap">
            {interaction.count} {t("analysis.interactions")}
          </span>
        </div>
      ))}
    </div>
  );
}
