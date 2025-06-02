"use client";

import React, { useState } from "react";
import { RefObject } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  useElementToImage,
  ElementToImageOptions,
} from "@/app/utils/elementToImage";
import { Camera } from "lucide-react";

export interface ShareButtonProps {
  /** Ref to the element to be converted to image */
  targetRef: RefObject<HTMLElement | null>;
  /** Options for image conversion */
  imageOptions?: ElementToImageOptions;
  /** Custom filename for downloads */
  filename?: string;
  /** Custom button text */
  buttonText?: string;
  /** Button variant */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom class name */
  className?: string;
}

// Function to hide ShareButton during capture
const hideShareButtonDuringCapture = (element: HTMLElement): (() => void) => {
  // Find all ShareButton elements within the target
  const shareButtons = element.querySelectorAll("[data-share-button]");
  const originalDisplays: string[] = [];

  shareButtons.forEach((button, index) => {
    const htmlButton = button as HTMLElement;
    originalDisplays[index] = htmlButton.style.display;
    htmlButton.style.display = "none";
  });

  // Return cleanup function
  return () => {
    shareButtons.forEach((button, index) => {
      const htmlButton = button as HTMLElement;
      htmlButton.style.display = originalDisplays[index] || "";
    });
  };
};

// Function to apply aesthetically pleasing gradient background
const applyGradientBackground = (
  element: HTMLElement,
  isDark: boolean
): (() => void) => {
  const originalBackground = element.style.background;
  const originalBackgroundColor = element.style.backgroundColor;
  const originalBackgroundImage = element.style.backgroundImage;

  // Define gradient backgrounds based on theme
  const gradients = {
    light: {
      // Balanced subtle gradients - noticeable but gentle
      primary: "linear-gradient(135deg, #f9fafc 0%, #f4f6f8 100%)",
      secondary: "linear-gradient(135deg, #faf9fb 0%, #f6f4f6 100%)",
      tertiary: "linear-gradient(135deg, #f8fbfc 0%, #f3f8fa 100%)",
      quaternary: "linear-gradient(135deg, #fbfbfc 0%, #f7f9fa 100%)",
      elegant:
        "linear-gradient(135deg, #fafbfc 0%, #f6f8fa 25%, #f9f7f9 50%, #f5f6f8 75%, #f8fafb 100%)",
    },
    dark: {
      primary: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      secondary:
        "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
      tertiary:
        "linear-gradient(135deg, #0f0f23 0%, #16213e 50%, #1a1a2e 100%)",
      quaternary:
        "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 75%, #0f3460 100%)",
      elegant:
        "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #1a1a2e 80%, #0a0a0a 100%)",
    },
  };

  // Choose a gradient (you can randomize this or make it configurable)
  const selectedGradient = isDark
    ? gradients.dark.elegant
    : gradients.light.elegant;

  // Apply the gradient
  element.style.background = selectedGradient;
  element.style.backgroundImage = selectedGradient;

  // Return cleanup function
  return () => {
    element.style.background = originalBackground;
    element.style.backgroundColor = originalBackgroundColor;
    element.style.backgroundImage = originalBackgroundImage;
  };
};

// Function to add website URL watermark to element before capture
const addWatermark = (element: HTMLElement, isDark: boolean): (() => void) => {
  const watermark = document.createElement("div");

  // Theme-aware watermark styling
  const watermarkColor = isDark ? "#ffffff" : "#666666";
  const watermarkBg = isDark
    ? "rgba(0, 0, 0, 0.7)"
    : "rgba(255, 255, 255, 0.9)";

  watermark.style.cssText = `
    position: absolute;
    bottom: 12px;
    right: 12px;
    font-size: 12px;
    color: ${watermarkColor};
    background: ${watermarkBg};
    padding: 4px 8px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    pointer-events: none;
  `;
  watermark.textContent = "www.bsky-viz.com";

  // Make sure the parent element has relative positioning
  const originalPosition = element.style.position;
  if (!originalPosition || originalPosition === "static") {
    element.style.position = "relative";
  }

  element.appendChild(watermark);

  // Return cleanup function
  return () => {
    if (watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
    // Restore original position if we changed it
    if (!originalPosition || originalPosition === "static") {
      element.style.position = originalPosition;
    }
  };
};

export default function ShareButton({
  targetRef,
  imageOptions = {},
  filename = "bsky-viz-image",
  buttonText,
  variant = "outline",
  size = "default",
  className = "",
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const t = useTranslations("openai");

  // Merge default options with provided ones, with special handling for gradients
  const defaultImageOptions: ElementToImageOptions = {
    // Don't set backgroundColor when using gradients - let the applied gradient show
    pixelRatio: 2,
    quality: 0.95,
    cacheBust: true,
    skipFonts: false,
  };

  const mergedOptions = { ...defaultImageOptions, ...imageOptions };
  const convertToImage = useElementToImage(mergedOptions);

  const handleDownload = async () => {
    if (!targetRef.current) {
      console.error("ShareButton: Target ref is null");
      return;
    }

    setIsLoading(true);

    try {
      console.log("ShareButton: Starting image capture...");
      console.log("ShareButton: Current theme:", theme);

      const isDarkTheme = theme === "dark";

      // Hide ShareButton during capture
      const cleanupShareButton = hideShareButtonDuringCapture(
        targetRef.current
      );
      console.log("ShareButton: Hidden ShareButton during capture");

      // Apply gradient background
      const cleanupGradient = applyGradientBackground(
        targetRef.current,
        isDarkTheme
      );
      console.log("ShareButton: Applied gradient background");

      // Add watermark before capture with theme-aware styling
      const cleanupWatermark = addWatermark(targetRef.current, isDarkTheme);
      console.log("ShareButton: Added theme-aware watermark");

      // Wait a moment for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture the image with detailed logging
      console.log(
        "ShareButton: Converting element to image with options:",
        mergedOptions
      );
      const result = await convertToImage(targetRef.current);
      console.log("ShareButton: Image conversion successful");

      // Clean up all modifications
      cleanupWatermark();
      cleanupGradient();
      cleanupShareButton();
      console.log("ShareButton: All cleanup completed");

      // Download the image
      result.download(filename);
      console.log("ShareButton: Download initiated");
    } catch (error) {
      console.error("ShareButton: Failed to download image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleDownload}
      disabled={isLoading}
      data-share-button="true"
    >
      <Camera className="w-4 h-4" />
      <span className="hidden sm:inline">
        {buttonText || (isLoading ? t("capturing") : t("capture"))}
      </span>
    </Button>
  );
}

export { ShareButton };
