# Vertical Domain UI — Comprehensive Redesign Proposal

## Current state (after 4 fixes)

All 4 fixes from `vertical-domain-ui-optimization.md` are implemented:
- **Fix 1**: `ImageUploadZone` shared component extracted and used by 3 forms
- **Fix 2**: Age grid responsive (`grid-cols-3 sm:grid-cols-5`)
- **Fix 3**: Source comparison in result section (Before/After side-by-side)
- **Fix 4**: Mode switcher has separator, horizontal scroll, `py-2` touch targets

## Remaining UX issues

1. **Page feels like 5 different apps glued together** — general image/video generation has a completely different form structure from the 4 vertical domains. When switching from general → vertical, the entire page layout changes jarringly.

2. **No visual preview of vertical domains before entering** — user must click each mode to discover what it does. No hint icons or descriptions.

3. **Each vertical form is a simple stacked card** — upload → options → generate → result. No visual hierarchy, no sense of progression.

4. **Result sits below the form** — user must scroll down to see generated image. No side-by-side comparison on desktop.

5. **Missing visual distinction between input and output** — both the upload zone and result section use same rounded card style.

## Proposed design

### Concept: Studio layout

A **two-zone layout** that separates input controls (left/upper) from output preview (right/lower), inspired by creative tools (Photoshop, Midjourney web, Canva).

```
┌──────────────────────────────────────────────────┐
│ [通用生成] │ [虚拟试衣 ▸] [风格迁移 ▸] [性别互换 ▸] [年龄变换 ▸] │  ← Icon tabs
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌───────────┐  ┌────────────────────────────┐  │
│   │  Input     │  │  Preview / Result          │  │
│   │  Controls  │  │                            │  │
│   │           │  │   [upload zone or           │  │
│   │  [upload] │  │    generated image]         │  │
│   │           │  │                            │  │
│   │  [options] │  │                            │  │
│   │           │  │                            │  │
│   │  [generate]│  │                            │  │
│   └───────────┘  └────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Tab bar redesign

Replace the text-only segmented control with **icon + label tabs**:

| Mode | Icon | Label |
|------|------|-------|
| General | `Sparkles` | 通用生成 |
| Try-on | `Shirt` | 虚拟试衣 |
| Style Transfer | `Paintbrush` | 风格迁移 |
| Gender Swap | `VenusAndMars` | 性别互换 |
| Age Transform | `UserCog` | 年龄变换 |

- Active tab: filled pill with primary color + shadow
- Inactive: transparent with muted text
- On mobile: horizontally scrollable with snap points

### Studio layout (desktop: ≥768px)

The page splits into two equal-height columns:

**Left column (Input panel):**
- Consistent card header with mode icon + title + short description
- Image upload zone (the shared `ImageUploadZone` component)
- Mode-specific options (age grid, gender choice, style description, etc.)
- Generate button (full width, sticky bottom)
- Cost indicator

**Right column (Preview panel):**
- **Before generation**: Shows a translucent drop zone hint or mode showcase graphic
- **After generation**: Shows result image with overlay toolbar (download, regenerate, copy)
- On transform modes: Side-by-side source/result with animated slider ("before/after" scrub control)

### Mobile layout (<768px)

Single column, stacked vertically:
1. Input controls (scrollable)
2. Generate button (sticky bottom on scroll)
3. Result appears below after generation

### Before/After scrub slider

For style-transfer, gender-swap, age-transform result sections:

```
┌─────────────────────┐
│  ← Before │ After → │  ← Drag handle
│                     │
│   [image with       │
│    sliding reveal]  │
│                     │
└─────────────────────┘
```

- Implemented as two overlapping `<Image>` elements clipped via CSS `clip-path`
- Mouse/touch drag to reveal comparison
- Auto-animate on first load

### Progressive disclosure for vertical modes

When a vertical mode is first selected, show a brief **onboarding overlay** before the form:
- Mode name + icon (large)
- 1-sentence description
- Example result image (small thumbnail)
- "开始使用" CTA button → reveals the full form

This replaces the current instant form swap, giving users context for what each mode does.

### General mode remains unchanged

The "通用生成" mode keeps its current layout (prompt + options + image/video tabs). Only the vertical domains get the new studio layout.

---

## Implementation plan

### Phase 1: Tab bar upgrade (2h)
1. Import mode icons from `lucide-react` (`Sparkles`, `Shirt`, `Paintbrush`, `VenusAndMars`, `UserCog`)
2. Replace `<button>` group with a proper scrollable tab bar
3. Active state: pill with `bg-primary text-primary-foreground shadow-sm`
4. Add `aria-current="page"` for accessibility

### Phase 2: Studio layout wrapper (4h)
1. Create `src/components/create/studio-layout.tsx` — two-column responsive wrapper
2. Props: `left: ReactNode`, `right: ReactNode`, `mode: SceneMode`
3. Desktop: `grid grid-cols-2 gap-6`, left panel sticky
4. Mobile: single column stack

### Phase 3: Before/After scrub component (2h)
1. Create `src/components/create/before-after-slider.tsx`
2. Two `<Image>` elements with `clip-path: inset(0 X% 0 0)` on result
3. Drag handle in center with grab cursor
4. Touch + mouse event handlers

### Phase 4: Mode onboarding overlays (2h)
1. Create `src/components/create/mode-onboarding.tsx`
2. Fetched from local data (icon, title, description, example thumbnail per mode)
3. Shown once per session (`sessionStorage` flag)
4. Animated entrance/exit

### Phase 5: Integrate into create page (3h)
1. Wire `studio-layout` into each vertical mode branch
2. General mode keeps existing layout (no studio wrapper)
3. Test all 4 modes on desktop + mobile
4. Verify paste support works in new layout

---

## Design tokens to use

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-[14px]` | 14px | Card containers |
| `rounded-xl` | 12px | Tab bar, buttons |
| `rounded-lg` | 8px | Upload zone, option buttons |
| `bg-card` | card bg | Panel backgrounds |
| `border-border/60` | border | Panel borders |
| `shadow-sm` | shadow | Active tabs, panels |
| `bg-primary/10` | tinted primary | Active/highlight states |
| `text-xs` | 12px | Labels, descriptions |
| `text-sm` | 14px | Body text |

---

## Success criteria

1. Desktop: Two-column layout renders correctly at ≥768px
2. Mobile: Single-column layout renders correctly at <768px
3. Before/after slider works: drag handle reveals/hides result
4. Tab icons render on all 5 modes
5. Onboarding overlay shows once per session per mode
6. All existing functionality preserved: upload, paste, generate, result display, download, regenerate
7. `npm run build` passes
