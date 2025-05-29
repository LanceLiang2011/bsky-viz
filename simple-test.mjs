// Simple test script for basic functionality
import { WordProcessor } from "./app/utils/wordProcessor.enhanced.ts";

// Simple Chinese test
const text = "中文自然语言处理是人工智能的重要分支。";

console.log("Testing WordProcessor with text:", text);

// Use sync method
const result = WordProcessor.processText(text, { locale: "zh-cn" });
console.log("Result:", result);

// Try async method (but won't work in this simple script without await)
// We would need to use an IIFE with async/await
