import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProfileCard from "../../components/ProfileCard";
import AnalysisResults from "../../components/AnalysisResults";
import BackButton from "../../components/BackButton";
import OpenAISummaryCard from "../../components/OpenAISummaryCard";
import { Card, CardContent } from "@/components/ui/card";

// Import new services and types
import { BlueskyAPIClient, BlueskyDataProcessor } from "../../services/bluesky";
import { FeedAnalyzer } from "../../services/feedAnalyzer";

async function getOpenAISummary(
  originalPosts: string[],
  replyPosts: string[],
  t: Awaited<ReturnType<typeof getTranslations>>,
  userDisplayName?: string
): Promise<string | null> {
  if (process.env.USE_OPENAI !== "True") {
    const nameToUse = userDisplayName || t("openai.genericUser");
    return t("openai.disabledSummary", { username: nameToUse });
  }

  if (originalPosts.length === 0 && replyPosts.length === 0) {
    return t("openai.noTextForSummary");
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Construct the content with clear separation
    let content = "Please analyze the following user content:\n\n";

    if (originalPosts.length > 0) {
      content +=
        "=== ORIGINAL POSTS (Primary content - main interests and thoughts) ===\n";
      content += originalPosts.join("\n\n---\n\n");
      content += "\n\n";
    }

    if (replyPosts.length > 0) {
      content +=
        "=== REPLIES (Secondary content - conversational style and engagement) ===\n";
      content += replyPosts.join("\n\n---\n\n");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: t("openai.systemPromptWithSeparation"),
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 350,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return t("errors.openaiError");
  }
}

async function fetchBlueskyData(handle: string) {
  const t = await getTranslations();

  try {
    console.log("🚀 Starting new integrated data fetching system...");

    // Initialize API client and data processor
    const apiClient = new BlueskyAPIClient();

    // Fetch profile data
    const profileData = await apiClient.fetchProfile(handle);
    console.log(`✓ Profile fetched for: ${profileData.handle}`);

    // Fetch all feed data with pagination
    const allFeedItems = await apiClient.fetchFullFeed(handle);
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
        userTimezone: "UTC", // Use UTC for consistency with the old implementation
      }
    );
    console.log("✓ Feed analysis completed");

    // Get OpenAI content and summary
    let openAISummary = null;
    if (process.env.USE_OPENAI === "True") {
      const aiContent =
        BlueskyDataProcessor.getContentForAI(categorizedContent);

      if (aiContent.originalPosts.length > 0 || aiContent.replies.length > 0) {
        openAISummary = await getOpenAISummary(
          aiContent.originalPosts,
          aiContent.replies,
          t,
          profileData?.displayName || profileData?.handle
        );
        console.log("✓ OpenAI summary generated");
      }
    } else {
      // If OpenAI is disabled, show placeholder message
      const nameToUse =
        profileData?.displayName ||
        profileData?.handle ||
        t("openai.genericUser");
      openAISummary = t("openai.disabledSummary", { username: nameToUse });
    }

    console.log("🎉 All data processing completed successfully!");

    return {
      success: true,
      profile: profileData,
      processedFeed,
      categorizedContent, // Add the categorized data
      openAISummary,
    };
  } catch (err) {
    console.error("❌ Error in new data fetching system:", err);

    // Handle specific error types
    if (err instanceof Error) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      return { error: err.message };
    }

    return { error: t("errors.fetchFailed") };
  }
}

export default async function HandlePage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const t = await getTranslations();
  const { handle, locale } = await params;

  if (!handle) {
    notFound();
  }

  const result = await fetchBlueskyData(decodeURIComponent(handle));

  if (result.error) {
    if (result.error === "User not found") {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BackButton locale={locale} />
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              <strong>{t("results.error")}:</strong> {result.error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result.success || !result.profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BackButton locale={locale} />
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">{t("results.noData")}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackButton locale={locale} />
      <ProfileCard profile={result.profile} />

      {/* OpenAI Summary Card */}
      {result.openAISummary && (
        <OpenAISummaryCard summary={result.openAISummary} />
      )}

      {result.processedFeed && (
        <AnalysisResults
          processedFeed={result.processedFeed}
          currentUser={{
            did: result.profile.did,
            handle: result.profile.handle,
            displayName: result.profile.displayName,
            avatar: result.profile.avatar,
          }}
        />
      )}
    </div>
  );
}
