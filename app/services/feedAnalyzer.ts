/* eslint-disable @typescript-eslint/no-explicit-any */
import { CategorizedContent, ProcessedFeedData } from "../types/bluesky";

export interface FeedAnalysisOptions {
  locale?: string;
  userHandle?: string;
  userTimezone?: string;
}

export class FeedAnalyzer {
  /**
   * Analyze preprocessed categorized content
   */
  static async analyzeCategorizedContent(
    content: CategorizedContent,
    options: FeedAnalysisOptions = {}
  ): Promise<ProcessedFeedData> {
    console.log("🔍 Starting feed analysis with preprocessed data...");

    const { ownPosts, ownReplies, ownReposts, otherContent } = content;

    // Combine all user content for analysis
    const allUserContent = [
      ...ownPosts.map((p) => ({ ...p, type: "post" as const })),
      ...ownReplies.map((r) => ({ ...r, type: "reply" as const })),
      ...ownReposts.map((r) => ({
        ...r.originalPost,
        type: "repost" as const,
        createdAt: r.createdAt, // Use repost time, not original post time
      })),
    ];

    // Sort by creation time for timeline analysis
    allUserContent.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    console.log(
      `  📊 Analyzing ${allUserContent.length} user content items...`
    );

    // Build activity timeline
    const activityTimeline = this.buildActivityTimeline(allUserContent);

    // Build hourly activity
    const activityByHour = this.buildHourlyActivity(allUserContent);

    // Build hourly activity by type
    const activityByHourAndType =
      this.buildHourlyActivityByType(allUserContent);

    // Analyze interactions with other users - FIXED VERSION
    const topInteractions = this.analyzeInteractions(
      ownReplies,
      otherContent,
      options.userHandle
    );

    // Extract hashtags
    const commonHashtags = this.extractHashtags(allUserContent);

    // Prepare word cloud data
    const { rawText, isChineseContent } =
      this.prepareWordCloudData(allUserContent);

    // Calculate insights
    const insights = this.calculateInsights(allUserContent);

    // Build result
    const result: ProcessedFeedData = {
      activityByHour,
      activityByHourAndType,
      activityTimeline,
      topInteractions,
      commonHashtags,
      wordCloudData: [], // Placeholder for server-side
      rawText,
      isChineseContent,
      insights,
    };

    // Log results for debugging
    this.logAnalysisResults(result);

    return result;
  }

