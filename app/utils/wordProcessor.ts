// Word processor utility for text analysis and word cloud generation
// This file can be used on both client and server side

// Word cloud data interface
export interface WordData {
  text: string;
  value: number;
}

// Language detection and processing options
export interface ProcessingOptions {
  locale?: string;
  minWordLength?: number;
  maxWords?: number;
}

// Word frequency processor with multilingual support
export class WordProcessor {
  // English stop words
  private static readonly ENGLISH_STOP_WORDS = new Set([
    // Essential English stop words
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "this",
    "that",
    "these",
    "those",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "if",
    "when",
    "where",
    "why",
    "how",
    "what",
    "who",
    "which",
    "there",
    "here",
    "up",
    "down",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "just",
    "only",
    "very",
    "so",
    "now",
    "get",
    "go",
    "come",
    "see",
    "know",
    "take",
    "make",
    "think",
    "say",
    "tell",
    "give",
    "put",
    "use",
    "find",
    "work",
    "call",
    "try",
    "ask",
    "need",
    "feel",
    "become",
    "leave",
    "turn",
    "start",
    "show",
    "hear",
    "play",
    "run",
    "move",
    "live",
    "believe",
    "bring",
    "happen",
    "write",
    "sit",
    "stand",
    "lose",
    "pay",
    "meet",
    "include",
    "continue",
    "set",
    "learn",
    "change",
    "lead",
    "understand",
    "watch",
    "follow",
    "stop",
    "create",
    "speak",
    "read",
    "spend",
    "grow",
    "open",
    "walk",
    "win",
    "teach",
    "offer",
    "remember",
    "consider",
    "appear",
    "buy",
    "serve",
    "die",
    "send",
    "build",
    "stay",
    "fall",
    "cut",
    "reach",
    "kill",
    "remain",
    "suggest",
    "raise",
    "pass",
    "sell",
    "require",
    "report",
    // Common social media/tech words
    "rt",
    "via",
    "cc",
    "dm",
    "pm",
    "lol",
    "omg",
    "btw",
    "fyi",
    "imo",
    "imho",
    "aka",
    "asap",
    "etc",
    "ie",
    "eg",
    "vs",
    "www",
    "http",
    "https",
    "com",
    "org",
    "net",
    "html",
    "url",
    "link",
    "click",
    "follow",
    "like",
    "share",
    "retweet",
    "reply",
    "mention",
    "hashtag",
    "tag",
    "post",
    "tweet",
    "status",
    "update",
    // Numbers and single characters
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ]);

  // Chinese stop words (common characters and words)
  private static readonly CHINESE_STOP_WORDS = new Set([
    // Common Chinese stop characters/words
    "的",
    "了",
    "在",
    "是",
    "我",
    "有",
    "和",
    "就",
    "不",
    "人",
    "都",
    "一",
    "他",
    "为",
    "上",
    "个",
    "也",
    "说",
    "我们",
    "出",
    "会",
    "可",
    "这",
    "你",
    "对",
    "生",
    "能",
    "而",
    "自",
    "着",
    "去",
    "之",
    "过",
    "家",
    "学",
    "如",
    "时",
    "们",
    "以",
    "下",
    "地",
    "多",
    "么",
    "得",
    "可以",
    "这个",
    "中",
    "那",
    "来",
    "要",
    "用",
    "年",
    "等",
    "没",
    "大",
    "做",
    "同",
    "当",
    "从",
    "还",
    "进",
    "第",
    "水",
    "方",
    "长",
    "与",
    "三",
    "于",
    "高",
    "正",
    "受",
    "党",
    "全",
    "或",
    "将",
    "以及",
    "由",
    "新",
    "两",
    // Punctuation and symbols often found in Chinese text
    "！",
    "？",
    "，",
    "。",
    "；",
    "：",
    "、",
    "\u201c",
    "\u201d",
    "\u2018",
    "\u2019",
    "（",
    "）",
    "【",
    "】",
    "《",
    "》",
    // Common single characters that are usually not meaningful alone
    "及",
    "与",
    "和",
    "或",
    "但",
    "而",
    "因",
    "所",
    "为",
    "此",
    "其",
    "各",
    "每",
    "该",
    "些",
    "某",
    // Numbers in Chinese
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
    "百",
    "千",
    "万",
    "亿",
    // Time-related
    "年",
    "月",
    "日",
    "时",
    "分",
    "秒",
    "今",
    "昨",
    "明",
    "前",
    "后",
    "早",
    "晚",
    "上",
    "下",
    // Common verbs that might not be meaningful in word clouds
    "是",
    "有",
    "在",
    "了",
    "着",
    "过",
    "来",
    "去",
    "说",
    "做",
    "看",
    "想",
    "知",
    "得",
    "给",
    "把",
  ]);

