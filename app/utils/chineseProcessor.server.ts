// Server-only Chinese text processing with Jieba
// This file should only be imported on the server side

interface JiebaInstance {
  cut(text: string, hmm?: boolean): string[];
  cutForSearch(text: string): string[];
}

let jiebaInstance: JiebaInstance | null = null;
let jiebaLoaded = false;

// Chinese stop words
const chineseStopWords = new Set([
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
  "怎么",
  "为什么",
  "因为",
  "所以",
  "但是",
  "可是",
  "然后",
  "还是",
  "或者",
  "如果",
  "虽然",
  "虽说",
  "不过",
  "而且",
  "另外",
  "首先",
  "最后",
  "总之",
  "其实",
  "当然",
  "确实",
  "应该",
  "可能",
  "也许",
  "大概",
  "差不多",
  "比较",
  "非常",
  "特别",
  "尤其",
  "特别是",
  "尤其是",
  "现在",
  "以前",
  "以后",
  "将来",
  "过去",
  "最近",
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
  "有时",
  "偶尔",
  "很少",
  "几乎",
  "差点",
  "快要",
  "即将",
  "刚刚",
  "才",
  "就是",
  "只是",
  "仅仅",
  "不仅",
  "不但",
  "不只",
  "除了",
  "包括",
  "关于",
  "对于",
  "由于",
  "根据",
  "按照",
  "通过",
  "经过",
  "穿过",
  "越过",
  "超过",
  "达到",
  "接近",
  "靠近",
  "远离",
  "离开",
  "回到",
  "进入",
  "出来",
  "起来",
  "下来",
  "过来",
  "过去",
  "回来",
  "出去",
  "进去",
  "上去",
  "下去",
  "带来",
  "带去",
  "拿来",
  "拿去",
  "送来",
  "送去",
  // Additional comprehensive stop words
  "都是",
  "这个",
  "那个",
  "一个",
  "也是",
  "现在",
  "觉得",
  "怎么",
  "什么",
  "我们",
  "还是",
  "因为",
  "所以",
  "可以",
  "知道",
  "时候",
  "没有",
  "还有",
  "出来",
  "起来",
  "下来",
  "过来",
  "回来",
  "出去",
  "进去",
  "上去",
  "下去",
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
  "今天",
  "明天",
  "昨天",
  "今年",
  "去年",
  "明年",
  "上午",
  "下午",
  "晚上",
  "中午",
  "早上",
  "晚上",
  "白天",
  "夜里",
  "刚刚",
  "马上",
  "立刻",
  "突然",
  "忽然",
  "偶然",
  "经常",
  "总是",
  "从来",
  "一直",
  "已经",
  "还没",
  "正在",
  "将要",
  "即将",
  "刚才",
  "以前",
  "以后",
  "之前",
  "之后",
  "当时",
  "那时",
  "这时",
  "同时",
  "平时",
  "有时",
  "无时",
  "随时",
  "及时",
  "按时",
  "准时",
  "临时",
  "暂时",
  "长时间",
  "短时间",
  "一会儿",
  "一瞬间",
  "一刹那",
  "一辈子",
  "一生",
  "终于",
  "果然",
  "竟然",
  "仍然",
  "依然",
  "还是",
  "或者",
  "要么",
  "不是",
  "而是",
  "只是",
  "就是",
  "正是",
  "恰是",
  "便是",
  "乃是",
  "即是",
  "无非",
  "不过",
  "只不过",
  "无非是",
  "不外乎",
  "除非",
  "除了",
  "除此之外",
  "此外",
  "另外",
  "而且",
  "并且",
  "况且",
  "何况",
  "更何况",
  "不但",
  "不仅",
  "不只",
  "不光",
  "不单",
  "岂但",
  "岂只",
  "然而",
  "但是",
  "可是",
  "不过",
  "只是",
  "然而",
  "却",
  "而",
  "可",
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
  "这么",
  "那么",
  "如斯",
  "自己",
  "本人",
  "自身",
  "自我",
  "彼此",
  "相互",
  "互相",
  "彼此",
  "大家",
  "各自",
  "各位",
  "诸位",
  "众人",
  "人家",
  "别人",
  "他人",
  "某人",
  "有人",
  "无人",
  "任何人",
  "每个人",
  "所有人",
  "转发",
  "评论",
  "点赞",
  "分享",
  "关注",
  "取关",
  "私信",
]);

