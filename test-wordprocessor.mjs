// Test script for WordProcessor functionality
import { WordProcessor } from "./app/utils/wordProcessor.ts";

// Test text samples
const testTexts = [
  "I love coding and building amazing applications with React and TypeScript!",
  "Working on a new project today. Excited to see how it turns out!",
  "The weather is beautiful today. Perfect day for a walk in the park.",
  "Just finished reading a great book about artificial intelligence and machine learning.",
  "React hooks are really powerful. useState and useEffect are my favorites.",
  "Building a word cloud component with d3-cloud library. Very exciting!",
  "TypeScript makes JavaScript development so much better with type safety.",
  "Next.js is an amazing framework for building full-stack web applications.",
];

console.log("Testing WordProcessor...");
console.log("=".repeat(50));

// Test individual text processing
testTexts.forEach((text, index) => {
  console.log(`\nTest ${index + 1}: "${text}"`);
  const words = WordProcessor.processText(text);
  console.log("Processed words:", words.slice(0, 5)); // Show top 5 words
});

// Test combining multiple texts
console.log("\n" + "=".repeat(50));
console.log("Testing combined text processing...");
const combinedText = testTexts.join(" ");
const combinedWords = WordProcessor.processText(combinedText);
console.log(
  `\nCombined text (${combinedText.length} chars) produced ${combinedWords.length} unique words`
);
console.log("Top 10 words:", combinedWords.slice(0, 10));

// Test word array combination
const wordArrays = testTexts.map((text) => WordProcessor.processText(text));
const mergedWords = WordProcessor.combineWordArrays(wordArrays);
console.log(`\nMerged word arrays produced ${mergedWords.length} unique words`);
console.log("Top 10 merged words:", mergedWords.slice(0, 10));

console.log("\n" + "=".repeat(50));
console.log("WordProcessor test completed successfully! ✅");
