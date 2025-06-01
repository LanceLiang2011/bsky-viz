# Element to Image Utilities Documentation

This documentation covers the reusable React/Next.js utilities for converting React elements to images using the `html-to-image` library.

## Overview

The implementation consists of two main parts:

1. **`elementToImage.ts`** - Core utility function for element-to-image conversion with theme support
2. **`ShareButton.tsx`** - Theme-aware component with automatic background detection and watermarking

## Key Features

✅ **Theme-Aware Capture**: Automatically detects light/dark mode and applies appropriate backgrounds  
✅ **Smart Watermarking**: Theme-adaptive watermarks that are readable in all modes  
✅ **Zero Configuration**: No manual background setup required  
✅ **Clean Architecture**: Simple, maintainable code without complex DOM manipulation

## Installation & Dependencies

The required dependency is already installed:

```json
{
  "html-to-image": "^1.11.13",
  "next-themes": "^0.3.0"
}
```

## Core Utility: `elementToImage`

Located at: `app/utils/elementToImage.ts`

### Basic Usage

```tsx
import { elementToImage } from "@/app/utils/elementToImage";

const result = await elementToImage(htmlElement, {
  format: "png",
  quality: 0.95,
  backgroundColor: "#ffffff",
  pixelRatio: 2,
});

// Download the image
result.download("my-image.png");

// Access the blob or data URL
console.log(result.blob);
console.log(result.dataUrl);
```

### Options

```tsx
interface ElementToImageOptions {
  format?: "png" | "jpeg" | "svg";
  quality?: number; // 0-1, for JPEG
  width?: number; // Override element width
  height?: number; // Override element height
  backgroundColor?: string; // Background color
  pixelRatio?: number; // For high-DPI displays
  skipFonts?: boolean; // Skip font loading
  cacheBust?: boolean; // Add cache busting
  filter?: (node: HTMLElement) => boolean; // Filter nodes
}
```

## ShareButton Component

Located at: `app/components/ShareButton.tsx`

A theme-aware download button component that automatically captures elements as images with proper background colors and watermarking based on the current theme.

### Basic Usage

```tsx
import ShareButton from "@/app/components/ShareButton";

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={ref}>{/* Content to be captured */}</div>
      <ShareButton
        targetRef={ref}
        filename="my-image"
        variant="outline"
        size="sm"
      />
    </div>
  );
}
```

### Props

```tsx
interface ShareButtonProps {
  targetRef: RefObject<HTMLElement | null>;
  imageOptions?: ElementToImageOptions; // backgroundColor will be overridden by theme
  filename?: string; // Default: "bsky-viz-image"
  buttonText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}
```

### Features

- **Theme-Aware Backgrounds**: Automatically detects light/dark mode and applies appropriate backgrounds
  - Light mode: `#ffffff` (white)
  - Dark mode: `#09090b` (zinc-950)
- **Smart Watermarking**: Theme-adaptive "www.bsky-viz.com" watermark
  - Light mode: Dark text on light background
  - Dark mode: Light text on dark background
- **Zero Configuration**: No manual background setup required
- **Clean Architecture**: Simple implementation without complex DOM manipulation
- **Loading States**: Shows loading indicators during image processing
- **Error Handling**: Graceful error handling with console logging
- **Customizable**: Full control over appearance and functionality
- **No Backdrop Issues**: Direct capture without modal/dialog interference

## Custom Hook: `useImageCapture`

Located at: `app/hooks/useImageCapture.ts`

Simplified hook for direct image capture functionality.

### Usage

```tsx
import { useImageCapture } from "@/app/hooks/useImageCapture";

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const { captureElement, captureFromRef } = useImageCapture({
    format: "png",
    pixelRatio: 2,
  });

  const handleCapture = async () => {
    try {
      const result = await captureFromRef(ref);
      result.download("captured-image.png");
    } catch (error) {
      console.error("Capture failed:", error);
    }
  };

  return (
    <div>
      <div ref={ref}>Content to capture</div>
      <button onClick={handleCapture}>Capture</button>
    </div>
  );
}
```

## Implementation in OpenAISummaryCard

The ShareButton has been integrated into the OpenAI Summary Card component:

```tsx
// In OpenAISummaryCard.tsx
const cardRef = useRef<HTMLDivElement>(null);

return (
  <Card ref={cardRef}>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{t("openai.summaryTitle")}</CardTitle>
      <ShareButton
        targetRef={cardRef}
        filename="bsky-viz-summary"
        variant="ghost"
        size="sm"
        imageOptions={{
          backgroundColor: "transparent",
          pixelRatio: 2,
        }}
      />
    </CardHeader>
    {/* Rest of card content */}
  </Card>
);
```

## Client-Side Considerations

Since `html-to-image` is a client-side library, all components using it are marked with `"use client"`. The utilities handle this elegantly:

- **Dynamic Imports**: Could be implemented for code splitting
- **Error Boundaries**: Wrap components for better error handling
- **Loading States**: Built into ShareButton component
- **Browser Compatibility**: Works in modern browsers with canvas support

## Best Practices

1. **Performance**: Use higher `pixelRatio` (2-3) for better quality on high-DPI displays
2. **Styling**: Use `backgroundColor: 'transparent'` to preserve design backgrounds
3. **Fonts**: Set `skipFonts: false` to ensure custom fonts are captured
4. **Error Handling**: Always wrap calls in try-catch blocks
5. **Loading States**: Use the built-in loading states in ShareButton
6. **File Naming**: Provide meaningful filenames for downloads

## Troubleshooting

### Common Issues

1. **Fonts not rendering**: Set `skipFonts: false` and ensure fonts are loaded
2. **Blurry images**: Increase `pixelRatio` to 2 or 3
3. **Missing styles**: Ensure all CSS is loaded before capture
4. **CORS errors**: Some external resources may block image generation
5. **Large elements**: Consider setting explicit width/height for very large elements

### Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Limited by canvas size restrictions

## Future Enhancements

Potential improvements to consider:

1. **Toast Notifications**: Add success/error feedback
2. **Progress Indicators**: For large image processing
3. **Batch Processing**: Capture multiple elements at once
4. **Cloud Upload**: Direct upload to cloud storage services
5. **Social Sharing**: Extended social media platform support
6. **Image Editing**: Basic editing capabilities before sharing
