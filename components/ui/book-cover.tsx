import { getDisplayBookTitle } from '@/lib/display-book-title';

interface BookCoverProps {
  title: string;
  description?: string | null;
  accentColor?: string;
  plan?: string;
  previewImageUrl?: string | null;
}

const THEMES = [
  {
    background: 'linear-gradient(160deg, #fff8ec 0%, #f6ead7 52%, #e6cfaa 100%)',
    shadow: 'rgba(166, 118, 61, 0.18)',
    line: 'rgba(130, 90, 46, 0.24)',
    foil: 'rgba(255, 248, 220, 0.82)',
    label: 'rgba(92, 58, 30, 0.72)',
  },
  {
    background: 'linear-gradient(160deg, #f7f4ea 0%, #ebe4d1 55%, #d8c9ab 100%)',
    shadow: 'rgba(122, 104, 71, 0.18)',
    line: 'rgba(99, 78, 51, 0.22)',
    foil: 'rgba(255, 250, 232, 0.78)',
    label: 'rgba(82, 67, 44, 0.72)',
  },
  {
    background: 'linear-gradient(160deg, #f8efe5 0%, #eddcc9 56%, #d8b99a 100%)',
    shadow: 'rgba(140, 96, 64, 0.18)',
    line: 'rgba(112, 72, 46, 0.22)',
    foil: 'rgba(255, 243, 227, 0.8)',
    label: 'rgba(97, 63, 40, 0.72)',
  },
  {
    background: 'linear-gradient(160deg, #f5f0e7 0%, #e7dece 55%, #cdb99b 100%)',
    shadow: 'rgba(107, 88, 62, 0.18)',
    line: 'rgba(92, 72, 46, 0.22)',
    foil: 'rgba(255, 248, 236, 0.8)',
    label: 'rgba(88, 68, 46, 0.72)',
  },
];

function hashString(value: string) {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function getCoverLabel(title: string) {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9']/g, ''))
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]} ${words[1]}`;
  }

  return words[0] || 'Memory Book';
}

function getCoverMicrocopy(description?: string | null) {
  if (!description?.trim()) return 'Collected with love';
  const clean = description.replace(/\s+/g, ' ').trim();
  return clean.length > 36 ? `${clean.slice(0, 33).trimEnd()}…` : clean;
}

export function BookCover({ title, description, accentColor = 'var(--bronze)', plan = 'free', previewImageUrl }: BookCoverProps) {
  const displayTitle = getDisplayBookTitle(title);
  const theme = THEMES[hashString(title) % THEMES.length];
  const coverLabel = getCoverLabel(displayTitle).toUpperCase();
  const initial = displayTitle.trim().charAt(0).toUpperCase() || 'M';
  const microcopy = getCoverMicrocopy(description);
  const isPremium = plan !== 'free';
  const hasPreviewImage = Boolean(previewImageUrl);

  return (
    <div
      aria-hidden="true"
      className="relative shrink-0 overflow-hidden rounded-[14px]"
      style={{
        marginTop: 4,
        width: 78,
        height: 104,
        background: theme.background,
        border: '1px solid rgba(255,255,255,0.72)',
        boxShadow: `3px 4px 16px rgba(43,43,43,0.10), 8px 12px 28px ${theme.shadow}, inset 0 0 0 0.75px rgba(255,255,255,0.75)`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 22% 18%, rgba(255,255,255,0.78), transparent 32%), radial-gradient(circle at 78% 20%, ${accentColor}14, transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.18), transparent 30%, rgba(255,255,255,0.06) 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: `linear-gradient(180deg, ${accentColor}, color-mix(in srgb, ${accentColor} 65%, #fff 35%))`,
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.35)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.32,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.52) 0.5px, transparent 0.5px)',
          backgroundSize: '6px 6px',
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="relative flex h-full flex-col px-3 pb-3 pt-3.5">
        <div
          className="mb-2 rounded-full px-2 py-1 text-[7px] font-semibold tracking-[0.18em]"
          style={{
            color: theme.label,
            backgroundColor: 'rgba(255,255,255,0.42)',
            border: '1px solid rgba(255,255,255,0.48)',
            alignSelf: 'flex-start',
            backdropFilter: 'blur(6px)',
          }}
        >
          {isPremium ? 'HEIRLOOM EDITION' : 'MEMORY JOURNAL'}
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[10px] px-2.5 py-2.5" style={{ backgroundColor: 'rgba(255,252,244,0.54)' }}>
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              width: 18,
              height: 18,
              borderRadius: 999,
              border: `1px solid ${theme.foil}`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.3)`,
            }}
          />
          {hasPreviewImage ? (
            <>
              <div className="absolute inset-x-2.5 top-2.5 bottom-[27px] overflow-hidden rounded-[8px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl ?? undefined}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(38,26,16,0.06) 52%, rgba(38,26,16,0.38) 100%)',
                  }}
                />
                <div className="absolute left-2 bottom-2 right-2">
                  <div className="rounded-[7px] px-1.5 py-1" style={{ backgroundColor: 'rgba(255,248,236,0.76)', backdropFilter: 'blur(8px)' }}>
                    <div className="text-[6.5px] font-semibold tracking-[0.18em] truncate" style={{ color: 'rgba(74,49,27,0.8)' }}>
                      {coverLabel}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-2.5 right-2.5 bottom-2 text-[6.5px] leading-[1.35]" style={{ color: 'rgba(90, 69, 45, 0.7)' }}>
                {microcopy}
              </div>
            </>
          ) : (
            <>
              <div
                className="text-[25px] leading-none"
                style={{
                  color: 'rgba(74, 49, 27, 0.82)',
                  fontFamily: 'var(--font-serif)',
                  textShadow: '0 1px 0 rgba(255,255,255,0.45)',
                }}
              >
                {initial}
              </div>
              <div className="mt-1.5 text-[8px] font-semibold tracking-[0.2em]" style={{ color: theme.label }}>
                {coverLabel}
              </div>
              <div className="mt-2 space-y-1.5">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    style={{
                      height: 1.5,
                      width: index === 0 ? '100%' : '82%',
                      backgroundColor: theme.line,
                      borderRadius: 999,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2.5 text-[7px] leading-[1.45]" style={{ color: 'rgba(90, 69, 45, 0.72)' }}>
                {microcopy}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
