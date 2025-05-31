// Server-side text processing - simplified versions without client dependencies
import { CHINESE_FILTER_WORDS } from "./filterWords";

/**
 * Simple Chinese text segmentation for server-side processing
 * Uses basic regex patterns instead of jieba for server compatibility
 */
function segmentChineseTextSimple(text: string): string[] {
  if (!text) return [];

  // Basic Chinese word segmentation using regex patterns
  // This is a simplified approach for server-side processing
  const words: string[] = [];

  // Split by common Chinese punctuation and whitespace
  const segments = text.split(
    /[\s\u3000-\u303f\uff00-\uffef\u2000-\u206f\u2e00-\u2e7f\\!"#$%&'()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/
  );

  for (const segment of segments) {
    if (!segment.trim()) continue;

    // For Chinese text, split into individual characters or bi-grams for better processing
    if (/[\u4e00-\u9fff]/.test(segment)) {
      // Split Chinese characters into bi-grams when possible
      if (segment.length === 1) {
        words.push(segment);
      } else {
        for (let i = 0; i < segment.length - 1; i++) {
          const bigram = segment.slice(i, i + 2);
          words.push(bigram);
        }
        // Also add individual characters for single-character words
        for (const char of segment) {
          if (/[\u4e00-\u9fff]/.test(char)) {
            words.push(char);
          }
        }
      }
    } else {
      // For non-Chinese text, add as-is
      words.push(segment);
    }
  }

  return words;
}

/**
 * Check if a word should be filtered out
 */
function isFilteredOutWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();

  if (trimmed.length === 0) return true;
  if (trimmed.length === 1 && !/[\u4e00-\u9fff]/.test(trimmed)) return true;

  return CHINESE_FILTER_WORDS.has(trimmed);
}

/**
 * Server-side Chinese text processing
 */
export function processChineseTextServer(text: string): Map<string, number> {
  const words = segmentChineseTextSimple(text);
  const wordCount = new Map<string, number>();

  for (const word of words) {
    const trimmed = word.trim();
    if (trimmed && !isFilteredOutWord(trimmed)) {
      wordCount.set(trimmed, (wordCount.get(trimmed) || 0) + 1);
    }
  }

  return wordCount;
}

/**
 * Server-side English text processing
 */
export function processEnglishTextServer(text: string): Map<string, number> {
  const wordCount = new Map<string, number>();

  // Clean and tokenize text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .split(" ");

  for (const word of words) {
    if (isValidEnglishWord(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }

  return wordCount;
}

/**
 * Check if word is a valid English word for processing
 */
function isValidEnglishWord(word: string): boolean {
  // Filter out very short words, numbers, and common stop words
  if (word.length < 2) return false;
  if (/^\d+$/.test(word)) return false; // Pure numbers

  const stopWords = new Set([
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
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "must",
    "shall",
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
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "this",
    "that",
    "these",
    "those",
    "all",
    "any",
    "some",
    "no",
    "not",
    "only",
    "just",
    "very",
    "too",
    "so",
    "also",
  ]);

  return !stopWords.has(word);
}

/**
 * Check if text is predominantly Chinese
 */
export function isPredominantlyChinese(text: string): boolean {
  if (!text || text.length === 0) return false;

  const chineseCharCount = (
    text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []
  ).length;
  const totalCharCount = text.replace(/\s/g, "").length;

  return totalCharCount > 0 && chineseCharCount / totalCharCount > 0.3;
}
