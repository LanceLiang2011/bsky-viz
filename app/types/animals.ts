// Animal configuration with multilingual support - based on available image assets (16 animals)
export const ANIMALS_EN = [
  "bear",
  "cat",
  "cow",
  "deer",
  "dog",
  "duck",
  "fish",
  "giraffe",
  "hamster",
  "horse",
  "lion",
  "owl",
  "penguin",
  "rabbit",
  "sheep",
  "wolf",
] as const;

export const ANIMALS_ZH = [
  "熊",
  "猫",
  "奶牛",
  "鹿",
  "狗",
  "鸭子",
  "鱼",
  "长颈鹿",
  "仓鼠",
  "马",
  "狮子",
  "猫头鹰",
  "企鹅",
  "兔子",
  "羊",
  "狼",
] as const;

// Type definitions
export type AnimalEN = (typeof ANIMALS_EN)[number];
export type AnimalZH = (typeof ANIMALS_ZH)[number];
export type Animal = AnimalEN | AnimalZH;

// Animal image mapping - paths to PNG assets (16 animals)
export const ANIMAL_IMAGES: Record<string, string> = {
  // English animals
  bear: "/assets/animals/Bear.png",
  cat: "/assets/animals/Cat.png",
  cow: "/assets/animals/Cow.png",
  deer: "/assets/animals/Deer.png",
  dog: "/assets/animals/Dog.png",
  duck: "/assets/animals/Duck.png",
  fish: "/assets/animals/Fish.png",
  giraffe: "/assets/animals/Giraffe .png", // Note: space in filename
  hamster: "/assets/animals/Hamster.png",
  horse: "/assets/animals/Horse.png",
  lion: "/assets/animals/Lion.png",
  owl: "/assets/animals/Owl.png",
  penguin: "/assets/animals/Penguin.png",
  rabbit: "/assets/animals/Rabbit.png",
  sheep: "/assets/animals/Sheep.png",
  wolf: "/assets/animals/Wolf.png",

  // Chinese animals (same images)
  熊: "/assets/animals/Bear.png",
  猫: "/assets/animals/Cat.png",
  奶牛: "/assets/animals/Cow.png",
  鹿: "/assets/animals/Deer.png",
  狗: "/assets/animals/Dog.png",
  鸭子: "/assets/animals/Duck.png",
  鱼: "/assets/animals/Fish.png",
  长颈鹿: "/assets/animals/Giraffe .png",
  仓鼠: "/assets/animals/Hamster.png",
  马: "/assets/animals/Horse.png",
  狮子: "/assets/animals/Lion.png",
  猫头鹰: "/assets/animals/Owl.png",
  企鹅: "/assets/animals/Penguin.png",
  兔子: "/assets/animals/Rabbit.png",
  羊: "/assets/animals/Sheep.png",
  狼: "/assets/animals/Wolf.png",
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

// Helper function to get animal image path
export function getAnimalImage(animal: string): string {
  const imagePath =
    ANIMAL_IMAGES[animal] || ANIMAL_IMAGES[animal.toLowerCase()];
  return imagePath || "/assets/animals/Cat.png"; // fallback to cat
}
