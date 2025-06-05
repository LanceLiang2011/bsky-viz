import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "openai/resources/chat/chat.mjs";
import { z } from "zod";
import { ANIMAL_CONFIG, type Animal } from "@/app/types/animals";

interface AnalyzeRequest {
  originalPosts: string[];
  replyPosts: string[];
  userDisplayName?: string;
  locale: string;
}

interface AnalyzeResponse {
  summary: string | null;
  animal?: Animal | null;
  animalReason?: string | null;
  error?: string;
}

// Field-specific prompts for natural separation
const FIELD_PROMPTS = {
  en: {
    summary:
      "Write a comprehensive 150-200 word personality profile analyzing this person's communication style, interests, emotional expression, problem-solving approach, and social dynamics based on their posts. Focus on psychological traits and behavioral patterns that define their personality.",
    animalSelection:
      "FIRST: Check if the user identifies themselves as any animal in their username, posts, or replies (e.g., 'I'm a cat person', 'tiger mom here', profile name with animal references, etc.). If they do, select that animal from the available list. ONLY if they don't self-identify as any animal, then analyze their behavioral patterns and select ONE animal from the available list that best represents their core characteristics. Consider their communication style, problem-solving approach, social dynamics, and behavioral patterns. Be creative and avoid common defaults like owl, wolf, or cat unless they truly fit.",
    animalExplanation:
      "Write a 120-150 word explanation of why the SPECIFIC animal you selected above perfectly matches this person. If they self-identified as this animal, explain why their self-perception aligns with that animal's traits and how their posts confirm this identity. If you selected based on behavioral analysis, connect their actual behavioral patterns from their posts to this animal's typical traits. Be specific about which behaviors or self-references led to this exact choice - do not use generic animal descriptions. Keep the explanation concise enough to fit in a display card.",
  },
  "zh-cn": {
    summary:
      "撰写一份150-200字的全面个性档案，基于此人的帖子分析其沟通风格、兴趣爱好、情感表达、解决问题的方法和社交动态。重点关注定义其个性的心理特征和行为模式。",
    animalSelection:
      "首先：检查用户是否在其用户名、帖子或回复中将自己认同为任何动物（例如：我是猫奴、虎妈在此、个人资料名称中的动物引用等）。如果有，请从可用列表中选择该动物。只有当他们没有自我认同为任何动物时，才分析其行为模式并从可用列表中选择一个最能代表其核心特征的动物。考虑其沟通风格、解决问题的方法、社交动态和行为模式。发挥创意，避免常见的默认选择如猫头鹰、狼或猫，除非它们真正符合。",
    animalExplanation:
      "写一段120-150字的解释，说明为什么你上面选择的特定动物完美匹配此人。如果他们自我认同为这种动物，解释为什么他们的自我认知与该动物的特质一致，以及他们的帖子如何证实这种身份。如果你是基于行为分析选择的，将其帖子中的实际行为模式与该动物的典型特质联系起来。具体说明哪些行为或自我引用导致了这个确切的选择 - 不要使用通用的动物描述。保持解释简洁，适合在显示卡片中展示。",
  },
};

// Function to create locale-specific animal schema
function createAnimalAnalysisSchema(locale: string) {
  const config =
    ANIMAL_CONFIG[locale as keyof typeof ANIMAL_CONFIG] || ANIMAL_CONFIG.en;
  const prompts =
    FIELD_PROMPTS[locale as keyof typeof FIELD_PROMPTS] || FIELD_PROMPTS.en;

  return z.object({
    summary: z.string().describe(prompts.summary),
    animal: z.enum(config.animals).describe(prompts.animalSelection),
    animalReason: z.string().describe(prompts.animalExplanation),
  });
}

