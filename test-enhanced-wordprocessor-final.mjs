import { WordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

// Test Chinese text with common problematic words
const chineseText = `
今天天气很好，我很开心。哈哈哈，真的是太好了！
我觉得这个很不错，就是太贵了。
医生说要多运动，国家政策也很支持。
天啊，实在是太厉害了！成功了！
到底怎么回事？发生了什么？
然后就这样吧，觉得还行。现在开始行动！
`;

console.log("Testing Enhanced Chinese Word Processor...\n");

// Test synchronous processing
console.log("=== Synchronous Processing ===");
try {
  const syncResult = WordProcessor.processTextSync(chineseText, {
    locale: "zh-CN",
    minWordLength: 2,
    maxWords: 20,
  });

  console.log("Sync result:", syncResult.slice(0, 10));
  console.log(`Total words found: ${syncResult.length}\n`);
} catch (error) {
  console.error("Sync processing error:", error);
}

// Test asynchronous processing
console.log("=== Asynchronous Processing ===");
try {
  const asyncResult = await WordProcessor.processTextAsync(chineseText, {
    locale: "zh-CN",
    minWordLength: 2,
    maxWords: 20,
  });

  console.log("Async result:", asyncResult.slice(0, 10));
  console.log(`Total words found: ${asyncResult.length}\n`);
} catch (error) {
  console.error("Async processing error:", error);
}

// Test English text
console.log("=== English Processing ===");
const englishText = `
This is a great day for testing our word cloud functionality.
The weather is beautiful and the code is working perfectly.
We have successfully implemented Chinese word segmentation using Jieba.
`;

try {
  const englishResult = WordProcessor.processTextSync(englishText, {
    locale: "en",
    minWordLength: 3,
    maxWords: 15,
  });

  console.log("English result:", englishResult.slice(0, 10));
  console.log(`Total words found: ${englishResult.length}\n`);
} catch (error) {
  console.error("English processing error:", error);
}

console.log("Testing completed!");
