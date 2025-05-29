// Test script for Enhanced Chinese WordProcessor functionality
import { WordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

// Chinese test text samples
const chineseTestTexts = [
  "我今天学会了使用TypeScript和React开发网页应用程序",
  "这个项目非常有趣，我们用了很多现代化的技术栈",
  "中文词云功能现在应该可以正常工作了",
  "我喜欢编程，特别是前端开发和用户界面设计",
  "Bluesky是一个很棒的社交媒体平台，用户体验很好",
  // Additional problematic test cases
  "哈哈哈，这个真的太好了，很有意思啊，我觉得是这样的呢",
  "好好好，是的是的，就是这样，确实如此，没错没错"
];

console.log("Testing Enhanced Chinese WordProcessor...");
console.log("=".repeat(50));

// Test Chinese text processing with explicit locale (synchronous)
console.log("\n1. Testing with explicit zh-cn locale (sync):");
chineseTestTexts.forEach((text, index) => {
  console.log(`\nChinese Test ${index + 1}: "${text}"`);
  const words = WordProcessor.processText(text, { locale: "zh-cn" });
  console.log("Processed words:", words);
});

// Run asynchronous tests in sequence
async function runAsyncTests() {
  console.log("\n2. Testing with explicit zh-cn locale (async):");
  for (let i = 0; i < chineseTestTexts.length; i++) {
    const text = chineseTestTexts[i];
    console.log(`\nChinese Async Test ${i + 1}: "${text}"`);
    try {
      const words = await WordProcessor.processTextAsync(text, { locale: "zh-cn" });
      console.log("Processed words (async):", words);
    } catch (error) {
      console.error("Error in async processing:", error);
    }
  }
}

// Run the async tests
runAsyncTests().then(() => {
  console.log("\nAll tests completed.");
});
