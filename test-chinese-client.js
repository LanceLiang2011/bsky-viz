// Test script to verify Chinese processing works correctly
import {
  segmentChineseText,
  processChineseText,
  isChineseText,
} from "./app/utils/chineseProcessor.client.ts";

async function testChineseProcessing() {
  console.log("🧪 Testing Chinese text processing...\n");

  const testTexts = [
    "我爱新西兰，这是一个美丽的国家",
    "今天天气很好，我想去公园散步",
    "人工智能技术发展很快，未来会改变我们的生活",
    "bluesky是一个很好的社交媒体平台",
    "中文分词是自然语言处理的重要技术",
  ];

  for (const text of testTexts) {
    console.log(`📝 Original text: "${text}"`);
    console.log(`🔍 Is Chinese text: ${isChineseText(text)}`);

    try {
      const words = await segmentChineseText(text);
      console.log(`✅ Segmented words: [${words.join(", ")}]`);

      const wordFreq = await processChineseText(text);
      console.log(`📊 Word frequencies:`, Object.fromEntries(wordFreq));

      // Check for problematic fragments
      const problematicWords = words.filter(
        (word) => word === "新西" || word === "西兰" || word.length === 1
      );
      if (problematicWords.length > 0) {
        console.log(
          `⚠️  Found problematic words: [${problematicWords.join(", ")}]`
        );
      }
    } catch (error) {
      console.error(`❌ Error processing "${text}":`, error);
    }

    console.log("---\n");
  }
}

// Test the functionality
testChineseProcessing().catch(console.error);
