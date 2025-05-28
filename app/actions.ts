/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getTranslations } from "next-intl/server";

export async function analyzeUser(formData: FormData) {
  const t = await getTranslations();
  const handle = formData.get("handle")?.toString()?.trim();

  console.log(`Analyzing user with handle: ${handle}`);

  if (!handle) {
    return { error: t("errors.noHandle") };
  }

  try {
    // Remove @ symbol if present and validate handle format
    let cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    // Remove any invisible/non-printable characters and extra whitespace
    cleanHandle = cleanHandle
      .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    // Ensure handle has proper format
    if (!cleanHandle.includes(".") && !cleanHandle.includes(":")) {
      cleanHandle = `${cleanHandle}.bsky.social`;
    }

    console.log(`Fetching data for handle: ${cleanHandle}`);

    // First try to fetch profile to validate the handle
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
      const errorText = await profileRes.text();
      console.error(
        `Profile fetch failed: ${profileRes.status} ${profileRes.statusText}`,
        errorText
      );
      return {
        error: `Failed to fetch profile: ${profileRes.status} ${profileRes.statusText}. Handle: "${cleanHandle}". Response: ${errorText}`,
      };
    }

    const profileData = await profileRes.json();

    // Initialize variables for pagination
    let cursor = undefined;
    let hasMoreData = true;
    let allFeedItems: FeedItem[] = [];
    let pageCount = 0;
    const MAX_PAGES = 10;

    // Fetch feed data with pagination
    while (hasMoreData && pageCount < MAX_PAGES) {
      // Remove reachedTimeLimit from condition
      pageCount++;

      // Build the URL with cursor if we have one
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
          error: `Failed to fetch feed: ${feedRes.status} ${feedRes.statusText}. Response: ${errorText}`,
        };
      }

      const feedData = await feedRes.json();

      // Add this page's feed items to our collection
      if (feedData.feed && feedData.feed.length > 0) {
        // Add filtered items to our collection
        allFeedItems = allFeedItems.concat(feedData.feed);
      }

      // Check if there's a cursor for the next page
      if (feedData.cursor) {
        cursor = feedData.cursor;
        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        hasMoreData = false;
      }
    }

    console.log(
      `Fetched ${pageCount} pages with ${allFeedItems.length} total feed items` // Update log message
    );

    return {
      success: true,
      profile: profileData,
      feed: { feed: allFeedItems },
    };
  } catch (err) {
    console.error("Error fetching Bluesky data:", err);
    return { error: t("errors.fetchFailed") };
  }
}

// Define an interface for feed items
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
      [key: string]: any;
    };
    indexedAt: string;
    likeCount?: number;
    replyCount?: number;
    repostCount?: number;
  };
  reply?: {
    root: any;
    parent: any;
  };
  reason?: any;
  [key: string]: any;
}
