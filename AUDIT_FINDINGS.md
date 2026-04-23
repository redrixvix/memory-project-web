# Memory Project — Audit & Findings
**Date:** 2026-04-23 | **Runtime:** ~2h | **Model:** MiniMax-M2.7

---

## ✅ Changes Made

### SEO (Completed)

**layout.tsx metadata improvements:**
- Strengthened default title: "Write Your Family's Story. Print It to Last." — direct, emotional, action-oriented
- Rewrote meta description: leads with "Capture the stories that matter most" (emotional hook), second sentence clearly states free/paid value proposition
- Added `max-image-preview: 'large'` for Google Bot
- Added `maximum-scale: 5` to viewport for mobile tolerance
- Added `twitter:creator` handle
- Keywords now include "family memory book" (higher-intent), "hardcover book", "family history book"

**pricing/page.tsx metadata:**
- Added `title: { default + template }` pattern for consistent `<title>` across all pages
- Added `openGraph` with pricing-specific description and URL
- Keywords added for search-intent terms like "memory book pricing", "printed memory book cost"

**Other SEO hygiene:**
- FAQ page metadata already solid (title + description with good keyword coverage)
- Privacy/Terms metadata already using the right plain title format
- Sitemap includes all key public pages with appropriate priority/changeFrequency

### Copy (Completed)
- Homepage hero subhead: changed "printed books from $99" → "beautifully printed hardcover books from $99" — adds tactile quality descriptor

### Trust Signals (Completed)
- Trust bar redesigned: removed duplicate star rating, integrated stars + "Loved by families" inline with the three trust bullets for a cleaner, more compact presentation

### Structural (Completed)
- Removed stray blank line in hero `<h1>` section

---

## 🔍 Full Audit Findings

### What's Already Good
- **Color palette:** Warm, cohesive — cornsilk/beige/tea-green/bronze/papaya/charcoal. Feels premium and intentional
- **Typography:** Lora serif for headings + body, Inter for UI labels. Strong hierarchy, `clamp()`-based responsive sizes
- **Animation system:** Fade-up, float, breathe, grain textures — tasteful, not excessive. IntersectionObserver scroll-reveal working well
- **Component design:** Cards, buttons, inputs all consistently styled with the warm palette
- **Trust signals:** No-pressure copy throughout ("Free to start", "No credit card required", "Cancel anytime")
- **SEO schema:** FAQPage, WebSite, Organization, WebApplication JSON-LD already injected on homepage, pricing, and FAQ pages. Breadcrumb schema on inner pages
- **Accessibility:** Skip-to-content link, `aria-label` on all CTAs, focus-visible ring in bronze, focus trap in lightbox, `prefers-reduced-motion` support
- **Mobile nav:** Glassmorphism drawer working with overlay
- **Lightbox:** Full keyboard support (ESC close, focus trap), backdrop blur, scale-in animation
- **Auth pages:** Split-panel layout (editorial left, form right) on login + signup — excellent
- **Dashboard empty state:** Elegant CSS book stack illustration, clear CTA
- **Book detail:** Photos render with lightbox, memory accent colors rotate through palette
- **FAQ page:** Clean accordion with `<details>/<summary>`, proper semantic HTML
- **Pricing:** Featured card with papaya background + badge overlap — visually correct hierarchy
- **sitemap.ts:** Complete, with dashboard intentionally excluded
- **robots.ts:** Properly configured
- **OG image:** Present at `/og-image.png`

### Issues to Address

#### Critical
1. **No real product photography anywhere** — Every page uses CSS-only book mockups. A premium memory book product needs at least one real or high-quality generated photo of an actual printed book. The CSS book illustrations are well-crafted but lack the tactility and authenticity that photography provides.

