"use client";

import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
}

/**
 * Optimized Image component that automatically determines whether to use
 * Next.js image optimization based on the image source
 */
export default function OptimizedImage({ src, ...props }: OptimizedImageProps) {
  // Don't optimize static animal images or small assets
  const shouldOptimize =
    !src.startsWith("/assets/animals/") &&
    !src.startsWith("/logo.png") &&
    !src.startsWith("/favicon");

  return (
    <Image
      src={src}
      unoptimized={!shouldOptimize}
      quality={shouldOptimize ? 75 : undefined}
      {...props}
    />
  );
}
