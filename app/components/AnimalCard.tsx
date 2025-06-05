"use client";

import { useTranslations } from "next-intl";
import { getAnimalEmoji, type Animal } from "@/app/types/animals";

interface AnimalCardProps {
  animal?: Animal | null;
  animalReason?: string | null;
  username?: string;
  handle: string;
  showUserInfo: boolean;
}

export default function AnimalCard({
  animal,
  animalReason,
  username,
  handle,
  showUserInfo,
}: AnimalCardProps) {
  const t = useTranslations();

  return (
    <div className="bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border-l border-r border-b border-border/50 shadow-xl rounded-b-[22px] p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
          {showUserInfo ? (
            <div className="flex flex-col gap-1">
              {username && (
                <span className="text-xl sm:text-2xl lg:text-3xl">
                  {username}
                </span>
              )}
              <span className="text-sm sm:text-base lg:text-lg text-muted-foreground font-normal">
                @{handle}
              </span>
            </div>
          ) : (
            t("openai.animalTitle")
          )}
        </h2>
      </div>

      {/* Content */}
      <div className="max-w-none">
        {animal && animalReason ? (
          <div className="space-y-6">
            {/* Animal Display */}
            <div className="text-center">
              <div className="text-6xl sm:text-7xl lg:text-8xl mb-4">
                {getAnimalEmoji(animal)}
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 capitalize">
                {animal}
              </h3>
            </div>

            {/* Reason */}
            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                {t("openai.animalReasonTitle")}
              </h4>
              <p className="text-foreground/90 text-base sm:text-lg leading-relaxed">
                {animalReason}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-foreground/70 text-base sm:text-lg italic text-center py-8">
            Animal analysis not available
          </div>
        )}
      </div>
    </div>
  );
}
