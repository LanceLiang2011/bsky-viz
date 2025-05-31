import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { analyzeFeed } from "../../utils/feedAnalyzer";
import ProfileCard from "../../components/ProfileCard";
import AnalysisResults from "../../components/AnalysisResults";
import BackButton from "../../components/BackButton";
import OpenAISummaryCard from "../../components/OpenAISummaryCard";
import { Card, CardContent } from "@/components/ui/card";

// Define interfaces for the data
export interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string;
  associated?: {
    lists: number;
    feedgens: number;
    starterPacks: number;
    labeler: boolean;
  };
  pinnedPost?: {
    cid: string;
    uri: string;
  };
}

export interface ProcessedFeedData {
  activityByHour: Record<number, number>;
  activityTimeline: Array<{
    date: string;
    posts: number;
    replies: number;
    reposts: number;
    likes: number;
    total: number;
  }>;
  topInteractions: Array<{
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
    count: number;
  }>;
  commonHashtags: Array<{
    tag: string;
    count: number;
  }>;
  wordCloudData: Array<{
    text: string;
    value: number;
  }>;
  insights: {
    totalPosts: number;
    totalReplies: number;
    totalReposts: number;
    averagePostLength: number;
    mostActiveHour: number;
    mostActiveDay: string;
    postsWithMedia: number;
    postsWithLinks: number;
    languagesUsed: Record<string, number>;
  };
}

interface FeedItem {
  post: {
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    record: {
      text: string;
      createdAt: string;
      $type: string;
      [key: string]: unknown;
    };
    indexedAt: string;
    likeCount?: number;
    replyCount?: number;
    repostCount?: number;
  };
  reply?: {
    root: unknown;
    parent: unknown;
  };
  reason?: unknown;
  [key: string]: unknown;
}

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

