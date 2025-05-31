"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div
      className={`relative w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-lg border overflow-hidden shadow-inner ${className}`}
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
          title={`${currentUser.displayName || currentUser.handle} (You)`}
        >
          <Avatar className="w-full h-full border-4 border-white shadow-xl ring-2 ring-indigo-200">
            {isValidAvatarUrl(currentUser.avatar) && (
              <AvatarImage
                src={currentUser.avatar}
                alt={currentUser.displayName || currentUser.handle}
              />
            )}
            <AvatarFallback
              className={`bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold ${
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
          1: "bg-gradient-to-br from-indigo-200 to-purple-200 text-indigo-800 font-semibold", // Inner ring
          2: "bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-medium", // Middle ring
          3: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-medium", // Outer ring
        };

        return (
          <div
            key={interaction.handle}
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
            title={`${interaction.displayName || interaction.handle} - ${
              interaction.count
            } interactions`}
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
        );
      })}

      {/* Center label with enhanced styling */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 font-medium shadow-md border border-white/50">
        {t("analysis.friendCircle")}
      </div>
    </div>
  );
}
