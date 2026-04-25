export interface MemoryPromptGroup {
  category: string;
  prompts: string[];
}

const MEMORY_PROMPTS: MemoryPromptGroup[] = [
  {
    category: "Family & Roots",
    prompts: [
      "What do you remember about your grandparents?",
      "What's your favorite memory with your parents?",
      "Tell me about the house you grew up in.",
      "Describe a typical Sunday morning growing up.",
    ],
  },
  {
    category: "Life Moments",
    prompts: [
      "What was your wedding day like?",
      "Tell me about your first job.",
      "What was the best day of your life?",
      "Describe a holiday tradition you loved.",
    ],
  },
  {
    category: "Relationships",
    prompts: [
      "Tell me about your best friend growing up.",
      "What's a skill you're proud of learning?",
      "Describe a time you felt truly proud of yourself.",
    ],
  },
  {
    category: "Adventures",
    prompts: [
      "Tell me about a trip that changed your perspective.",
      "What's the most beautiful place you've ever seen?",
      "Describe a meal you'll never forget.",
    ],
  },
];

export function getMemoryPromptGroups(): MemoryPromptGroup[] {
  return MEMORY_PROMPTS.map((group) => ({
    category: group.category,
    prompts: [...group.prompts],
  }));
}

export function flattenMemoryPrompts(groups: MemoryPromptGroup[]): string[] {
  return groups.flatMap((group) => group.prompts);
}

export function isMemoryPromptGroups(value: unknown): value is MemoryPromptGroup[] {
  return Array.isArray(value) && value.every((group) => {
    if (!group || typeof group !== "object") {
      return false;
    }

    const maybeGroup = group as Partial<MemoryPromptGroup>;
    return typeof maybeGroup.category === "string"
      && Array.isArray(maybeGroup.prompts)
      && maybeGroup.prompts.every((prompt) => typeof prompt === "string");
  });
}
