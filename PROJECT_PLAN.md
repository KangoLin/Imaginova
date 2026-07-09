# Imaginova — AI 图像与视频生成平台

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | **Next.js 16** (App Router, Turbopack) |
| 样式 | **Tailwind CSS 4 + shadcn/ui** |
| 设计引擎 | **shadcn/ui + Taste Skill** |
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
- ✅ **Proxy 中间件**：`src/proxy.ts` 全局路由保护，未登录重定向到 `/login`
- ✅ **GUI 逻辑修复 8 项**：
  - H1: proxy.ts 添加 config matcher
  - H2: 生成后跳转详情页替代内联展示
  - H3: 视频轮询期间 Toast 提示
  - M1: 登录后跳转 Dashboard
  - M2: 统一使用 Toast 系统（移除内联 setTimeout）
  - L1: Logout 改为 fetch 调用
  - L2: Video 详情页自动轮询（5s）
  - L3: Credits 充值后统一调用 `/api/me` 刷新
- ✅ **UI 最终版 — 推翻重做**：从紫色/粉色完全替换为青碧/琥珀（teal/amber）配色，移除所有自定义工具类，纯 Tailwind + shadcn

## 已知问题
- ⚠️ Video CDN 速度较慢（`platform-outputs.agnes-ai.space`），目前直接使用 CDN 直连绕过服务端中转

## 设计系统（现行）

| Token | 色值 | 说明 |
|-------|------|------|
| Primary | `oklch(0.55 0.13 185)` | 青碧色 #0D9488 — 主按钮/链接 |
| Accent | `oklch(0.72 0.14 75)` | 琥珀色 #F59E0B — 强调色 |
| Background | `oklch(0.985 0.002 65)` | 暖白背景 |
| Foreground | `oklch(0.21 0.015 40)` | 深暖灰文字 |
| Font | Inter (400/500/600/700/800/900) | 单一字体 |

### 设计原则
- **Clean Modern Minimal** — 干净、呼吸感、功能优先
- 毛玻璃导航栏 + `container-narrow` (1120px) 居中约束
- 自定义工具类已全部移除，只用原生 Tailwind + shadcn

## 项目结构

```
src/
  lib/
    db.ts              — SQLite 数据库
    auth.ts            — JWT 生成/验证
    image.ts           — 图片生成 API 封装（T2I + I2I）
    video.ts           — 视频生成 API 封装（T2V + I2V，异步轮询）
    utils.ts           — shadcn cn() 工具函数
  proxy.ts             — Next.js 16 Proxy 中间件（路由保护）
  components/
    ui/                — shadcn/ui 组件（Button, Card, Input, Textarea, Tabs, Badge, Label）
    theme-toggle.tsx
    sign-out-button.tsx
  app/
    page.tsx           — 首页（teal hero + 固定玻璃导航）
    login/page.tsx     — 登录
    register/page.tsx  — 注册
    create/page.tsx    — 生成页（图像/视频 Tab）
    dashboard/page.tsx — 用户面板 & 历史记录
    image/[id]/page.tsx — 图片详情
    video/[id]/page.tsx — 视频详情
    credits/page.tsx   — 积分充值
    settings/page.tsx  — 用户设置
    api/
      register, login, logout, me, me/images, me/videos
      generate/image, generate/video
      proxy/video — 视频流式代理（备用）
      credits/transactions, credits/checkin, credits/recharge
      image/[id], video/[id]
      settings/password
```

## 数据库表

| 表 | 字段 | 备注 |
|---|---|---|
| `users` | id, name, email, password, credits, created_at | ✅ |
| `images` | id, user_id, prompt, model, url, created_at | ✅ |
| `videos` | id, user_id, prompt, model, status, progress, task_id, url, created_at | ✅ |
| `credit_transactions` | id, user_id, type, amount, description, created_at | ✅ |

## 构建状态

- `npm run build` — 零错误，零警告 ✅
