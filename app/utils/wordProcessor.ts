// Word processor utility for text analysis and word cloud generation
// This file can be used on both client and server side

// Word cloud data interface
export interface WordData {
  text: string;
  value: number;
}

// Word frequency processor with optimized performance
export class WordProcessor {
  private static readonly STOP_WORDS = new Set([
    // English stop words (essential only)
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

  static processText(text: string): WordData[] {
    if (!text || typeof text !== "string") return [];

    try {
      // Clean and normalize text
      const cleaned = text
        .toLowerCase()
        .replace(/[^\w\s#@]/g, " ") // Keep alphanumeric, hashtags, mentions
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) return [];

      // Extract words with frequency counting
      const wordFreq = new Map<string, number>();

      // Split by whitespace and filter
      cleaned.split(" ").forEach((word) => {
        const trimmed = word.trim();

        // Filter criteria
        if (
          trimmed.length >= 3 &&
          !this.STOP_WORDS.has(trimmed) &&
          !trimmed.match(/^\d+$/) && // No pure numbers
          !trimmed.match(/^[@#]+$/) // No bare @ or #
        ) {
          wordFreq.set(trimmed, (wordFreq.get(trimmed) || 0) + 1);
        }
      });

      // Convert to WordData array and sort by frequency
      return Array.from(wordFreq.entries())
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);
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
