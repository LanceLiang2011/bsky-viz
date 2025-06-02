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
  beforeCapture?: () => void;
  afterCapture?: () => void;
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

// Function to add website URL watermark to element before capture
const addWatermark = (element: HTMLElement, isDark: boolean): (() => void) => {
  const watermark = document.createElement("div");

  // Theme-aware watermark styling - contrasting colors
  const watermarkColor = isDark ? "#ffffff" : "#000000";
  const watermarkBg = isDark
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(0, 0, 0, 0.1)";

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
  beforeCapture,
  afterCapture,
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const t = useTranslations("openai");

  // Merge default options with provided ones - we'll set backgroundColor dynamically based on theme
  const defaultImageOptions: ElementToImageOptions = {
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

    beforeCapture?.();
    setIsLoading(true);

    let cleanupShareButton: (() => void) | null = null;
    let cleanupWatermark: (() => void) | null = null;

    try {
      console.log("ShareButton: Starting image capture...");
      console.log("ShareButton: Current theme:", theme);
      console.log("ShareButton: Target element:", targetRef.current);

      const isDarkTheme = theme === "dark";

      // Set subtle gradient backgrounds based on current theme
      const themeBackgroundColor = isDarkTheme
        ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)";

      const themeAwareOptions = {
        ...mergedOptions,
        backgroundColor: themeBackgroundColor,
      };

      console.log(
        "ShareButton: Using background gradient:",
        themeBackgroundColor
      );
      console.log(
        "ShareButton: Current theme:",
        isDarkTheme ? "dark" : "light"
      );

      // Hide ShareButton during capture
      cleanupShareButton = hideShareButtonDuringCapture(targetRef.current);
      console.log("ShareButton: Hidden ShareButton during capture");

      // Add watermark before capture
      cleanupWatermark = addWatermark(targetRef.current, isDarkTheme);
      console.log("ShareButton: Added watermark");

      // Wait for DOM updates to complete
      console.log("ShareButton: Waiting for DOM updates...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force a repaint to ensure all styles are applied
      targetRef.current.scrollTop = targetRef.current.scrollTop;

      // Log element styles for debugging
      const computedStyle = window.getComputedStyle(targetRef.current);
      console.log("ShareButton: Element background:", computedStyle.background);
      console.log("ShareButton: Element dimensions:", {
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight,
      });

      // Capture the image with theme-aware background
      console.log("ShareButton: Converting element to image...");
      const result = await convertToImage(targetRef.current, themeAwareOptions);
      console.log("ShareButton: Image conversion successful");

      // Download the image
      result.download(filename);
      console.log("ShareButton: Download initiated");
    } catch (error) {
      console.error("ShareButton: Failed to download image:", error);
      console.error("ShareButton: Error details:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      // Clean up modifications
      if (cleanupWatermark) {
        cleanupWatermark();
        console.log("ShareButton: Watermark cleanup completed");
      }
      if (cleanupShareButton) {
        cleanupShareButton();
        console.log("ShareButton: ShareButton cleanup completed");
      }

      setIsLoading(false);
      afterCapture?.();
    }
  };

  return (
    <div className="relative group" data-share-button="true">
      {/* Gradient border wrapper */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400/60 via-purple-400/60 to-pink-400/60 dark:from-blue-400/40 dark:via-purple-400/40 dark:to-pink-400/40 rounded-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" />

      <Button
        variant={variant}
        size={size}
        className={`relative flex items-center gap-2 bg-background/95 dark:bg-background/95 border-0 hover:bg-background/90 dark:hover:bg-background/90 ${className}`}
        onClick={handleDownload}
        disabled={isLoading}
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">
          {buttonText || (isLoading ? t("capturing") : t("capture"))}
        </span>
      </Button>
    </div>
  );
}

export { ShareButton };
