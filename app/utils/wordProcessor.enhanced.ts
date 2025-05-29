// Enhanced Word processor utility for text analysis and word cloud generation
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

// Import Chinese processor (server-only)
import { segmentChineseText, isServerSide } from "./chineseProcessor.server";

// Word frequency processor with enhanced multilingual support
export class WordProcessor {
  // English stop words (comprehensive list)
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
    "lmao",
    "tldr",
    "nsfw",
    "irl",
    "tbt",
    "icymi",
    "afaik",
    "tbh",
    "ftw",
    "nbd",
    "smh",
  ]);

  // Chinese stop words (comprehensive list)
  private static readonly CHINESE_STOP_WORDS = new Set([
    // Common Chinese stop words
    "的",
    "了",
    "和",
    "是",
    "在",
    "我",
    "有",
    "个",
    "人",
    "这",
    "上",
    "们",
    "到",
    "时",
    "大",
    "地",
    "为",
    "子",
    "中",
    "你",
    "说",
    "生",
    "国",
    "年",
    "着",
    "就",
    "那",
    "要",
    "出",
    "也",
    "得",
    "里",
    "后",
    "自",
    "以",
    "会",
    "家",
    "可",
    "下",
    "而",
    "过",
    "天",
    "去",
    "能",
    "对",
    "小",
    "多",
    "然",
    "于",
    "心",
    "学",
    "么",
    "之",
    "都",
    "好",
    "看",
    "起",
    "发",
    "当",
    "没",
    "成",
    "只",
    "如",
    "事",
    "把",
    "还",
    "用",
    "第",
    "样",
    "道",
    "想",
    "作",
    "种",
    "开",
    "美",
    "总",
    "从",
    "无",
    "情",
    "己",
    "面",
    "最",
    "女",
    "但",
    "现",
    "前",
    "些",
    "所",
    "同",
    "日",
    "手",
    "又",
    "行",
    "意",
    "动",
    "方",
    "期",
    "它",
    "头",
    "经",
    "长",
    "儿",
    "回",
    "位",
    "分",
    "爱",
    "老",
    "因",
    "很",
    "给",
    "名",
    "法",
    "间",
    "斯",
    "知",
    "世",
    "什",
    "两",
    "次",
    "使",
    "身",
    "者",
    "被",
    "高",
    "已",
    "亲",
    "其",
    "进",
    "此",
    "话",
    "常",
    "与",
    "活",
    "正",
    "感",
    "见",
    "明",
    "问",
    "力",
    "理",
    "尔",
    "点",
    "文",
    "几",
    "定",
    "本",
    "公",
    "特",
    "做",
    "外",
    "孩",
    "相",
    "西",
    "果",
    "走",
    "将",
    "月",
    "十",
    "实",
    "向",
    "声",
    "车",
    "全",
    "信",
    "重",
    "三",
    "机",
    "工",
    "物",
    "气",
    "每",
    "并",
    "别",
    "真",
    "打",
    "太",
    "新",
    "比",
    "才",
    "便",
    "夫",
    "再",
    "书",
    "部",
    "水",
    "像",
    "眼",
    "等",
    "体",
    "却",
    "加",
    "电",
    "主",
    "界",
    "门",
    "利",
    "海",
    "受",
    "听",
    "表",
    "德",
    "少",
    "克",
    "代",
    "员",
    "许",
    "先",
    "口",
    "由",
    "死",
    "安",
    "写",
    "性",
    "马",
    "光",
    "白",
    "或",
    "住",
    "难",
    "望",
    "教",
    "命",
    "花",
    "结",
    "乐",
    "色",
    "更",
    "拉",
    "东",
    "神",
    "记",
    "处",
    "让",
    "母",
    "父",
    "应",
    "直",
    "字",
    "场",
    "平",
    "报",
    "友",
    "关",
    "放",
    "至",
    "张",
    "认",
    "接",
    "告",
    "入",
    "笑",
    "内",
    "英",
    "军",
    "候",
    "民",
    "岁",
    "往",
    "何",
    "度",
    "山",
    "觉",
    "路",
    "带",
    "万",
    "男",
    "边",
    "风",
    "解",
    "叫",
    "任",
    "金",
    "快",
    "原",
    "吃",
    "妈",
    "变",
    "通",
    "师",
    "立",
    "象",
    "数",
    "四",
    "失",
    "满",
    "战",
    "远",
    "格",
    "士",
    "音",
    "轻",
    "目",
    "条",
    "呢",
    "病",
    "始",
    "达",
    "深",
    "完",
    "今",
    "提",
    "求",
    "清",
    "王",
    "化",
    "空",
    "业",
    "思",
    "切",
    "怎",
    "非",
    "找",
    "片",
    "罗",
    "钱",
    "紶",
    "吗",
    "语",
    "元",
    "喜",
    "曾",
    "离",
    "飞",
    "科",
    "言",
    "干",
    "流",
    "欢",
    "即",
    "境",
    "具",
    "际",
    "须",
    "试",
    "收",
    "交",
    "准",
    "少",
    "持",
    "组",
    "旦",
    "星",
    "根",
    "共",
    "价",
    "护",
    "七",
    "城",
    "早",
    "火",
    "始",
    "复",
    "单",
    "坐",
    "产",
    "推",
    "必",
    "团",
    "造",
    "亮",
    "亚",
    "极",
    "李",
    "息",
    "织",
    "商",
    "第",
    "转",
    "请",
    "保",
    "网",
    "式",
    "场",
    "计",
    "量",
    "管",
    "精",
    "黑",
    "则",
    "古",
    "术",
    "节",
    "专",
    "连",
    "黄",
    "丽",
    "让",
    "证",
    "传",
    "营",
    "纪",
    "基",
    "积",
    "周",
    "示",
    "赶",
    "约",
    "青",
    "系",
    "半",
    "商",
    "片",
    "容",
    "研",
    "食",
    "密",
    "材",
    "书",
    "院",
    "刘",
    "图",
    "听",
    "吸",
    "百",
    "乎",
    "致",
    "湾",
    "效",
    "般",
    "历",
    "画",
    "拿",
    "论",
    "联",
    "步",
    "留",
    "车",
    "治",
    "党",
    "华",
    "斗",
    "指",
    "结",
    "导",
    "笔",
    "参",
    "落",
    "无",
    "南",
    "照",
    "字",
    "劳",
    "轮",
    "略",
    "些",
    "值",
    "则",
    "员",
    "某",
    "团",
    "站",
    "程",
    "张",
    "刻",
    "构",
    "河",
    "若",
    "维",
    "局",
    "树",
    "故",
    "按",
    "个",
    "均",
    "且",
    "石",
    "运",
    "存",
    "究",
    "决",
    "注",
    "确",
    "越",
    "装",
    "亦",
    "线",
    "周",
    "势",
    "威",
    "案",
    "率",
    "幸",
    "费",
    "列",
    "举",
    "适",
    "图",
    "专",
    "血",
    "热",
    "客",
    "阿",
    "介",
    "击",
    "卡",
    "兴",
    "训",
    "苏",
    "获",
    "举",
    "杀",
    "献",
    "宣",
    "布",
    "著",
    "财",
    "状",
    "类",
    "担",
    "检",
    "责",
    "球",

    // Numbers and ordinals
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
    "点",
    "号",
    "第",
    "次",
    "位",
    "本",
    "又",
    "再",
    "还",
    "更",
    "最",
    "内",
    "外",
    "远",
    "近",
    "左",
    "右",
    "东",
    "西",
    "南",
    "北",
    "里",

    // Punctuation and symbols (as strings with escaped characters)
    "!",
    "?",
    ",",
    ".",
    ";",
    ":",
    "、",
    '"',
    '"',
    "'",
    "'",
    "(",
    ")",
    "[",
    "]",
    "<",
    ">",
    "〈",
    "〉",
    "「",
    "」",
    "『",
    "』",
    "—",
    "…",

    // Social media specific expressions that add no value
    "哈",
    "哈哈",
    "哈哈哈",
    "呵呵",
    "嘿嘿",
    "嘻嘻",
    "哇",
    "啊",
    "呀",
    "呢",
    "噢",
    "哦",
    "嗯",
    "唉",
    "哎",
    "额",
    "诶",
    "咦",
    "哟",
    "喂",
    "嗨",
    "转发",
    "评论",
    "点赞",
    "分享",
    "关注",
    "取关",
    "私信",
    "好看",
    "好好",
    "好好好",
    "太好",
    "很好",
    "非常好",
    "超好",
    "真好",
    "真的",
    "真的是",
    "真是",
    "就是",
    "就像",
    "就这样",
    "就那样",
    "不是",
    "不像",
    "不行",
    "可以",
    "可能",
    "不可能",
    "应该",
    "应当",
    "需要",
    "必须",
    "不能",
    "难以",
    "的话",
    "来说",
    "而已",
    "罢了",
    "而已",

    // Repetitive expressions and meaningless sequences
    "啊啊",
    "啊啊啊",
    "呀呀",
    "呀呀呀",
    "嗯嗯",
    "嗯嗯嗯",
    "好好好",
    "对对对",
    "是是是",
    "行行行",
  ]);

  // Check if a string is repetitive (like "哈哈", "嘻嘻", etc.)
  private static isRepetitiveExpression(word: string): boolean {
    if (word.length < 2) return false;

    // Check for simple character repetition
    const firstChar = word[0];
    for (let i = 1; i < word.length; i++) {
      if (word[i] !== firstChar) return false;
    }
    return true;
  }

  // Detect if a Chinese character is potentially meaningful as a standalone word
  private static isMeaningfulChineseChar(char: string): boolean {
    if (char.length !== 1) return true;

    // Very common single characters that are typically not useful on their own
    const commonSingleChars = new Set([
      "的",
      "了",
      "和",
      "是",
      "在",
      "我",
      "有",
      "个",
      "人",
      "这",
      "上",
      "们",
      "到",
      "时",
      "大",
      "地",
      "为",
      "子",
      "中",
      "你",
      "说",
      "生",
      "国",
      "年",
      "着",
      "就",
      "那",
      "要",
      "出",
      "也",
      "得",
      "里",
      "后",
      "自",
      "以",
      "会",
      "家",
      "可",
      "下",
      "而",
      "过",
      "天",
      "去",
      "能",
      "对",
      "小",
      "多",
      "然",
      "于",
      "心",
      "学",
      "么",
      "之",
      "都",
      "好",
      "看",
      "起",
      "发",
      "当",
      "没",
      "成",
      "只",
      "如",
      "事",
      "把",
      "还",
      "用",
      "第",
      "样",
      "道",
      "想",
      "作",
      "种",
      "开",
      "美",
      "总",
      "从",
      "无",
      "情",
      "己",
      "面",
      "最",
      "女",
      "但",
      "现",
      "前",
      "些",
      "所",
      "同",
      "日",
      "手",
      "又",
      "行",
      "意",
      "动",
      "方",
      "期",
      "它",
      "头",
      "经",
      "长",
      "儿",
      "回",
      "位",
      "分",
      "爱",
      "老",
      "因",
      "很",
      "给",
      "名",
      "法",
      "间",
      "斯",
      "知",
      "世",
      "什",
      "两",
      "次",
      "使",
      "身",
      "者",
      "被",
      "高",
      "已",
      "亲",
      "其",
      "进",
      "哈",
      "啊",
      "呀",
      "嗯",
      "哦",
      "呢",
      "吧",
      "啦",
      "噢",
      "喔",
      "唉",
      "诶",
      "哎",
      "嘿",
      "嘻",
    ]);

    return !commonSingleChars.has(char);
  }

  // Language detection based on character set
  static detectLanguage(text: string): "chinese" | "english" {
    // Count Chinese vs. non-Chinese characters
    let chineseCharCount = 0;
    let nonChineseCharCount = 0;

    for (const char of text) {
      // Chinese character range check (basic CJK Unified Ideographs)
      if (/[\u4e00-\u9fa5]/.test(char)) {
        chineseCharCount++;
      } else if (/[a-zA-Z]/.test(char)) {
        nonChineseCharCount++;
      }
    }

    // If more Chinese characters than English letters, classify as Chinese
    return chineseCharCount > nonChineseCharCount ? "chinese" : "english";
  }

  // Process English text into word frequency data
  static processEnglishText(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    const minWordLength = options.minWordLength || 3;
    const wordFreq = new Map<string, number>();

    // Clean and normalize text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    // Count word frequencies
    for (const word of words) {
      if (
        word.length >= minWordLength &&
        !this.ENGLISH_STOP_WORDS.has(word) &&
        !/^\d+$/.test(word) // Skip numbers
      ) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    // Convert to WordData array and sort by frequency
    const result = Array.from(wordFreq.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);

    const maxWords = options.maxWords || result.length;
    return result.slice(0, maxWords);
  }

  // Fallback Chinese segmentation (used when Jieba is not available)
  static fallbackChineseSegmentation(
    text: string,
    wordFreq: Map<string, number>,
    minWordLength: number
  ): void {
    // Collect Chinese characters
    const chineseChars: string[] = [];
    for (const char of text) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        chineseChars.push(char);
      } else if (chineseChars.length > 0 && /\s/.test(char)) {
        // Process current segment on whitespace
        this.processChineseSegment(
          chineseChars.join(""),
          wordFreq,
          minWordLength
        );
        chineseChars.length = 0;
      }
    }

    // Process any remaining characters
    if (chineseChars.length > 0) {
      this.processChineseSegment(
        chineseChars.join(""),
        wordFreq,
        minWordLength
      );
    }
  }

  // Process a Chinese text segment using n-gram approach
  static processChineseSegment(
    segment: string,
    wordFreq: Map<string, number>,
    minWordLength: number
  ): void {
    const maxN = Math.min(4, segment.length);

    // Process different n-grams
    for (let n = minWordLength; n <= maxN; n++) {
      for (let i = 0; i <= segment.length - n; i++) {
        const ngram = segment.slice(i, i + n);

        // Skip if it's a stop word or doesn't meet criteria
        if (
          this.CHINESE_STOP_WORDS.has(ngram) ||
          this.isRepetitiveExpression(ngram) ||
          (ngram.length === 1 && !this.isMeaningfulChineseChar(ngram))
        ) {
          continue;
        }

        // Give higher weight to longer n-grams (more likely meaningful phrases)
        const weight = n;
        wordFreq.set(ngram, (wordFreq.get(ngram) || 0) + weight);
      }
    }
  }

  // Process text using Jieba segmentation for Chinese (async method)
  static async processTextAsync(
    text: string,
    options: ProcessingOptions = {}
  ): Promise<WordData[]> {
    try {
      // Detect language from locale or text content
      let language: "chinese" | "english" = "english";

      if (options.locale) {
        language = options.locale.includes("zh") ? "chinese" : "english";
      } else {
        language = this.detectLanguage(text);
      }

      console.log(
        `Processing text asynchronously with detected language: ${language}`
      );

      // For Chinese, try to use server-side segmentation
      if (language === "chinese" && isServerSide()) {
        const minLength = options.minWordLength || 2;

        try {
          // Use server-side Chinese segmentation
          console.log("Using server-side Chinese word segmentation");
          const wordFreq = new Map<string, number>();

          // Clean text
          const cleaned = text
            .replace(/[^\u4e00-\u9fa5\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (cleaned) {
            // Get segmented words from server-side processor
            const segments = await segmentChineseText(cleaned);

            // Count word frequencies
            for (const word of segments) {
              if (
                word.length >= minLength &&
                !this.CHINESE_STOP_WORDS.has(word) &&
                !this.isRepetitiveExpression(word) &&
                (word.length > 1 || this.isMeaningfulChineseChar(word))
              ) {
                // Weight by length (favor longer words)
                const weight = word.length;
                wordFreq.set(word, (wordFreq.get(word) || 0) + weight);
              }
            }
          }

          let result = Array.from(wordFreq.entries())
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value);

          // Apply quality filtering
          result = result.filter(({ text, value }) => {
            if (text.length === 1 && value < 5) return false;
            if (this.isRepetitiveExpression(text)) return false;
            return true;
          });

          const maxWords = options.maxWords || result.length;
          return result.slice(0, maxWords);
        } catch (segmentError) {
          console.log(
            "Server-side Chinese segmentation failed, using fallback:",
            segmentError
          );
          return this.processTextSync(text, options);
        }
      } else {
        return this.processEnglishText(text, options);
      }
    } catch (error) {
      console.error("Error processing text for word cloud:", error);
      // Fallback to sync method
      return this.processTextSync(text, options);
    }
  }

  // Legacy alias for backward compatibility
  static processText(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    return this.processTextSync(text, options);
  }

  // Synchronous text processing method (fallback when Jieba is not available)
  static processTextSync(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    try {
      // Detect language from locale or text content
      let language: "chinese" | "english" = "english";

      if (options.locale) {
        language = options.locale.includes("zh") ? "chinese" : "english";
      } else {
        language = this.detectLanguage(text);
      }

      console.log(
        `Processing text synchronously with detected language: ${language}`
      );

      // For synchronous processing, use fallback for Chinese
      if (language === "chinese") {
        const minLength = options.minWordLength || 2;
        const wordFreq = new Map<string, number>();

        const cleaned = text
          .replace(/[^\u4e00-\u9fa5\w\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (cleaned) {
          this.fallbackChineseSegmentation(cleaned, wordFreq, minLength);
        }

        let result = Array.from(wordFreq.entries())
          .map(([text, value]) => ({ text, value }))
          .sort((a, b) => b.value - a.value);

        // Apply quality filtering
        result = result.filter(({ text, value }) => {
          if (text.length === 1 && value < 5) return false;
          if (this.isRepetitiveExpression(text)) return false;
          return true;
        });

        const maxWords = options.maxWords || result.length;
        return result.slice(0, maxWords);
      } else {
        return this.processEnglishText(text, options);
      }
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
  const processText = (text: string, options?: ProcessingOptions) =>
    WordProcessor.processTextSync(text, options);
  const combineWordArrays = (wordArrays: WordData[][]) =>
    WordProcessor.combineWordArrays(wordArrays);

  return { processText, combineWordArrays };
};

export default WordProcessor;
