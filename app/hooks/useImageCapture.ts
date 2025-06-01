"use client";

import { useCallback, RefObject } from "react";
import {
  elementToImage,
  ElementToImageOptions,
} from "@/app/utils/elementToImage";

/**
 * Custom hook for easily converting React elements to images
 * This provides a simplified interface for the elementToImage utility
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { captureElement, isCapturing } = useImageCapture();
 *
 *   const handleCapture = async () => {
 *     try {
 *       const result = await captureElement(ref.current);
 *       result.download('my-image.png');
 *     } catch (error) {
 *       console.error('Failed to capture:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <div ref={ref}>Content to capture</div>
 *       <button onClick={handleCapture} disabled={isCapturing}>
 *         {isCapturing ? 'Capturing...' : 'Capture'}
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useImageCapture(defaultOptions?: ElementToImageOptions) {
  const captureElement = useCallback(
    async (element: HTMLElement | null, options?: ElementToImageOptions) => {
      if (!element) {
        throw new Error("Element is required for image capture");
      }

      const mergedOptions = { ...defaultOptions, ...options };
      return await elementToImage(element, mergedOptions);
    },
    [defaultOptions]
  );

  const captureFromRef = useCallback(
    async (ref: RefObject<HTMLElement>, options?: ElementToImageOptions) => {
      if (!ref.current) {
        throw new Error("Ref does not contain a valid element");
      }

      return await captureElement(ref.current, options);
    },
    [captureElement]
  );

  return {
    captureElement,
    captureFromRef,
  };
}