async function initializeJieba(): Promise<JiebaInstance | null> {
  if (jiebaLoaded) return jiebaInstance;

  try {
    // Only load on server
    if (typeof window !== "undefined") {
      console.warn("Chinese processor should only be used on server side");
      return null;
    }

    // Dynamic import to avoid bundling issues
    const jiebaModule = await eval('import("@node-rs/jieba")');
    const { dict } = await eval('import("@node-rs/jieba/dict.js")');

    // Use withDict to load the default dictionary
    jiebaInstance = jiebaModule.Jieba.withDict(dict) as JiebaInstance;
    jiebaLoaded = true;
    console.log("Jieba initialized successfully");
    return jiebaInstance;
  } catch (error) {
    console.warn("Failed to initialize Jieba:", error);
    jiebaLoaded = true; // Mark as attempted
    return null;
  }
}

function isStopWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();
  return chineseStopWords.has(trimmed);
}

function isValidWord(word: string): boolean {
  const trimmed = word.trim();

  // Filter out empty, single character, or very short words
  if (trimmed.length < 2) return false;

  // Filter out stop words (this is the key fix)
  if (isStopWord(trimmed)) return false;

  // Filter out words that are only punctuation or numbers
  if (/^[\d\s\p{P}]+$/u.test(trimmed)) return false;

  // Filter out words with only ASCII punctuation
  if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\s]+$/.test(trimmed))
    return false;

  // Filter out repetitive expressions (哈哈, 嘻嘻, etc.)
  if (isRepetitiveExpression(trimmed)) return false;

  // Filter out single meaningless characters
  if (trimmed.length === 1 && !isMeaningfulSingleChar(trimmed)) return false;

  return true;
}

// Helper function to detect repetitive expressions
function isRepetitiveExpression(word: string): boolean {
  if (word.length < 2) return false;

  // Check if it's the same character repeated
  const firstChar = word[0];
  if (word.split("").every((char) => char === firstChar)) {
    return true;
  }

  // Check if it's alternating two characters (like "哈哈")
  if (word.length >= 2) {
    const pattern = word.slice(0, 2);
    const repeated = pattern
      .repeat(Math.ceil(word.length / 2))
      .slice(0, word.length);
    if (word === repeated) {
      return true;
    }
  }

  return false;
}

// Helper function to check if a single character is meaningful
function isMeaningfulSingleChar(char: string): boolean {
  // Only allow meaningful single Chinese characters like country names, etc.
  const meaningfulSingleChars = new Set([
    "中",
    "美",
    "英",
    "法",
    "德",
    "日",
    "韩",
    "俄",
    "印",
    "澳",
    "国",
    "省",
    "市",
    "县",
    "区",
    "村",
    "镇",
    "街",
    "路",
    "桥",
  ]);

  return meaningfulSingleChars.has(char);
}

export async function segmentChineseText(text: string): Promise<string[]> {
  try {
    const jieba = await initializeJieba();
    if (jieba) {
      // Use cut() instead of cutForSearch() to avoid over-segmentation
      const words = jieba.cut(text, false); // false means don't use HMM for unknown words
      return words.filter(isValidWord);
    }
  } catch (error) {
    console.warn("Jieba segmentation failed:", error);
  }

  // Fallback to simple segmentation
  return fallbackChineseSegmentation(text);
}

function fallbackChineseSegmentation(text: string): string[] {
  const words: string[] = [];
  const chineseCharRegex = /[\u4e00-\u9fff]/;

  // Simple approach: extract continuous Chinese character sequences
  let currentWord = "";

  for (const char of text) {
    if (chineseCharRegex.test(char)) {
      currentWord += char;
    } else {
      if (currentWord.length >= 2) {
        // Only keep words with 2+ characters
        words.push(currentWord);
      }
      currentWord = "";

      // Also handle non-Chinese words (like English)
      if (/[a-zA-Z]/.test(char)) {
        const match = text.match(/[a-zA-Z]+/);
        if (match && match[0].length >= 3) {
          words.push(match[0]);
        }
      }
    }
  }

  if (currentWord.length >= 2) {
    words.push(currentWord);
  }

  return words.filter(isValidWord);
}

export function isServerSide(): boolean {
  return (
    typeof window === "undefined" &&
    typeof process !== "undefined" &&
    Boolean(process.versions?.node)
  );
}
