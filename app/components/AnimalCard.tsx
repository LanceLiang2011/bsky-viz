"use client";

import { getAnimalImage, type Animal } from "@/app/types/animals";
import { useTranslations } from "next-intl";
import AnimatedProfileCard from "./AnimatedProfileCard";

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
  const t = useTranslations("openai");

  if (!animal || !animalReason) {
    return (
      <div className="bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border-l border-r border-b border-border/50 shadow-xl rounded-b-[22px] p-6 sm:p-8">
        <div className="text-foreground/70 text-base sm:text-lg italic text-center py-8">
          Animal analysis not available
        </div>
      </div>
    );
  }

  // Capitalize the animal name for display
  const displayAnimalName = animal.charAt(0).toUpperCase() + animal.slice(1);

  // Use the full animal reason text without truncation since we now have scrolling
  const displayReason = animalReason;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Header with user info if needed */}
      {showUserInfo && (
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
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
          </h2>
        </div>
      )}

      {/* Animated Profile Card with Animal */}
      <AnimatedProfileCard
        avatarUrl={getAnimalImage(animal)}
        name={displayAnimalName}
        title={displayReason}
        identityLabel={t("animalIdentityLabel", {
          username: username || handle,
        })}
        handle={handle}
        status="Spirit Animal"
        contactText="Analysis"
        showUserInfo={true}
        enableTilt={true}
        miniAvatarUrl={getAnimalImage(animal)}
        className="animal-card"
        onContactClick={() => {
          // Optional: Add interaction tracking or modal
          console.log(`Viewed ${animal} analysis for @${handle}`);
        }}
      />
    </div>
  );
}
