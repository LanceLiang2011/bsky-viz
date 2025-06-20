"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getAvatarFallbackChar,
  isValidAvatarUrl,
} from "@/app/utils/avatarUtils";
import type { InteractionData } from "./analysis-types";

interface AvatarCloudProps {
  interactions: InteractionData[];
  currentUser?: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  className?: string;
}

export default function AvatarCloud({
  interactions,
  currentUser,
  className = "",
}: AvatarCloudProps) {
  const t = useTranslations();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [screenSize, setScreenSize] = useState<"small" | "medium" | "large">(
    "large"
  );

  useEffect(() => {
    setMounted(true);

    const updateScreenSize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 640) {
          setScreenSize("small");
        } else if (window.innerWidth < 1024) {
          setScreenSize("medium");
        } else {
          setScreenSize("large");
        }
      }
    };

    // Set initial size
    updateScreenSize();

    // Add event listener
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateScreenSize);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateScreenSize);
      }
    };
  }, []);

  const handleUserClick = (handle: string) => {
    // Navigate to the user's handle page with current locale
    router.push(`/${encodeURIComponent(handle)}`);
  };

  // Calculate positions and sizes for avatar cloud using concentric circles
  const getAvatarStyle = (interaction: InteractionData, index: number) => {
    // Define the three rings: 5 + 10 + 15 = 30 total
    let ring: number;
    let positionInRing: number;
    let totalInRing: number;
    let avatarSize: number;
    let radiusPercentage: number;

    // Use default (large) sizing during SSR to prevent hydration mismatch
    const effectiveScreenSize = mounted ? screenSize : "large";

    if (index < 5) {
      // First ring: top 5 friends (positions 0-4)
      ring = 1;
      positionInRing = index;
      totalInRing = 5;
      avatarSize =
        effectiveScreenSize === "small"
          ? 48
          : effectiveScreenSize === "medium"
          ? 52
          : 56;
      radiusPercentage = effectiveScreenSize === "small" ? 22 : 25;
    } else if (index < 15) {
      // Second ring: next 10 friends (positions 5-14)
      ring = 2;
      positionInRing = index - 5;
      totalInRing = 10;
      avatarSize =
        effectiveScreenSize === "small"
          ? 40
          : effectiveScreenSize === "medium"
          ? 44
          : 48;
      radiusPercentage = effectiveScreenSize === "small" ? 32 : 35;
    } else {
      // Third ring: remaining 15 friends (positions 15-29)
      ring = 3;
      positionInRing = index - 15;
      totalInRing = 15;
      avatarSize =
        effectiveScreenSize === "small"
          ? 32
          : effectiveScreenSize === "medium"
          ? 36
          : 40;
      radiusPercentage = effectiveScreenSize === "small" ? 39 : 42;
    }

    // Calculate angle for even distribution in the ring
    const angleStep = (2 * Math.PI) / totalInRing;
    const angle = positionInRing * angleStep;

    // Add a small rotation offset for each ring to prevent alignment
    const ringOffset = ring * 0.3; // Slight rotation per ring
    const finalAngle = angle + ringOffset;

    // Calculate position relative to center (50%, 50%)
    const centerX = 50;
    const centerY = 50;

    // Convert radius percentage to actual pixel offset
    const x = centerX + radiusPercentage * Math.cos(finalAngle);
    const y = centerY + radiusPercentage * Math.sin(finalAngle);

    // Ensure positions stay within bounds with padding
    const boundedX = Math.round(Math.max(8, Math.min(92, x)) * 100) / 100;
    const boundedY = Math.round(Math.max(8, Math.min(92, y)) * 100) / 100;

    return {
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      position: "absolute" as const,
      left: `${boundedX}%`,
      top: `${boundedY}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 100 - index, // Higher rank = higher z-index
    };
  };

  // Show all 30 interactions in the cloud
  const cloudInteractions = interactions.slice(0, 30);

  // Use default (large) sizing during SSR to prevent hydration mismatch
  const effectiveScreenSize = mounted ? screenSize : "large";

  return (
    <TooltipProvider>
      <div
        className={`relative w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-gradient-to-br from-primary/10 via-muted to-primary/20 rounded-lg border overflow-hidden shadow-inner ${className}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)
          `,
        }}
      >
        {/* Center user avatar - largest and most prominent */}
        {currentUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute cursor-pointer hover:scale-110 transition-transform duration-200 drop-shadow-lg"
                style={{
                  width: `${
                    effectiveScreenSize === "small"
                      ? "64px"
                      : effectiveScreenSize === "medium"
                      ? "72px"
                      : "80px"
                  }`,
                  height: `${
                    effectiveScreenSize === "small"
                      ? "64px"
                      : effectiveScreenSize === "medium"
                      ? "72px"
                      : "80px"
                  }`,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                }}
                onClick={() => handleUserClick(currentUser.handle)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleUserClick(currentUser.handle);
                  }
                }}
              >
                <Avatar className="w-full h-full border-4 border-white shadow-xl ring-2 ring-indigo-200">
                  {isValidAvatarUrl(currentUser.avatar) && (
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser.displayName || currentUser.handle}
                    />
                  )}
                  <AvatarFallback
                    className={`bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold ${
                      effectiveScreenSize === "small" ? "text-lg" : "text-xl"
                    }`}
                  >
                    {mounted
                      ? getAvatarFallbackChar(
                          currentUser.displayName,
                          currentUser.handle
                        )
                      : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-popover/95 text-popover-foreground border shadow-xl backdrop-blur-sm z-[9999]"
              sideOffset={8}
            >
              <p className="font-medium">
                {currentUser.displayName || currentUser.handle}
                <span className="text-primary ml-1">
                  {t("analysis.youLabel")}
                </span>
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Interaction avatars in concentric rings */}
        {cloudInteractions.map((interaction, index) => {
          const style = getAvatarStyle(interaction, index);
          const ring = index < 5 ? 1 : index < 15 ? 2 : 3;

          // Different border styles for different rings
          const borderClasses = {
            1: "border-3 border-white shadow-lg ring-2 ring-indigo-100/70", // Inner ring
            2: "border-2 border-white shadow-md ring-1 ring-purple-100/50", // Middle ring
            3: "border-2 border-white shadow-md ring-1 ring-gray-100/40", // Outer ring
          };

          const fallbackClasses = {
            1: "bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold", // Inner ring
            2: "bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium", // Middle ring
            3: "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground font-medium", // Outer ring
          };

          return (
            <Tooltip key={interaction.handle}>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer hover:scale-110 transition-transform duration-200 drop-shadow-md"
                  style={style}
                  onClick={() => handleUserClick(interaction.handle)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleUserClick(interaction.handle);
                    }
                  }}
                >
                  <Avatar
                    className={`w-full h-full ${
                      borderClasses[ring as keyof typeof borderClasses]
                    }`}
                  >
                    {isValidAvatarUrl(interaction.avatar) && (
                      <AvatarImage
                        src={interaction.avatar}
                        alt={interaction.displayName || interaction.handle}
                      />
                    )}
                    <AvatarFallback
                      className={`${
                        fallbackClasses[ring as keyof typeof fallbackClasses]
                      } text-xs`}
                    >
                      {mounted
                        ? getAvatarFallbackChar(
                            interaction.displayName,
                            interaction.handle
                          )
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover/95 text-popover-foreground border shadow-xl backdrop-blur-sm z-[9999]"
                sideOffset={8}
              >
                <div className="text-center">
                  <p className="font-medium text-sm">
                    {interaction.displayName || interaction.handle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("analysis.interactionCount", {
                      count: interaction.count,
                    })}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
