/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BlueskyProfile,
  BlueskyFeedResponse,
  BlueskyFeedItem,
  CategorizedContent,
  PreprocessedPost,
  PreprocessedReply,
  PreprocessedRepost,
} from "../types/bluesky";

export class BlueskyAPIClient {
  private readonly baseUrl = "https://public.api.bsky.app";
  private readonly userAgent = "bsky-viz/1.0";
  // Increase concurrency significantly
  private readonly maxConcurrency = 15; // Increased from 5 to 15
  private readonly maxPages = 100;

  /**
   * Fetch user profile data
   */
  async fetchProfile(handle: string): Promise<BlueskyProfile> {
    const cleanHandle = this.cleanHandle(handle);
    const url = `${
      this.baseUrl
    }/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(cleanHandle)}`;

    console.log(`Fetching profile for: ${cleanHandle}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": this.userAgent,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }
      const errorText = await response.text();
      console.error(
        `Profile fetch failed: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(
        `Failed to fetch profile: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch all feed data with high-performance parallel processing
   */
  async fetchFullFeed(handle: string): Promise<BlueskyFeedItem[]> {
    const cleanHandle = this.cleanHandle(handle);
    console.log(
      `Starting high-performance parallel feed fetch for: ${cleanHandle}`
    );

    // Initial fetch to get first page
    const firstPageData = await this.fetchFeedPage(cleanHandle);
    let allFeedItems = firstPageData.feed || [];

    // Track both seen cursors and post IDs
    const seenCursors = new Set<string>();
    const seenPostIds = new Set<string>(allFeedItems.map((item) => item.post.uri));

    if (!firstPageData.cursor) {
      console.log("Only one page of results available");
      return allFeedItems;
    }

    seenCursors.add(firstPageData.cursor);
    const cursors = [firstPageData.cursor];
    let pageCount = 1;
    let hasMorePages = true;

    // Get initial cursors for parallel fetching - get more initially
    while (
      hasMorePages &&
      cursors.length < this.maxConcurrency &&
      pageCount < this.maxPages
    ) {
      const lastCursor = cursors[cursors.length - 1];
      try {
        const nextPage = await this.fetchFeedPage(cleanHandle, lastCursor);
        pageCount++;

        if (nextPage.feed) {
          if (nextPage.cursor) {
            cursors.push(nextPage.cursor);
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error("Error during cursor discovery:", error);
        break;
      }
    }

    // Process in larger parallel batches without arbitrary delays
    while (cursors.length > 0 && pageCount < this.maxPages) {
      // Take a full batch to maximize parallel processing
      const batchCursors = cursors.splice(0, this.maxConcurrency);
      console.log(
        `Processing batch of ${batchCursors.length} pages in parallel`
      );

      try {
        // Fetch pages in parallel
        const results = await Promise.all(
          batchCursors.map((cursor) => this.fetchFeedPage(cleanHandle, cursor))
        );

        // Process results with duplicate checking
        for (const result of results) {
          if (result.feed) {
            // Filter out duplicates
            const newItems = result.feed.filter(
              (item) => !seenPostIds.has(item.post.uri)
            );

            // Add new post IDs to tracking
            newItems.forEach((item) => seenPostIds.add(item.post.uri));

            // Only add new items
            allFeedItems = allFeedItems.concat(newItems);
            pageCount++;

            if (
              result.cursor &&
              !seenCursors.has(result.cursor) &&
              pageCount < this.maxPages
            ) {
              seenCursors.add(result.cursor);
              cursors.push(result.cursor);
            }
          }
        }

        console.log(
          `Progress: ${pageCount} pages, ${allFeedItems.length} items collected`
        );

        // No arbitrary delay between batches - rely on rate limiting headers
      } catch (error) {
        console.error("Error during parallel fetching:", error);
        // Fall back to sequential processing
        break;
      }

      if (pageCount >= this.maxPages) {
        console.log(`Hit maximum page limit of ${this.maxPages}`);
        break;
      }
    }

    // Keep the fallback sequential processing for error cases
    if (cursors.length > 0 && pageCount < this.maxPages) {
      console.log("Falling back to sequential processing for remaining pages");
      for (const cursor of cursors) {
        if (pageCount >= this.maxPages) break;

        try {
          const result = await this.fetchFeedPage(cleanHandle, cursor);
          if (result.feed) {
            allFeedItems = allFeedItems.concat(result.feed);
            pageCount++;
          }
        } catch (error) {
          console.error("Error during sequential fallback:", error);
        }
      }
    }

    console.log(
      `✓ Fetched ${pageCount} pages with ${allFeedItems.length} unique feed items`
    );
    return allFeedItems;
  }

  /**
   * Helper method to fetch a single page of feed data
   */
  private async fetchFeedPage(
    handle: string,
    cursor?: string
  ): Promise<BlueskyFeedResponse> {
    let feedUrl = `${
      this.baseUrl
    }/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
      handle
    )}&limit=100`;

    if (cursor) {
      feedUrl += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": this.userAgent,
      },
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "2";
        console.log(
          `Rate limited. Waiting ${retryAfter} seconds before retry.`
        );

        // Wait the suggested time plus a small buffer
        const waitTime = (parseInt(retryAfter) + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        // Retry the request
        return this.fetchFeedPage(handle, cursor);
      }

      // Handle other errors
      const errorText = await response.text();
      throw new Error(
        `Feed fetch failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Clean and format handle
   */
  private cleanHandle(handle: string): string {
    let cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
    cleanHandle = cleanHandle
      .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E]/g, "") // Remove invisible characters
      .replace(/\s+/g, "") // Remove spaces
      .toLowerCase();

