# Imaginova — AI 图像与视频生成平台

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | **Next.js 16** (App Router, Turbopack) |
| 样式 | **Tailwind CSS 4 + shadcn/ui** |
| 设计引擎 | **UI UX Pro Max** (Exaggerated Minimalism) |
| 数据库 | **SQLite** (`better-sqlite3`) |
| 认证 | **JWT** (`jose` + `bcryptjs`) |
| 图像生成 | Agnes AI (`agnes-image-2.1-flash`) |
| 视频生成 | Agnes AI (`agnes-video-v2.0`) |

## 已实现功能 ✓

- ✅ **Step 1 — 骨架**：项目初始化、数据库建表（users/images/videos）、全局样式
- ✅ **Step 2 — 用户系统**：注册/登录 API、JWT cookie、注册/登录页面
- ✅ **Step 3 — 图片生成**：文生图（text-to-image）
- ✅ **Step 4 — 视频生成**：文生视频（text-to-video，异步轮询）
- ✅ **Step 5 — 用户中心**：Dashboard（历史记录、积分显示）
- ✅ **P1 — 图生图 (img2img)**：图片上传、FormData 处理、`extra_body.image[]` 参数传递
- ✅ **P2 — 图生视频 (Image-to-Video)**：图片上传、`image` 顶层参数传递
- ✅ **Agnes AI API 迁移**：视频端点从 legacy `/v1/video/generations` 迁移到 `/v1/videos`；URL 提取修复（`body.url`）
- ✅ **代理/流式优化**：proxy route 移除多余鉴权头、支持流式传输（`ReadableStream`）
- ✅ **P3 — 作品详情页**：图片详情页 `/image/[id]`、视频详情页 `/video/[id]`、Dashboard 点击跳转
- ✅ **P4 — 积分系统**：签到（日限 3s 提示）、Mock 充值、交易流水、充值页面 `/credits`
- ✅ **P5 — 用户设置**：修改密码 API（验证旧密码）、设置页面 `/settings`
- ✅ **P6 — UI/UX 完善**：暗色模式（CSS 变量 + class-based 切换）、骨架屏（skeleton 组件）、Toast 通知系统、错误边界、动画 & 响应式优化

## 已知问题
- ⚠️ Video CDN 速度较慢（`platform-outputs.agnes-ai.space`），目前直接使用 CDN 直连绕过服务端中转
- ⚠️ 图片/视频需要支持 URL 下载/分享功能（简单实现即可）

## UI 重构 v1 (2026-07-09) — shadcn/ui + frontend-design skill
- ✅ shadcn/ui (base-nova) 初始化: Button, Card, Input, Textarea, Label, Tabs, Badge
- ✅ 暖橙色系 oklch 色板 + Geist 字体
- ✅ 所有页面 shadcn 组件化

## UI 重构 v2 (2026-07-09) — UI UX Pro Max (Exaggerated Minimalism)

