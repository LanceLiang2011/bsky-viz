"use client";

import React, { useMemo, useEffect, useState } from "react";
import WordCloudBase, { WordCloudConfig, WordData } from "./WordCloudBase";

// Props interface for the WordCloud component
interface WordCloudProps {
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

// Standard WordCloud component for English/general text processing
export const WordCloud: React.FC<WordCloudProps> = React.memo(
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
    const [isEnglishContent, setIsEnglishContent] = useState<boolean>(false);

    // Process raw text client-side if provided
    useEffect(() => {
      if (!rawText) return;

      const processText = async () => {
        try {
          setIsProcessing(true);
          setProcessingError(null);

          // Dynamically import English processor functions to avoid SSR issues
          const { isEnglishText, processEnglishText } = await import(
            "../utils/englishProcessor.client"
          );

          // Check if text contains English content
          const hasEnglishText = isEnglishText(rawText);
          setIsEnglishContent(hasEnglishText);

          if (!hasEnglishText) {
            setProcessingError("No English text detected");
            return;
          }

          // Process English text
          const wordMap = await processEnglishText(rawText);
          const words = mapToWordData(wordMap);

          setProcessedWords(words);
        } catch (error) {
          console.error("Error processing English text:", error);
          setProcessingError("Failed to process English text");
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

    // Custom empty state message for English processing
    const emptyStateMessage =
      rawText && !isEnglishContent
        ? "No English text detected in the content."
        : "No significant words found in the analyzed content.";

    const processingMessage = isProcessing
      ? "Processing English text..."
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

WordCloud.displayName = "WordCloud";

export default WordCloud;
