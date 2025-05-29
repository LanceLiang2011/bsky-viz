import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testText = searchParams.get("text") || "我爱新西兰，这是一个美丽的国家";

  return NextResponse.json({
    message:
      "Chinese text processing has been moved to client-side for Vercel compatibility",
    testText,
    instructions:
      "Please use the client-side ChineseTestComponent at /test-chinese or the ChineseWordCloud component to test jieba-wasm functionality",
    note: "Server-side jieba processing was removed due to compatibility issues with Vercel serverless environment",
  });
}
