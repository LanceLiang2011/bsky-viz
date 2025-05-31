"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
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

  const handleUserClick = (handle: string) => {
    // Navigate to the user's handle page with current locale
    router.push(`/${encodeURIComponent(handle)}`);
  };

  // Calculate positions and sizes for avatar cloud
  const getAvatarStyle = (interaction: InteractionData, index: number) => {
    const maxCount = Math.max(...interactions.map((i) => i.count));
    const minCount = Math.min(...interactions.map((i) => i.count));

    // Calculate size based on interaction count (32px to 72px) - larger sizes
    const sizeRatio =
      maxCount > minCount
        ? (interaction.count - minCount) / (maxCount - minCount)
        : 0.5;
    const size = Math.max(32, Math.min(72, 32 + sizeRatio * 40));

    // Calculate position in a tighter spiral pattern around the center
    const angle = index * 137.5 * (Math.PI / 180); // Golden angle for better distribution
    const radius = Math.min(25 + index * 6, 120); // Tighter spiral, smaller max radius

    const centerX = 50; // Center percentage
    const centerY = 50; // Center percentage

    const x = centerX + (radius * Math.cos(angle)) / 2.5; // Less division for more compact layout
    const y = centerY + (radius * Math.sin(angle)) / 2.5;

    // Ensure positions stay within bounds with better padding
    const boundedX = Math.max(8, Math.min(92, x));
    const boundedY = Math.max(8, Math.min(92, y));

    return {
      width: `${size}px`,
      height: `${size}px`,
      position: "absolute" as const,
      left: `${boundedX}%`,
      top: `${boundedY}%`,
      transform: "translate(-50%, -50%)",
      zIndex: interactions.length - index, // Higher interaction count = higher z-index
    };
  };

  // Take only top 15 interactions for the cloud to keep it compact
  const cloudInteractions = interactions.slice(0, 15);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-lg border overflow-hidden shadow-inner ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)
        `,
      }}
    >
      {/* Center user avatar - larger and more prominent */}
      {currentUser && (
        <div
          className="absolute cursor-pointer hover:scale-110 transition-transform duration-200 drop-shadow-lg"
          style={{
            width: "96px",
            height: "96px",
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
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold">
              {getAvatarFallbackChar(
                currentUser.displayName,
                currentUser.handle
              )}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Interaction avatars */}
      {cloudInteractions.map((interaction, index) => (
        <div
          key={interaction.handle}
          className="cursor-pointer hover:scale-110 transition-transform duration-200 drop-shadow-md"
          style={getAvatarStyle(interaction, index)}
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
          <Avatar className="w-full h-full border-3 border-white shadow-lg ring-1 ring-gray-200/50">
            {isValidAvatarUrl(interaction.avatar) && (
              <AvatarImage
                src={interaction.avatar}
                alt={interaction.displayName || interaction.handle}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-medium">
              {getAvatarFallbackChar(
                interaction.displayName,
                interaction.handle
              )}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}

      {/* Center label with enhanced styling */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 font-medium shadow-md border border-white/50">
        {t("analysis.friendCircle")}
      </div>
    </div>
  );
}