    if (!cleanHandle.includes(".") && !cleanHandle.includes(":")) {
      cleanHandle = `${cleanHandle}.bsky.social`;
    }

    return cleanHandle;
  }
}

export class BlueskyDataProcessor {
  /**
   * Preprocess and categorize feed data immediately after fetching
   */
  static preprocessFeedData(
    feedItems: BlueskyFeedItem[],
    userProfile: BlueskyProfile
  ): CategorizedContent {
    console.log("🔄 Starting data preprocessing...");

    const ownPosts: PreprocessedPost[] = [];
    const ownReplies: PreprocessedReply[] = [];
    const ownReposts: PreprocessedRepost[] = [];
    const otherContent: BlueskyFeedItem[] = [];

    let userContentCount = 0;
    const timeRange = { earliest: "", latest: "" };

    feedItems.forEach((item, index) => {
      // Update progress logging
      if ((index + 1) % 100 === 0) {
        console.log(`  Processed ${index + 1}/${feedItems.length} items...`);
      }

      // Track time range
      const itemTime = item.post.indexedAt;
      if (!timeRange.earliest || itemTime < timeRange.earliest) {
        timeRange.earliest = itemTime;
      }
      if (!timeRange.latest || itemTime > timeRange.latest) {
        timeRange.latest = itemTime;
      }

      // Check if this is user's own content
      if (this.isUserOwnContent(item, userProfile)) {
        userContentCount++;

        if (this.isRepost(item)) {
          // This is a repost by the user
          ownReposts.push(this.preprocessRepost(item));
        } else if (this.isReply(item)) {
          // This is a reply by the user
          ownReplies.push(this.preprocessReply(item));
        } else {
          // This is an original post by the user
          ownPosts.push(this.preprocessPost(item.post));
        }
      } else {
        // This is content from others (for interaction analysis)
        otherContent.push(item);
      }
    });

    const result: CategorizedContent = {
      ownPosts,
      ownReplies,
      ownReposts,
      otherContent,
      metadata: {
        totalItems: feedItems.length,
        userContentItems: userContentCount,
        originalPostsCount: ownPosts.length,
        repliesCount: ownReplies.length,
        repostsCount: ownReposts.length,
        timeRange,
      },
    };

    console.log("✓ Data preprocessing completed");
    console.log(`  📊 Categorization results:`);
    console.log(`     • Original posts: ${ownPosts.length}`);
    console.log(`     • Replies: ${ownReplies.length}`);
    console.log(`     • Reposts: ${ownReposts.length}`);
    console.log(`     • Other content: ${otherContent.length}`);
    console.log(
      `     • User content ratio: ${(
        (userContentCount / feedItems.length) *
        100
      ).toFixed(1)}%`
    );

    // Show content samples for verification
    this.logContentSamples(result);

    return result;
  }

