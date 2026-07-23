# Vertical Domain UI Optimization

Written against: 94cddf6

## Design language

- Audited surface: 4 vertical domain forms (try-on, style-transfer, gender-swap, age-transform) + mode switcher bar on `/create`
- Design sources: `globals.css`, `button.tsx`, `dialog.tsx`, `locale-provider.tsx`, existing form patterns in `create/page.tsx`
- Documented decisions: Three-tier radius (8px functional, 14px modals, 9999px pills), oklch primary purple / accent teal, dark mode via `.dark` class
- Governing owners and consumers: `src/components/create/*.tsx` — each form is self-contained with duplicated upload zone markup

## Findings

### 1. Upload zone markup duplicated across 3 forms

| # | Form | Lines | Pattern |
|---|------|-------|---------|
| 1 | style-transfer-form | 123-143 | Inline drag-drop + hidden input |
| 2 | gender-swap-form | 83-89 | Inline drag-drop + hidden input |
| 3 | age-transform-form | 94-100 | Inline drag-drop + hidden input |
| 4 | try-on-form | 82-101 | Reuses `UploadZone` component (160-232) |

**Problem**: The drag-drop upload zone is defined inline in 3 of 4 forms, with nearly identical markup (~15 lines each). Only `try-on-form` uses the reusable `UploadZone` component. This creates maintenance duplication.

**Proposed change**: Extract the inline upload zone from one of the duplicate forms into a shared `ImageUploadZone` component (or reuse/extend `UploadZone`), then replace the inline markup in all 3 forms.

**Scope**: `style-transfer-form.tsx`, `gender-swap-form.tsx`, `age-transform-form.tsx`

### 2. Age option grid collapses on mobile

```jsx
<div className="grid grid-cols-5 gap-2">
```

**Problem**: `grid-cols-5` with `text-[10px]` labels and emoji icons creates extremely cramped touch targets on screens < 480px. The 5th column may overflow or force text truncation.

**Proposed change**: Use responsive grid: `grid-cols-3 sm:grid-cols-5 gap-2`. On mobile (3 columns), the options wrap to 2 rows (3 + 2), giving each button more breathing room.

**Scope**: `age-transform-form.tsx:105`

### 3. Result section lacks source comparison for transform tasks

All 4 forms show the generated result image without the original source image for comparison. For transformation tasks (gender, age, style), users need to compare before/after to evaluate quality. The try-on form is an exception where both source images are already shown during input.

**Proposed change**: In the result section of style-transfer, gender-swap, and age-transform forms, add the source preview image alongside the result in a side-by-side or stacked comparison layout.

**Scope**: `style-transfer-form.tsx`, `gender-swap-form.tsx`, `age-transform-form.tsx` — result section after line ~125

### 4. Mode switcher lacks visual hierarchy

All 5 mode buttons (`通用生成`, 虚拟试衣, 风格迁移, 性别互换, 年龄变换) use identical visual weight. The "通用生成" (general) mode is the default/fallback but has no visual distinction from the specialized scene modes.

**Proposed change**: Give the active mode a stronger visual indicator — e.g., a bottom accent border or pill-style active indicator. Optionally make "通用生成" slightly more prominent as the hub entry point.

**Scope**: `create/page.tsx:213-261` — mode switcher button group

## Improve first

Finding #1 (Upload zone duplication) has the strongest evidence: identical markup at `style-transfer-form.tsx:123-143`, `gender-swap-form.tsx:83-89`, and `age-transform-form.tsx:94-100` differs only in translation keys. The `UploadZone` component at `try-on-form.tsx:160-232` already proves the abstraction is feasible and used. Refactoring to a shared component removes ~40 lines of duplication and ensures future changes apply to all forms.

---

## Plan: Extract shared ImageUploadZone component

### Evidence chain

- Surface: 4 vertical domain forms at `src/components/create/*.tsx`
- Problem: 3 of 4 forms duplicate identical drag-drop upload zone markup (15+ lines each)
- Design evidence: `UploadZone` at `try-on-form.tsx:160-232` proves the abstraction pattern
- Owner: `src/components/create/` — all 4 forms
- Scope and affected surfaces: `style-transfer-form.tsx:123-143`, `gender-swap-form.tsx:83-89`, `age-transform-form.tsx:94-100`
- Uncertainty: None

### Design decision

Create a shared `ImageUploadZone` component in `src/components/ui/image-upload-zone.tsx` that accepts the same props as the current inline pattern (`preview`, `onFile`, `onRemove`, drag state, label/hint text). Replace inline markup in the 3 duplicate forms.

### Reuse

- Pattern: existing `UploadZone` in `try-on-form.tsx` (lines 160-232)
- Exemplar: `try-on-form.tsx:82-101`

### Changes

1. **Create** `src/components/ui/image-upload-zone.tsx`
   - Accept: `preview, onFile, onRemove, label, hint, dragOver, onDragOver, inputRef, uploading?`
   - Render: same drop zone + preview toggle + hidden file input pattern
   - Export as named export

2. **Update** `style-transfer-form.tsx`
   - Import `ImageUploadZone`
   - Replace lines 102-144 with `<ImageUploadZone ... />`
   - Remove inline `fileInputRef`, drag state, upload zone markup

3. **Update** `gender-swap-form.tsx`
   - Import `ImageUploadZone`
   - Replace lines 87-89 with `<ImageUploadZone ... />`
   - Remove inline `fileInputRef`, drag state, upload zone markup

4. **Update** `age-transform-form.tsx`
   - Import `ImageUploadZone`
   - Replace lines 93-100 with `<ImageUploadZone ... />`
   - Remove inline `fileInputRef`, drag state, upload zone markup

5. **Optionally** migrate `try-on-form.tsx` to use the shared component instead of its local `UploadZone` (lower priority)

### Scope

- Inherit: `style-transfer-form.tsx`, `gender-swap-form.tsx`, `age-transform-form.tsx`
- Verify: `try-on-form.tsx` (existing `UploadZone` still works)
- Exclude: `create/page.tsx` (general upload zone has different behavior)

### Validation

- Product: All 3 forms accept image upload via drag-drop, file picker, and paste (Ctrl+V) — same behavior as before
- Interface: Test upload, replace image, remove image flows on each form
- System: Confirm all 3 forms now share one component; no duplicate patterns remain
- Repository: `npm run build` → compiled successfully

### Stop conditions

- Stop if existing `UploadZone` props don't cover all 3 forms' needs
