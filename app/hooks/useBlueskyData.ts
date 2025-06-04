import { useState, useEffect } from "react";
import axios from "axios";
import { BlueskyAPIClient, BlueskyDataProcessor } from "../services/bluesky";
import { FeedAnalyzer } from "../services/feedAnalyzer";
import type {
  BlueskyProfile,
  CategorizedContent,
  ProcessedFeedData,
  BlueskyFeedItem,
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
  isDataComplete: boolean;
  progress: {
    currentStep: string;
    percentage: number;
    pagesLoaded: number;
    totalPages: number;
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

export function useBlueskyData(
  handle: string,
  customMaxPages?: number
): UseBlueskyDataReturn {
  const [data, setData] = useState<BlueskyDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataComplete, setIsDataComplete] = useState(false);
  const [progress, setProgress] = useState({
    currentStep: "Initializing...",
    percentage: 0,
    pagesLoaded: 0,
    totalPages: customMaxPages || 500,
  });

  useEffect(() => {
    if (!handle) return;

    const fetchDataProgressively = async () => {
      setIsLoading(true);
      setError(null);
      setIsDataComplete(false);
      setData(null);

      try {
        // Initialize API client
        const apiClient = new BlueskyAPIClient();

        // Fetch profile data first
        setProgress((prev) => ({
          ...prev,
          currentStep: "Fetching profile...",
          percentage: 5,
        }));

        const profileData = await apiClient.fetchProfile(handle);
        console.log(`✓ Profile fetched for: ${profileData.handle}`);

        // Set up progressive feed fetching with callback
        const maxPagesToUse = customMaxPages || 500;

        setProgress((prev) => ({
          ...prev,
          currentStep: "Fetching posts...",
          percentage: 10,
          totalPages: maxPagesToUse,
        }));

        // Progressive callback that updates state every few pages
        const progressCallback = (
          currentItems: BlueskyFeedItem[],
          pagesLoaded: number,
          isComplete: boolean
        ) => {
          // Update progress
          const percentage = Math.min(
            10 + (pagesLoaded / maxPagesToUse) * 80,
            90
          );
          setProgress((prev) => ({
            ...prev,
            currentStep: isComplete
              ? "Processing data..."
              : "Fetching posts...",
            percentage,
            pagesLoaded,
          }));

          // Update data every 10 pages or when complete
          if (pagesLoaded % 10 === 0 || isComplete) {
            console.log(
              `📊 Progressive update: ${currentItems.length} items, ${pagesLoaded} pages`
            );

            // Process data in background without blocking the callback
            (async () => {
              try {
                // Preprocess and categorize data
                const categorizedContent =
                  BlueskyDataProcessor.preprocessFeedData(
                    currentItems,
                    profileData
                  );

                // Analyze the categorized data
                const processedFeed =
                  await FeedAnalyzer.analyzeCategorizedContent(
                    categorizedContent,
                    {
                      userHandle: handle,
                      userTimezone: "UTC",
                    }
                  );

                // Update the data state
                setData({
                  profile: profileData,
                  processedFeed,
                  categorizedContent,
                });
              } catch (err) {
                console.error("Error in progressive data processing:", err);
              }
            })();
          }
        };

        // Fetch feed data with progressive updates
        const finalFeedItems = await apiClient.fetchFeedProgressive(
          handle,
          customMaxPages,
          progressCallback
        );

        // Final processing
        setProgress((prev) => ({
          ...prev,
          currentStep: "Finalizing...",
          percentage: 95,
        }));

        console.log(`✓ Feed data fetched: ${finalFeedItems.length} items`);

        // Final categorization and analysis
        const categorizedContent = BlueskyDataProcessor.preprocessFeedData(
          finalFeedItems,
          profileData
        );

        const processedFeed = await FeedAnalyzer.analyzeCategorizedContent(
          categorizedContent,
          {
            userHandle: handle,
            userTimezone: "UTC",
          }
        );

        // Set final data
        setData({
          profile: profileData,
          processedFeed,
          categorizedContent,
        });

        setProgress((prev) => ({
          ...prev,
          currentStep: "Complete",
          percentage: 100,
          pagesLoaded: prev.totalPages,
        }));

        setIsDataComplete(true);
        console.log("🎉 All data processing completed successfully!");
      } catch (err) {
        console.error("Error in progressive data fetching:", err);
        const errorMessage =
          err instanceof Error
            ? err.message === "USER_NOT_FOUND"
              ? "User not found"
              : err.message
            : "Failed to fetch data";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataProgressively();
  }, [handle, customMaxPages]);

  return {
    data,
    error,
    isLoading,
    isDataComplete,
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
