<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quick Start

```bash
npm run dev        # dev server (Turbopack) → http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm test           # Jest unit tests
npm run test:e2e   # Playwright E2E
```

**Build quirk**: Docker build uses `--webpack` flag (Turbopack has a `req.json()` bug in Docker). Local dev always uses Turbopack.

**Pre-commit**: `husky` → `lint-staged` auto-runs `eslint --fix` on staged `*.{js,jsx,ts,tsx,mjs}` files.

## Project Layout

```
src/
  lib/            — Backend logic (db, auth, image, video, mail, stripe, api-client)
  proxy.ts        — Next.js middleware (route protection, auth redirect)
  components/     — UI + feature components
    ui/           — shadcn/ui primitives (Button, Card, Dialog, etc.)
  app/
    (dashboard)/  — Route group: create, dashboard (layout with Navbar variant="app")
    (detail)/     — Route group: image/[id], video/[id], credits, settings (layout with Navbar variant="detail")
    admin/        — Admin panel (separate AdminNavbar)
    api/          — All API routes
  locales/        — en.json / zh.json (i18n via LocaleProvider)
agnes-pool/       — Separate AI proxy service (FastAPI + Vue/Vite frontend)
```

**Path alias**: `@/` → `src/` (configured in tsconfig.json and jest.config.ts).

## Architecture

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS 4 + shadcn/ui (base-nova style) + tw-animate-css |
| Database | SQLite via `better-sqlite3` (WAL mode, file path from `DATABASE_PATH` env or `data.db`) |
| Auth | JWT (`jose` + `bcryptjs`), httpOnly cookie named `token`, 7-day expiry |
| AI API | Agnes AI (not OpenAI — uses `AI_API_BASE_URL` + `OPENAI_API_KEY` headers) |
| Payment | Stripe (API version hardcoded to `2026-06-24.dahlia` in `src/lib/stripe.ts`) |
| Email | nodemailer via QQ SMTP; dev fallback logs to console |
| i18n | Custom React Context + localStorage key `imaginova-locale`; use `t('key')` from `useLocale()` |

## Critical Technical Details

### Database (src/lib/db.ts)
- **Singleton**: `new Database(...)` at module scope — recreating will fail.
- **Migrations**: Schema is in `db.exec()` at module init. Column additions use `try/catch ALTER TABLE` (idempotent).
- **`nativeBinding`** path is hardcoded to `node_modules/better-sqlite3/build/Release/...` — necessary for Next.js bundle.
- **Tables**: `users`, `images`, `videos`, `credit_transactions`, `password_resets`, `verification_codes`, `user_tasks`, `api_usage`.

### Auth (src/lib/auth.ts)
- `AUTH_SECRET` env var is **required** at runtime (no fallback).
- Cookie: `{ httpOnly: true, secure: only if HTTPS, sameSite: "lax", path: "/", maxAge: 7 days }`.
- Middleware (`src/proxy.ts`): Matches all non-API/static paths. Protects paths starting with `/create`, `/dashboard`, `/credits`, `/settings`, `/image/`, `/video/`, `/admin`. Redirects to `/login?redirect=...`.

### API Routes
- **Middleware NOT applied to `/api/*`** — each API route does its own auth via `getSessionUser()`.
- `api-client.ts`: Client-side fetch wrapper with `credentials: "include"`. Auto-redirects to `/login` on 401 (skips if already on `/login`).
- The `request` helper in `image.ts`/`video.ts` uses `AbortController` with timeout + retries.

### AI Generation
- **Image**: `POST {AI_API_BASE}/v1/images/generations` with OpenAI-compatible schema.
- **Video**: `POST /v1/videos` to create, `GET /v1/videos/{task_id}` to poll. Response URL may be in `url`, `video_url`, `metadata.url`, or `result.url` fields (see `extractVideoUrl()` in `video.ts`).
- Supports image-to-image (`extra_body.image` array) and image-to-video.
- **SSE streaming**: `GET /api/video/[id]/stream` for real-time video progress. Frontend uses EventSource (not polling).

