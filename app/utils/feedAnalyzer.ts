/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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

interface WordCount {
  [word: string]: number;
}

interface ProcessedFeedData {
  activityByHour: ActivityByHour;
  activityTimeline: DayActivity[];
  activityByDay: ActivityByDay;
  topInteractions: InteractionAccount[];
  wordCloudData: WordCount;
  commonHashtags: { tag: string; count: number }[];
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

// Common Chinese stop words
const chineseStopWords = new Set([
  "的",
  "了",
  "和",
  "是",
  "就",
  "都",
  "而",
  "及",
  "与",
  "这",
  "那",
  "你",
  "我",
  "他",
  "她",
  "它",
  "们",
  "个",
  "上",
  "下",
  "不",
  "在",
  "有",
  "为",
  "以",
  "于",
  "之",
  "很",
  "被",
  "到",
  "可以",
  "没有",
  "什么",
  "这个",
  "那个",
  "自己",
  "这些",
  "那些",
  "如果",
  "因为",
  "所以",
  "但是",
  "可是",
  "然而",
  "虽然",
  "不过",
  "只是",
  "还是",
  "还有",
  "一个",
  "一些",
]);

// Common English stop words
const englishStopWords = new Set([
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
]);

// Extract text content from a post
function extractTextContent(post: any): string {
  // Get main post text
  const text = post.post?.record?.text || "";

  // Get text from reply parent if exists
  const replyParentText = post.reply?.parent?.record?.text || "";

  return text + " " + replyParentText;
}

// Extract date and hour from ISO string with proper timezone support
function extractDateAndHour(isoString: string, userTimezone?: string) {
  try {
    // Get browser timezone if none provided
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

// Extract words for word cloud
function extractWords(text: string): string[] {
  if (!text) return [];

  // Handle both English and Chinese text
  // For English: split by spaces and remove punctuation
  // For Chinese: split by character

  // Remove URLs
  const textWithoutUrls = text.replace(/https?:\/\/\S+/g, "");

  // Remove mentions
  const textWithoutMentions = textWithoutUrls.replace(/@[\w.-]+/g, "");

  // Remove punctuation and symbols
  const cleanText = textWithoutMentions.replace(/[^\p{L}\p{N}\s]/gu, " ");

  // Split into words
  // This will work for English, and for Chinese each character will be treated as a "word"
  let words: string[] = [];

  // Check if text contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(cleanText);

  if (hasChinese) {
    // For Chinese, we need a different approach
    // Extract individual Chinese characters
    const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];

    // Extract English words
    const englishWords = cleanText
      .replace(/[\u4e00-\u9fa5]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1);

    words = [...chineseChars, ...englishWords];
  } else {
    // For non-Chinese text, split by spaces
    words = cleanText.split(/\s+/).filter((word) => word.length > 1);
  }

  // Filter out stop words
  words = words.filter((word) => {
    const lowerWord = word.toLowerCase();
    return !englishStopWords.has(lowerWord) && !chineseStopWords.has(word);
  });

  return words;
}

// Main analyzer function
export function analyzeFeed(feedData: any): ProcessedFeedData {
  // Initialize data structures
  const activityByHour: ActivityByHour = {};
  const activityByDay: ActivityByDay = {};
  const interactionCounts: {
    [did: string]: { count: number; handle: string; displayName: string };
  } = {};
  const wordCounts: WordCount = {};
  const hashtagCounts: { [tag: string]: number } = {};

  let totalPosts = 0;
  let totalReplies = 0;
  let totalReposts = 0;
  let totalTextLength = 0;
  let postsWithText = 0;
  let postsWithMedia = 0;
  let postsWithLinks = 0;
  const languagesUsed: { [lang: string]: number } = {};

  // Initialize hours
  for (let i = 0; i < 24; i++) {
    activityByHour[i] = 0;
  }

  // Process each feed item
  const feed = feedData?.feed || [];

  feed.forEach((item: any) => {
    // Skip if no post data
    if (!item.post && !item.reason) return;

    // Determine if it's a post, reply or repost
    const isRepost = !!item.reason;
    const isReply = !isRepost && !!item.reply;
    const isPost = !isRepost && !isReply;

    // Get the post object
    const post = isRepost ? item.post : item.post;
    if (!post) return;

    // Get created date
    const createdAt = post.record?.createdAt || post.indexedAt;
    if (!createdAt) return;

    // Extract date and hour
    const { date, hour } = extractDateAndHour(createdAt);

    // Update activity by hour
    activityByHour[hour] = (activityByHour[hour] || 0) + 1;

    // Initialize or update activity by day
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

    // Update counts
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

    // Track interactions with other accounts
    if (isReply && item.reply) {
      // Count interaction with parent post author
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

      // Count interaction with root post author if different
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

    // Extract text for word cloud
    const text = extractTextContent(item);
    if (text) {
      postsWithText++;
      totalTextLength += text.length;

      // Process for word cloud
      const words = extractWords(text);
      words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

      // Extract hashtags
      const hashtags = text.match(/#[\w\u4e00-\u9fa5]+/g) || [];
      hashtags.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    }

    // Check for media
    const hasEmbed = post.embed || post.record?.embed;
    if (hasEmbed) {
      const embedType = post.embed?.$type || post.record?.embed?.$type;
      if (embedType?.includes("images") || embedType?.includes("media")) {
        postsWithMedia++;
      }
    }

    // Check for external links
    const hasLinks = text && /https?:\/\/\S+/g.test(text);
    if (hasLinks) {
      postsWithLinks++;
    }

    // Track languages used
    const langs = post.record?.langs || [];
    langs.forEach((lang: string) => {
      languagesUsed[lang] = (languagesUsed[lang] || 0) + 1;
    });
  });

  // Find most active hour and day
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

  // Sort interactions by count
  const topInteractions = Object.values(interactionCounts)
    .map(({ count, handle, displayName }) => ({
      did: handle.split(".")[0],
      handle,
      displayName,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Sort hashtags by count
  const commonHashtags = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Convert activityByDay to sorted timeline
  const activityTimeline = Object.values(activityByDay).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Return processed data
  return {
    activityByHour,
    activityTimeline,
    activityByDay,
    topInteractions,
    wordCloudData: wordCounts,
    commonHashtags,
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
