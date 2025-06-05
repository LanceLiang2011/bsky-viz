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
      "Write a comprehensive personality profile (aim for 200-250 words for optimal card display) that analyzes this person's unique characteristics across multiple dimensions. Structure your analysis to distinguish between their original thoughts and conversational patterns:\n\n1. CORE PERSONALITY (from original posts): Analyze their primary interests, values, worldview, and authentic self-expression when they initiate conversations.\n\n2. SOCIAL DYNAMICS (from replies): Examine their communication style, emotional intelligence, conflict resolution approach, and how they engage with others in conversations.\n\n3. BEHAVIORAL PATTERNS: Identify recurring themes, decision-making style, humor/tone, and psychological traits that emerge across both contexts.\n\nFocus on specific examples from their content that reveal deeper personality insights, emotional patterns, and unique characteristics that set them apart. Create a thorough and insightful analysis that captures their distinctive behavioral fingerprint.",
    animalSelection:
      "Analyze their behavioral patterns from their posts and replies to select ONE animal that best represents their characteristics. Focus purely on:\n\n• COMMUNICATION PATTERNS: How do they express themselves, interact with others, and handle conversations?\n• ACTIVITY PATTERNS: When and how frequently do they post? What triggers their engagement?\n• EMOTIONAL PATTERNS: How do they respond to stress, excitement, conflict, or joy in their posts?\n• SOCIAL PATTERNS: Are they leaders, followers, collaborators, or independent operators?\n• CONTENT PATTERNS: What topics energize them? How do they approach different subjects?\n\nSelect the animal whose natural behavioral traits most closely match these observed patterns. Be creative and avoid defaults - choose based on genuine behavioral alignment.",
    animalExplanation:
      "Write a detailed explanation (aim for 120-150 words for optimal card display) of why the SPECIFIC animal you selected above perfectly matches this person's behavioral patterns. Connect their actual posting behaviors, communication style, social interactions, and activity patterns to this animal's natural traits and behaviors. Be specific about which observable behaviors led to this choice - reference their actual posting patterns, response styles, or engagement habits. Focus on behavioral evidence from their content, not superficial associations. Create a compelling analysis that demonstrates the clear behavioral connection between this person and their spirit animal.",
  },
  "zh-cn": {
    summary:
      "撰写一份全面个性档案（建议200-250字），从多个维度分析此人的独特特征。构建您的分析以区分他们的原创思想和对话模式：\n\n1. 核心个性（来自原创帖子）：分析他们在主动发起对话时的主要兴趣、价值观、世界观和真实自我表达。\n\n2. 社交动态（来自回复）：检查他们的沟通风格、情商、解决冲突的方法，以及在对话中如何与他人互动。\n\n3. 行为模式：识别在两种情境中出现的重复主题、决策风格、幽默/语调和心理特征。\n\n重点关注来自其内容的具体例子，这些例子揭示了更深层的个性洞察、情感模式和使他们与众不同的独特特征。创建捕捉其独特行为指纹的彻底且富有洞察力的分析。",
    animalSelection:
      "通过分析其帖子和回复中的行为模式来选择一个最能代表其特征的动物。纯粹关注：\n\n• 沟通模式：他们如何表达自己、与他人互动、处理对话？\n• 活动模式：他们何时以及多频繁地发帖？什么触发了他们的参与？\n• 情感模式：他们在帖子中如何回应压力、兴奋、冲突或快乐？\n• 社交模式：他们是领导者、追随者、合作者还是独立运营者？\n• 内容模式：什么话题让他们充满活力？他们如何处理不同主题？\n\n选择其自然行为特征与这些观察到的模式最接近的动物。发挥创意，避免默认选择 - 基于真正的行为对齐进行选择。",
    animalExplanation:
      "写一段详细的解释（建议100-130字），说明为什么你上面选择的特定动物完美匹配此人的行为模式。将他们的实际发帖行为、沟通风格、社交互动和活动模式与该动物的自然特征和行为联系起来。具体说明哪些可观察的行为导致了这个选择 - 引用他们的实际发帖模式、回应风格或参与习惯。专注于来自其内容的行为证据，而非表面联想。创建一个引人入胜的分析，展示此人与其精神动物之间清晰的行为联系。",
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
      "You are a creative social media psychologist specializing in behavioral personality analysis. Analyze the user's posts and replies to understand their deeper traits, communication patterns, and behavioral tendencies through pure observation of their digital behavior.\n\nYour analysis has two main parts:\n\n1. DETAILED PERSONALITY SUMMARY:\nCreate a comprehensive psychological profile that clearly distinguishes between different aspects of their personality:\n\n• ORIGINAL POSTS ANALYSIS: Focus on their authentic thoughts, interests, values, and worldview when they initiate conversations. These reveal their core personality, passions, and how they view the world.\n\n• REPLIES ANALYSIS: Examine their social interaction style, emotional intelligence, conversational patterns, and how they respond to others. This shows their interpersonal skills and social dynamics.\n\n• INTEGRATED BEHAVIORAL PATTERNS: Identify consistent themes, decision-making approaches, humor style, emotional patterns, and unique characteristics that appear across both contexts.\n\nProvide specific examples and insights that reveal psychological depth, not just surface-level observations.\n\n2. ANIMAL BEHAVIORAL ANALYSIS:\nAnalyze their behavioral patterns from their posts and replies to select ONE animal that best represents their characteristics. Focus purely on observable behaviors:\n\n• COMMUNICATION PATTERNS: How do they express themselves, interact with others, and handle conversations?\n• ACTIVITY PATTERNS: When and how frequently do they post? What triggers their engagement?\n• EMOTIONAL PATTERNS: How do they respond to stress, excitement, conflict, or joy in their posts?\n• SOCIAL PATTERNS: Are they leaders, followers, collaborators, or independent operators?\n• CONTENT PATTERNS: What topics energize them? How do they approach different subjects?\n• ENGAGEMENT STYLE: Are they reactive or proactive? Do they seek attention or prefer background presence?\n\nSelect the animal whose natural behavioral traits most closely match these observed digital behaviors. Then explain why THAT EXACT animal fits them based purely on behavioral evidence from their content.\n\nCRITICAL: Be creative and diverse when doing behavioral analysis - avoid defaulting to owl, wolf, or cat unless they genuinely match the observed behavioral patterns. Base your choice entirely on how they actually behave in their digital interactions.\n\nWeight original posts more heavily than replies when determining core interests and personality traits, but use replies to understand their social interaction style.",
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
      "你是一位富有创意的社交媒体心理学家，专门进行行为个性分析。通过纯粹观察用户的数字行为，分析用户的帖子和回复，理解他们深层的个性特征、沟通模式和行为倾向。\n\n你的分析有两个主要部分：\n\n1. 详细个性摘要：\n创建一个全面的心理档案，清楚地区分他们个性的不同方面：\n\n• 原创帖子分析：关注他们在主动发起对话时的真实想法、兴趣、价值观和世界观。这些揭示了他们的核心个性、激情以及他们如何看待世界。\n\n• 回复分析：检查他们的社交互动风格、情商、对话模式以及如何回应他人。这显示了他们的人际交往技能和社交动态。\n\n• 综合行为模式：识别在两种情境中出现的一致主题、决策方法、幽默风格、情感模式和独特特征。\n\n提供揭示心理深度的具体例子和洞察，而不仅仅是表面观察。\n\n2. 动物行为分析：\n通过分析其帖子和回复中的行为模式来选择一个最能代表其特征的动物。纯粹关注可观察的行为：\n\n• 沟通模式：他们如何表达自己、与他人互动、处理对话？\n• 活动模式：他们何时以及多频繁地发帖？什么触发了他们的参与？\n• 情感模式：他们在帖子中如何回应压力、兴奋、冲突或快乐？\n• 社交模式：他们是领导者、追随者、合作者还是独立运营者？\n• 内容模式：什么话题让他们充满活力？他们如何处理不同主题？\n• 参与风格：他们是被动反应型还是主动出击型？他们寻求关注还是偏好后台存在？\n\n选择其自然行为特征与这些观察到的数字行为最接近的动物。然后解释为什么那个确切的动物适合他们，完全基于来自其内容的行为证据。\n\n关键：在进行行为分析时要有创意和多样性 - 避免默认选择猫头鹰、狼或猫，除非它们真正匹配观察到的行为模式。完全基于他们在数字互动中的实际行为方式来做出选择。\n\n在确定核心兴趣和个性特征时，原创帖子的权重应超过回复内容，但使用回复来理解他们的社交互动风格。",
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
    }); // Construct the content with clear separation and emphasis on different content types
    let content =
      "Please analyze the following user content with clear attention to the distinction between original thoughts and conversational responses:\n\n";

    // Add user identification context if available
    if (userDisplayName) {
      content += `=== USER INFORMATION ===\n`;
      content += `Display Name: "${userDisplayName}"\n`;
      content += `NOTE: Focus your analysis purely on behavioral patterns observed in the user's posting content and interactions. Do not consider the display name or username as indicators of animal identity - base your animal selection entirely on demonstrated behavioral traits.\n\n`;
    }

    if (originalPosts.length > 0) {
      content +=
        "=== ORIGINAL POSTS (Primary Analysis Focus - Core Personality & Authentic Self) ===\n";
      content +=
        "These posts represent the user's original thoughts, interests, and worldview when they initiate conversations.\n";
      content +=
        "Use these primarily for understanding their core personality, values, passions, and authentic self-expression.\n\n";
      content += originalPosts.join("\n\n---\n\n");
      content += "\n\n";
    }

    if (replyPosts.length > 0) {
      content +=
        "=== REPLIES TO OTHERS (Secondary Analysis - Social Interaction Style) ===\n";
      content +=
        "These replies show how the user interacts with others, their conversational style, and social dynamics.\n";
      content +=
        "Use these to understand their interpersonal skills, emotional intelligence, and social behavior patterns.\n\n";
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
