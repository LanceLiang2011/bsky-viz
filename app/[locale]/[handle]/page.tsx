import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { analyzeFeed } from "../../utils/feedAnalyzer";
import ProfileCard from "../../components/ProfileCard";
import AnalysisResults from "../../components/AnalysisResults";
import BackButton from "../../components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  postsText: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
  userDisplayName?: string
): Promise<string | null> {
  if (process.env.USE_OPENAI !== "True") {
    const nameToUse = userDisplayName || t("openai.genericUser");
    return t("openai.disabledSummary", { username: nameToUse });
  }

  if (!postsText.trim()) {
    return t("openai.noTextForSummary");
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: t("openai.systemPrompt"),
        },
        {
          role: "user",
          content: `Please summarize the following posts from a user:\n\n${postsText}`,
        },
      ],
      max_tokens: 300,
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
    const MAX_PAGES = 10;

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

    // Prepare text for OpenAI
    const postsTextForOpenAI = allFeedItems
      .map((item) => item.post?.record?.text)
      .filter((text) => typeof text === "string" && text.trim() !== "")
      .slice(0, 200)
      .join("\n\n---\n\n");

    let openAISummary = null;
    if (postsTextForOpenAI || process.env.USE_OPENAI !== "True") {
      openAISummary = await getOpenAISummary(
        postsTextForOpenAI,
        t,
        profileData?.displayName || profileData?.handle
      );
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
            <div className="text-gray-600">{t("results.noData")}</div>
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
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle>{t("openai.summaryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {result.openAISummary}
            </p>
          </CardContent>
        </Card>
      )}

      {result.processedFeed && (
        <AnalysisResults processedFeed={result.processedFeed} />
      )}
    </div>
  );
}
