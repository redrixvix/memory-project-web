'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight scroll-reveal using Intersection Observer.
 * Elements with className="reveal" will animate in when they enter the viewport.
 * No Framer Motion needed — pure CSS + IntersectionObserver.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once visible, no need to keep observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    // Observe the element itself
    observer.observe(el);

    // Also observe any child elements with .reveal class
    const revealChildren = el.querySelectorAll('.reveal');
    revealChildren.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
