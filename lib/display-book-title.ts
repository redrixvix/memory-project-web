export function getDisplayBookTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return 'Memory Book';

  const match = trimmed.match(/^(.*?)(?:\s+|[-–—•|:]\s*)(\d{10,})$/);
  if (!match) return trimmed;

  const base = match[1]?.trim();
  return base && /[A-Za-z]/.test(base) ? base : trimmed;
}

export function titleWasSanitized(title: string) {
  return getDisplayBookTitle(title) !== title.trim();
}
