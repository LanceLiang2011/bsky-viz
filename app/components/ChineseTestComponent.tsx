"use client";

import React, { useState } from "react";

export default function ChineseTestComponent() {
  const [testText, setTestText] = useState("我爱新西兰，这是一个美丽的国家");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testSegmentation = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Dynamic import to avoid SSR issues
      const { segmentChineseText, processChineseText, isChineseText } =
        await import("../utils/chineseProcessor.client");

      console.log(`Testing text: "${testText}"`);
      console.log(`Is Chinese text: ${isChineseText(testText)}`);

      const words = await segmentChineseText(testText);
      const wordFreq = await processChineseText(testText);

      const resultText = `
Original: "${testText}"
Is Chinese: ${isChineseText(testText)}
Segmented words: [${words.join(", ")}]
Word frequencies: ${JSON.stringify(Object.fromEntries(wordFreq), null, 2)}

Problematic words check:
- Contains "新西": ${words.includes("新西")}
- Contains "西兰": ${words.includes("西兰")}
- Single character words: ${words.filter((w: string) => w.length === 1)}
      `;

      setResult(resultText);
    } catch (error) {
      console.error("Test failed:", error);
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTexts = [
    "我爱新西兰，这是一个美丽的国家",
    "今天天气很好，我想去公园散步",
    "人工智能技术发展很快，未来会改变我们的生活",
    "bluesky是一个很好的社交媒体平台",
    "中文分词是自然语言处理的重要技术",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chinese Text Processing Test</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Quick Test Texts:</h3>
        <div className="flex flex-wrap gap-2">
          {testTexts.map((text, index) => (
            <button
              key={index}
              onClick={() => setTestText(text)}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm"
            >
              Test {index + 1}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={testSegmentation}
        disabled={isLoading || !testText.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Testing..." : "Test Segmentation"}
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
