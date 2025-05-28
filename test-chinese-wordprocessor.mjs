// Test script for Chinese WordProcessor functionality
import { WordProcessor } from "./app/utils/wordProcessor.ts";

// Chinese test text samples
const chineseTestTexts = [
  "我今天学会了使用TypeScript和React开发网页应用程序",
  "这个项目非常有趣，我们用了很多现代化的技术栈",
  "中文词云功能现在应该可以正常工作了",
  "我喜欢编程，特别是前端开发和用户界面设计",
  "Bluesky是一个很棒的社交媒体平台，用户体验很好",
];

const englishTestTexts = [
  "I love coding in React and TypeScript",
  "Building modern web applications is exciting",
];

console.log("Testing Chinese WordProcessor...");
console.log("=".repeat(50));

// Test Chinese text processing with explicit locale
console.log("\n1. Testing with explicit zh-cn locale:");
chineseTestTexts.forEach((text, index) => {
  console.log(`\nChinese Test ${index + 1}: "${text}"`);
  const words = WordProcessor.processText(text, { locale: "zh-cn" });
  console.log("Processed words:", words.slice(0, 10)); // Show top 10 words
});

// Test Chinese text processing with auto-detection
console.log("\n2. Testing with auto-detection:");
chineseTestTexts.forEach((text, index) => {
  console.log(`\nChinese Auto-detect ${index + 1}: "${text}"`);
  const words = WordProcessor.processText(text);
  console.log("Processed words:", words.slice(0, 10)); // Show top 10 words
});

// Test English text processing with explicit locale
console.log("\n3. Testing English with explicit en locale:");
englishTestTexts.forEach((text, index) => {
  console.log(`\nEnglish Test ${index + 1}: "${text}"`);
  const words = WordProcessor.processText(text, { locale: "en" });
  console.log("Processed words:", words.slice(0, 10)); // Show top 10 words
});

// Test mixed text
console.log("\n4. Testing mixed Chinese-English text:");
const mixedText =
  "我在学习React和TypeScript开发 building modern web apps with 中文 and English";
console.log(`\nMixed text: "${mixedText}"`);
const mixedWords = WordProcessor.processText(mixedText);
console.log("Processed words:", mixedWords.slice(0, 15));

// Test combined Chinese texts
console.log("\n5. Testing combined Chinese texts:");
const combinedChineseText = chineseTestTexts.join(" ");
const combinedChineseWords = WordProcessor.processText(combinedChineseText, {
  locale: "zh-cn",
});
console.log(
  `\nCombined Chinese text (${combinedChineseText.length} chars) produced ${combinedChineseWords.length} unique words`
);
console.log("Top 15 Chinese words:", combinedChineseWords.slice(0, 15));

console.log("\n" + "=".repeat(50));
console.log("Chinese WordProcessor test completed! ✅");