  /**
   * Build activity timeline
   */
  private static buildActivityTimeline(content: any[]): any[] {
    const timelineMap = new Map<string, any>();

    content.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split("T")[0];
      if (!timelineMap.has(date)) {
        timelineMap.set(date, {
          date,
          posts: 0,
          replies: 0,
          reposts: 0,
          likes: 0,
          total: 0,
        });
      }

      const dayData = timelineMap.get(date)!;
      if (item.type === "post") dayData.posts++;
      else if (item.type === "reply") dayData.replies++;
      else if (item.type === "repost") dayData.reposts++;
      dayData.total++;
    });

    return Array.from(timelineMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  /**
   * Build hourly activity
   */
  private static buildHourlyActivity(content: any[]): Record<number, number> {
    const activityByHour: Record<number, number> = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      activityByHour[i] = 0;
    }

    content.forEach((item) => {
      const hour = new Date(item.createdAt).getHours();
      activityByHour[hour]++;
    });

    return activityByHour;
  }

  /**
   * Build hourly activity by type
   */
  private static buildHourlyActivityByType(content: any[]): {
    posts: Record<number, number>;
    replies: Record<number, number>;
    reposts: Record<number, number>;
  } {
    const posts: Record<number, number> = {};
    const replies: Record<number, number> = {};
    const reposts: Record<number, number> = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      posts[i] = 0;
      replies[i] = 0;
      reposts[i] = 0;
    }

    content.forEach((item) => {
      const hour = new Date(item.createdAt).getHours();
      if (item.type === "post") posts[hour]++;
      else if (item.type === "reply") replies[hour]++;
      else if (item.type === "repost") reposts[hour]++;
    });

    return { posts, replies, reposts };
  }

  /**
   * Analyze interactions with other users (FIXED VERSION)
   * Uses author information directly from reply structure
   */
  private static analyzeInteractions(
    userReplies: any[],
    otherContent: any[],
    userHandle?: string
  ): ProcessedFeedData["topInteractions"] {
    const interactions = new Map<
      string,
      {
        did: string;
        handle: string;
        displayName: string;
        avatar?: string;
        count: number;
      }
    >();

    console.log(
      `  🤝 Analyzing interactions from ${userReplies.length} user replies...`
    );

    // FIXED: Use author information directly from reply structure
    userReplies.forEach((reply) => {
      // Process parent author (immediate reply target)
      if (reply.replyTo?.parent?.author) {
        const author = reply.replyTo.parent.author;
        if (userHandle && author.handle === userHandle) return; // Skip self

        const key = author.did;
        if (!interactions.has(key)) {
          interactions.set(key, {
            did: author.did,
            handle: author.handle,
            displayName: author.displayName || author.handle,
            avatar: author.avatar,
            count: 0,
          });
        }
        interactions.get(key)!.count++;
      }

      // Process root author (thread starter) if different from parent
      if (
        reply.replyTo?.root?.author &&
        reply.replyTo.root.author.did !== reply.replyTo?.parent?.author?.did
      ) {
        const author = reply.replyTo.root.author;
        if (userHandle && author.handle === userHandle) return; // Skip self

        const key = author.did;
        if (!interactions.has(key)) {
          interactions.set(key, {
            did: author.did,
            handle: author.handle,
            displayName: author.displayName || author.handle,
            avatar: author.avatar,
            count: 0,
          });
        }
        interactions.get(key)!.count++;
      }
    });

    const result = Array.from(interactions.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    console.log(`  📈 Found ${result.length} unique interactions`);
    console.log(`  🔝 Top interactions:`, result.slice(0, 3));

    return result;
  }

  /**
   * Extract and count hashtags
   */
  private static extractHashtags(
    content: any[]
  ): ProcessedFeedData["commonHashtags"] {
    const hashtagCounts = new Map<string, number>();

    content.forEach((item) => {
      const text = item.text || "";
      const hashtags = text.match(/#[\w\u4e00-\u9fa5]+/g) || [];
      hashtags.forEach((tag: string) => {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(hashtagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  /**
   * Prepare word cloud data for client-side processing
   */
  private static prepareWordCloudData(content: any[]): {
    rawText: string;
    isChineseContent: boolean;
  } {
    const rawText = content
      .map((item) => item.text || "")
      .filter(Boolean)
      .join(" ");

    const isChineseContent = this.isPredominantlyChinese(rawText);

    return { rawText, isChineseContent };
  }

  /**
   * Check if text is predominantly Chinese
   */
  private static isPredominantlyChinese(text: string): boolean {
    if (!text || text.length === 0) return false;

    const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalChars = text.replace(/\s/g, "").length;

    return totalChars > 0 && chineseCharCount / totalChars > 0.3;
  }

  /**
   * Calculate various insights
   */
  private static calculateInsights(
    content: any[]
  ): ProcessedFeedData["insights"] {
    const totalPosts = content.filter((item) => item.type === "post").length;
    const totalReplies = content.filter((item) => item.type === "reply").length;
    const totalReposts = content.filter(
      (item) => item.type === "repost"
    ).length;

    const textsWithLength = content
      .map((item) => item.text || "")
      .filter((text) => text.length > 0);

    const averagePostLength =
      textsWithLength.length > 0
        ? Math.round(
            textsWithLength.reduce((sum, text) => sum + text.length, 0) /
              textsWithLength.length
          )
        : 0;

    // Find most active hour
    const hourCounts: Record<number, number> = {};
    content.forEach((item) => {
      const hour = new Date(item.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHour = Object.entries(hourCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]
      ? parseInt(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
      : 0;

    // Find most active day
    const dayCounts: Record<string, number> = {};
    content.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split("T")[0];
      dayCounts[date] = (dayCounts[date] || 0) + 1;
    });
    const mostActiveDay =
      Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    const postsWithMedia = content.filter(
      (item) => item.metadata?.hasMedia
    ).length;

    const postsWithLinks = content.filter(
      (item) => item.metadata?.hasLinks
    ).length;

    const languagesUsed: Record<string, number> = { en: content.length };

    return {
      totalPosts,
      totalReplies,
      totalReposts,
      averagePostLength,
      mostActiveHour,
      mostActiveDay,
      postsWithMedia,
      postsWithLinks,
      languagesUsed,
    };
  }

  /**
   * Log analysis results for debugging
   */
  private static logAnalysisResults(result: ProcessedFeedData): void {
    console.log("\n📈 Analysis Results Summary:");
    console.log(`  • Total posts: ${result.insights.totalPosts}`);
    console.log(`  • Total replies: ${result.insights.totalReplies}`);
    console.log(`  • Total reposts: ${result.insights.totalReposts}`);
    console.log(
      `  • Average post length: ${result.insights.averagePostLength} chars`
    );
    console.log(`  • Most active hour: ${result.insights.mostActiveHour}:00`);
    console.log(`  • Most active day: ${result.insights.mostActiveDay}`);
    console.log(`  • Posts with media: ${result.insights.postsWithMedia}`);
    console.log(`  • Posts with links: ${result.insights.postsWithLinks}`);
    console.log(`  • Common hashtags: ${result.commonHashtags.length}`);
    console.log(`  • Top interactions: ${result.topInteractions.length}`);
    console.log(`  • Raw text length: ${result.rawText?.length || 0} chars`);
    console.log(`  • Is Chinese content: ${result.isChineseContent}`);
  }
}
