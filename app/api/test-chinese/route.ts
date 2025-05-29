import { NextRequest, NextResponse } from "next/server";
import { segmentChineseText } from "../../utils/chineseProcessor.server";
import WordProcessor from "../../utils/wordProcessor.enhanced";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text =
    searchParams.get("text") ||
    "今天天气很好，我很开心。我住在新西兰奥克兰。但是 English words should be filtered out when processing Chinese text!";

  return processChineseText(text);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text =
    body.text ||
    "今天天气很好，我很开心。我住在新西兰奥克兰。但是 English words should be filtered out when processing Chinese text!";

  return processChineseText(text);
}

async function processChineseText(text: string) {
  try {
    console.log("🧪 Testing Chinese text processing...");
    console.log("Input text:", text);

    // Test the Chinese processor directly
    const segments = await segmentChineseText(text);
    console.log("Segmented words:", segments);

    // Test the enhanced WordProcessor with English filtering
    const wordCloudData = await WordProcessor.processTextAsync(text, {
      locale: "zh",
    });
    console.log("Word cloud data:", wordCloudData);

    // Check for filler words that should be filtered
    const fillerWordsToCheck = [
      "一个",
      "这个",
      "那个",
      "什么",
      "因为",
      "现在",
      "一下",
      "也是",
      "都是",
      "然后",
      "但是",
      "所以",
      "虽然",
      "如果",
      "或者",
      "已经",
      "还是",
      "应该",
      "可能",
      "当然",
      "其实",
      "比如",
      "就是",
      "而且",
      "不过",
      "可是",
      "觉得",
      "感觉",
      "知道",
      "认为",
      "好像",
      "似乎",
      "大概",
      "估计",
      "或许",
      "也许",
    ];

    const fillerWordsFound = segments.filter((word) =>
      fillerWordsToCheck.includes(word)
    );

    // Check for basic stop words
    const stopWordsFound = segments.filter((word) =>
      ["的", "了", "我们", "都", "很"].includes(word)
    );

    const repetitiveFound = segments.filter(
      (word) => /^(.)\1+$/.test(word) || word === "哈哈哈" || word === "嘻嘻嘻"
    );

    // Test if we have proper individual words (not long phrases)
    const properWords = segments.filter(
      (word) =>
        word.length >= 2 &&
        word.length <= 4 &&
        !fillerWordsToCheck.includes(word)
    );
    const longPhrases = segments.filter((word) => word.length > 6);

    return NextResponse.json({
      input: text,
      segments: segments,
      wordCloudData: wordCloudData,
      totalWords: segments.length,
      fillerWordsFound: fillerWordsFound,
      stopWordsFound: stopWordsFound,
      repetitiveFound: repetitiveFound,
      properWords: properWords,
      longPhrases: longPhrases,
      englishWordsInWordCloud: wordCloudData.filter((item) =>
        /^[a-zA-Z\s]+$/.test(item.text)
      ),
      status: segments.length > 0 ? "SUCCESS" : "NO_WORDS",
      validation: {
        hasFillerWords: fillerWordsFound.length > 0,
        hasStopWords: stopWordsFound.length > 0,
        hasRepetitive: repetitiveFound.length > 0,
        properSegmentation: segments.some((word) => word.length >= 2),
        hasProperWords: properWords.length > 0,
        hasLongPhrases: longPhrases.length > 0,
        englishFilteringWorking:
          wordCloudData.filter((item) => /^[a-zA-Z\s]+$/.test(item.text))
            .length === 0,
      },
    });
  } catch (error) {
    console.error("Error testing Chinese processing:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        status: "ERROR",
      },
      { status: 500 }
    );
  }
}
