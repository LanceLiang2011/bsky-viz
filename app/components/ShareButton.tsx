"use client";

import React, { useState } from "react";
import { RefObject } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  useElementToImage,
  ElementToImageOptions,
} from "@/app/utils/elementToImage";
import { Download } from "lucide-react";

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

  // Get theme-appropriate background color
  const getThemeBackgroundColor = () => {
    if (theme === "dark") {
      return "#09090b"; // zinc-950 - dark mode background
    }
    return "#ffffff"; // white - light mode background
  };

  // Merge default options with provided ones, using theme-based background
  const defaultImageOptions: ElementToImageOptions = {
    backgroundColor: getThemeBackgroundColor(),
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

      // Add watermark before capture with theme-aware styling
      const cleanupWatermark = addWatermark(targetRef.current, isDarkTheme);
      console.log("ShareButton: Added theme-aware watermark");

      // Wait a moment for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Capture the image with detailed logging
      console.log(
        "ShareButton: Converting element to image with options:",
        mergedOptions
      );
      const result = await convertToImage(targetRef.current);
      console.log("ShareButton: Image conversion successful");

      // Clean up watermark
      cleanupWatermark();
      console.log("ShareButton: Cleanup completed");

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
      className={className}
      onClick={handleDownload}
      disabled={isLoading}
    >
      <Download className="w-4 h-4 mr-2" />
      {buttonText || (isLoading ? "Downloading..." : "Download")}
    </Button>
  );
}

export { ShareButton };
