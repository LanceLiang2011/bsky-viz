// Test script for the fixed Chinese WordProcessor implementation
import { WordProcessor } from "./app/utils/wordProcessor.fixed.ts";

// Test Chinese text with problematic characters
const text = "中文自然语言处理是人工智能的重要分支。哈哈哈，真的很好！";

console.log("Testing Fixed WordProcessor");
console.log("==========================");
console.log(`Test text: "${text}"`);

// Test synchronous processing
console.log("\nSynchronous Processing:");
try {
  const result = WordProcessor.processText(text, { locale: "zh-cn" });
  console.log("Words found:", result.length);
  console.log("Results:", result);
} catch (error) {
  console.error("Error in sync processing:", error);
}

// Test some problematic cases
const problematicTexts = [
  "哈哈哈，这个真的太好了，很有意思啊，我觉得是这样的呢",
  "好好好，是的是的，就是这样，确实如此，没错没错",
  "中文词云功能现在应该可以正常工作了",
  "Bluesky是一个很棒的社交媒体平台，用户体验很好"
];

console.log("\nTesting Problematic Cases:");
problematicTexts.forEach((testText, index) => {
  console.log(`\nTest Case ${index + 1}: "${testText}"`);
  try {
    const result = WordProcessor.processText(testText, { locale: "zh-cn" });
    console.log("Words found:", result.length);
    console.log("Results:", result);
  } catch (error) {
    console.error(`Error in Test Case ${index + 1}:`, error);
  }
});
