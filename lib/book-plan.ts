export type BookPlan = 'free' | 'premium' | 'plus';

export const BOOK_PLAN_OPTIONS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    description: 'Unlimited text memories — free forever',
    features: ['Unlimited text memories', 'Guided writing prompts', 'One memory book'],
    notFeatures: ['Photos & audio', 'Printed books'],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '$50',
    description: 'Lifetime access — 5GB photo & audio storage',
    features: ['Everything in Free', '5GB photo & audio storage', 'Printed books from $99', 'Family collaboration'],
    notFeatures: [],
  },
  {
    id: 'plus',
    label: 'Plus',
    price: '$100',
    description: 'Lifetime access — 15GB photo & audio storage',
    features: ['Everything in Premium', '15GB photo & audio storage', 'Priority support'],
    notFeatures: [],
  },
] as const satisfies ReadonlyArray<{
  id: BookPlan;
  label: string;
  price: string;
  description: string;
  features: readonly string[];
  notFeatures: readonly string[];
}>;

export function parseBookPlanInput(value: unknown): BookPlan | null {
  if (typeof value !== 'string') {
    return null;
  }

  switch (value.trim().toLowerCase()) {
    case 'free':
      return 'free';
    case 'premium':
    case 'pro':
    case '5gb':
      return 'premium';
    case 'plus':
    case '15gb':
      return 'plus';
    default:
      return null;
  }
}

export function normalizeBookPlan(plan: unknown, storageTier?: unknown): BookPlan {
  return parseBookPlanInput(plan) ?? parseBookPlanInput(storageTier) ?? 'free';
}

export function planToStorageTier(plan: BookPlan): 'free' | '5gb' | '15gb' {
  switch (plan) {
    case 'premium':
      return '5gb';
    case 'plus':
      return '15gb';
    default:
      return 'free';
  }
}

export function getBookPlanLabel(plan: unknown, storageTier?: unknown): string {
  switch (normalizeBookPlan(plan, storageTier)) {
    case 'premium':
      return 'Premium';
    case 'plus':
      return 'Plus';
    default:
      return 'Free';
  }
}
