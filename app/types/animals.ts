// Animal configuration with multilingual support
export const ANIMALS_EN = [
  "cat",
  "dog",
  "eagle",
  "owl",
  "lion",
  "tiger",
  "wolf",
  "dolphin",
  "elephant",
  "fox",
  "rabbit",
  "bear",
  "monkey",
  "penguin",
  "turtle",
  "butterfly",
  "bee",
  "octopus",
  "shark",
  "horse",
  "panda",
  "koala",
  "kangaroo",
  "giraffe",
  "zebra",
  "deer",
  "squirrel",
  "hedgehog",
  "otter",
  "duck",
] as const;

export const ANIMALS_ZH = [
  "猫",
  "狗",
  "老鹰",
  "猫头鹰",
  "狮子",
  "老虎",
  "狼",
  "海豚",
  "大象",
  "狐狸",
  "兔子",
  "熊",
  "猴子",
  "企鹅",
  "乌龟",
  "蝴蝶",
  "蜜蜂",
  "章鱼",
  "鲨鱼",
  "马",
  "熊猫",
  "考拉",
  "袋鼠",
  "长颈鹿",
  "斑马",
  "鹿",
  "松鼠",
  "刺猬",
  "水獭",
  "鸭子",
] as const;

// Type definitions
export type AnimalEN = (typeof ANIMALS_EN)[number];
export type AnimalZH = (typeof ANIMALS_ZH)[number];
export type Animal = AnimalEN | AnimalZH;

// Animal emoji mapping
export const ANIMAL_EMOJIS: Record<string, string> = {
  // English animals
  cat: "🐱",
  dog: "🐶",
  eagle: "🦅",
  owl: "🦉",
  lion: "🦁",
  tiger: "🐅",
  wolf: "🐺",
  dolphin: "🐬",
  elephant: "🐘",
  fox: "🦊",
  rabbit: "🐰",
  bear: "🐻",
  monkey: "🐵",
  penguin: "🐧",
  turtle: "🐢",
  butterfly: "🦋",
  bee: "🐝",
  octopus: "🐙",
  shark: "🦈",
  horse: "🐴",
  panda: "🐼",
  koala: "🐨",
  kangaroo: "🦘",
  giraffe: "🦒",
  zebra: "🦓",
  deer: "🦌",
  squirrel: "🐿️",
  hedgehog: "🦔",
  otter: "🦦",
  duck: "🦆",

  // Chinese animals (same emojis)
  猫: "🐱",
  狗: "🐶",
  老鹰: "🦅",
  猫头鹰: "🦉",
  狮子: "🦁",
  老虎: "🐅",
  狼: "🐺",
  海豚: "🐬",
  大象: "🐘",
  狐狸: "🦊",
  兔子: "🐰",
  熊: "🐻",
  猴子: "🐵",
  企鹅: "🐧",
  乌龟: "🐢",
  蝴蝶: "🦋",
  蜜蜂: "🐝",
  章鱼: "🐙",
  鲨鱼: "🦈",
  马: "🐴",
  熊猫: "🐼",
  考拉: "🐨",
  袋鼠: "🦘",
  长颈鹿: "🦒",
  斑马: "🦓",
  鹿: "🦌",
  松鼠: "🐿️",
  刺猬: "🦔",
  水獭: "🦦",
  鸭子: "🦆",
};

// Multilingual animal configuration
export const ANIMAL_CONFIG = {
  "zh-cn": {
    animals: ANIMALS_ZH,
    animalDescribe: "一个最能代表用户特征的动物",
    animalReasonDescribe:
      "选择这个动物的简要原因说明，要基于用户的行为模式和特征进行分析",
  },
  en: {
    animals: ANIMALS_EN,
    animalDescribe: "An animal that best represents the user's characteristics",
    animalReasonDescribe:
      "A brief explanation of why this animal was chosen, based on behavioral patterns and characteristics",
  },
} as const;

// Helper function to get animal emoji
export function getAnimalEmoji(animal: string): string {
  return ANIMAL_EMOJIS[animal.toLowerCase()] || "🐾";
}
