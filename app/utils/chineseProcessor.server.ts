// Server-only Chinese text processing with Jieba
// This file should only be imported on the server side

interface JiebaInstance {
  cutForSearch(text: string): string[];
}

let jiebaInstance: JiebaInstance | null = null;
let jiebaLoaded = false;

async function initializeJieba(): Promise<JiebaInstance | null> {
  if (jiebaLoaded) return jiebaInstance;

  try {
    // Only load on server
    if (typeof window !== "undefined") {
      console.warn("Chinese processor should only be used on server side");
      return null;
    }

    // Dynamic import to avoid bundling issues
    const jieba = await eval('import("@node-rs/jieba")');
    jiebaInstance = new jieba.default.Jieba() as JiebaInstance;
    jiebaLoaded = true;
    console.log("Jieba initialized successfully");
    return jiebaInstance;
  } catch (error) {
    console.warn("Failed to initialize Jieba:", error);
    jiebaLoaded = true; // Mark as attempted
    return null;
  }
}

export async function segmentChineseText(text: string): Promise<string[]> {
  try {
    const jieba = await initializeJieba();
    if (jieba) {
      return jieba.cutForSearch(text);
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

  // Extract words by finding sequences of Chinese characters
  let currentWord = "";

  for (const char of text) {
    if (chineseCharRegex.test(char)) {
      currentWord += char;
    } else {
      if (currentWord.length > 0) {
        // Split longer sequences into smaller parts
        if (currentWord.length > 4) {
          for (let i = 0; i < currentWord.length - 1; i++) {
            words.push(currentWord.slice(i, i + 2));
          }
        } else {
          words.push(currentWord);
        }
        currentWord = "";
      }
    }
  }

  if (currentWord.length > 0) {
    if (currentWord.length > 4) {
      for (let i = 0; i < currentWord.length - 1; i++) {
        words.push(currentWord.slice(i, i + 2));
      }
    } else {
      words.push(currentWord);
    }
  }

  return words;
}

export function isServerSide(): boolean {
  return (
    typeof window === "undefined" &&
    typeof process !== "undefined" &&
    Boolean(process.versions?.node)
  );
}
