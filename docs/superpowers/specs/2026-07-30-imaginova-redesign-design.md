# Imaginova Redesign — Design Spec

## Product Positioning

**Tagline**: Imaginova — AI Visual Studio

A unified AI visual creation platform covering five vertical studios. Positioned as a brand/product visual asset generator, not a generic AI tool.

**Target users**: Chinese and overseas markets. Fashion brands, e-commerce sellers, game developers, content creators.

## Studio Structure

| Studio | English | Chinese | Features |
|--------|---------|---------|----------|
| 1 | Product Photography | 产品摄影 | Product posters, ad visuals, product photography (images only) |
| 2 | Fashion Studio | 时尚工作室 | Model try-on, age transform, gender swap (portrait processing) |
| 3 | Game Assets | 游戏资产 | Character art, game sprites, concept designs |
| 4 | Style Transfer | 风格转换 | Artistic style transfer on uploaded photos |
| 5 | Free Creation | 自由创作 | Text-to-image, text-to-video, keyframe animation, all other tools |

## Homepage Structure

### Hero Section
- Full-viewport hero with **auto-playing carousel** (5 slides, one per studio)
- Each slide: one hero-grade large image representing the studio + studio name overlaid
- Auto-play with manual dot/pagination navigation
- Centered text overlay: "Imaginova" badge + "AI Visual Studio" tagline
- CTA: "Start Creating" / "See Examples"

### Studio Selection Section
- 5 studio cards in a row (responsive grid)
- Each card: icon + name + short description
- Click → navigates to `/create?mode=<studio>`

### Showcase Gallery
- Full-width image grid (asymmetric, magazine-style)
- 4-5 large example images from different studios
- Hover: subtle scale-up

### How It Works
- 3 steps: Choose Studio → Upload & Describe → Download & Use

### Examples Section
- 3-column cards showing prompt examples per studio

### Final CTA
- "Ready to create professional visuals?"

## Create Page Structure

### Studio Switcher
- 5-button grid at top: Product Photography | Fashion Studio | Game Assets | Style Transfer | Free Creation
- Active studio highlighted in white (on dark) / black (on light)
- Switches content area below

### Per-Studio Content

**Product Photography**
- Image tab: text-to-image + image-to-image (product focus)
- Prompt placeholder: "Product on white background, minimalist, studio lighting..."
- Link to Campaign page (`/create/campaign`)
- No video tab

**Fashion Studio**
- Model Try-On form (person photo + garment photo)
- Below: quick access to Age Transform and Gender Swap as sub-modes

**Game Assets**
- Style preset selector (Fantasy, Cyberpunk, Pixel Art, Anime, RPG, Sci-Fi)
- Text prompt → image generation with style prefix

**Style Transfer**
- Reuse existing StyleTransferForm component

**Free Creation**
- Tab bar: Text-to-Image | Text-to-Video | Style Transfer | Gender Swap | Age Transform
- Text-to-Image/Video: full parameter controls (size, resolution, duration, fps, keyframes)

## Color System

### Dark Mode (default)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#000000` | Page background |
| `--surface` | `#1A1A1A` | Cards, panels, inputs |
| `--surface-elevated` | `#2A2A2A` | Modals, dropdowns |
| `--text-primary` | `#F5F5F5` | Body, headings |
| `--text-secondary` | `#A1A1AA` | Labels, metadata |
| `--text-muted` | `#52525B` | Placeholder, disabled |
| `--border` | `#27272A` | Dividers, outlines |
| `--accent` | `#FFFFFF` | CTAs, active states, key interactions |

### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F5F5F5` | Cards, panels, inputs |
| `--surface-elevated` | `#FAFAFA` | Modals, dropdowns |
| `--text-primary` | `#18181B` | Body, headings |
| `--text-secondary` | `#71717A` | Labels, metadata |
| `--text-muted` | `#D4D4D8` | Placeholder, disabled |
| `--border` | `#E4E4E7` | Dividers, outlines |
| `--accent` | `#18181B` | CTAs, active states, key interactions |

**Emphasis strategy**: No chromatic accent color. Key actions use pure white (dark) / pure black (light) against gray surroundings. Hierarchy is communicated through weight, size, and grayscale contrast.

## Typography
- Retain existing font stack (Inter/system sans-serif)
- Tight tracking for headings (-0.5px to -1px letter-spacing)
- Uppercase labels with wider letter-spacing for navigational cues

## Visual Principles
- **Content-first**: UI recedes; images are the primary visual element
- **Zero decorative gradients**: No gradient backgrounds unless inside a generated image
- **Minimal shadows**: Use surface color elevation instead of box-shadows
- **Generous spacing**: Large vertical gaps between sections for breathing room
- **Subtle borders**: `1px solid #27272A` (dark) barely visible containment

## Implementation Priority
1. CSS variable color swap (globals.css) — no UI change, just token replacement
2. Homepage hero carousel
3. Create page studio switcher + 5 studio modes
4. Dashboard minor polish
- Pricing: unchanged

## Future Considerations
- Product Hunt launch after design stabilizes
- Marketing site with case studies
- Analytics integration
