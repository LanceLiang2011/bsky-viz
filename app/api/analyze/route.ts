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
      "Write a comprehensive personality profile that analyzes this person's unique characteristics across multiple dimensions. Structure your analysis to distinguish between their original thoughts and conversational patterns:\n\n1. CORE PERSONALITY (from original posts): Analyze their primary interests, values, worldview, and authentic self-expression when they initiate conversations.\n\n2. SOCIAL DYNAMICS (from replies): Examine their communication style, emotional intelligence, conflict resolution approach, and how they engage with others in conversations.\n\n3. BEHAVIORAL PATTERNS: Identify recurring themes, decision-making style, humor/tone, and psychological traits that emerge across both contexts.\n\nFocus on specific examples from their content that reveal deeper personality insights, emotional patterns, and unique characteristics that set them apart. Provide as much detail as needed to create a thorough and insightful analysis.",
    animalSelection:
      "FIRST: Check the username/display name for animal references (like 'Ducky', 'Wolf', 'Tiger', 'Bear', etc.) - these often indicate the user's preferred animal identity. SECOND: Look for explicit self-identification in their post content - Check if the user actively identifies themselves as any animal through statements like 'I'm a cat person', 'tiger mom here', frequent animal metaphors, comparing themselves to animals, or using animal characteristics to describe their behavior (e.g., 'I'm hibernating', 'prowling around', 'nest building'). THIRD: Only if no username hints or content-based self-identification is found, analyze their behavioral patterns and select ONE animal that best represents their characteristics. Be creative and avoid common defaults unless they truly fit.",
    animalExplanation:
      "Write a detailed explanation of why the SPECIFIC animal you selected above perfectly matches this person. If they self-identified as this animal, explain why their self-perception aligns with that animal's traits and how their posts confirm this identity. If you selected based on behavioral analysis, connect their actual behavioral patterns from their posts to this animal's typical traits. Be specific about which behaviors or self-references led to this exact choice - do not use generic animal descriptions. Provide enough detail to create a compelling and insightful analysis.",
  },
  "zh-cn": {
    summary:
      "撰写一份全面个性档案，从多个维度分析此人的独特特征。构建您的分析以区分他们的原创思想和对话模式：\n\n1. 核心个性（来自原创帖子）：分析他们在主动发起对话时的主要兴趣、价值观、世界观和真实自我表达。\n\n2. 社交动态（来自回复）：检查他们的沟通风格、情商、解决冲突的方法，以及在对话中如何与他人互动。\n\n3. 行为模式：识别在两种情境中出现的重复主题、决策风格、幽默/语调和心理特征。\n\n重点关注来自其内容的具体例子，这些例子揭示了更深层的个性洞察、情感模式和使他们与众不同的独特特征。提供创建彻底且富有洞察力分析所需的详细信息。",
    animalSelection:
      "首先：检查用户名/显示名称中的动物引用（如'Ducky'、'Wolf'、'Tiger'、'Bear'等）- 这些通常表明用户偏好的动物身份。其次：在帖子内容中寻找明确的自我认同 - 检查用户是否通过诸如'我是猫猫'、'本狗狗'、'喵喵喵'、频繁的动物比喻、将自己与动物进行比较，或使用动物特征来描述自己的行为（如'我在冬眠'、'我在觅食'、'筑巢中'）等方式积极地将自己认同为任何动物。第三：只有在没有发现用户名提示或基于内容的自我认同时，才分析其行为模式并从可用列表中选择一个最能代表其特征的动物。发挥创意，避免常见的默认选择，除非它们真正符合。",
    animalExplanation:
      "写一段详细的解释，说明为什么你上面选择的特定动物完美匹配此人。如果他们自我认同为这种动物，解释为什么他们的自我认知与该动物的特质一致，以及他们的帖子如何证实这种身份，但不要提及分析的结果是源于用户的用户名， 或用户自身的认同。如果你是基于行为分析选择的，将其帖子中的实际行为模式与该动物的典型特质联系起来。具体说明哪些行为或自我引用导致了这个确切的选择 - 不要使用通用的动物描述。提供足够的细节来创建一个引人入胜且富有洞察力的分析。",
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
      "You are a creative social media psychologist specializing in personality analysis. Analyze the user's posts and replies to understand their deeper traits, communication patterns, and behavioral tendencies.\n\nIMPORTANT: The user's display name/username often hints at their animal identity preference. Animal-like words in their name can suggest their animal self-identification unless they explicitly indicate a more suitable animal identity in their content. For example, 'Ducky Guillaume' contains 'Ducky' as part of their name, which may suggest duck identification.\n\nYour analysis has two main parts:\n\n1. DETAILED PERSONALITY SUMMARY:\nCreate a comprehensive psychological profile that clearly distinguishes between different aspects of their personality:\n\n• ORIGINAL POSTS ANALYSIS: Focus on their authentic thoughts, interests, values, and worldview when they initiate conversations. These reveal their core personality, passions, and how they view the world.\n\n• REPLIES ANALYSIS: Examine their social interaction style, emotional intelligence, conversational patterns, and how they respond to others. This shows their interpersonal skills and social dynamics.\n\n• INTEGRATED BEHAVIORAL PATTERNS: Identify consistent themes, decision-making approaches, humor style, emotional patterns, and unique characteristics that appear across both contexts.\n\nProvide specific examples and insights that reveal psychological depth, not just surface-level observations.\n\n2. ANIMAL ANALYSIS (PRIORITY ORDER):\n   - FIRST PRIORITY: Check the username/display name for animal references (like 'Ducky', 'Wolf', 'Tiger', 'Bear', etc.) - these often indicate the user's preferred animal identity.\n   - SECOND PRIORITY: Look for explicit self-identification in their post content - Check if the user actively identifies themselves as any animal in their posts or replies through statements like 'I'm a cat person', 'I identify as a tiger mom', 'bear hugs are my thing', frequent animal metaphors, or comparing themselves to animals.\n   - BEHAVIORAL CLUES: Pay special attention to users who consistently use animal-like descriptors for themselves, such as:\n     • Describing their actions with animal verbs ('hibernating', 'prowling', 'nesting', 'hunting', 'grazing')\n     • Using animal characteristics to explain their mood or behavior ('feeling foxy', 'being catty', 'going into my shell')\n     • Repeatedly referencing specific animal behaviors that mirror their own patterns\n     • Making frequent comparisons between themselves and particular animals\n   - THIRD PRIORITY: Only if no username hints or content-based self-identification is found, analyze their behavioral patterns and select ONE animal from the available list that matches their demonstrated characteristics.\n   - Then explain why THAT EXACT animal fits them, whether through username hints, explicit content-based self-identification, or behavioral analysis.\n\nCRITICAL: The animal you select and the explanation must perfectly match. Do not select one animal and explain a different one. Be creative and diverse when doing behavioral analysis - avoid defaulting to owl, wolf, or cat unless they truly fit or are suggested by their identity.\n\nWeight original posts more heavily than replies when determining core interests and personality traits, but use replies to understand their social interaction style.",
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
      "你是一位富有创意的社交媒体心理学家，专门进行个性分析。分析用户的帖子和回复，理解他们深层的个性特征、沟通模式和行为倾向。\n\n重要提示：用户的显示名称/用户名往往暗示了他们的动物身份偏好。除非他们在内容中明确表达了更合适的动物身份，否则其姓名中的动物词汇可以暗示其动物自我认同。例如，'Ducky Guillaume'中包含'Ducky'作为其名称的一部分，这可能暗示鸭子认同。\n\n你的分析有两个主要部分：\n\n1. 详细个性摘要：\n创建一个全面的心理档案，清楚地区分他们个性的不同方面：\n\n• 原创帖子分析：关注他们在主动发起对话时的真实想法、兴趣、价值观和世界观。这些揭示了他们的核心个性、激情以及他们如何看待世界。\n\n• 回复分析：检查他们的社交互动风格、情商、对话模式以及如何回应他人。这显示了他们的人际交往技能和社交动态。\n\n• 综合行为模式：识别在两种情境中出现的一致主题、决策方法、幽默风格、情感模式和独特特征。\n\n提供揭示心理深度的具体例子和洞察，而不仅仅是表面观察。\n\n2. 动物分析（优先级顺序）：\n   - 第一优先级：检查用户名/显示名称中的动物引用（如'Ducky'、'Wolf'、'Tiger'、'Bear'等）- 这些通常表明用户偏好的动物身份。\n   - 第二优先级：在帖子内容中寻找明确的自我认同 - 检查用户是否在其帖子或回复中通过诸如'我是猫奴'、'我认为自己是虎妈'、'熊抱是我的最爱'、频繁的动物比喻或将自己与动物进行比较等陈述积极地将自己认同为任何动物。\n   - 行为线索：特别注意那些经常使用动物类比来描述自己的用户，例如：\n     • 用动物动词描述自己的行为（'冬眠中'、'觅食'、'筑巢'、'狩猎'、'放牧'）\n     • 用动物特征解释自己的情绪或行为（'像狐狸一样狡猾'、'像猫一样高冷'、'缩回壳里'）\n     • 反复引用特定动物行为来描述自己的模式\n     • 频繁地将自己与特定动物进行比较\n   - 第三优先级：只有在没有发现用户名提示或基于内容的自我认同时，才分析其行为模式并从可用列表中选择一个与其展示特征匹配的动物。\n   - 然后解释为什么那个确切的动物适合他们，无论是通过用户名提示、明确的基于内容的自我认同还是行为分析。\n\n关键：你选择的动物和解释必须完美匹配。不要选择一个动物然后解释不同的动物。在进行行为分析时要有创意和多样性 - 避免默认选择猫头鹰、狼或猫，除非它们真正符合或被其身份所暗示。\n\n在确定核心兴趣和个性特征时，原创帖子的权重应超过回复内容，但使用回复来理解他们的社交互动风格。",
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
      content += `NOTE: The display name may contain hints about the user's preferred animal identity. Animal-like words in usernames often suggest self-identification with that animal (e.g., 'Ducky' may suggest duck identity, 'Wolf' may suggest wolf identity). Consider this as a strong indicator unless their content explicitly suggests a different animal.\n\n`;
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
