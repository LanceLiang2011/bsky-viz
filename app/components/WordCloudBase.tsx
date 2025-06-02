"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Type, RefreshCw, Hash, Eye, EyeOff } from "lucide-react";
import {
  WordCloud as ReactWordCloud,
  Word,
  FinalWordData,
} from "@isoterik/react-word-cloud";
import { WordData } from "../utils/wordProcessor";
import ShareButton from "./ShareButton";

// Word cloud configuration interface
export interface WordCloudConfig {
  maxWords: number;
  minFontSize: number;
  maxFontSize: number;
  colors: string[];
  fontFamily: string;
  enableTooltips: boolean;
  showControls: boolean;
}

// Default configuration
const DEFAULT_CONFIG: WordCloudConfig = {
  maxWords: 100,
  minFontSize: 18,
  maxFontSize: 72,
  colors: [
    "#1DA1F2", // Twitter Blue
    "#657786", // Dark Gray
    "#14171A", // Almost Black
    "#AAB8C2", // Light Gray
    "#E1E8ED", // Lighter Gray
    "#F7F9FA", // Lightest Gray
    "#1991DA", // Darker Blue
    "#0084B4", // Even Darker Blue
  ],
  fontFamily: "Inter, system-ui, sans-serif",
  enableTooltips: true,
  showControls: true,
};

// Color schemes for different themes
const COLOR_SCHEMES = {
  bluesky: [
    "#1DA1F2",
    "#657786",
    "#14171A",
    "#AAB8C2",
    "#E1E8ED",
    "#F7F9FA",
    "#1991DA",
    "#0084B4",
  ],
  vibrant: [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
  ],
  monochrome: [
    "#2C3E50",
    "#34495E",
    "#7F8C8D",
    "#95A5A6",
    "#BDC3C7",
    "#D5DBDB",
    "#85929E",
    "#566573",
  ],
};

// Props interface for the shared WordCloudBase component
interface WordCloudBaseProps {
  words?: WordData[];
  rawText?: string;
  config?: Partial<WordCloudConfig>;
  className?: string;
  title?: string;
  subtitle?: string;
  onWordClick?: (word: WordData) => void;
  isLoading?: boolean;
  error?: string;
  children?: ReactNode; // For custom processing logic
  emptyStateMessage?: string;
  processingMessage?: string;
}

// Transform WordData to Word format expected by react-word-cloud
const transformWordsForCloud = (
  words: WordData[],
  maxWords: number
): Word[] => {
  return words
    .filter((word) => word.value > 0)
    .slice(0, maxWords)
    .map((word) => ({
      text:
        word.text.length > 20 ? `${word.text.substring(0, 17)}...` : word.text,
      value: word.value,
    }));
};

