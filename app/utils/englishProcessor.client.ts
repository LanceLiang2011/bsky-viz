// Client-side English text processing for enhanced word cloud filtering
"use client";

import { ENGLISH_FILTER_WORDS } from "./englishFilterWords";

// Helper function to check if a word is a filtered English word
export function isFilteredEnglishWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();
  return ENGLISH_FILTER_WORDS.has(trimmed);
}

// Helper function to check if a word is a web/tech fragment
export function isWebFragment(word: string): boolean {
  const trimmed = word.trim().toLowerCase();

  // Check for common web patterns
  if (
    trimmed.includes(".") &&
    (trimmed.includes("com") ||
      trimmed.includes("org") ||
      trimmed.includes("net") ||
      trimmed.includes("edu") ||
      trimmed.includes("gov") ||
      trimmed.includes("co.") ||
      trimmed.includes("ca") ||
      trimmed.includes("cn") ||
      trimmed.includes("uk") ||
      trimmed.includes("au") ||
      trimmed.includes("de") ||
      trimmed.includes("fr"))
  ) {
    return true;
  }

  // Check for protocol indicators
  if (
    trimmed.startsWith("http") ||
    trimmed.startsWith("www") ||
    trimmed.startsWith("ftp") ||
    trimmed.startsWith("://")
  ) {
    return true;
  }

  // Check for common file extensions
  if (
    /(\.jpg|\.png|\.gif|\.pdf|\.doc|\.txt|\.zip|\.exe|\.mp3|\.mp4|\.html|\.htm|\.php|\.asp|\.css|\.js)$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Check for email patterns
  if (/@/.test(trimmed) && trimmed.includes(".")) {
    return true;
  }

  return false;
}

// Helper function to check for repetitive patterns in English
export function isRepetitiveEnglishPattern(word: string): boolean {
  const trimmed = word.trim().toLowerCase();
  if (trimmed.length < 3) return false;

  // Check for character repetition (like "hahaha", "hehe", etc.)
  const chars = [...trimmed];
  const uniqueChars = new Set(chars);

  // If word has very few unique characters relative to length, it might be repetitive
  if (uniqueChars.size === 1) return true; // All same character
  if (trimmed.length >= 4 && uniqueChars.size <= 2) {
    // Check if it's just alternating characters like "haha", "lolo"
    const firstTwo = trimmed.substring(0, 2);
    const pattern = firstTwo.repeat(Math.ceil(trimmed.length / 2));
    if (trimmed === pattern.substring(0, trimmed.length)) {
      return true;
    }
  }

  // Check for common meaningless patterns
  const meaninglessPatterns = [
    /^(ha)+$/, // haha, hahaha
    /^(he)+$/, // hehe, hehehe
    /^(lo)+l?$/, // lol, lolo
    /^(o)+h?$/, // ooo, oooh
    /^(a)+h?$/, // aaa, aaah
    /^(e)+$/, // eee
    /^(u)+h?$/, // uuu, uuuh
    /^(m)+$/, // mmm
    /^(n)+$/, // nnn
  ];

  for (const pattern of meaninglessPatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}

// Enhanced validation for English words
export function isValidEnglishWord(word: string): boolean {
  const trimmed = word.trim().toLowerCase();

  // Filter out empty or very short words
  if (trimmed.length < 2) return false;

  // Filter out filtered words
  if (isFilteredEnglishWord(trimmed)) return false;

  // Filter out web fragments
  if (isWebFragment(trimmed)) return false;

  // Filter out repetitive patterns
  if (isRepetitiveEnglishPattern(trimmed)) return false;

  // Must contain at least one English letter
  if (!/[a-z]/.test(trimmed)) return false;

  // Filter out pure numbers
  if (/^\d+$/.test(trimmed)) return false;

  // Filter out words that are mostly punctuation or numbers
  const alphaCount = (trimmed.match(/[a-z]/g) || []).length;
  if (alphaCount / trimmed.length < 0.6) return false;

  // Must contain at least one vowel (basic English word pattern)
  if (!/[aeiou]/.test(trimmed)) {
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
      "tv",
      "pc",
      "cd",
      "dvd",
      "gps",
      "cpu",
      "gpu",
      "ram",
      "ssd",
      "hdd",
      "usb",
      "app",
      "api",
      "css",
      "html",
      "xml",
      "sql",
      "php",
      "pdf",
    ]);
    if (!consonantOnlyExceptions.has(trimmed) && trimmed.length > 2) {
      return false;
    }
  }

  // Filter out single characters that are too common/meaningless
  if (trimmed.length === 1) {
    const commonSingleChars = new Set([
      "a",
      "i",
      "o",
      "u",
      "e",
      "x",
      "y",
      "z",
      "b",
      "c",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "m",
      "n",
      "p",
      "q",
      "r",
      "s",
      "t",
      "v",
      "w",
    ]);
    if (commonSingleChars.has(trimmed)) return false;
  }

  return true;
}

// Process English text and return word frequency map (enhanced version)
export function processEnglishText(text: string): Map<string, number> {
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

// Check if text is predominantly English
export function isEnglishText(text: string): boolean {
  // Count English letters vs other characters
  const englishLetterCount = (text.match(/[a-zA-Z]/g) || []).length;
  const chineseCharCount = (
    text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []
  ).length;
  const totalLetters = englishLetterCount + chineseCharCount;

  // If more English letters than Chinese characters, classify as English
  return totalLetters > 0 && englishLetterCount >= chineseCharCount;
}
