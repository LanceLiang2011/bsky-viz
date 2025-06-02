import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { BlueskyAPIClient, BlueskyDataProcessor } from "../services/bluesky";
import { FeedAnalyzer } from "../services/feedAnalyzer";
import type {
  BlueskyProfile,
  CategorizedContent,
  ProcessedFeedData,
} from "../types/bluesky";

interface BlueskyDataResult {
  profile: BlueskyProfile;
  processedFeed: ProcessedFeedData;
  categorizedContent: CategorizedContent;
}

interface UseBlueskyDataReturn {
  data: BlueskyDataResult | null;
  error: string | null;
  isLoading: boolean;
  progress: {
    currentStep: string;
    percentage: number;
  };
}

interface AnalyzeResponse {
  summary: string | null;
  error?: string;
}

// Create axios instance for OpenAI API calls
const apiClient = axios.create({
  timeout: 120000, // 2 minutes timeout for OpenAI analysis
});

// SWR fetcher function for Bluesky data
const fetchBlueskyData = async (key: string): Promise<BlueskyDataResult> => {
  const [, handle, maxPages] = key.split("|");
  const customMaxPages = maxPages ? parseInt(maxPages) : undefined;

  console.log("🚀 Starting client-side data fetching system...");

  // Initialize API client and data processor
  const apiClient = new BlueskyAPIClient();

  // Fetch profile data
  const profileData = await apiClient.fetchProfile(handle);
  console.log(`✓ Profile fetched for: ${profileData.handle}`);

  // Fetch all feed data with pagination
  const allFeedItems = await apiClient.fetchFeed(handle, customMaxPages);
  console.log(`✓ Feed data fetched: ${allFeedItems.length} items`);

  // Preprocess and categorize data immediately
  const categorizedContent = BlueskyDataProcessor.preprocessFeedData(
    allFeedItems,
    profileData
  );
  console.log("✓ Data preprocessing and categorization completed");

  // Analyze the categorized data using the improved analyzer
  const processedFeed = await FeedAnalyzer.analyzeCategorizedContent(
    categorizedContent,
    {
      userHandle: handle,
      userTimezone: "UTC", // Use UTC for consistency
    }
  );
  console.log("✓ Feed analysis completed");

  console.log("🎉 All data processing completed successfully!");

  return {
    profile: profileData,
    processedFeed,
    categorizedContent,
  };
};

export function useBlueskyData(
  handle: string,
  customMaxPages?: number
): UseBlueskyDataReturn {
  const [progress, setProgress] = useState({
    currentStep: "Initializing...",
    percentage: 0,
  });

  // Create a unique SWR key
  const swrKey = handle
    ? `bluesky-data|${handle}|${customMaxPages || ""}`
    : null;

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR(swrKey, fetchBlueskyData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    onLoadingSlow: () => {
      setProgress({
        currentStep: "Fetching large amount of data...",
        percentage: 50,
      });
    },
  });

  // Handle error formatting
  const error = swrError
    ? swrError instanceof Error
      ? swrError.message === "USER_NOT_FOUND"
        ? "User not found"
        : swrError.message
      : "Failed to fetch data"
    : null;

  return {
    data: data || null,
    error,
    isLoading,
    progress,
  };
}

export async function analyzeWithOpenAI(
  categorizedContent: CategorizedContent,
  userDisplayName: string | undefined,
  locale: string
): Promise<string | null> {
  try {
    const aiContent = BlueskyDataProcessor.getContentForAI(categorizedContent);

    if (
      aiContent.originalPosts.length === 0 &&
      aiContent.replies.length === 0
    ) {
      return null;
    }

    const response = await apiClient.post<AnalyzeResponse>("/api/analyze", {
      originalPosts: aiContent.originalPosts,
      replyPosts: aiContent.replies,
      userDisplayName,
      locale,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.summary;
  } catch (error) {
    console.error("Error calling OpenAI analysis API:", error);
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}