// Main shared WordCloudBase component
export const WordCloudBase: React.FC<WordCloudBaseProps> = React.memo(
  ({
    words,
    config = {},
    className = "",
    title = "Word Cloud",
    subtitle,
    onWordClick,
    isLoading = false,
    error,
    children,
    emptyStateMessage = "No significant words found in the analyzed content.",
    processingMessage = "Processing text...",
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mergedConfig, setMergedConfig] = useState<WordCloudConfig>({
      ...DEFAULT_CONFIG,
      ...config,
    });
    const [colorScheme, setColorScheme] =
      useState<keyof typeof COLOR_SCHEMES>("bluesky");
    const [showControls, setShowControls] = useState(mergedConfig.showControls);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

    // Update dimensions based on container size
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          // More responsive calculation for mobile
          const containerWidth = Math.max(280, width - 48); // Reduced padding for mobile
          const aspectRatio = containerWidth < 640 ? 0.8 : 0.7; // Taller on mobile
          const maxHeight = containerWidth < 640 ? 400 : 600; // Lower max height on mobile
          const minHeight = containerWidth < 640 ? 300 : 400; // Lower min height on mobile

          const calculatedHeight = Math.max(
            minHeight,
            Math.min(maxHeight, containerWidth * aspectRatio)
          );

          setDimensions({
            width: containerWidth,
            height: calculatedHeight,
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Transform words for the react-word-cloud library
    const cloudWords = useMemo(() => {
      if (!words || words.length === 0) return [];
      return transformWordsForCloud(words, mergedConfig.maxWords);
    }, [words, mergedConfig.maxWords]);

    // Update color scheme
    const updateColorScheme = useCallback(
      (scheme: keyof typeof COLOR_SCHEMES) => {
        setColorScheme(scheme);
        setMergedConfig((prev) => ({
          ...prev,
          colors: COLOR_SCHEMES[scheme],
        }));
      },
      []
    );

    // Handle word click
    const handleWordClick = useCallback(
      (word: FinalWordData) => {
        if (onWordClick && words) {
          // Find original word data
          const originalWord = words.find(
            (w) =>
              (w.text.length > 20
                ? `${w.text.substring(0, 17)}...`
                : w.text) === word.text
          );
          if (originalWord) {
            onWordClick(originalWord);
          }
        }
      },
      [onWordClick, words]
    );

    // Font size function
    const fontSizeFunction = useCallback(
      (word: Word) => {
        const minSize = mergedConfig.minFontSize;
        const maxSize = mergedConfig.maxFontSize;
        const maxValue = Math.max(...cloudWords.map((w) => w.value));
        const minValue = Math.min(...cloudWords.map((w) => w.value));

        if (maxValue === minValue) return maxSize;

        const ratio = (word.value - minValue) / (maxValue - minValue);
        return minSize + ratio * (maxSize - minSize);
      },
      [mergedConfig.minFontSize, mergedConfig.maxFontSize, cloudWords]
    );

    // Fill color function
    const fillFunction = useCallback(
      (_word: Word, index: number) => {
        return mergedConfig.colors[index % mergedConfig.colors.length];
      },
      [mergedConfig.colors]
    );

    // Loading state
    if (isLoading) {
      return (
        <Card className={`w-full ${className}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{processingMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Error state
    if (error) {
      return (
        <Card className={`w-full ${className}`}>
          <CardHeader>
            <CardTitle className="text-destructive">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Empty state
    if (!cloudWords || cloudWords.length === 0) {
      return (
        <Card className={`w-full ${className}`}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No words to display
              </h3>
              <p className="text-muted-foreground">{emptyStateMessage}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`w-full ${className}`} ref={containerRef}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Hash className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{title}</span>
              </CardTitle>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                {cloudWords.length} words
              </Badge>

              <ShareButton
                targetRef={containerRef}
                filename={`${title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-word-cloud`}
                variant="ghost"
                size="sm"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="h-8 w-8 p-0"
              >
                {showControls ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {showControls && (
            <>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Theme:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
                    {Object.keys(COLOR_SCHEMES).map((scheme) => (
                      <Button
                        key={scheme}
                        variant={colorScheme === scheme ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateColorScheme(
                            scheme as keyof typeof COLOR_SCHEMES
                          )
                        }
                        className="text-xs capitalize px-2 py-1 h-auto min-w-0"
                      >
                        {scheme}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>
          <div className="relative bg-background rounded-lg border w-full overflow-hidden">
            <ReactWordCloud
              words={cloudWords}
              width={dimensions.width}
              height={dimensions.height}
              font={mergedConfig.fontFamily}
              fontSize={fontSizeFunction}
              fill={fillFunction}
              padding={2}
              spiral="archimedean"
              rotate={() => (~~(Math.random() * 6) - 3) * 30}
              enableTooltip={mergedConfig.enableTooltips}
              onWordClick={handleWordClick}
              transition="all 0.3s ease"
            />
          </div>

          {cloudWords.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Top Words
              </h4>
              <div className="flex flex-wrap gap-1">
                {cloudWords.slice(0, 20).map((word, index) => (
                  <Badge
                    key={`${word.text}-${index}`}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors px-2 py-1"
                    onClick={() => {
                      const originalWord = words?.find(
                        (w) =>
                          (w.text.length > 20
                            ? `${w.text.substring(0, 17)}...`
                            : w.text) === word.text
                      );
                      if (originalWord && onWordClick) {
                        onWordClick(originalWord);
                      }
                    }}
                    style={{
                      borderColor:
                        mergedConfig.colors[index % mergedConfig.colors.length],
                    }}
                  >
                    <span className="truncate max-w-[120px]">{word.text}</span>{" "}
                    ({word.value})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Render any custom processing logic */}
        {children}
      </Card>
    );
  }
);

WordCloudBase.displayName = "WordCloudBase";

export default WordCloudBase;
