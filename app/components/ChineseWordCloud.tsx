"use client";

import React, { useMemo, useEffect, useState } from "react";
import WordCloudBase, { WordCloudConfig, WordData } from "./WordCloudBase";

// Props interface for the ChineseWordCloud component
interface ChineseWordCloudProps {
  // Raw text for client-side processing
  rawText?: string;
  config?: Partial<WordCloudConfig>;
  className?: string;
  title?: string;
  subtitle?: string;
  onWordClick?: (word: WordData) => void;
  isLoading?: boolean;
  error?: string;
}

// Convert word frequency map to WordData array
const mapToWordData = (wordMap: Map<string, number>): WordData[] => {
  return Array.from(wordMap.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value);
};

// Enhanced WordCloud component with Chinese processing
export const ChineseWordCloud: React.FC<ChineseWordCloudProps> = React.memo(
  ({
    rawText,
    config = {},
    className = "",
    title = "Word Cloud",
    subtitle,
    onWordClick,
    isLoading: externalLoading = false,
    error: externalError,
  }) => {
    // Client-side processing state
    const [processedWords, setProcessedWords] = useState<WordData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [isChineseContent, setIsChineseContent] = useState<boolean>(false);

    // Process raw text client-side if provided
    useEffect(() => {
      if (!rawText) return;

      const processText = async () => {
        try {
          setIsProcessing(true);
          setProcessingError(null);

          // Dynamically import Chinese processor functions to avoid SSR issues
          const { isChineseText, processChineseText } = await import(
            "../utils/chineseProcessor.client"
          );

          // Check if text contains Chinese content
          const hasChineseText = isChineseText(rawText);
          setIsChineseContent(hasChineseText);

          if (!hasChineseText) {
            setProcessingError("No Chinese text detected");
            return;
          }

          // Process Chinese text
          const wordMap = await processChineseText(rawText);
          const words = mapToWordData(wordMap);

          setProcessedWords(words);
        } catch (error) {
          console.error("Error processing Chinese text:", error);
          setProcessingError("Failed to process Chinese text");
        } finally {
          setIsProcessing(false);
        }
      };

      processText();
    }, [rawText]);

    // Use processed words
    const words = useMemo(() => {
      return processedWords;
    }, [processedWords]);

    // Determine loading state
    const isLoading = externalLoading || isProcessing;

    // Determine error state (convert null to undefined for type compatibility)
    const error = externalError || processingError || undefined;

    // Custom empty state message for Chinese processing
    const emptyStateMessage =
      rawText && !isChineseContent
        ? "No Chinese text detected in the content."
        : "No significant words found in the analyzed content.";

    const processingMessage = isProcessing
      ? "Processing Chinese text..."
      : "Loading...";

    return (
      <WordCloudBase
        words={words}
        config={config}
        className={className}
        title={title}
        subtitle={subtitle}
        onWordClick={onWordClick}
        isLoading={isLoading}
        error={error}
        emptyStateMessage={emptyStateMessage}
        processingMessage={processingMessage}
      />
    );
  }
);

ChineseWordCloud.displayName = "ChineseWordCloud";

export default ChineseWordCloud;