async function fetchBlueskyData(handle: string, locale?: string) {
  const t = await getTranslations();

  // Clean and format the handle
  let cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  cleanHandle = cleanHandle
    .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!cleanHandle.includes(".") && !cleanHandle.includes(":")) {
    cleanHandle = `${cleanHandle}.bsky.social`;
  }

  console.log(`Fetching data for handle: ${cleanHandle}`);

  try {
    // Fetch profile
    const profileUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(
      cleanHandle
    )}`;

    const profileRes = await fetch(profileUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "bsky-viz/1.0",
      },
    });

    if (!profileRes.ok) {
      if (profileRes.status === 404) {
        return { error: "User not found" };
      }
      const errorText = await profileRes.text();
      console.error(
        `Profile fetch failed: ${profileRes.status} ${profileRes.statusText}`,
        errorText
      );
      return {
        error: `Failed to fetch profile: ${profileRes.status} ${profileRes.statusText}`,
      };
    }

    const profileData = await profileRes.json();

    // Fetch feed data with pagination
    let cursor = undefined;
    let hasMoreData = true;
    let allFeedItems: FeedItem[] = [];
    let pageCount = 0;
    const MAX_PAGES = 12; // Limit to 12 pages to avoid excessive data

    while (hasMoreData && pageCount < MAX_PAGES) {
      pageCount++;

      let feedUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
        cleanHandle
      )}&limit=100`;

      if (cursor) {
        feedUrl += `&cursor=${encodeURIComponent(cursor)}`;
      }

      console.log(
        `Fetching feed page ${pageCount}, cursor: ${cursor || "initial"}`
      );

      const feedRes = await fetch(feedUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "bsky-viz/1.0",
        },
      });

      if (!feedRes.ok) {
        const errorText = await feedRes.text();
        console.error(
          `Feed fetch failed: ${feedRes.status} ${feedRes.statusText}`,
          errorText
        );
        return {
          error: `Failed to fetch feed: ${feedRes.status} ${feedRes.statusText}`,
        };
      }

      const feedData = await feedRes.json();

      if (feedData.feed && feedData.feed.length > 0) {
        allFeedItems = allFeedItems.concat(feedData.feed);
      }

      if (feedData.cursor) {
        cursor = feedData.cursor;
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        hasMoreData = false;
      }
    }

    console.log(
      `Fetched ${pageCount} pages with ${allFeedItems.length} total feed items`
    );

    // Process the feed data
    console.log("Starting feed analysis on server...");
    const processedFeed = await analyzeFeed(
      { feed: allFeedItems },
      { locale, userHandle: cleanHandle, userTimezone: "UTC" }
    );
    console.log("Feed analysis completed on server");

    // Helper function to determine if a feed item represents user's own content
    // This is critical for OpenAI analysis - we only want to analyze content the user actually wrote
    const isUserOwnContent = (
      item: FeedItem,
      userDid: string,
      userHandle: string
    ) => {
      // Skip reposts completely - these are just reshares of other people's content
      if (item.reason) return false;

      const postAuthor = item.post?.author;
      if (!postAuthor) return false;

      // Check both DID (decentralized identifier) and handle for accuracy
      // Some edge cases might have one but not the other
      const matchesDid = postAuthor.did === userDid;
      const matchesHandle = postAuthor.handle === userHandle;

      return matchesDid || matchesHandle;
    };

    // Enhanced algorithm for OpenAI content selection
    // Separate user's original posts from replies for proper weighting
    const userOwnedItems = allFeedItems.filter((item) =>
      isUserOwnContent(item, profileData?.did || "", cleanHandle)
    );

    console.log(`Total feed items: ${allFeedItems.length}`);
    console.log(`User's own content items: ${userOwnedItems.length}`);

    // Separate original posts from replies
    const originalPosts: string[] = [];
    const replyPosts: string[] = [];

    userOwnedItems.forEach((item) => {
      const text = item.post?.record?.text;
      if (typeof text === "string" && text.trim() !== "") {
        // Check if this is a reply (has reply field)
        if (item.reply) {
          replyPosts.push(text.trim());
        } else {
          originalPosts.push(text.trim());
        }
      }
    });

    console.log(`Original posts: ${originalPosts.length}`);
    console.log(`Reply posts: ${replyPosts.length}`);

    // Enhanced logging - show actual content samples for verification
    console.log("\n=== ORIGINAL POSTS SAMPLE (First 3) ===");
    originalPosts.slice(0, 3).forEach((post, index) => {
      console.log(
        `Original Post ${index + 1}:`,
        post.substring(0, 150) + (post.length > 150 ? "..." : "")
      );
    });

    console.log("\n=== REPLY POSTS SAMPLE (First 3) ===");
    replyPosts.slice(0, 3).forEach((reply, index) => {
      console.log(
        `Reply Post ${index + 1}:`,
        reply.substring(0, 150) + (reply.length > 150 ? "..." : "")
      );
    });

    // Algorithm: ALL original posts + random 100 replies (if more than 100)
    const finalOriginalPosts = originalPosts; // Send ALL original posts - these are most important
    const finalReplyPosts =
      replyPosts.length > 100
        ? replyPosts
            .sort(() => Math.random() - 0.5) // Shuffle for random selection
            .slice(0, 100) // Take first 100 after shuffle
        : replyPosts; // If ≤ 100 replies, take all

    console.log(`Final original posts for AI: ${finalOriginalPosts.length}`);
    console.log(`Final reply posts for AI: ${finalReplyPosts.length}`);
    console.log(
      `Total characters for AI: ${
        (finalOriginalPosts.join("") + finalReplyPosts.join("")).length
      }`
    );

    let openAISummary = null;
    if (
      (finalOriginalPosts.length > 0 || finalReplyPosts.length > 0) &&
      process.env.USE_OPENAI === "True"
    ) {
      openAISummary = await getOpenAISummary(
        finalOriginalPosts,
        finalReplyPosts,
        t,
        profileData?.displayName || profileData?.handle
      );
    } else if (process.env.USE_OPENAI !== "True") {
      // If OpenAI is disabled, still show a placeholder message
      const nameToUse =
        profileData?.displayName ||
        profileData?.handle ||
        t("openai.genericUser");
      openAISummary = t("openai.disabledSummary", { username: nameToUse });
    }

    return {
      success: true,
      profile: profileData,
      processedFeed,
      openAISummary,
    };
  } catch (err) {
    console.error("Error fetching Bluesky data:", err);
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

  const result = await fetchBlueskyData(decodeURIComponent(handle), locale);

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
