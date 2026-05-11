'use client';

import { useState, useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal: animate each item in as it enters the viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    container.querySelectorAll('.faq-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`space-y-3 ${className}`}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={[
              'reveal rounded-2xl border overflow-hidden transition-all duration-300',
              isOpen
                ? 'bg-[var(--bronze-04)] border-[var(--bronze-35)] shadow-[0_4px_20px_rgba(212,163,115,0.10),inset_0_0_0_1px_rgba(212,163,115,0.06)]'
                : 'bg-[var(--card)] border-[var(--bronze-15)] shadow-[0_1px_6px_rgba(212,163,115,0.04)]',
            ].join(' ')}
          >
            {/* Question — clickable header */}
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group min-h-[44px] cursor-pointer"
            >
              <span
                className="text-base font-medium transition-colors duration-200"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {item.q}
              </span>
              {/* Animated chevron — rotates when open */}
              <span
                className={[
                  'shrink-0 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110',
                  isOpen ? 'bg-[var(--bronze-18)]' : 'bg-[var(--bronze-08)]',
                ].join(' ')}
                style={{
                  width: 44,
                  height: 44,
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
                  style={{ borderTop: '1px solid var(--bronze-08)' }}
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