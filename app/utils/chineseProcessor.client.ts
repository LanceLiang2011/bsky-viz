// Client-side Chinese text processing with jieba-wasm
"use client";

let jiebaInitialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jiebaFunctions: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<any> | null = null;

// Chinese stop words - comprehensive list including social media expressions
const CHINESE_STOP_WORDS = new Set([
  // Basic stop words
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
  "一个",
  "上",
  "也",
  "很",
  "到",
  "说",
  "要",
  "去",
  "你",
  "会",
  "着",
  "没有",
  "看",
  "好",
  "自己",
  "这",
  "那",
  "它",
  "我们",
  "你们",
  "他们",
  "这个",
  "那个",
  "这样",
  "那样",
  "什么",

  // Temporal words
  "现在",
  "今天",
  "昨天",
  "明天",
  "时候",
  "以前",
  "以后",
  "后来",
  "刚才",
  "马上",
  "立刻",
  "突然",
  "已经",
  "还没",
  "正在",
  "曾经",
  "从来",
  "一直",
  "总是",
  "经常",

  // Modal words
  "可能",
  "应该",
  "必须",
  "需要",
  "想要",
  "希望",
  "觉得",
  "认为",
  "以为",
  "知道",
  "明白",
  "理解",
  "相信",

  // Direction and movement
  "出来",
  "起来",
  "下来",
  "过来",
  "回来",
  "出去",
  "进去",
  "上去",
  "下去",
  "过去",
  "回去",
  "进来",
  "上来",

  // Quantifiers and measures
  "一下",
  "一点",
  "一些",
  "一样",
  "一起",
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
  "第一",
  "第二",
  "第三",

  // Common expressions
  "都是",
  "也是",
  "因为",
  "所以",
  "可以",
  "还是",
  "怎么",
  "为什么",
  "但是",
  "不过",
  "而且",
  "或者",
  "还有",
  "比如",
  "就是",
  "只是",
  "不是",
  "有点",
  "有些",

  // Interjections and expressions
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
  "咯",

  // Questions words
  "咱",
  "咱们",
  "谁",
  "哪",
  "哪个",
  "哪些",
  "哪里",
  "哪儿",
  "何处",
  "何时",
  "何人",
  "何事",
  "如何",
  "怎样",
  "怎么样",
  "多少",
  "几",
  "几个",
  "几时",
  "几点",
  "多大",
  "多高",
  "多长",
  "多远",
  "多久",
  "多么",
  "如此",

  // Social media specific
  "转发",
  "点赞",
  "评论",
  "分享",
  "收藏",
  "关注",
  "取关",
  "私信",
  "微博",
  "朋友圈",
  "发布",
  "更新",
  "刷新",
  "删除",
  "编辑",
  "保存",
  "发送",

  // Bluesky specific
  "bluesky",
  "蓝天",
  "推文",
  "帖子",
  "动态",
  "时间线",
  "消息",
  "通知",
  "个人资料",
  "设置",
  "隐私",
  "安全",
  "算法",
  "feed",
  "at协议",

  // Common meaningless fragments that should be filtered
  "新西",
  "西兰",
  "美国",
  "国人",
  "中国",
  "国家",
  "可是",
  "但是",
  "然后",
  "接着",
  "于是",
  "结果",
  "最后",
  "首先",
  "其次",
  "再次",
  "总之",
  "因此",
  "所以",
  "由于",
  "如果",
  "假如",
  "要是",
  "万一",
  "除非",
  "无论",
  "不管",
  "尽管",
  "虽然",
  "即使",
  "就算",
  "哪怕",
  "只要",
  "只有",
  "除了",
  "除非",
  "不仅",
  "不但",
  "而且",
  "并且",
  "同时",
  "另外",
  "此外",
  "况且",
  "何况",
  "更何况",
]);

// Helper function to check if a word is English
function isEnglishWord(word: string): boolean {
  return /^[a-zA-Z0-9\-'_.]+$/.test(word);
}

// Helper function to check if it's a stop word
function isStopWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();
  return CHINESE_STOP_WORDS.has(trimmed);
}

// Helper function to check if it's a valid word
function isValidWord(word: string): boolean {
  const trimmed = word.trim();

  // Filter out empty or very short words
  if (trimmed.length < 2) return false;

  // Filter out stop words
  if (isStopWord(trimmed)) return false;

  // Filter out English words for Chinese processing
  if (isEnglishWord(trimmed)) return false;

  // Filter out words that are only punctuation or numbers
  if (/^[\d\s\p{P}]+$/u.test(trimmed)) return false;

  // Filter out words with only ASCII punctuation
  if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\s]+$/.test(trimmed))
    return false;

  // Must contain at least one Chinese character
  if (!/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(trimmed)) return false;

  // Filter out single characters that are too common/meaningless
  if (trimmed.length === 1) {
    const commonSingleChars = new Set([
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
      "上",
      "也",
      "很",
      "到",
      "说",
      "要",
      "去",
      "你",
      "会",
      "着",
      "看",
      "好",
      "这",
      "那",
      "它",
    ]);
    if (commonSingleChars.has(trimmed)) return false;
  }

  // Filter out words that are mostly punctuation with few Chinese chars
  const chineseCharCount = (
    trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []
  ).length;
  if (chineseCharCount / trimmed.length < 0.6) return false;

  return true;
}

// Initialize jieba-wasm properly for browser use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initializeJieba(): Promise<any> {
  if (jiebaInitialized && jiebaFunctions) return jiebaFunctions;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log("Initializing Jieba WASM...");
      
      // Dynamic import to avoid SSR issues
      const jiebaModule = await import("jieba-wasm");
      
      // For browser usage, we need to call the default function first (init)
      await jiebaModule.default();
      
      // Then we can use the exported functions
      jiebaFunctions = {
        cut: jiebaModule.cut,
        cut_all: jiebaModule.cut_all,
        cut_for_search: jiebaModule.cut_for_search,
        tokenize: jiebaModule.tokenize,
        add_word: jiebaModule.add_word
      };
      
      jiebaInitialized = true;
      console.log("Jieba WASM initialized successfully");
      console.log("Available functions:", Object.keys(jiebaFunctions));
      
      return jiebaFunctions;
    } catch (error) {
      console.error("Failed to initialize Jieba WASM:", error);
      jiebaInitialized = false;
      throw new Error(`Jieba WASM initialization failed: ${error}`);
    }
  })();

  return initPromise;
}

// Segment Chinese text using jieba-wasm
export async function segmentChineseText(text: string): Promise<string[]> {
  const jieba = await initializeJieba();
  
  if (!jieba || typeof jieba.cut !== "function") {
    throw new Error("Jieba WASM is not properly initialized or cut function is not available");
  }
  
  try {
    // Use jieba.cut for segmentation (second parameter is HMM mode)
    const words = jieba.cut(text, true); // true enables HMM for better accuracy
    console.log(`Jieba segmented "${text}" into:`, words);
    
    if (!Array.isArray(words)) {
      throw new Error("Jieba cut returned non-array result");
    }
    
    const validWords = words.filter(isValidWord);
    console.log("After filtering:", validWords);
    
    return validWords;
  } catch (error) {
    console.error("Jieba segmentation failed:", error);
    throw new Error(`Chinese text segmentation failed: ${error}`);
  }
}

// Process text and return word frequency map
export async function processChineseText(
  text: string
): Promise<Map<string, number>> {
  const words = await segmentChineseText(text);
  const wordCount = new Map<string, number>();

  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  return wordCount;
}

// Check if text contains Chinese characters
export function isChineseText(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text);
}
