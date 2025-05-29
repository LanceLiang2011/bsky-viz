import { WordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

// Test Chinese text with common problematic words
const chineseText = `今天天气很好，我很开心。哈哈哈，真的是太好了！我觉得这个很不错，就是太贵了。`;

console.log("Testing Enhanced Chinese Word Processor (Sync Only)...\n");

// Test synchronous processing only
console.log("=== Synchronous Processing ===");
try {
  const syncResult = WordProcessor.processTextSync(chineseText, {
    locale: "zh-CN",
    minWordLength: 2,
    maxWords: 15,
  });

  console.log("Sync result:");
  syncResult.forEach((word, index) => {
    console.log(`${index + 1}. "${word.text}" (${word.value})`);
  });
  console.log(`\nTotal words found: ${syncResult.length}`);

  // Test if problematic words are filtered out
  const problematicWords = [
    "哈",
    "哈哈",
    "哈哈哈",
    "好",
    "很",
    "太",
    "了",
    "的",
    "是",
  ];
  const foundProblematic = syncResult.filter((w) =>
    problematicWords.includes(w.text)
  );
  console.log(`\nProblematic words found: ${foundProblematic.length}`);
  if (foundProblematic.length > 0) {
    console.log(
      "Problematic words:",
      foundProblematic.map((w) => w.text)
    );
  }
} catch (error) {
  console.error("Sync processing error:", error);
}

console.log("\nTesting completed!");
