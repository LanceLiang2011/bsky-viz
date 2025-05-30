/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { WordProcessor, type WordData } from "./wordProcessor";

// Types for processed data
interface ActivityByHour {
  [hour: number]: number;
}

interface DayActivity {
  posts: number;
  replies: number;
  reposts: number;
  likes: number;
  total: number;
  date: string;
}

interface ActivityByDay {
  [date: string]: DayActivity;
}

interface InteractionAccount {
  did: string;
  handle: string;
  displayName: string;
  count: number;
}

interface ProcessedFeedData {
  activityByHour: ActivityByHour;
  activityTimeline: DayActivity[];
  activityByDay: ActivityByDay;
  topInteractions: InteractionAccount[];
  commonHashtags: { tag: string; count: number }[];
  wordCloudData: WordData[];
  rawText?: string; // Raw text for client-side Chinese processing
  isChineseContent?: boolean; // Flag to indicate Chinese content
  insights: {
    totalPosts: number;
    totalReplies: number;
    totalReposts: number;
    averagePostLength: number;
    mostActiveHour: number;
    mostActiveDay: string;
    postsWithMedia: number;
    postsWithLinks: number;
    languagesUsed: { [lang: string]: number };
  };
}

// Extract text content from a post
function extractTextContent(post: any): string {
  const text = post.post?.record?.text || "";
  const replyParentText = post.reply?.parent?.record?.text || "";
  return text + " " + replyParentText;
}

// Check if the combined text is predominantly Chinese
function isPredominantlyChinese(text: string): boolean {
  if (!text || text.length === 0) return false;

  const chineseCharCount = (
    text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []
  ).length;
  const totalChars = text.replace(/\s/g, "").length;

  // If more than 30% of non-space characters are Chinese, consider it Chinese content
  return totalChars > 0 && chineseCharCount / totalChars > 0.3;
}

// Extract date and hour from ISO string with proper timezone support
function extractDateAndHour(isoString: string, userTimezone?: string) {
  try {
    const timezone =
      userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseISO(isoString);
    const zonedDate = toZonedTime(date, timezone);
    const hour = zonedDate.getHours();
    const formattedDate = format(zonedDate, "yyyy-MM-dd");
    return { date: formattedDate, hour };
  } catch (e) {
    console.error("Error parsing date:", isoString, e);
    return { date: "1970-01-01", hour: 0 };
  }
}

