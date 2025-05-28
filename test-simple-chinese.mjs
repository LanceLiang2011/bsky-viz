// Simple test for Chinese WordProcessor
import { WordProcessor } from "./app/utils/wordProcessor.ts";

console.log("Testing Chinese text processing...");

// Test 1: Simple Chinese text with explicit locale
const chineseText = "我今天学会了使用TypeScript开发网页应用程序";
console.log(`Test text: ${chineseText}`);

try {
  const result = WordProcessor.processText(chineseText, { locale: "zh-cn" });
  console.log("Result:", result);
} catch (error) {
  console.error("Error:", error);
}

console.log("Test completed");
