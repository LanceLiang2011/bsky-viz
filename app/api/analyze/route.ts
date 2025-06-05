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
      "Write a comprehensive personality profile (aim for 200-300 words) that provides deep psychological insights through detailed analysis of this person's digital behavior. Structure your analysis with concrete examples from their content:\n\n**1. CORE PERSONALITY ANALYSIS (from original posts):**\nAnalyze their authentic self-expression, values, worldview, and interests. Quote specific phrases or reference particular posts that reveal their inner thoughts, passions, concerns, and unique perspectives. Identify their intellectual curiosity, creative expression, problem-solving approaches, and core beliefs.\n\n**2. SOCIAL INTERACTION PATTERNS (from replies):**\nExamine how they engage with others - their empathy levels, conflict resolution style, humor usage, support-giving behavior, and emotional intelligence. Reference specific examples of how they respond to different types of conversations, their tone variations, and relationship-building patterns.\n\n**3. INTEGRATED BEHAVIORAL FINGERPRINT:**\nSynthesize patterns that appear across both contexts - their communication rhythm, emotional regulation, decision-making style, leadership tendencies, and unique quirks. Highlight contradictions, growth patterns, or situational adaptations that make them psychologically complex.\n\n**CRITICAL:** Always cite specific examples from their content. Use phrases like 'as evidenced by their post about...', 'demonstrated when they replied...', or 'shown in their frequent discussions of...'. Create a rich, evidence-based psychological portrait that captures their authentic digital personality with specific behavioral proof.",
    animalSelection:
      "Analyze their behavioral patterns from their posts and replies to select ONE animal that best represents their characteristics. Choose from these 16 animals based on behavioral alignment:\n\n🐻 BEAR: Protective, strong presence, speaks with authority, direct communication, defends others, occasional bursts of intense activity, thoughtful but can be forceful when needed\n\n🐱 CAT: Independent, selective engagement, witty/sharp humor, observes before acting, maintains boundaries, quality over quantity interactions, confident but not attention-seeking\n\n🐄 COW: Calm, consistent, grounded, community-minded, steady posting rhythm, practical wisdom, reliable support to others, peaceful but firm in values\n\n🦌 DEER: Gentle, alert to social dynamics, graceful communication, sensitive to others' emotions, quick to react to changes, artistic/aesthetic interests, somewhat cautious in conflicts\n\n🐶 DOG: Enthusiastic, loyal, highly social, frequent engagement, positive responses, supportive of others, builds community, authentic emotional expression, seeks connection\n\n🦆 DUCK: Adaptable, goes with the flow, maintains calm surface, versatile interests, handles different social groups well, practical problem-solving, resilient to criticism\n\n🐟 FISH: Flows with trends, moves in social currents, collective participation, follows conversations, contributes to larger discussions, smooth transitions between topics\n\n🦒 GIRAFFE: Broad perspective, sees big picture, thoughtful long-form content, unique viewpoint, stands above drama, patient observation, strategic engagement\n\n🐹 HAMSTER: High energy, frequent activity bursts, collects/shares information, busy engagement style, quick responses, stores/remembers details, playful interactions\n\n🐴 HORSE: Energetic, forward-moving, leads conversations, strong opinions, competitive spirit, works well in groups, powerful presence, drives discussions forward\n\n🦁 LION: Natural leader, confident posts, takes charge in discussions, protective of community, bold statements, commands attention, authoritative but caring\n\n🦉 OWL: Thoughtful analysis, posts during quiet hours, wisdom-sharing, methodical responses, sees what others miss, patient observation, insightful comments\n\n🐧 PENGUIN: Community-focused, coordinated group activities, formal yet playful, adapts to social climate, huddles with like-minded users, distinctive but harmonious\n\n🐰 RABBIT: Quick, frequent interactions, multiplies conversations, spreads information rapidly, alert to trends, energetic bursts, sometimes anxious about conflicts\n\n🐑 SHEEP: Follows community trends, harmonious interactions, goes along with group consensus, peaceful presence, comfort in numbers, avoids confrontation\n\n🐺 WOLF: Strategic social behavior, pack mentality, loyal to close circle, communicates with purpose, territorial about values, cooperative when aligned, lone wolf tendencies\n\nSelect the animal whose natural behavioral traits most closely match their observed social media patterns. Focus on their actual posting behaviors, not superficial associations.",
    animalExplanation:
      "Write a explanation (aim for 100 words) that clearly demonstrates why the SPECIFIC animal you selected {animalSelection} perfectly matches this person's behavioral patterns. Connect their actual posting behaviors, communication style, social interactions, and activity patterns to this animal's natural traits and behaviors. Reference specific observable behaviors that led to this choice - such as their posting frequency, response patterns, conversation leadership style, or engagement habits. Focus on concrete behavioral evidence from their content rather than superficial associations. Create a compelling analysis that demonstrates the clear and logical behavioral connection between this person and their spirit animal.",
  },
  "zh-cn": {
    summary:
      "撰写一份全面个性档案（建议280-320字），通过详细分析此人的数字行为，提供深度心理洞察。用具体内容例子构建您的分析：\n\n**1. 核心个性分析（来自原创帖子）：**\n分析他们的真实自我表达、价值观、世界观和兴趣。引用特定短语或参考特定帖子，这些揭示了他们的内心想法、激情、担忧和独特观点。识别他们的求知欲、创造性表达、解决问题的方法和核心信念。\n\n**2. 社交互动模式（来自回复）：**\n检查他们如何与他人互动 - 他们的同理心水平、冲突解决风格、幽默使用、支持给予行为和情商。参考他们如何回应不同类型对话的具体例子，他们的语调变化和关系建立模式。\n\n**3. 综合行为指纹：**\n综合在两种情境中出现的模式 - 他们的沟通节奏、情绪调节、决策风格、领导倾向和独特癖好。突出矛盾、成长模式或使他们在心理上复杂的情境适应。\n\n**关键：**始终引用他们内容中的具体例子。创建一个丰富的、基于证据的心理画像，用具体行为证据捕捉他们真实的数字个性。",
    animalSelection:
      "通过分析其帖子和回复中的行为模式来选择一个最能代表其特征的动物。基于行为对齐从这16种动物中选择：\n\n🐻 熊：保护性强、强势存在感、权威发言、直接沟通、保护他人、偶尔激烈活动、深思熟虑但必要时可强势\n\n🐱 猫：独立、选择性参与、机智/犀利幽默、行动前观察、保持界限、重质不重量的互动、自信但不寻求关注\n\n🐄 奶牛：冷静、一致、踏实、社区意识、稳定发帖节奏、实用智慧、对他人可靠支持、平和但坚持价值观\n\n🦌 鹿：温和、对社交动态敏感、优雅沟通、对他人情感敏感、快速反应变化、艺术/美学兴趣、冲突中略显谨慎\n\n🐶 狗：热情、忠诚、高度社交、频繁参与、积极回应、支持他人、建立社区、真实情感表达、寻求连接\n\n🦆 鸭子：适应性强、顺其自然、保持表面平静、兴趣多样、善于处理不同社交群体、实用问题解决、抗批评能力强\n\n🐟 鱼：跟随趋势、在社交流中移动、集体参与、跟随对话、贡献于更大讨论、话题间平滑过渡\n\n🦒 长颈鹿：视野开阔、看到大局、深思熟虑的长篇内容、独特观点、超脱争论、耐心观察、战略性参与\n\n🐹 仓鼠：高能量、频繁活动爆发、收集/分享信息、忙碌参与风格、快速回应、存储/记住细节、有趣互动\n\n🐴 马：精力充沛、向前推进、引导对话、强烈观点、竞争精神、团队合作良好、强大存在感、推动讨论前进\n\n🦁 狮子：天生领导者、自信发帖、在讨论中掌控、保护社区、大胆陈述、吸引注意、权威但关怀\n\n🦉 猫头鹰：深思分析、安静时间发帖、分享智慧、有条理回应、看到他人忽略的内容、耐心观察、洞察评论\n\n🐧 企鹅：社区导向、协调群体活动、正式而有趣、适应社交环境、与志同道合用户聚集、独特但和谐\n\n🐰 兔子：快速、频繁互动、增加对话、快速传播信息、对趋势敏感、精力爆发、有时对冲突焦虑\n\n🐑 羊：跟随社区趋势、和谐互动、与群体共识保持一致、平和存在、在群体中舒适、避免对抗\n\n🐺 狼：战略社交行为、群体心理、对核心圈忠诚、有目的沟通、对价值观有领土意识、结盟时合作、独狼倾向\n\n选择其自然行为特征与其观察到的社交媒体模式最接近的动物。专注于他们的实际发帖行为，而非表面联想。",
    animalExplanation:
      "写一段解释（建议100-120字），清楚地证明为什么你选择的特定动物{animalSelection}完美匹配此人的行为模式。将他们的实际发帖行为、沟通风格、社交互动和活动模式与该动物的自然特征和行为联系起来。参考导致这个选择的具体可观察行为 - 如他们的发帖频率、回应模式、对话领导风格或参与习惯。专注于来自其内容的具体行为证据，而非表面联想。创建一个令人信服的分析，证明此人与其精神动物之间清晰且合理的行为联系。",
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
      "You are a creative social media psychologist specializing in behavioral personality analysis. Analyze the user's posts and replies to understand their deeper traits, communication patterns, and behavioral tendencies through pure observation of their digital behavior.\n\nYour analysis has two main parts:\n\n1. DETAILED PERSONALITY SUMMARY:\nCreate a comprehensive psychological profile that clearly distinguishes between different aspects of their personality:\n\n• ORIGINAL POSTS ANALYSIS: Focus on their authentic thoughts, interests, values, and worldview when they initiate conversations. These reveal their core personality, passions, and how they view the world.\n\n• REPLIES ANALYSIS: Examine their social interaction style, emotional intelligence, conversational patterns, and how they respond to others. This shows their interpersonal skills and social dynamics.\n\n• INTEGRATED BEHAVIORAL PATTERNS: Identify consistent themes, decision-making approaches, humor style, emotional patterns, and unique characteristics that appear across both contexts.\n\nProvide specific examples and insights that reveal psychological depth, not just surface-level observations.\n\n2. ANIMAL BEHAVIORAL ANALYSIS:\nAnalyze their behavioral patterns to select ONE of these 16 animals that best represents their characteristics:\n\n🐻 BEAR: Protective, strong presence, speaks with authority, direct communication, defends others, occasional bursts of intense activity, thoughtful but can be forceful when needed\n🐱 CAT: Independent, selective engagement, witty/sharp humor, observes before acting, maintains boundaries, quality over quantity interactions, confident but not attention-seeking\n🐄 COW: Calm, consistent, grounded, community-minded, steady posting rhythm, practical wisdom, reliable support to others, peaceful but firm in values\n🦌 DEER: Gentle, alert to social dynamics, graceful communication, sensitive to others' emotions, quick to react to changes, artistic/aesthetic interests, somewhat cautious in conflicts\n🐶 DOG: Enthusiastic, loyal, highly social, frequent engagement, positive responses, supportive of others, builds community, authentic emotional expression, seeks connection\n🦆 DUCK: Adaptable, goes with the flow, maintains calm surface, versatile interests, handles different social groups well, practical problem-solving, resilient to criticism\n🐟 FISH: Flows with trends, moves in social currents, collective participation, follows conversations, contributes to larger discussions, smooth transitions between topics\n🦒 GIRAFFE: Broad perspective, sees big picture, thoughtful long-form content, unique viewpoint, stands above drama, patient observation, strategic engagement\n🐹 HAMSTER: High energy, frequent activity bursts, collects/shares information, busy engagement style, quick responses, stores/remembers details, playful interactions\n🐴 HORSE: Energetic, forward-moving, leads conversations, strong opinions, competitive spirit, works well in groups, powerful presence, drives discussions forward\n🦁 LION: Natural leader, confident posts, takes charge in discussions, protective of community, bold statements, commands attention, authoritative but caring\n🦉 OWL: Thoughtful analysis, posts during quiet hours, wisdom-sharing, methodical responses, sees what others miss, patient observation, insightful comments\n🐧 PENGUIN: Community-focused, coordinated group activities, formal yet playful, adapts to social climate, huddles with like-minded users, distinctive but harmonious\n🐰 RABBIT: Quick, frequent interactions, multiplies conversations, spreads information rapidly, alert to trends, energetic bursts, sometimes anxious about conflicts\n🐑 SHEEP: Follows community trends, harmonious interactions, goes along with group consensus, peaceful presence, comfort in numbers, avoids confrontation\n🐺 WOLF: Strategic social behavior, pack mentality, loyal to close circle, communicates with purpose, territorial about values, cooperative when aligned, lone wolf tendencies\n\nFocus on observable behaviors:\n• COMMUNICATION PATTERNS: How do they express themselves, interact with others, and handle conversations?\n• ACTIVITY PATTERNS: When and how frequently do they post? What triggers their engagement?\n• EMOTIONAL PATTERNS: How do they respond to stress, excitement, conflict, or joy in their posts?\n• SOCIAL PATTERNS: Are they leaders, followers, collaborators, or independent operators?\n• CONTENT PATTERNS: What topics energize them? How do they approach different subjects?\n• ENGAGEMENT STYLE: Are they reactive or proactive? Do they seek attention or prefer background presence?\n\nSelect the animal whose behavioral description most closely matches these observed digital behaviors. Then explain why THAT EXACT animal fits them based purely on behavioral evidence from their content.\n\nCRITICAL: Be creative and diverse when doing behavioral analysis - consider all 16 animals equally and choose based on genuine behavioral pattern matching. Base your choice entirely on how they actually behave in their digital interactions.\n\nWeight original posts more heavily than replies when determining core interests and personality traits, but use replies to understand their social interaction style.",
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
      "你是一位富有创意的社交媒体心理学家，专门进行行为个性分析。通过纯粹观察用户的数字行为，分析用户的帖子和回复，理解他们深层的个性特征、沟通模式和行为倾向。\n\n你的分析有两个主要部分：\n\n1. 详细个性摘要：\n创建一个全面的心理档案，清楚地区分他们个性的不同方面：\n\n• 原创帖子分析：关注他们在主动发起对话时的真实想法、兴趣、价值观和世界观。这些揭示了他们的核心个性、激情以及他们如何看待世界。\n\n• 回复分析：检查他们的社交互动风格、情商、对话模式以及如何回应他人。这显示了他们的人际交往技能和社交动态。\n\n• 综合行为模式：识别在两种情境中出现的一致主题、决策方法、幽默风格、情感模式和独特特征。\n\n提供揭示心理深度的具体例子和洞察，而不仅仅是表面观察。\n\n2. 动物行为分析：\n分析他们的行为模式，从这16种动物中选择一个最能代表其特征的动物：\n\n🐻 熊：保护性强、强势存在感、权威发言、直接沟通、保护他人、偶尔激烈活动、深思熟虑但必要时可强势\n🐱 猫：独立、选择性参与、机智/犀利幽默、行动前观察、保持界限、重质不重量的互动、自信但不寻求关注\n🐄 奶牛：冷静、一致、踏实、社区意识、稳定发帖节奏、实用智慧、对他人可靠支持、平和但坚持价值观\n🦌 鹿：温和、对社交动态敏感、优雅沟通、对他人情感敏感、快速反应变化、艺术/美学兴趣、冲突中略显谨慎\n🐶 狗：热情、忠诚、高度社交、频繁参与、积极回应、支持他人、建立社区、真实情感表达、寻求连接\n🦆 鸭子：适应性强、顺其自然、保持表面平静、兴趣多样、善于处理不同社交群体、实用问题解决、抗批评能力强\n🐟 鱼：跟随趋势、在社交流中移动、集体参与、跟随对话、贡献于更大讨论、话题间平滑过渡\n🦒 长颈鹿：视野开阔、看到大局、深思熟虑的长篇内容、独特观点、超脱争论、耐心观察、战略性参与\n🐹 仓鼠：高能量、频繁活动爆发、收集/分享信息、忙碌参与风格、快速回应、存储/记住细节、有趣互动\n🐴 马：精力充沛、向前推进、引导对话、强烈观点、竞争精神、团队合作良好、强大存在感、推动讨论前进\n🦁 狮子：天生领导者、自信发帖、在讨论中掌控、保护社区、大胆陈述、吸引注意、权威但关怀\n🦉 猫头鹰：深思分析、安静时间发帖、分享智慧、有条理回应、看到他人忽略的内容、耐心观察、洞察评论\n🐧 企鹅：社区导向、协调群体活动、正式而有趣、适应社交环境、与志同道合用户聚集、独特但和谐\n🐰 兔子：快速、频繁互动、增加对话、快速传播信息、对趋势敏感、精力爆发、有时对冲突焦虑\n🐑 羊：跟随社区趋势、和谐互动、与群体共识保持一致、平和存在、在群体中舒适、避免对抗\n🐺 狼：战略社交行为、群体心理、对核心圈忠诚、有目的沟通、对价值观有领土意识、结盟时合作、独狼倾向\n\n关注可观察的行为：\n• 沟通模式：他们如何表达自己、与他人互动、处理对话？\n• 活动模式：他们何时以及多频繁地发帖？什么触发了他们的参与？\n• 情感模式：他们在帖子中如何回应压力、兴奋、冲突或快乐？\n• 社交模式：他们是领导者、追随者、合作者还是独立运营者？\n• 内容模式：什么话题让他们充满活力？他们如何处理不同主题？\n• 参与风格：他们是被动反应型还是主动出击型？他们寻求关注还是偏好后台存在？\n\n选择行为描述与这些观察到的数字行为最接近的动物。然后解释为什么那个确切的动物适合他们，完全基于来自其内容的行为证据。\n\n关键：在进行行为分析时要有创意和多样性 - 平等考虑所有16种动物，基于真正的行为模式匹配进行选择。完全基于他们在数字互动中的实际行为方式来做出选择。\n\n在确定核心兴趣和个性特征时，原创帖子的权重应超过回复内容，但使用回复来理解他们的社交互动风格。",
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
