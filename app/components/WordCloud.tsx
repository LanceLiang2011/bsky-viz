/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Type, RefreshCw, Hash, Eye, EyeOff } from "lucide-react";
import { type WordData } from "../utils/wordProcessor";

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
  minFontSize: 14,
  maxFontSize: 65,
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
    "#1991DA",
    "#0084B4",
    "#66D9EF",
    "#A6E3A1",
  ],
  sunset: [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
  ],
  forest: [
    "#2E8B57",
    "#228B22",
    "#32CD32",
    "#90EE90",
    "#006400",
    "#8FBC8F",
    "#20B2AA",
    "#66CDAA",
  ],
  ocean: [
    "#0077BE",
    "#4682B4",
    "#5F9EA0",
    "#87CEEB",
    "#6495ED",
    "#4169E1",
    "#1E90FF",
    "#00BFFF",
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

// Simple word positioning algorithm
interface WordPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  rotation: number;
}

// Props interface for the WordCloud component
interface WordCloudProps {
  words: WordData[];
  config?: Partial<WordCloudConfig>;
  className?: string;
  title?: string;
  subtitle?: string;
  onWordClick?: (word: WordData) => void;
  isLoading?: boolean;
  error?: string;
}

// Custom word cloud implementation
const generateWordPositions = (
  words: WordData[],
  config: WordCloudConfig,
  width: number,
  height: number
): (WordData & WordPosition)[] => {
  if (!words.length) return [];

  const maxValue = Math.max(...words.map((w) => w.value));
  const minValue = Math.min(...words.map((w) => w.value));
  const valueRange = maxValue - minValue || 1;

  const positions: (WordData & WordPosition)[] = [];
  const occupied: { x: number; y: number; width: number; height: number }[] =
    [];

  // Helper function to check if a position overlaps with existing words
  const isOverlapping = (x: number, y: number, w: number, h: number) => {
    return occupied.some(
      (pos) =>
        x < pos.x + pos.width + 10 &&
        x + w + 10 > pos.x &&
        y < pos.y + pos.height + 5 &&
        y + h + 5 > pos.y
    );
  };

  // Helper function to find a valid position using spiral placement
  const findPosition = (wordWidth: number, wordHeight: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius =
      Math.min(width, height) / 2 - Math.max(wordWidth, wordHeight);

    // Try center first
    if (
      !isOverlapping(
        centerX - wordWidth / 2,
        centerY - wordHeight / 2,
        wordWidth,
        wordHeight
      )
    ) {
      return { x: centerX - wordWidth / 2, y: centerY - wordHeight / 2 };
    }

    // Spiral outward
    for (let radius = 20; radius < maxRadius; radius += 15) {
      for (let angle = 0; angle < 360; angle += 30) {
        const x =
          centerX + radius * Math.cos((angle * Math.PI) / 180) - wordWidth / 2;
        const y =
          centerY + radius * Math.sin((angle * Math.PI) / 180) - wordHeight / 2;

        if (
          x >= 0 &&
          y >= 0 &&
          x + wordWidth <= width &&
          y + wordHeight <= height
        ) {
          if (!isOverlapping(x, y, wordWidth, wordHeight)) {
            return { x, y };
          }
        }
      }
    }

    // Fallback to random position
    return {
      x: Math.random() * (width - wordWidth),
      y: Math.random() * (height - wordHeight),
    };
  };

  // Process words in order of importance (highest value first)
  const sortedWords = [...words].sort((a, b) => b.value - a.value);

  sortedWords.forEach((word, index) => {
    if (index >= config.maxWords) return;

    // Calculate font size based on word value
    const normalizedValue = (word.value - minValue) / valueRange;
    const fontSize =
      config.minFontSize +
      normalizedValue * (config.maxFontSize - config.minFontSize);

    // Estimate word dimensions (rough approximation)
    const wordWidth = word.text.length * fontSize * 0.6;
    const wordHeight = fontSize * 1.2;

    // Find position
    const position = findPosition(wordWidth, wordHeight);

    // Add to occupied areas
    occupied.push({
      x: position.x,
      y: position.y,
      width: wordWidth,
      height: wordHeight,
    });

    // Create positioned word
    positions.push({
      ...word,
      x: position.x,
      y: position.y,
      width: wordWidth,
      height: wordHeight,
      fontSize,
      color: config.colors[index % config.colors.length],
      rotation: Math.random() > 0.7 ? (Math.random() - 0.5) * 60 : 0, // 30% chance of rotation
    });
  });

  return positions;
};

// Main WordCloud component
export const WordCloud: React.FC<WordCloudProps> = React.memo(
  ({
    words,
    config = {},
    className = "",
    title = "Word Cloud",
    subtitle,
    onWordClick,
    isLoading = false,
    error,
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
    const [hoveredWord, setHoveredWord] = useState<string | null>(null);

    // Update dimensions based on container size
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: Math.max(300, width - 32),
            height: Math.max(300, Math.min(500, width * 0.6)),
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Process and position words
    const positionedWords = useMemo(() => {
      if (!words || words.length === 0) return [];

      const processedWords = words
        .filter((word) => word.value > 0)
        .map((word) => ({
          ...word,
          text:
            word.text.length > 20
              ? `${word.text.substring(0, 17)}...`
              : word.text,
        }));

      return generateWordPositions(
        processedWords,
        mergedConfig,
        dimensions.width,
        dimensions.height
      );
    }, [words, mergedConfig, dimensions]);

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
      (word: WordData) => {
        if (onWordClick) {
          onWordClick(word);
        }
      },
      [onWordClick]
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
                <p className="text-muted-foreground">Processing words...</p>
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
    if (!positionedWords || positionedWords.length === 0) {
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
              <p className="text-muted-foreground">
                No significant words found in the analyzed content.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`w-full ${className}`} ref={containerRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {positionedWords.length} words
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
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
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Theme:</span>
                  {Object.keys(COLOR_SCHEMES).map((scheme) => (
                    <Button
                      key={scheme}
                      variant={colorScheme === scheme ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateColorScheme(scheme as keyof typeof COLOR_SCHEMES)
                      }
                      className="text-xs capitalize"
                    >
                      {scheme}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>
          <div
            className="relative bg-background rounded-lg border overflow-hidden"
            style={{ height: dimensions.height }}
          >
            <svg
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full"
            >
              {positionedWords.map((word, index) => (
                <text
                  key={`${word.text}-${index}`}
                  x={word.x + word.width / 2}
                  y={word.y + word.height / 2}
                  fontSize={word.fontSize}
                  fill={word.color}
                  fontFamily={mergedConfig.fontFamily}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${word.rotation} ${
                    word.x + word.width / 2
                  } ${word.y + word.height / 2})`}
                  style={{
                    cursor: onWordClick ? "pointer" : "default",
                    opacity: hoveredWord && hoveredWord !== word.text ? 0.6 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                  onClick={() => handleWordClick(word)}
                  onMouseEnter={() => setHoveredWord(word.text)}
                  onMouseLeave={() => setHoveredWord(null)}
                  className="select-none"
                >
                  {word.text}
                </text>
              ))}
            </svg>
          </div>

          {positionedWords.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Top Words
              </h4>
              <div className="flex flex-wrap gap-1">
                {positionedWords.slice(0, 20).map((word, index) => (
                  <Badge
                    key={`${word.text}-${index}`}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => handleWordClick(word)}
                    style={{ borderColor: word.color }}
                  >
                    {word.text} ({word.value})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

WordCloud.displayName = "WordCloud";

export default WordCloud;