#### High Priority
2. **Hero CSS book illustration is technically impressive but emotionally flat** — The code-drawn book with spine ribs, page stack, and content lines is well-executed for CSS, but it's still a drawing. In the context of "premium product site," it reads as "we couldn't afford photography." One generated or stock photo would solve this.
3. **No testimonials with verifiable attribution** — Current testimonials use initials + city only. Anonymous quotes with no way to verify authenticity reduce trust. Consider either: (a) getting real testimonials, (b) being transparent that they're sample quotes, or (c) replacing with a different social proof format (e.g., media mentions, stat counters)
4. **No press/trust logos** — StoryWorth prominently displays "As seen in: The New York Times, Oprah Daily." Memory Project has zero third-party credibility markers. If no real press coverage exists, this could be addressed with: user count, books printed count, or a clear "Here's how we compare to StoryWorth" editorial section.
5. **Pricing page /faq page are fully static** — No OpenGraph per-page customization yet (pricing now has it, but FAQ and signup don't). These pages should have their own `openGraph` metadata.

#### Medium Priority
6. **`/signup` page missing its own metadata** — No `export const metadata` in signup/page.tsx. It's a high-priority conversion page that should have its own title/description for SEO.
7. **`/dashboard` missing metadata** — Even though it's auth-protected, adding `metadata` for completeness helps maintainability and avoids template warnings.
8. **FAQ JSON-LD appears twice** — Both `seo-schema.tsx` (homepage) AND `faq/page.tsx` output identical FAQPage schema. Homepage should output `WebSite` schema only; FAQPage schema should live exclusively on `/faq`.
9. **No `robots.txt` customization** — The auto-generated one is fine, but adding an `Allow: /` for assets and explicit disallow patterns would be more intentional.
10. **No `authors` JSON-LD** — The Organization schema exists but there's no Person/Author schema for the content creators.

#### Lower Priority
11. **Dashboard books have no visual cover identity** — Color-coded left stripe helps but a per-book "cover" color/texture block (even a gradient) would add visual richness. Consider showing a tiny photo mosaic if the book has photos.
12. **"How It Works" step layout breaks on mobile** — The horizontal rule separator between steps 1 and 2 doesn't render on mobile (border-r hidden below md). The three-step layout needs mobile-specific treatment.
13. **Dashboard has no sort/filter for books** — Users with many books need a way to find specific ones. Even a simple alphabetical sort or search would help.
14. **Book detail memory cards have no drag handles** — The STRATEGIC_AUDIT.md correctly identified this as a UX gap. The memory reordering feature is noted but not implemented.
15. **No loading skeleton for book detail page** — While the auth loading skeleton exists for dashboard, book detail has no skeleton state for when photos/memories are fetching.
16. **Signup page hero testimonial is anonymous** — The testimonial on the signup editorial panel uses "Diane M., Portland OR ★★★★★" which has the same verifiability issue as homepage testimonials.
17. **`prefers-reduced-motion` disables the hero float animation** — The `hero-ambient::after` breathe animation should also be disabled via `prefers-reduced-motion`, but it currently only has the `animate-float` override in the CSS. Minor but noted.
18. **No structured data for Product/Book** — For a memory book printing service, a Product schema with price/availability would add rich results in search.

### Competitive Context (from research)

| Competitor | Strengths | Weaknesses | Pricing Signal |
|---|---|---|---|
| StoryWorth | Press mentions, weekly prompts, editorial photography | $99/yr subscription + printing (confusing) | $59-199/yr + $29-79 printing |
| Remento | Video-first, no-password, elderly-friendly, Shark Tank credibility | Audio-only, no text memories | $99/yr + $29 printing |
| Day One | Massive user count (10M+), polished journal UX | Journal app, not a print product | $35/yr |
| My Life in a Book | Professional memoir service, premium positioning | Very expensive, full-service | $500-2000+ |

**Positioning opportunity:** StoryWorth bundles subscription + print in a confusing way. Memory Project's "free forever, pay only for printing" model is actually clearer and more honest. This should be front and center in the value prop, not buried in pricing copy.

### Summary Scores

| Area | Score | Notes |
|---|---|---|
| SEO | 8/10 | Strong structure, missing per-page OG on inner pages |
| Copy | 8/10 | Warm, clear, no "digital" framing — minor copy tweaks made |
| Design | 8/10 | Cohesive palette, strong typography — needs real photography |
| UX | 7/10 | Solid core flows, gaps in dashboard filtering/reordering |
| Performance | 9/10 | Build clean, static pages, no obvious bloat |
| Accessibility | 8/10 | Good focus states, skip link, keyboard nav — ARIA labels complete |
| Trust Signals | 6/10 | No press logos, anonymous testimonials, no stat counters |
| Mobile | 8/10 | Good responsive behavior, nav drawer works |
| Conversion | 7/10 | Clean CTAs, trust bar improved — hero could be stronger |

**Overall: 7.5/10** — Solid foundation with clear visual identity. Main gaps are real photography, verifiable social proof, and a few SEO per-page metadata gaps. The product itself is well-designed; the marketing site just needs credibility markers to match the quality of the UI.

---

## 🎯 Recommended Next Sprint

1. **Image strategy** — Source or generate one high-quality printed book photo. The CSS book mockup is impressive but a real product photo would dramatically increase emotional resonance and trust.
2. **Social proof upgrade** — Add a stat counter (books created, families served) or media mention section. Even a small "Here's what makes us different from StoryWorth" comparison block would add credibility.
3. **SEO metadata parity** — Add `export const metadata` to `/signup` and `/dashboard`, fix duplicate FAQPage schema, consider Product/Offer schema for rich results.
4. **Dashboard polish** — Book cover color blocks, sort/filter, memory card drag handles for reordering.
5. **Mobile "How It Works" fix** — Recalculate the step layout for mobile breakpoints.