### 设计系统
- **Style**: Exaggerated Minimalism — 超大排印、高对比度、大量留白
- **Primary**: `oklch(0.541 0.247 293)` (#7C3AED 紫色) → CTA/主按钮
- **Accent**: `oklch(0.656 0.212 354)` (#EC4899 粉色) → 强调色/渐变
- **Secondary**: `oklch(0.585 0.204 277)` (#6366F1 靛蓝) → 辅助色
- **Background**: `oklch(0.977 0.014 308)` (#FAF5FF) 浅紫
- **Typography**: Inter (900/800/700/600/400)
- **Gradient**: 紫色→粉色渐变 (primary → accent)
- **Pattern**: Video-First Hero / 紫色径向渐变背景

### 全局工具类
- `text-exaggerated`: `clamp(2.5rem, 8vw, 8rem)` 超大字重
- `text-exaggerated-md`: `clamp(1.5rem, 4vw, 4rem)` 中等强调
- `btn-accent` / `btn-ghost`: 粉色按钮 + 紫色幽灵按钮
- `gradient-purple-pink`: 紫色→粉色渐变背景
- `gradient-text`: 紫色→粉色渐变文字
- `card-hover`: 带 lift 效果的卡片
- `section-padding` / `container-wide`: 布局常量

### 页面重构
| 页面 | 关键改动 |
|------|----------|
| 首页 `/` | 固定导航 + 渐变 radial background + 超大 hero 排版 + 标签 pill + 底部装饰分隔 |
| 登录/注册 | 背景渐变光晕 + Imaginova logo + shadow-xl Card + error inline alert |
| Create `/create` | 全高导航栏 + dashed upload zone + 渐变 progress bar |
| Dashboard | 导航栏 Create 按钮 + gradient credits 链接 + 4:3 卡片网格 + hover lift |
| Credits | 超大 gradient 数字显示 + rounded hover transaction rows |
| Settings | 与 Dashboard 一致导航 + 带 label/placeholder 的密码表单 |
| Image Detail | 全黑展示区 + muted 标签式信息卡 + 下载按钮 |
| Video Detail | 实时渐变 progress bar + 3 列信息网格 + 同风格下载按钮 |

## Taste Skill 设计审计 (2026-07-09)
- ✅ 安装 `taste-skill` npm 包，生成 7 个设计口味模板到 `skills/taste/` 和 `templates/taste/`
- ✅ 配置: STRICTNESS=high, AUDIT_DEPTH=comprehensive, PRESERVATION=aggressive, SCOPE=system
- ✅ 修复 8 个审计问题:

| Severity | 问题 | 修复 |
|----------|------|------|
| CRITICAL | 首页双 CTA 冲突 | 移除 "Learn More"，保留单个 "Start Creating" |
| CRITICAL | 缺少 prefers-reduced-motion | 全局添加 `@media (prefers-reduced-motion: reduce)` |
| CRITICAL | "x" 按钮误用 destructive | 改为 `bg-muted-foreground/20 text-muted-foreground` |
| MAJOR | 卡片过度使用 border | 所有 Card 移除 `border-border`，改用 `shadow-sm` |
| MAJOR | `leading-[0.85]` 魔法数字 | 改为 `leading-none` |
| MAJOR | Badge `text-[10px]` | 改为 `text-xs` |
| MAJOR | 底部文字 50% 透明度 | 提升至 65% |
| MAJOR | btn-accent hover 用 opacity | 改为 `brightness(1.1)` lightness shift |

### 设计资源
- `design-system/imaginova/MASTER.md` — 全局设计规范
- `design-system/imaginova/pages/*.md` — 页面级覆写规则
- `.opencode/skills/ui-ux-pro-max/` — 设计搜索引擎
- `skills/taste/` — Taste Skill 设计口味模板
- `templates/taste/` — Taste Skill 纯文本 prompt 模板
- `docs/UI-RESOURCES.md` — 组件库 & AI 技能清单

### H1 — 添加 proxy.ts 全局路由保护 ✅
- 新增 `src/proxy.ts`（Next.js 16 Proxy 中间件）
- 未登录用户访问受保护页面直接 302 到 `/login?redirect=xxx`
- 已登录用户访问 `/login` `/register` 自动跳转 `/dashboard`

### H2 — 生成结果后跳转详情页 ✅
- 图片生成 API 返回 `id`，Create 页面成功后 `router.push("/image/${id}")`
- 视频生成 API 返回 `id`，轮询完成或出错时 `router.push("/video/${id}")`
- 不再在 Create 页内联展示结果，避免刷新丢失

### M1 — 视频轮询期间 Toast 提示 ✅
- 视频生成开始时弹出 Toast："Video generation started — you can leave this page and check progress in Dashboard"

### M2 — 登录后跳转 Dashboard ✅
- 登录成功 `router.push("/dashboard")` 而非首页

### M3 — 统一使用 Toast 系统 ✅
- Dashboard check-in、Settings 密码修改、Credits 充值全部改用 `useToast()`
- 移除了所有页面的内联 `setTimeout` 消息

### L1 — Logout 改为 fetch ✅
- Dashboard 和 Create 页的 Sign Out 改为 `fetch + router.push("/") + router.refresh()`
- 首页（Server Component）使用 `SignOutButton` Client Component

### L2 — Video 详情页自动轮询 ✅
- `video/[id]/page.tsx` 在 status 为 queued/processing 时每 5s 自动刷新状态
- 完成或失败后停止轮询

### L3 — Credits 页去重 ✅
- 充值成功后移除手动 `setUser`，统一通过 `fetch("/api/me")` 刷新

## 后续计划

### 阶段二：产品体验完善

#### P3 — 作品详情页 ✅

| 文件 | 内容 |
|---|---|
| `src/app/api/image/[id]/route.ts` | 图片详情 API（鉴权 + 归属检查） |
| `src/app/api/video/[id]/route.ts` | 视频详情 API（鉴权 + 归属检查） |
| `src/app/image/[id]/page.tsx` | 图片详情：全屏展示、prompt、模型、时间、下载按钮 |
| `src/app/video/[id]/page.tsx` | 视频详情：播放器、prompt、模型、时间、下载 |
| `src/app/dashboard/page.tsx` | 点击条目跳转到详情页（替代 lightbox） |

#### P4 — 积分系统完善 ✅

| 文件 | 内容 |
|---|---|
| `src/lib/db.ts` | 新增 `credit_transactions` 表 |
| `src/app/api/credits/transactions/route.ts` | 积分流水记录 |
| `src/app/api/credits/checkin/route.ts` | 每日签到接口（+1 积分，日限一次） |
| `src/app/api/credits/recharge/route.ts` | 充值接口（mock，无支付对接） |
| `src/app/dashboard/page.tsx` | 签到按钮、积分链接到充值页 |
| `src/app/credits/page.tsx` | 积分充值页面 + 交易流水展示 |

#### P5 — 用户设置 ✅

| 文件 | 内容 |
|---|---|
| `src/app/api/settings/password/route.ts` | 修改密码 API（需验证旧密码） |
| `src/app/settings/page.tsx` | 密码修改表单 + 确认验证 |
| `src/app/dashboard/page.tsx` | 增加 Settings 链接 |

---

---

## 项目结构

```
src/
  lib/
    db.ts              — SQLite 数据库
    auth.ts            — JWT 生成/验证
    image.ts           — 图片生成 API 封装（T2I + I2I）
    video.ts           — 视频生成 API 封装（T2V + I2V，异步轮询）
  app/
    page.tsx           — 首页
    login/page.tsx     — 登录
    register/page.tsx  — 注册
    create/page.tsx    — 生成页（图像/视频 Tab 切换，支持上传参考图）
    dashboard/page.tsx — 用户面板 & 历史记录（图片 lightbox + 视频直连播放）
    image/[id]/page.tsx — 图片详情（P3 🔜）
    video/[id]/page.tsx — 视频详情（P3 🔜）
    credits/page.tsx   — 积分充值（P4 🔜）
    settings/page.tsx  — 用户设置（P5 🔜）
    api/
      register/route.ts
      login/route.ts
      logout/route.ts
      me/route.ts
      me/images/route.ts
      me/videos/route.ts
      generate/image/route.ts
      generate/video/route.ts
      proxy/video/route.ts — 视频流式代理（备用）
      credits/transactions/route.ts
      credits/checkin/route.ts
      credits/recharge/route.ts
      image/[id]/route.ts
      video/[id]/route.ts
      settings/password/route.ts
```

## 数据库表

| 表 | 字段 | 备注 |
|---|---|---|
| `users` | id, name, email, password, credits, created_at | 已实现 |
| `images` | id, user_id, prompt, model, url, created_at | 已实现 |
| `videos` | id, user_id, prompt, model, status, progress, task_id, url, created_at | 已实现 |
| `credit_transactions` | id, user_id, type, amount, description, created_at | P4 待建 |

## 开发顺序

所有阶段已完成。项目 MVP 交付。