### Middleware (src/proxy.ts)
- Filters via `matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]`.
- Reads JWT from cookie directly (not using `getSessionUser()` — it's an edge function).

### i18n
- `locale-provider.tsx`: Context-based. Inline script in `layout.tsx` pre-sets `html.lang` from localStorage to prevent flash.
- Translation keys accessed via `t('key')`. All pages must use `t()`.
- Add new keys to **both** `en.json` and `zh.json`.

### Design System
- **Colors**: oklch values in CSS variables. Primary: purple (`oklch(0.5 0.22 280)`), Accent: teal (`oklch(0.55 0.2 200)`).
- **Dark mode**: Class-based (`.dark` class on `<html>`).
- **Radius**: Three-tier system — 8px (functional), 14px (modals/containers), 9999px (CTA pills).
- **Custom utilities** in `globals.css`: `text-gradient`, `glass`, `pill`, `card-elevated`, `animate-fade-in`, `animate-slide-up`, `animate-shimmer`.

### React Bits Components
Installed animation components: `Aurora`, `SplitText`, `BlurText`, `ShinyText`, `FadeContent`, `DotField`, `TiltedCard`, `SpotlightCard`. Import from `@/components/`.

## Commands & Conventions

### Testing
- **Unit tests**: `npm test` (Jest). Test files in `src/__tests__/**.test.{ts,tsx}`. Setup in `src/__tests__/setup.ts`.
- **E2E tests**: `npm run test:e2e` (Playwright). Tests in `e2e/`. Uses Chrome, auto-starts dev server.

### Verification order
`npm run lint` → `npm run build` → `npm test`

### Docker
```bash
docker compose up -d --build
docker compose logs -f
docker compose restart
```
`--no-cache` must be used for builds if `.next` cache is stale (cold start `req.json()` bug).

### Environment Variables (required)
| Var | Purpose |
|-----|---------|
| `AUTH_SECRET` | JWT signing key (32+ hex chars) |
| `OPENAI_API_KEY` | Agnes AI API key |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS` | Email (QQ SMTP) |
| `AI_API_BASE_URL` | Agnes AI base URL (default: `https://apihub.agnes-ai.com`) |
| `DATABASE_PATH` | SQLite file path (default: `data.db` in cwd) |
| `NEXT_PUBLIC_APP_URL` | Public site URL (for Stripe/cookie `secure`) |

### Deployment
- Docker `output: "standalone"` in next.config.ts.
- `serverExternalPackages: ["better-sqlite3"]` in next.config.ts — required for Docker build.
- Production server: Tencent Cloud (`43.161.245.49`), SSH username/password login.
- After `git pull`, use `docker compose up -d --build --no-cache` for clean builds.

### Important Constraints
- `as any` / `@ts-ignore` / `@ts-expect-error` — never use.
- No `module.exports` in pages — breaks HMR.
- All `min-h-screen` must be `min-h-dvh` (iOS Safari address bar fix).
- Transition properties: prefer specific CSS properties over `transition-all` (performance).
- `touch-action: manipulation` on `<html>` (300ms click delay fix).
- After every feature update, update `PROJECT_PLAN.md`.
- **Mobile adaptation**: Always test on ≤375px viewport. Avoid fixed widths; use `max-w-sm`/`max-w-md` for content containers. Use `overflow-x-auto` with snap points for scrollable rows. Touch targets must be ≥36px (ideally 44px). Use `overscroll-behavior: contain` on modals/sheets to prevent body scroll. Never use `hover:` as the only interaction indicator — always pair with `active:` or `aria-selected` for touch devices.
- **Animation budget**: Limit simultaneous animated properties to 2 per element. Prefer `transform` and `opacity` for animation (compositor-friendly). Avoid animating `width`, `height`, `top`, `left`, `box-shadow`, or `border-radius` on mobile. Use `will-change: transform` sparingly and only during active animations.
- **Touch interactions**: All draggable/resizable components must support both pointer and touch events. Use `touch-action: none` on interactive slider handles to prevent scroll interference. Avoid 300ms tap delay (already handled by `touch-action: manipulation` on `<html>`).
- **Image loading**: Always provide `width`/`height` on `<Image>` to prevent layout shift. Use CSS `aspect-ratio` as fallback for dynamic images. Show skeleton/shimmer placeholders while loading (class `animate-shimmer` with `bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30`).

## Developer Emails
- `1264867171@qq.com`
- `2633313990@qq.com`

## Deployment Rules
- **Local-first**: All development and updates are done locally first.
- **Ask before deploy**: After completing a major update, ask the user for explicit confirmation before deploying to the production server (Tencent Cloud `43.161.245.49`).
- **Never auto-deploy**: Do not push to production or run Docker compose on the server without user approval.