  /**
   * Check if a feed item is user's own content
   */
  private static isUserOwnContent(
    item: BlueskyFeedItem,
    userProfile: BlueskyProfile
  ): boolean {
    // For reposts, check the reposter (item.reason.by)
    if (this.isRepost(item)) {
      const reposter = item.reason?.by;
      return (
        reposter?.did === userProfile.did ||
        reposter?.handle === userProfile.handle
      );
    }

    // For posts and replies, check the post author
    const author = item.post?.author;
    return (
      author?.did === userProfile.did || author?.handle === userProfile.handle
    );
  }

  /**
   * Check if item is a repost
   */
  private static isRepost(item: BlueskyFeedItem): boolean {
    return (
      !!item.reason && item.reason.$type === "app.bsky.feed.defs#reasonRepost"
    );
  }

  /**
   * Check if item is a reply
   */
  private static isReply(item: BlueskyFeedItem): boolean {
    return !!item.reply || !!item.post.record.reply;
  }

  /**
   * Preprocess a regular post
   */
  private static preprocessPost(post: any): PreprocessedPost {
    return {
      id: post.uri,
      cid: post.cid,
      text: post.record?.text || "",
      createdAt: post.record?.createdAt || post.indexedAt,
      indexedAt: post.indexedAt,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      metrics: {
        likes: post.likeCount || 0,
        replies: post.replyCount || 0,
        reposts: post.repostCount || 0,
      },
      metadata: this.extractMetadata(post),
      embed: post.embed
        ? { type: post.embed.$type, data: post.embed }
        : undefined,
    };
  }

  /**
   * Preprocess a reply
   */
  private static preprocessReply(item: BlueskyFeedItem): PreprocessedReply {
    const basePost = this.preprocessPost(item.post);

    return {
      ...basePost,
      replyTo: {
        root:
          item.reply?.root || item.post.record.reply?.root
            ? {
                uri: (item.reply?.root || item.post.record.reply?.root)?.uri,
                cid: (item.reply?.root || item.post.record.reply?.root)?.cid,
                author: item.reply?.root?.author
                  ? {
                      did: item.reply.root.author.did,
                      handle: item.reply.root.author.handle,
                      displayName: item.reply.root.author.displayName,
                      avatar: item.reply.root.author.avatar,
                    }
                  : undefined,
              }
            : undefined,
        parent:
          item.reply?.parent || item.post.record.reply?.parent
            ? {
                uri: (item.reply?.parent || item.post.record.reply?.parent)
                  ?.uri,
                cid: (item.reply?.parent || item.post.record.reply?.parent)
                  ?.cid,
                author: item.reply?.parent?.author
                  ? {
                      did: item.reply.parent.author.did,
                      handle: item.reply.parent.author.handle,
                      displayName: item.reply.parent.author.displayName,
                      avatar: item.reply.parent.author.avatar,
                    }
                  : undefined,
              }
            : undefined,
      },
      threadDepth: this.calculateThreadDepth(item),
    };
  }

  /**
   * Preprocess a repost
   */
  private static preprocessRepost(item: BlueskyFeedItem): PreprocessedRepost {
    return {
      id: `repost:${item.reason?.indexedAt}:${item.post.uri}`,
      createdAt: item.reason?.indexedAt || item.post.indexedAt,
      indexedAt: item.reason?.indexedAt || item.post.indexedAt,
      reposter: {
        did: item.reason?.by.did || "",
        handle: item.reason?.by.handle || "",
        displayName: item.reason?.by.displayName,
        avatar: item.reason?.by.avatar,
      },
      originalPost: this.preprocessPost(item.post),
    };
  }

