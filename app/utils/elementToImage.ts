"use client";

import { toPng, toJpeg, toSvg } from "html-to-image";

export type ImageFormat = "png" | "jpeg" | "svg";

export interface ElementToImageOptions {
  format?: ImageFormat;
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
  skipFonts?: boolean;
  cacheBust?: boolean;
  filter?: (node: HTMLElement) => boolean;
}

export interface ElementToImageResult {
  dataUrl: string;
  blob: Blob;
  download: (filename?: string) => void;
}

/**
 * Convert a React element (via ref) to an image
 * @param element - The HTML element to convert
 * @param options - Conversion options
 * @returns Promise with image data and utilities
 */
export async function elementToImage(
  element: HTMLElement,
  options: ElementToImageOptions = {}
): Promise<ElementToImageResult> {
  const {
    format = "png",
    quality = 0.95,
    backgroundColor = "#ffffff",
    pixelRatio = 2,
    skipFonts = false,
    cacheBust = true,
    filter,
    width,
    height,
  } = options;

  const htmlToImageOptions = {
    quality,
    backgroundColor,
    pixelRatio,
    skipFonts,
    cacheBust,
    filter,
    width,
    height,
  };

  let dataUrl: string;

  try {
    switch (format) {
      case "jpeg":
        dataUrl = await toJpeg(element, htmlToImageOptions);
        break;
      case "svg":
        dataUrl = await toSvg(element, htmlToImageOptions);
        break;
      case "png":
      default:
        dataUrl = await toPng(element, htmlToImageOptions);
        break;
    }
  } catch (error) {
    throw new Error(`Failed to convert element to ${format}: ${error}`);
  }

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Create download function
  const download = (filename?: string) => {
    const defaultFilename = `image.${format}`;
    const link = document.createElement("a");
    link.download = filename || defaultFilename;
    link.href = dataUrl;
    link.click();
  };

  return {
    dataUrl,
    blob,
    download,
  };
}

/**
 * Hook for converting React elements to images
 * @param options - Default options for image conversion
 * @returns Function to convert element to image
 */
export function useElementToImage(defaultOptions: ElementToImageOptions = {}) {
  return (element: HTMLElement | null, options: ElementToImageOptions = {}) => {
    if (!element) {
      throw new Error("Element is null or undefined");
    }

    return elementToImage(element, { ...defaultOptions, ...options });
  };
}
