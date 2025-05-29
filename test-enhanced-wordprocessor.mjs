#!/usr/bin/env node

// Simple test for the enhanced word processor
import { WordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

const testText = "中文自然语言处理是人工智能的重要分支，我们需要使用先进的算法来分析和理解中文文本。哈哈哈，真的很好！";

console.log("Testing Enhanced Word Processor");
console.log("==============================");
console.log(`Test text: "${testText}"`);

// Test synchronous processing
console.log("\nSynchronous Processing:");
try {
  const result = WordProcessor.processText(testText, { locale: "zh-cn" });
  console.log("Words found:", result.length);
  console.log("Results:", result);
} catch (error) {
  console.error("Error in sync processing:", error);
}

// Test asynchronous processing
console.log("\nAsynchronous Processing:");
(async () => {
  try {
    const asyncResult = await WordProcessor.processTextAsync(testText, { locale: "zh-cn" });
    console.log("Words found:", asyncResult.length);
    console.log("Results:", asyncResult);
  } catch (error) {
    console.error("Error in async processing:", error);
  }
})();
