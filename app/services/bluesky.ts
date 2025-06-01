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
  private readonly requestDelay = 300; // ms between requests
  private readonly maxPages = 12;

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
   * Fetch all feed data with pagination
   */
  async fetchFullFeed(handle: string): Promise<BlueskyFeedItem[]> {
    const cleanHandle = this.cleanHandle(handle);
    let cursor: string | undefined;
    let hasMoreData = true;
    let allFeedItems: BlueskyFeedItem[] = [];
    let pageCount = 0;

    console.log(`Starting feed fetch for: ${cleanHandle}`);

    while (hasMoreData && pageCount < this.maxPages) {
      pageCount++;

      let feedUrl = `${
        this.baseUrl
      }/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
        cleanHandle
      )}&limit=100`;

      if (cursor) {
        feedUrl += `&cursor=${encodeURIComponent(cursor)}`;
      }

      console.log(
        `Fetching feed page ${pageCount}, cursor: ${cursor || "initial"}`
      );

      const response = await fetch(feedUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": this.userAgent,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Feed fetch failed: ${response.status} ${response.statusText}`,
          errorText
        );
        throw new Error(
          `Failed to fetch feed: ${response.status} ${response.statusText}`
        );
      }

      const feedData: BlueskyFeedResponse = await response.json();

      if (feedData.feed && feedData.feed.length > 0) {
        allFeedItems = allFeedItems.concat(feedData.feed);
      }

      if (feedData.cursor) {
        cursor = feedData.cursor;
        // Rate limiting - wait between requests
        await new Promise((resolve) => setTimeout(resolve, this.requestDelay));
      } else {
        hasMoreData = false;
      }
    }

    console.log(
      `✓ Fetched ${pageCount} pages with ${allFeedItems.length} total feed items`
    );
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

    const maxOriginalPosts = 100;
    const maxReplies = 100;

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