// Main analyzer function
export async function analyzeFeed(
  feedData: any,
  options: { locale?: string; userHandle?: string } = {} // locale parameter kept for compatibility but ignored for route independence
): Promise<ProcessedFeedData> {
  console.log(
    `Starting feed analysis with ${feedData?.feed?.length || 0} items`
  );

  const activityByHour: ActivityByHour = {};
  const activityByDay: ActivityByDay = {};
  const interactionCounts: {
    [did: string]: { count: number; handle: string; displayName: string };
  } = {};
  const hashtagCounts: { [tag: string]: number } = {};
  const allTexts: string[] = []; // Collect all text for word cloud processing

  let totalPosts = 0;
  let totalReplies = 0;
  let totalReposts = 0;
  let totalTextLength = 0;
  let postsWithText = 0;
  let postsWithMedia = 0;
  let postsWithLinks = 0;
  const languagesUsed: { [lang: string]: number } = {};

  for (let i = 0; i < 24; i++) {
    activityByHour[i] = 0;
  }

  const feed = feedData?.feed || [];

  // Use the provided user handle, or extract from the first post as fallback
  const userHandle = options.userHandle || "";
  const userDid = feed.length > 0 ? feed[0]?.post?.author?.did : "";

  console.log(`User handle provided: ${userHandle || "Not provided"}`);
  console.log(`User DID identified as: ${userDid || "Not found"}`);

  console.log(`Processing ${feed.length} feed items...`);
  let processedItems = 0;

  feed.forEach((item: any) => {
    if (!item.post && !item.reason) return;
    const isRepost = !!item.reason;
    const isReply = !isRepost && !!item.reply;
    const isPost = !isRepost && !isReply;
    const post = isRepost ? item.post : item.post;
    if (!post) return;
    const createdAt = post.record?.createdAt || post.indexedAt;
    if (!createdAt) return;
    const { date, hour } = extractDateAndHour(createdAt);
    activityByHour[hour] = (activityByHour[hour] || 0) + 1;
    if (!activityByDay[date]) {
      activityByDay[date] = {
        posts: 0,
        replies: 0,
        reposts: 0,
        likes: 0,
        total: 0,
        date,
      };
    }
    if (isPost) {
      totalPosts++;
      activityByDay[date].posts++;
    } else if (isReply) {
      totalReplies++;
      activityByDay[date].replies++;
    } else if (isRepost) {
      totalReposts++;
      activityByDay[date].reposts++;
    }
    activityByDay[date].total++;
    if (isReply && item.reply) {
      const parentAuthor = item.reply.parent?.author;
      if (parentAuthor && parentAuthor.did) {
        if (!interactionCounts[parentAuthor.did]) {
          interactionCounts[parentAuthor.did] = {
            count: 0,
            handle: parentAuthor.handle || "",
            displayName: parentAuthor.displayName || parentAuthor.handle || "",
          };
        }
        interactionCounts[parentAuthor.did].count++;
      }
      const rootAuthor = item.reply.root?.author;
      if (
        rootAuthor &&
        rootAuthor.did &&
        rootAuthor.did !== (parentAuthor?.did || "")
      ) {
        if (!interactionCounts[rootAuthor.did]) {
          interactionCounts[rootAuthor.did] = {
            count: 0,
            handle: rootAuthor.handle || "",
            displayName: rootAuthor.displayName || rootAuthor.handle || "",
          };
        }
        interactionCounts[rootAuthor.did].count++;
      }
    }
    const text = extractTextContent(item);
    if (text) {
      postsWithText++;
      totalTextLength += text.length;
      allTexts.push(text); // Collect text for word cloud

      // Simple hashtag extraction (no word processing for now)
      const hashtags = text.match(/#[\w\u4e00-\u9fa5]+/g) || [];
      hashtags.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    }
    const hasEmbed = post.embed || post.record?.embed;
    if (hasEmbed) {
      const embedType = post.embed?.$type || post.record?.embed?.$type;
      if (embedType?.includes("images") || embedType?.includes("media")) {
        postsWithMedia++;
      }
    }
    const hasLinks = text && /https?:\/\/\S+/g.test(text);
    if (hasLinks) {
      postsWithLinks++;
    }
    const langs = post.record?.langs || [];
    langs.forEach((lang: string) => {
      languagesUsed[lang] = (languagesUsed[lang] || 0) + 1;
    });
    processedItems++;
    if (processedItems % 100 === 0) {
      console.log(`Processed ${processedItems}/${feed.length} items`);
    }
  });

  console.log(`Processing complete. Building statistics...`);

  let mostActiveHour = 0;
  let maxHourCount = 0;
  for (const [hour, count] of Object.entries(activityByHour)) {
    if (count > maxHourCount) {
      maxHourCount = count;
      mostActiveHour = parseInt(hour);
    }
  }

  let mostActiveDay = "";
  let maxDayCount = 0;
  for (const [date, activity] of Object.entries(activityByDay)) {
    if (activity.total > maxDayCount) {
      maxDayCount = activity.total;
      mostActiveDay = date;
    }
  }

  console.log(
    `Building top interactions, filtering out user DID: ${userDid} and handle: ${userHandle}`
  );
  console.log(
    `Total interaction accounts before filtering: ${
      Object.keys(interactionCounts).length
    }`
  );

  // When building topInteractions, filter out the user's own DID and handle
  const topInteractions = Object.entries(interactionCounts)
    .filter(([interactionDid, { handle }]) => {
      // Filter out both the user's DID and handle to exclude the analyzed user completely
      const isDifferentDid = !userDid || interactionDid !== userDid;
      const isDifferentHandle = !userHandle || handle !== userHandle;
      return isDifferentDid && isDifferentHandle;
    })
    .map(([interactionDid, { count, handle, displayName }]) => ({
      did: interactionDid,
      handle,
      displayName,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  console.log(`Top interactions after filtering: ${topInteractions.length}`);
  console.log(`First few interactions:`, topInteractions.slice(0, 3));

  const commonHashtags = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const activityTimeline = Object.values(activityByDay).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Process text for word cloud
  console.log(`Processing ${allTexts.length} texts for word cloud...`);
  const combinedText = allTexts.join(" ");

  // Check if content is predominantly Chinese
  const isChineseContent = isPredominantlyChinese(combinedText);
  console.log(`Chinese content detected: ${isChineseContent}`);

  let wordCloudData: WordData[] = [];
  let rawText: string | undefined;

  if (isChineseContent) {
    // For Chinese content, pass raw text to client for processing
    rawText = combinedText;
    console.log(
      `Passing raw Chinese text to client (${combinedText.length} characters)`
    );
  } else {
    // For non-Chinese content, process server-side as usual
    // Remove locale parameter to ensure route-independent processing
    wordCloudData = (await WordProcessor.processTextAsync(combinedText)).slice(
      0,
      150
    ); // Limit to top 150 words
    console.log(`Generated word cloud with ${wordCloudData.length} words`);
  }

  console.log(`Analysis complete, returning processed data`);
  return {
    activityByHour,
    activityTimeline,
    activityByDay,
    topInteractions,
    commonHashtags,
    wordCloudData,
    rawText,
    isChineseContent,
    insights: {
      totalPosts,
      totalReplies,
      totalReposts,
      averagePostLength: postsWithText
        ? Math.round(totalTextLength / postsWithText)
        : 0,
      mostActiveHour,
      mostActiveDay,
      postsWithMedia,
      postsWithLinks,
      languagesUsed,
    },
  };
}
