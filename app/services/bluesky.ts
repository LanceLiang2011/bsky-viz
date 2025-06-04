/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BlueskyProfile,
  BlueskyFeedItem,
  CategorizedContent,
  PreprocessedPost,
  PreprocessedReply,
  PreprocessedRepost,
} from "../types/bluesky";

export class BlueskyAPIClient {
  private readonly baseUrl = "https://public.api.bsky.app";
  private readonly userAgent = "bsky-viz/1.0";
  private readonly defaultMaxPages = 500; // Fixed 500 pages for progressive loading

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
   * Fetch all feed data using efficient sequential pagination
   * Based on expert-recommended Bluesky API best practices
   */
  async fetchFeed(
    handle: string,
    customMaxPages?: number
  ): Promise<BlueskyFeedItem[]> {
    const cleanHandle = this.cleanHandle(handle);
    const maxPagesToUse = customMaxPages || this.defaultMaxPages;
    console.log(
      `Starting efficient feed fetch for: ${cleanHandle} (max pages: ${maxPagesToUse})`
    );

    const allFeedItems: BlueskyFeedItem[] = [];
    const seenPostIds = new Set<string>(); // Belt-and-suspenders duplicate detection
    let cursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      try {
        // Build URL with proper parameters following expert recommendations
        let feedUrl = `${
          this.baseUrl
        }/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
          cleanHandle
        )}&limit=100&filter=posts_with_replies`;

        if (cursor) {
          feedUrl += `&cursor=${encodeURIComponent(cursor)}`;
        } else {
          // Include pinned posts on first request to ensure completeness
          feedUrl += `&includePins=true`;
        }

        console.log(`Fetching page ${pageCount + 1}...`);

        const response = await fetch(feedUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": this.userAgent,
          },
        });

        if (!response.ok) {
          // Handle rate limiting with exponential backoff
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After") || "2";
            const waitTime = (parseInt(retryAfter) + Math.random()) * 1000; // Add jitter
            console.log(
              `Rate limited. Waiting ${Math.round(
                waitTime / 1000
              )}s before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue; // Retry the same request
          }

          const errorText = await response.text();
          throw new Error(
            `Feed fetch failed: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const pageData = await response.json();
        const feedItems = pageData.feed || [];

        // Filter out any duplicates (should not happen with proper cursor usage, but safety check)
        const newItems = feedItems.filter((item: BlueskyFeedItem) => {
          const postId = item.post.uri;
          if (seenPostIds.has(postId)) {
            console.warn(`Duplicate post detected: ${postId}`);
            return false;
          }
          seenPostIds.add(postId);
          return true;
        });

        // Add new items to our collection
        allFeedItems.push(...newItems);
        pageCount++;

        // Update cursor for next iteration
        cursor = pageData.cursor;

        // Progress logging
        console.log(
          `Page ${pageCount}: +${newItems.length} items (${allFeedItems.length} total)`
        );

        // Check if we've hit our page limit
        if (pageCount >= maxPagesToUse) {
          console.log(`Reached maximum page limit of ${maxPagesToUse}`);
          break;
        }

        // Small delay to be respectful to the API
        if (cursor) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error(`Error fetching page ${pageCount + 1}:`, error);

        // For network errors, try a few retries with exponential backoff
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("timeout"));

        if (isNetworkError && pageCount > 0) {
          console.log("Network error, retrying in 2 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue; // Retry the same request
        }

        // For other errors, stop the fetch to avoid infinite loops
        throw error;
      }
    } while (cursor); // Continue until no more pages

    console.log(
      `✓ Successfully fetched ${pageCount} pages with ${allFeedItems.length} unique feed items`
    );

    // Verify data integrity
    if (allFeedItems.length !== seenPostIds.size) {
      console.warn(
        `Data integrity warning: ${allFeedItems.length} items vs ${seenPostIds.size} unique IDs`
      );
    }

    return allFeedItems;
  }

  /**
   * Fetch feed data with progressive updates - calls the provided callback as data is fetched
   */
  async fetchFeedProgressive(
    handle: string,
    customMaxPages?: number,
    progressCallback?: (
      currentItems: BlueskyFeedItem[],
      pagesLoaded: number,
      isComplete: boolean
    ) => void
  ): Promise<BlueskyFeedItem[]> {
    const cleanHandle = this.cleanHandle(handle);
    const maxPagesToUse = customMaxPages || this.defaultMaxPages;
    console.log(
      `Starting progressive feed fetch for: ${cleanHandle} (max pages: ${maxPagesToUse})`
    );

    const allFeedItems: BlueskyFeedItem[] = [];
    const seenPostIds = new Set<string>();
    let cursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      try {
        // Build URL with proper parameters
        let feedUrl = `${
          this.baseUrl
        }/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
          cleanHandle
        )}&limit=100&filter=posts_with_replies`;

        if (cursor) {
          feedUrl += `&cursor=${encodeURIComponent(cursor)}`;
        } else {
          feedUrl += `&includePins=true`;
        }

        console.log(`Fetching page ${pageCount + 1}...`);

        const response = await fetch(feedUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": this.userAgent,
          },
        });

        if (!response.ok) {
          // Handle rate limiting with exponential backoff
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After") || "2";
            const waitTime = (parseInt(retryAfter) + Math.random()) * 1000;
            console.log(
              `Rate limited. Waiting ${Math.round(
                waitTime / 1000
              )}s before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }

          const errorText = await response.text();
          throw new Error(
            `Feed fetch failed: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const pageData = await response.json();
        const feedItems = pageData.feed || [];

        // Filter out duplicates
        const newItems = feedItems.filter((item: BlueskyFeedItem) => {
          const postId = item.post.uri;
          if (seenPostIds.has(postId)) {
            console.warn(`Duplicate post detected: ${postId}`);
            return false;
          }
          seenPostIds.add(postId);
          return true;
        });

        // Add new items to collection
        allFeedItems.push(...newItems);
        pageCount++;

        // Update cursor for next iteration
        cursor = pageData.cursor;

        // Progress logging
        console.log(
          `Page ${pageCount}: +${newItems.length} items (${allFeedItems.length} total)`
        );

        // Call progress callback for progressive updates
        if (progressCallback) {
          progressCallback([...allFeedItems], pageCount, false);
        }

        // Check if we've hit page limit
        if (pageCount >= maxPagesToUse) {
          console.log(`Reached maximum page limit of ${maxPagesToUse}`);
          break;
        }

        // Small delay to be respectful to the API
        if (cursor) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error(`Error fetching page ${pageCount + 1}:`, error);

        // For network errors, try a few retries with exponential backoff
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("timeout"));

        if (isNetworkError && pageCount > 0) {
          console.log("Network error, retrying in 2 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        throw error;
      }
    } while (cursor);

    console.log(
      `✓ Progressive fetch completed: ${pageCount} pages with ${allFeedItems.length} unique feed items`
    );

    // Final callback to indicate completion
    if (progressCallback) {
      progressCallback([...allFeedItems], pageCount, true);
    }

    // Verify data integrity
    if (allFeedItems.length !== seenPostIds.size) {
      console.warn(
        `Data integrity warning: ${allFeedItems.length} items vs ${seenPostIds.size} unique IDs`
      );
    }

    return allFeedItems;
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

    const maxOriginalPosts = 200; // Limit original posts to 200 for OpenAI
    const maxReplies = 200; // Limit replies to 200 for OpenAI

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