  /**
   * Detects if text contains significant Chinese characters
   */
  private static detectLanguage(text: string): "chinese" | "english" {
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const chineseChars = text.match(chineseCharRegex);
    const totalChars = text.replace(/\s/g, "").length;

    if (chineseChars && chineseChars.length > totalChars * 0.3) {
      return "chinese";
    }
    return "english";
  }

  /**
   * Process Chinese text using character-based segmentation
   */
  private static processChineseText(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    const minLength = options.minWordLength || 1;
    const wordFreq = new Map<string, number>();

    // Clean text but preserve Chinese characters
    const cleaned = text
      .replace(/[^\u4e00-\u9fa5\w\s]/g, " ") // Keep Chinese chars, alphanumeric, spaces
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return [];

    // For Chinese, we'll extract meaningful character sequences
    // Split by spaces and punctuation, then process each segment
    const segments = cleaned.split(/\s+/);

    segments.forEach((segment) => {
      // Extract Chinese character sequences of different lengths
      for (let length = 1; length <= Math.min(4, segment.length); length++) {
        for (let i = 0; i <= segment.length - length; i++) {
          const substring = segment.substring(i, i + length);

          // Only include if it contains Chinese characters and meets criteria
          if (
            substring.match(/[\u4e00-\u9fa5]/) &&
            substring.length >= minLength &&
            !this.CHINESE_STOP_WORDS.has(substring) &&
            !substring.match(/^\d+$/)
          ) {
            wordFreq.set(substring, (wordFreq.get(substring) || 0) + 1);
          }
        }
      }
    });

    return Array.from(wordFreq.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Process English text using space-based segmentation
   */
  private static processEnglishText(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    const minLength = options.minWordLength || 3;
    const wordFreq = new Map<string, number>();

    // Clean and normalize text
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s#@]/g, " ") // Keep alphanumeric, hashtags, mentions
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return [];

    // Split by whitespace and filter
    cleaned.split(" ").forEach((word) => {
      const trimmed = word.trim();

      // Filter criteria
      if (
        trimmed.length >= minLength &&
        !this.ENGLISH_STOP_WORDS.has(trimmed) &&
        !trimmed.match(/^\d+$/) && // No pure numbers
        !trimmed.match(/^[@#]+$/) // No bare @ or #
      ) {
        wordFreq.set(trimmed, (wordFreq.get(trimmed) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Main text processing method with language detection
   */
  static processText(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    if (!text || typeof text !== "string") return [];

    try {
      // Detect language from locale or text content
      let language: "chinese" | "english" = "english";

      if (options.locale) {
        language = options.locale.includes("zh") ? "chinese" : "english";
      } else {
        language = this.detectLanguage(text);
      }

      console.log(`Processing text with detected language: ${language}`);

      // Process based on detected language
      const results =
        language === "chinese"
          ? this.processChineseText(text, options)
          : this.processEnglishText(text, options);

      // Limit results if maxWords is specified
      const maxWords = options.maxWords || results.length;
      return results.slice(0, maxWords);
    } catch (error) {
      console.error("Error processing text for word cloud:", error);
      return [];
    }
  }

  static combineWordArrays(wordArrays: WordData[][]): WordData[] {
    const combinedFreq = new Map<string, number>();

    wordArrays.forEach((words) => {
      words.forEach(({ text, value }) => {
        combinedFreq.set(text, (combinedFreq.get(text) || 0) + value);
      });
    });

    return Array.from(combinedFreq.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
  }
}

// Hook for easy word processing (for client-side use)
export const useWordProcessor = () => {
  const processText = (text: string) => WordProcessor.processText(text);
  const combineWordArrays = (wordArrays: WordData[][]) =>
    WordProcessor.combineWordArrays(wordArrays);

  return { processText, combineWordArrays };
};

export default WordProcessor;