  /**
   * Extract metadata from a post
   */
  private static extractMetadata(post: any) {
    const text = post.record?.text || "";
    const hasMedia =
      !!post.embed &&
      (post.embed.$type?.includes("images") ||
        post.embed.$type?.includes("video") ||
        post.embed.$type?.includes("external"));

    // Extract hashtags
    const hashtags = (text.match(/#\w+/g) || []).map((tag: string) =>
      tag.slice(1).toLowerCase()
    );

    // Extract mentions
    const mentions = (text.match(/@[\w.]+/g) || []).map((mention: string) =>
      mention.slice(1)
    );

    // Check for links
    const hasLinks = /https?:\/\/\S+/.test(text);

    return {
      languages: post.record?.langs,
      hasMedia,
      hasLinks,
      hashtags,
      mentions,
      textLength: text.length,
    };
  }

  /**
   * Calculate thread depth for replies
   */
  private static calculateThreadDepth(item: BlueskyFeedItem): number {
    // Simple heuristic: if parent === root, depth is 1, otherwise estimate depth
    const reply = item.reply || item.post.record.reply;
    if (!reply) return 0;

    return reply.parent?.uri === reply.root?.uri ? 1 : 2; // Simplified depth calculation
  }

  /**
   * Log content samples for verification
   */
  private static logContentSamples(content: CategorizedContent): void {
    console.log("\n=== CONTENT SAMPLES (First 3 of each category) ===");

    console.log("\n📝 ORIGINAL POSTS:");
    content.ownPosts.slice(0, 3).forEach((post, index) => {
      const preview =
        post.text.substring(0, 100) + (post.text.length > 100 ? "..." : "");
      console.log(`  ${index + 1}. "${preview}" (${post.text.length} chars)`);
    });

    console.log("\n💬 REPLIES:");
    content.ownReplies.slice(0, 3).forEach((reply, index) => {
      const preview =
        reply.text.substring(0, 100) + (reply.text.length > 100 ? "..." : "");
      console.log(`  ${index + 1}. "${preview}" (depth: ${reply.threadDepth})`);
    });

    console.log("\n🔄 REPOSTS:");
    content.ownReposts.slice(0, 3).forEach((repost, index) => {
      const preview =
        repost.originalPost.text.substring(0, 80) +
        (repost.originalPost.text.length > 80 ? "..." : "");
      console.log(
        `  ${index + 1}. Reposted: "${preview}" by @${
          repost.originalPost.author.handle
        }`
      );
    });
  }

  /**
   * Get content for OpenAI analysis (simplified interface)
   */
  static getContentForAI(content: CategorizedContent): {
    originalPosts: string[];
    replies: string[];
    metadata: {
      totalOriginal: number;
      totalReplies: number;
      selectedReplies: number;
      totalCharacters: number;
    };
  } {
    const allOriginalPosts = content.ownPosts.map((post) => post.text);
    const allReplies = content.ownReplies.map((reply) => reply.text);

    const maxOriginalPosts = 200;
    const maxReplies = 200;

    const selectedOriginalPosts =
      allOriginalPosts.length > maxOriginalPosts
        ? allOriginalPosts
            .sort(() => Math.random() - 0.5)
            .slice(0, maxOriginalPosts)
        : allOriginalPosts;

    // Apply the same selection logic as before: all original posts + max 100 random replies
    const selectedReplies =
      allReplies.length > maxReplies
        ? allReplies.sort(() => Math.random() - 0.5).slice(0, maxReplies)
        : allReplies;

    const totalCharacters =
      selectedOriginalPosts.join("").length + selectedReplies.join("").length;

    console.log("\n🤖 OpenAI Content Selection:");
    console.log(`  • Original posts: ${selectedOriginalPosts.length}`);
    console.log(
      `  • Selected replies: ${selectedReplies.length} (out of ${allReplies.length})`
    );
    console.log(`  • Total characters: ${totalCharacters.toLocaleString()}`);

    return {
      originalPosts: selectedOriginalPosts,
      replies: selectedReplies,
      metadata: {
        totalOriginal: selectedOriginalPosts.length,
        totalReplies: allReplies.length,
        selectedReplies: selectedReplies.length,
        totalCharacters,
      },
    };
  }
}
