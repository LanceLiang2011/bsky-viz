#!/usr/bin/env node

// Test script to compare original and enhanced word processors for Chinese text
import { WordProcessor as OriginalWordProcessor } from "./app/utils/wordProcessor.backup.ts";
import { WordProcessor as EnhancedWordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

// Common test cases that showed issues with the original implementation
const testCases = [
  {
    name: "Test Case 1: Short Chinese phrases with common words",
    text: "今天天气真好，我很开心。哈哈哈，真是太好了。就是这样，好好好。",
  },
  {
    name: "Test Case 2: Mixed Chinese-English content",
    text: "在使用React开发应用时，我们需要注意性能优化。哈哈哈，这个应用真的很好用！",
  },
  {
    name: "Test Case 3: Repetitive expressions",
    text: "哈哈哈哈哈，嘻嘻嘻，呵呵呵，这样的内容很常见，但是应该被过滤掉。好好好好好！",
  },
  {
    name: "Test Case 4: Single characters that should be filtered",
    text: "我 你 他 她 它 是 的 了 啊 呢 吧 哦 哈 嗯 哼 呀 呐 嘛",
  },
  {
    name: "Test Case 5: Meaningful Chinese content",
    text: "中文自然语言处理是人工智能的重要分支，我们需要使用先进的算法来分析和理解中文文本。",
  },
];

// Color formatting for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(`${colors.bright}${colors.cyan}==========================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}  COMPARING WORD PROCESSORS FOR CHINESE  ${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}==========================================${colors.reset}\n`);

// Process each test case with both processors
for (const testCase of testCases) {
  console.log(`${colors.bright}${colors.magenta}${testCase.name}${colors.reset}`);
  console.log(`${colors.dim}Text: "${testCase.text}"${colors.reset}\n`);
  
  // Process with original word processor
  console.log(`${colors.yellow}Original Word Processor:${colors.reset}`);
  const originalResult = OriginalWordProcessor.processText(testCase.text, { locale: "zh-cn" });
  console.log(`Words found: ${originalResult.length}`);
  console.log(`Results: ${JSON.stringify(originalResult.slice(0, 15))}\n`);
  
  // Process with enhanced word processor (synchronous method)
  console.log(`${colors.green}Enhanced Word Processor (Sync):${colors.reset}`);
  const enhancedResultSync = EnhancedWordProcessor.processText(testCase.text, { locale: "zh-cn" });
  console.log(`Words found: ${enhancedResultSync.length}`);
  console.log(`Results: ${JSON.stringify(enhancedResultSync.slice(0, 15))}\n`);
  
  // Process with enhanced word processor (asynchronous method)
  console.log(`${colors.blue}Enhanced Word Processor (Async):${colors.reset}`);
  console.log("Running async test...");
  
  // Using IIFE to handle async code
  (async () => {
    try {
      const enhancedResultAsync = await EnhancedWordProcessor.processTextAsync(testCase.text, { locale: "zh-cn" });
      console.log(`Words found: ${enhancedResultAsync.length}`);
      console.log(`Results: ${JSON.stringify(enhancedResultAsync.slice(0, 15))}\n`);
    } catch (error) {
      console.error(`Error in async processing: ${error.message}`);
    }
  })();
  
  console.log(`${colors.bright}${colors.cyan}-----------------------------------------${colors.reset}\n`);
}

console.log("Test completed. Review the results to compare the word processors.");

// Async comparison for all test cases
console.log(`\n${colors.bright}${colors.cyan}RUNNING ASYNC COMPARISON FOR ALL CASES${colors.reset}\n`);

(async () => {
  try {
    for (const testCase of testCases) {
      console.log(`${colors.bright}Testing async for: ${testCase.name}${colors.reset}`);
      const enhancedResultAsync = await EnhancedWordProcessor.processTextAsync(testCase.text, { locale: "zh-cn" });
      console.log(`Words found: ${enhancedResultAsync.length}`);
      console.log(`Results: ${JSON.stringify(enhancedResultAsync.slice(0, 15))}\n`);
    }
  } catch (error) {
    console.error(`Error in async comparison: ${error.message}`);
  }
})();
