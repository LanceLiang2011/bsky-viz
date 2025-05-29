// Client-side Chinese text processing with jieba-wasm
"use client";

import { CHINESE_FILTER_WORDS } from "./stopWords";

let jiebaInitialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jiebaFunctions: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<any> | null = null;

// Chinese stop words - comprehensive list including social media expressions

// Helper function to check if a word is English
function isEnglishWord(word: string): boolean {
  return /^[a-zA-Z0-9\-'_.]+$/.test(word);
}

// Helper function to check if it's a stop word
function isStopWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();
  return CHINESE_FILTER_WORDS.has(trimmed);
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
        add_word: jiebaModule.add_word,
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
    throw new Error(
      "Jieba WASM is not properly initialized or cut function is not available"
    );
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
