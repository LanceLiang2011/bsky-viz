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

// Import animal images for better performance and optimization
import BearImg from "@/assets/animals/Bear.png";
import CatImg from "@/assets/animals/Cat.png";
import CowImg from "@/assets/animals/Cow.png";
import DeerImg from "@/assets/animals/Deer.png";
import DogImg from "@/assets/animals/Dog.png";
import DuckImg from "@/assets/animals/Duck.png";
import FishImg from "@/assets/animals/Fish.png";
import GiraffeImg from "@/assets/animals/Giraffe .png"; // Note: space in filename
import HamsterImg from "@/assets/animals/Hamster.png";
import HorseImg from "@/assets/animals/Horse.png";
import LionImg from "@/assets/animals/Lion.png";
import OwlImg from "@/assets/animals/Owl.png";
import PenguinImg from "@/assets/animals/Penguin.png";
import RabbitImg from "@/assets/animals/Rabbit.png";
import SheepImg from "@/assets/animals/Sheep.png";
import WolfImg from "@/assets/animals/Wolf.png";

// Type for imported images
type ImageImport = typeof BearImg;

// Animal image mapping - optimized imports for better performance (16 animals)
export const ANIMAL_IMAGES: Record<string, ImageImport> = {
  // English animals
  bear: BearImg,
  cat: CatImg,
  cow: CowImg,
  deer: DeerImg,
  dog: DogImg,
  duck: DuckImg,
  fish: FishImg,
  giraffe: GiraffeImg,
  hamster: HamsterImg,
  horse: HorseImg,
  lion: LionImg,
  owl: OwlImg,
  penguin: PenguinImg,
  rabbit: RabbitImg,
  sheep: SheepImg,
  wolf: WolfImg,

  // Chinese animals (same images)
  熊: BearImg,
  猫: CatImg,
  奶牛: CowImg,
  鹿: DeerImg,
  狗: DogImg,
  鸭子: DuckImg,
  鱼: FishImg,
  长颈鹿: GiraffeImg,
  仓鼠: HamsterImg,
  马: HorseImg,
  狮子: LionImg,
  猫头鹰: OwlImg,
  企鹅: PenguinImg,
  兔子: RabbitImg,
  羊: SheepImg,
  狼: WolfImg,
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

// Helper function to get animal image (now returns imported image object)
export function getAnimalImage(animal: string): ImageImport {
  const image = ANIMAL_IMAGES[animal] || ANIMAL_IMAGES[animal.toLowerCase()];
  return image || CatImg; // fallback to cat image
}