// Define prompts directly in the route - no need for complex imports
const PROMPTS = {
  en: {
    systemPrompt:
      "You are a creative social media psychologist specializing in personality analysis. Analyze the user's posts and replies to understand their deeper traits, communication patterns, and behavioral tendencies.\n\nYour task has two main parts:\n\n1. Personality Summary: Write a detailed psychological profile focusing on their communication style, interests, emotional expression, problem-solving approach, and social dynamics.\n\n2. Animal Analysis (PRIORITY ORDER):\n   - FIRST PRIORITY: Look for explicit self-identification - Check if the user identifies themselves as any animal in their username, display name, bio, posts, or replies (e.g., 'I'm a cat person', 'tiger mom', 'bear hugs', profile names like 'WolfGirl', etc.). If they clearly self-identify with any animal from the available list, select that animal.\n   - SECOND PRIORITY: Only if no self-identification is found, analyze their behavioral patterns and select ONE animal from the available list that matches their demonstrated characteristics.\n   - Then explain why THAT EXACT animal fits them, whether through self-identification or behavioral analysis.\n\nCRITICAL: The animal you select and the explanation must perfectly match. Do not select one animal and explain a different one. Be creative and diverse when doing behavioral analysis - avoid defaulting to owl, wolf, or cat unless they truly fit or self-identify.\n\nWeight original posts more heavily than replies when determining core interests and personality traits.",
    noTextMessage:
      "Not enough text content from recent posts to generate an AI summary.",
    disabledMessage:
      "AI summary generation is currently disabled. User {username} has posted various content.",
    genericUser: "this user",
    errorMessage:
      "Failed to get summary from AI assistant. The AI might be unavailable or an error occurred.",
  },
  "zh-cn": {
    systemPrompt:
      "你是一位富有创意的社交媒体心理学家，专门进行个性分析。分析用户的帖子和回复，理解他们深层的个性特征、沟通模式和行为倾向。\n\n你的任务有两个主要部分：\n\n1. 个性摘要：撰写详细的心理档案，重点关注其沟通风格、兴趣爱好、情感表达、解决问题的方法和社交动态。\n\n2. 动物分析（优先级顺序）：\n   - 第一优先级：寻找明确的自我认同 - 检查用户是否在其用户名、显示名称、简介、帖子或回复中将自己认同为任何动物（例如：我是猫奴、虎妈、熊抱、像WolfGirl这样的个人资料名称等）。如果他们明确地将自己与可用列表中的任何动物认同，请选择该动物。\n   - 第二优先级：只有在没有发现自我认同的情况下，才分析其行为模式并从可用列表中选择一个与其展示特征匹配的动物。\n   - 然后解释为什么那个确切的动物适合他们，无论是通过自我认同还是行为分析。\n\n关键：你选择的动物和解释必须完美匹配。不要选择一个动物然后解释不同的动物。在进行行为分析时要有创意和多样性 - 避免默认选择猫头鹰、狼或猫，除非它们真正符合或用户自我认同。\n\n在确定核心兴趣和个性特征时，原创帖子的权重应超过回复内容。",
    noTextMessage: "近期帖子文本内容不足，无法生成 AI 摘要。",
    disabledMessage:
      "AI 摘要生成功能当前已禁用。用户 {username} 发布了各种内容。",
    genericUser: "该用户",
    errorMessage: "未能从 AI 助手获取摘要。AI 可能不可用或发生错误。",
  },
};

const MODEL: ChatModel = "gpt-4.1-nano"; // "gpt-4.1-nano" for lower costs, or "gpt-4o-mini" for better performance

export async function POST(request: NextRequest) {
  let locale = "en"; // Default locale for error handling

  try {
    const {
      originalPosts,
      replyPosts,
      userDisplayName,
      locale: requestLocale,
    }: AnalyzeRequest = await request.json();

    // Capture locale for error handling
    locale = requestLocale || "en";

    // Get the appropriate prompt for the locale, fallback to English
    const prompts = PROMPTS[locale as keyof typeof PROMPTS] || PROMPTS.en;

    // Check if OpenAI is disabled
    if (process.env.USE_OPENAI !== "True") {
      const nameToUse = userDisplayName || prompts.genericUser;
      return NextResponse.json({
        summary: prompts.disabledMessage.replace("{username}", nameToUse),
        animal: null,
        animalReason: null,
      } as AnalyzeResponse);
    }

    // Check if there's content to analyze
    if (originalPosts.length === 0 && replyPosts.length === 0) {
      return NextResponse.json({
        summary: prompts.noTextMessage,
        animal: null,
        animalReason: null,
      } as AnalyzeResponse);
    }

    // Dynamic import of OpenAI
    const { default: OpenAI } = await import("openai");
    const { zodResponseFormat } = await import("openai/helpers/zod");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Construct the content with clear separation
    let content = "Please analyze the following user content:\n\n";

    // Add user identification context if available
    if (userDisplayName) {
      content += `=== USER INFORMATION ===\n`;
      content += `Display Name: ${userDisplayName}\n\n`;
    }

    if (originalPosts.length > 0) {
      content +=
        "=== ORIGINAL POSTS (Primary content - main interests and thoughts) ===\n";
      content += originalPosts.join("\n\n---\n\n");
      content += "\n\n";
    }

    if (replyPosts.length > 0) {
      content +=
        "=== REPLIES (Secondary content - conversational style and engagement) ===\n";
      content += replyPosts.join("\n\n---\n\n");
    }

    // Create locale-specific schema
    const AnimalAnalysisSchema = createAnimalAnalysisSchema(locale);

    const completion = await openai.beta.chat.completions.parse({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: prompts.systemPrompt,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: zodResponseFormat(
        AnimalAnalysisSchema,
        "animal_analysis"
      ),
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.parsed;

    return NextResponse.json({
      summary: result?.summary || null,
      animal: result?.animal || null,
      animalReason: result?.animalReason || null,
    } as AnalyzeResponse);
  } catch (error) {
    console.error("Error in OpenAI API route:", error);

    // Use the captured locale from the beginning of the function
    const prompts = PROMPTS[locale as keyof typeof PROMPTS] || PROMPTS.en;

    return NextResponse.json(
      {
        summary: null,
        animal: null,
        animalReason: null,
        error: prompts.errorMessage,
      } as AnalyzeResponse,
      { status: 500 }
    );
  }
}
