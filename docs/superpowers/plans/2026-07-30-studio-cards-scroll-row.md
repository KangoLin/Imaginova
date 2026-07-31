# Studio Cards Horizontal Scroll Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-studio cards grid on the homepage with a horizontal scrollable row.

**Architecture:** Single file change to `home-content.tsx` — replace the grid container and card sizing with snap-scroll layout. No new components, no CSS changes, no locale changes.

**Tech Stack:** Tailwind CSS 4 utility classes (snap, overflow, flex)

## Global Constraints

- No new dependencies
- Must work on ≤375px viewport
- Touch-friendly: `scroll-smooth` + `snap-x`

---

### Task 1: Replace Studio Cards Grid with Horizontal Scroll Row

**Files:**
- Modify: `src/components/home-content.tsx` (lines 167-191)

- [ ] Replace the grid container `<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">` with a horizontal scroll container:

```tsx
<div className="relative max-w-4xl mx-auto">
  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-6 px-6" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
```

- [ ] Update each card: remove grid-related classes, add `snap-start shrink-0` and responsive width:

```tsx
<div
  key={card.id}
  onClick={() => {
    if (user) window.location.href = `/create?mode=${card.id}`;
    else window.location.href = "/register";
  }}
  className="group relative rounded-[14px] bg-card border border-border/60 p-5 text-center cursor-pointer transition-all duration-300 hover:border-foreground/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 shrink-0 snap-start w-[70vw] sm:w-[220px] lg:w-[240px]"
  style={{ animationDelay: `${i * 0.06}s` }}
>
```

- [ ] Add a right-side fade overlay for scroll hint (insert after the flex container closes, inside the `relative max-w-4xl mx-auto` div):

```tsx
  </div>
  <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none sm:hidden" />
</div>
```

- [ ] Remove `max-w-4xl mx-auto` from the outer wrapper (it's now on the container). The section wrapper stays `container-narrow px-6 relative`.

- [ ] Ensure `justify-center` behavior on desktop when there is room: add an `lg:justify-center` class to the flex container only if 5 cards would fit. Since each card is 240px + 12px gap = ~1260px for 5, and `max-w-4xl` = 896px, cards won't all fit — so no `justify-center` needed. The scroll row will naturally overflow.

- [ ] Verify: `npm run lint` passes

- [ ] Verify: `npm run build` passes
