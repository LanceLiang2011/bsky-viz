/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useDefault, Segment } from "segmentit";
// eslint-disable-next-line react-hooks/rules-of-hooks
const segmentit = useDefault(new Segment());

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

interface WordCloudEntry {
  word: string;
  count: number;
}

interface ProcessedFeedData {
  activityByHour: ActivityByHour;
  activityTimeline: DayActivity[];
  activityByDay: ActivityByDay;
  topInteractions: InteractionAccount[];
  wordCloudData: WordCount;
  wordCloud: WordCloudEntry[]; // NEW: Top N words for word cloud
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
  // Added words:
  "哈哈",
  "哈哈哈",
  "哈哈哈哈",
  "就是",
  "不是",
  "也是",
  "很多",
  "我们",
  "她们",
  "他们",
  "你们",
  "可能",
  "现在",
  "这种",
  "不能",
  "怎么",
  "然后",
  "这样",
  "那样",
  "以后",
  "确实",
  "已经",
  "而且",
  "真是",
  "真的",
  "非常",
  "特别",
  "太",
  "很是",
  "好像",
  "似乎",
  "看来",
  "已经",
  "这是",
  "那是",
  "啊",
  "吧",
  "吗",
  "呢",
  "啦",
  "哦",
  "嗯",
  "知道",
  "觉得",
  "时候",
  "东西",
  "事情",
  "问题",
  "今天",
  "明天",
  "昨天",
  "真的",
  "有点",
  "一点",
  "大家",
  "一下",
  "一下下",
  "为什么",
  "怎么样",
  "是不是",
  "有没有",
  "其实",
  "都是",
  "应该",
  "可以",
  "要是",
  "感觉",
  "想要",
  "以为",
  "认为",
  "那么",
  "甚至",
  "原来",
  "也不",
  "是的",
  "是吗",
  "是吧",
  "是啊",
  "看来",
  "比如",
  "当时",
  "现在",
  "看到",
  "听到",
  "想到",
  "做的",
  "直接",
  "这么",
  "的话",
  "说的",
  "至少",
  "不要",
  "当然",
  "还是",
  "完全",
  "不会",
  "谢谢",
  "什么样",
  "一部分",
  "大部分",
  "另外",
  "其他",
  "一般",
  "左右",
  "大概",
  "几乎",
  "所有",
  "每个",
  "各种",
  "一种",
  "一样",
  "这样的话",
  "那样的话",
  "所以说",
  "因为说",
  "比较",
  "相当",
  "十分",
  "有点儿",
  "一会儿",
  "一下儿",
  "不用",
  "不必",
  "必须",
  "需要",
  "应该说",
  "可以说",
  "看起来",
  "听起来",
  "多",
  "少",
  "大",
  "小",
  "好",
  "坏",
  "快",
  "慢",
  "新",
  "旧",
  "高",
  "低",
  "对吧",
  "行吧",
  "好吧",
  "嗯嗯",
  "哦哦",
  "啊啊",
  "啦啦",
  "哇",
  "呀呀",
  "嘻嘻",
  "呵呵",
  "嘿嘿",
  "嗯哼",
  "啥",
  "干嘛",
  "咋",
  "咋样",
  "咋办",
  "干啥",
  "如何",
  "为何",
  "何时",
  "何地",
  "何人",
  "谁",
  "啥时候",
  "哪儿",
  "哪里",
  "哪个",
  "哪些",
  "本人",
  "他人",
  "别人",
  "各位",
  "同志",
  "朋友",
  "先生",
  "女士",
  "小姐",
  "兄弟",
  "姐妹",
  "咱们",
  "大家说",
  "有人说",
  "据说",
  "听说",
  "传说",
  "反正",
  "总之",
  "总而言之",
  "话说",
  "话说回来",
  "那么说",
  "反之",
  "反过来",
  "反过来说",
  "另一方面",
  "一方面",
  "首先",
  "其次",
  "然后是",
  "最后",
  "第一",
  "第二",
  "第三",
  "等等",
  "以及",
  "及其",
  "此外",
  "除此以外",
  "另外还",
  "还有就是",
  "特别是",
  "尤其是",
  "具体来说",
  "例如",
  "譬如",
  "比如说是",
  "也就是说",
  "换句话说",
  "总的来说",
  "一般来说",
  "严格来说",
  "坦白说",
  "老实说",
  "说实话",
  "说真的",
  "其实呢",
  "实际上",
  "事实上",
  "的确",
  "确实是",
  "真的是",
  "没错",
  "是的呢",
  "对的",
  "不对",
  "不是的",
  "不行",
  "不行啊",
  "可以吗",
  "行不行",
  "好不好",
  "对不对",
  "是不是啊",
  "有没有搞错",
  "说",
  "看",
  "想",
  "做",
  "去",
  "来",
  "用",
  "会",
  "能",
  "要",
  "得",
  "给",
  "对",
  "吧",
  "呀",
  "哈",
  "嘿",
  "嗨",
  "com",
  "www",
  "http",
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
  "com",
  "www",
  "http",
]);

// Extract text content from a post
function extractTextContent(post: any): string {
  const text = post.post?.record?.text || "";
  const replyParentText = post.reply?.parent?.record?.text || "";
  return text + " " + replyParentText;
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

// Extract words for word cloud
function extractWords(text: string): string[] {
  if (!text) return [];
  const textWithoutUrls = text.replace(/https?:\/\/\S+/g, "");
  const textWithoutMentions = textWithoutUrls.replace(/@[\w.-]+/g, "");
  const cleanText = textWithoutMentions.replace(/[^\p{L}\p{N}\s]/gu, " ");
  const hasChinese = /[\u4e00-\u9fa5]/.test(cleanText);

  let words: string[] = [];
  if (hasChinese) {
    // Use segmentit for Chinese segmentation
    words = segmentit.doSegment(cleanText, { simple: true });
    // Filter out stop words and single characters
    words = words.filter(
      (word) => word.length > 1 && !chineseStopWords.has(word)
    );
  } else {
    words = cleanText
      .split(/\s+/)
      .filter(
        (word) => word.length > 1 && !englishStopWords.has(word.toLowerCase())
      );
  }
  return words;
}

// Main analyzer function
export function analyzeFeed(feedData: any): ProcessedFeedData {
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

  for (let i = 0; i < 24; i++) {
    activityByHour[i] = 0;
  }

  const feed = feedData?.feed || [];

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
      // Improved word cloud: count all words
      const words = extractWords(text);
      words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
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
  });

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

  const topInteractions = Object.values(interactionCounts)
    .map(({ count, handle, displayName }) => ({
      did: handle.split(".")[0],
      handle,
      displayName,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const commonHashtags = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const activityTimeline = Object.values(activityByDay).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // NEW: Generate top N words for word cloud
  const wordCloud: WordCloudEntry[] = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 words

  return {
    activityByHour,
    activityTimeline,
    activityByDay,
    topInteractions,
    wordCloudData: wordCounts,
    wordCloud, // NEW
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
