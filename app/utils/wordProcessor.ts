// Enhanced Word processor utility for text analysis and word cloud generation
// This file can be used on both client and server side

import { ENGLISH_FILTER_WORDS } from "./englishFilterWords";

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

    // Additional common filler words and expressions
    "really",
    "actually",
    "basically",
    "literally",
    "definitely",
    "absolutely",
    "completely",
    "totally",
    "exactly",
    "obviously",
    "certainly",
    "perhaps",
    "probably",
    "maybe",
    "possibly",
    "generally",
    "usually",
    "normally",
    "typically",
    "particularly",
    "especially",
    "specifically",
    "mostly",
    "mainly",
    "largely",
    "primarily",
    "essentially",
    "basically",
    "fundamentally",
    "ultimately",
    "eventually",
    "finally",
    "initially",
    "originally",
    "previously",
    "recently",
    "currently",
    "presently",
    "immediately",
    "suddenly",
    "quickly",
    "slowly",
    "carefully",
    "clearly",
    "easily",
    "simply",
    "directly",
    "effectively",
    "successfully",
    "properly",
    "correctly",
    "accurately",
    "precisely",
    "approximately",
    "roughly",
    "somewhat",
    "rather",
    "quite",
    "fairly",
    "pretty",
    "fairly",
    "relatively",
    "extremely",
    "incredibly",
    "amazingly",
    "surprisingly",
    "unfortunately",
    "fortunately",
    "interestingly",
    "importantly",
    "significantly",
    "seriously",
    "honestly",
    "frankly",
    "personally",
    "generally",
    "overall",
    "anyway",
    "anyhow",
    "somehow",
    "somewhere",
    "sometime",
    "sometimes",
    "somewhat",
    "therefore",
    "however",
    "moreover",
    "furthermore",
    "nevertheless",
    "nonetheless",
    "meanwhile",
    "otherwise",
    "likewise",
    "similarly",
    "consequently",
    "accordingly",
    "additionally",
    "alternatively",
    "subsequently",
    "previously",
    "afterwards",
    "beforehand",
    "meanwhile",
    "simultaneously",

    // Common conversational words
    "yeah",
    "yep",
    "nope",
    "okay",
    "alright",
    "sure",
    "fine",
    "cool",
    "great",
    "awesome",
    "amazing",
    "wonderful",
    "fantastic",
    "excellent",
    "perfect",
    "brilliant",
    "incredible",
    "unbelievable",
    "stuff",
    "things",
    "something",
    "anything",
    "everything",
    "nothing",
    "someone",
    "anyone",
    "everyone",
    "nobody",
    "somewhere",
    "anywhere",
    "everywhere",
    "nowhere",
    "somehow",
    "anyhow",
    "anyway",
    "anyways",
    "whatever",
    "whenever",
    "wherever",
    "whoever",
    "however",
    "whichever",
    "kind",
    "sort",
    "type",
    "way",
    "ways",
    "thing",
    "stuff",
    "lots",
    "bunch",
    "couple",
    "few",
    "many",
    "much",
    "more",
    "most",
    "less",
    "least",
    "some",
    "any",
    "all",
    "every",
    "each",
    "both",
    "either",
    "neither",
    "none",
    "several",
    "various",
    "different",
    "same",
    "other",
    "another",
    "such",
    "certain",
    "particular",
    "special",
    "specific",
    "general",
    "common",
    "normal",
    "regular",
    "usual",
    "typical",
    "standard",
    "basic",
    "simple",
    "easy",
    "hard",
    "difficult",
    "complex",
    "complicated",
    "serious",
    "important",
    "significant",
    "major",
    "minor",
    "small",
    "big",
    "large",
    "huge",
    "tiny",
    "little",
    "short",
    "long",
    "high",
    "low",
    "good",
    "bad",
    "better",
    "worse",
    "best",
    "worst",
    "nice",
    "fine",
    "okay",
    "alright",
    "nbd",
    "smh",
  ]);

  // Chinese stop words (comprehensive list)
  private static readonly CHINESE_STOP_WORDS = new Set([
    // Common Chinese filler words and expressions (highest priority for removal)
    "一个",
    "这个",
    "那个",
    "什么",
    "因为",
    "现在",
    "一下",
    "也是",
    "都是",
    "然后",
    "但是",
    "所以",
    "虽然",
    "如果",
    "或者",
    "已经",
    "还是",
    "应该",
    "可能",
    "当然",
    "其实",
    "比如",
    "就是",
    "而且",
    "不过",
    "可是",
    "实际",
    "基本",
    "差不多",
    "怎么样",
    "为什么",
    "怎么办",
    "没什么",
    "有什么",
    "这样的",
    "那样的",
    "这种",
    "那种",
    "这里",
    "那里",
    "这边",
    "那边",
    "这么",
    "那么",
    "这样",
    "那样",
    "怎样",

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

    // Additional comprehensive filler expressions
    "知道",
    "觉得",
    "感觉",
    "发现",
    "认为",
    "以为",
    "看起来",
    "听起来",
    "好像",
    "看上去",
    "似乎",
    "大概",
    "估计",
    "或许",
    "也许",
    "可能",
    "肯定",
    "一定",
    "必然",
    "绝对",
    "完全",
    "彻底",
    "十分",
    "非常",
    "特别",
    "相当",
    "比较",
    "更加",
    "越来越",
    "总是",
    "经常",
    "通常",
    "一般",
    "平时",
    "偶尔",
    "有时",
    "时候",
    "时间",
    "刚才",
    "刚刚",
    "刚好",
    "正好",
    "恰好",
    "刚巧",
    "恰巧",
    "突然",
    "忽然",
    "马上",
    "立刻",
    "立即",
    "赶快",
    "赶紧",
    "快点",
    "慢点",
    "小心",
    "注意",
    "当心",
    "记住",
    "别忘",
    "忘记",
    "想起",
    "想到",
    "想想",
    "考虑",
    "打算",
    "计划",
    "准备",
    "决定",
    "选择",
    "希望",
    "期望",
    "想要",
    "需要",
    "必要",
    "重要",
    "关键",
    "主要",
    "次要",
    "一般",
    "普通",
    "正常",
    "特殊",
    "奇怪",
    "有趣",
    "无聊",
    "好玩",
    "好笑",
    "搞笑",
    "有意思",
    "没意思",
    "有用",
    "没用",
    "有效",
    "无效",
    "成功",
    "失败",
    "容易",
    "困难",
    "简单",
    "复杂",
    "清楚",
    "明白",
    "懂得",
    "理解",
    "知识",
    "经验",
    "能力",
    "水平",
    "技术",
    "方法",
    "方式",
    "办法",
    "措施",
    "手段",
    "工具",
    "设备",
    "机器",
    "系统",
    "平台",
    "网站",
    "页面",
    "界面",
    "功能",
    "效果",
    "结果",
    "影响",
    "作用",
    "价值",
    "意义",
    "目的",
    "目标",
    "任务",
    "工作",
    "事情",
    "问题",
    "情况",
    "状态",
    "条件",
    "环境",
    "地方",
    "位置",
    "地点",
    "场所",
    "空间",
    "范围",
    "区域",
    "地区",
    "城市",
    "国家",
    "世界",
    "社会",
    "人们",
    "大家",
    "别人",
    "他人",
    "朋友",
    "同事",
    "同学",
    "老师",
    "学生",
    "父母",
    "孩子",
    "家人",
    "亲人",
    "爱人",
    "男友",
    "女友",
    "老公",
    "老婆",
    "丈夫",
    "妻子",

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

  // Check if a word is primarily English (contains only Latin characters)
  static isEnglishWord(word: string): boolean {
    // Check if word contains only English letters, numbers, and common punctuation
    return /^[a-zA-Z0-9\-'_.]+$/.test(word) && /[a-zA-Z]/.test(word);
  }

  // Language detection based on character set
  static detectLanguage(text: string): "chinese" | "english" {
    // Count Chinese vs. non-Chinese characters
    let chineseCharCount = 0;
    let nonChineseCharCount = 0;

    for (const char of text) {
      // Chinese character range check (comprehensive CJK ranges)
      // Using same ranges as feedAnalyzer for consistency
      if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
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
      const trimmedWord = word.trim();

      if (
        trimmedWord.length >= minWordLength &&
        !ENGLISH_FILTER_WORDS.has(trimmedWord) && // Use enhanced filter list
        !this.ENGLISH_STOP_WORDS.has(trimmedWord) && // Keep original for backward compatibility
        !/^\d+$/.test(trimmedWord) && // Skip pure numbers
        !this.isWebFragment(trimmedWord) && // Filter web fragments
        !this.isRepetitivePattern(trimmedWord) && // Filter repetitive patterns
        this.isValidEnglishWord(trimmedWord) // Additional validation
      ) {
        wordFreq.set(trimmedWord, (wordFreq.get(trimmedWord) || 0) + 1);
      }
    }

    // Convert to WordData array and sort by frequency
    const result = Array.from(wordFreq.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);

    const maxWords = options.maxWords || result.length;
    return result.slice(0, maxWords);
  }

  // Check if a word is a web fragment (URLs, domains, etc.)
  private static isWebFragment(word: string): boolean {
    // Check for common web patterns
    if (
      word.includes(".") &&
      (word.includes("com") ||
        word.includes("org") ||
        word.includes("net") ||
        word.includes("edu") ||
        word.includes("gov") ||
        word.includes("co."))
    ) {
      return true;
    }

    // Check for protocol indicators
    if (
      word.startsWith("http") ||
      word.startsWith("www") ||
      word.startsWith("ftp")
    ) {
      return true;
    }

    // Check for common file extensions
    if (
      /(\.jpg|\.png|\.gif|\.pdf|\.doc|\.txt|\.zip|\.exe|\.mp3|\.mp4)$/i.test(
        word
      )
    ) {
      return true;
    }

    return false;
  }

  // Check for repetitive patterns in English (similar to Chinese)
  private static isRepetitivePattern(word: string): boolean {
    if (word.length < 3) return false;

    // Check for character repetition (like "hahaha", "hehe", etc.)
    const chars = [...word];
    const uniqueChars = new Set(chars);

    // If word has very few unique characters relative to length, it might be repetitive
    if (uniqueChars.size === 1) return true; // All same character
    if (word.length >= 4 && uniqueChars.size <= 2) {
      // Check if it's just alternating characters like "haha", "lolo"
      const firstTwo = word.substring(0, 2);
      const pattern = firstTwo.repeat(Math.ceil(word.length / 2));
      if (word === pattern.substring(0, word.length)) {
        return true;
      }
    }

    return false;
  }

  // Additional validation for English words
  private static isValidEnglishWord(word: string): boolean {
    // Must contain at least one vowel (basic English word pattern)
    if (!/[aeiou]/.test(word)) {
      // Exception for common consonant-only words and abbreviations
      const consonantOnlyExceptions = new Set([
        "by",
        "my",
        "gym",
        "try",
        "cry",
        "dry",
        "fly",
        "fry",
        "shy",
        "sky",
        "spy",
        "why",
      ]);
      if (!consonantOnlyExceptions.has(word) && word.length > 2) {
        return false;
      }
    }

    // Reject words that are mostly punctuation or special characters
    const alphaCount = (word.match(/[a-z]/g) || []).length;
    if (alphaCount / word.length < 0.7) {
      return false;
    }

    // Reject words with unusual character patterns (like "aaaaaa")
    if (this.isRepetitivePattern(word)) {
      return false;
    }

    // Reject common meaningless patterns
    const meaninglessPatterns = [
      /^(ha)+$/, // haha, hahaha
      /^(he)+$/, // hehe, hehehe
      /^(lo)+l?$/, // lol, lolo
      /^(o)+h?$/, // ooo, oooh
      /^(a)+h?$/, // aaa, aaah
      /^(e)+$/, // eee
      /^(u)+h?$/, // uuu, uuuh
    ];

    for (const pattern of meaninglessPatterns) {
      if (pattern.test(word)) {
        return false;
      }
    }

    return true;
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
          this.isEnglishWord(ngram) || // Filter out English words
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
      // Always detect language from content, ignore locale parameter to ensure route independence
      const language = this.detectLanguage(text);

      console.log(
        `Processing text asynchronously with detected language: ${language} (route-independent detection)`
      );

      // For Chinese content, we now handle this client-side only
      // Server-side processing is not supported for Chinese
      if (language === "chinese") {
        console.log(
          "Chinese content detected - should be processed client-side"
        );
        // Return empty array for server-side Chinese processing
        // Chinese processing is now handled client-side in ChineseWordCloud component
        return [];
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
  static processTextSync(
    text: string,
    options: ProcessingOptions = {}
  ): WordData[] {
    try {
      // Always detect language from content, ignore locale parameter to ensure route independence
      const language = this.detectLanguage(text);
      console.log(
        `Processing text synchronously with detected language: ${language} (route-independent detection)`
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
