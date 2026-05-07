'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className = '' }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-2xl border overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: isOpen ? 'rgba(212,163,115,0.04)' : '#FDFCF5',
              borderColor: isOpen ? 'rgba(212,163,115,0.35)' : 'rgba(212,163,115,0.15)',
              boxShadow: isOpen
                ? '0 4px 20px rgba(212,163,115,0.10), inset 0 0 0 1px rgba(212,163,115,0.06)'
                : '0 1px 6px rgba(212,163,115,0.04)',
            }}
          >
            {/* Question — clickable header */}
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-label={item.q}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
            >
              <span
                className="text-base font-medium transition-colors duration-200"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {item.q}
              </span>
              {/* Animated chevron — rotates when open */}
              <span
                className="shrink-0 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: isOpen ? 'rgba(212,163,115,0.18)' : 'rgba(212,163,115,0.08)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ color: 'var(--bronze)', transition: 'transform 0.3s ease' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            {/* Answer — layout-reflow-free grid transition */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.35s ease-out',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div
                  className="px-6 pb-6"
                  style={{ borderTop: '1px solid rgba(212,163,115,0.08)' }}
                >
                  <p
                    className="pt-5 text-sm leading-relaxed"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
