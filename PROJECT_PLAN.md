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

---

## 设计系统

| Token | 色值 | 说明 |
|-------|------|------|
| Primary | `oklch(0.55 0.13 185)` | 青碧色 — 主按钮/链接 |
| Accent | `oklch(0.72 0.14 75)` | 琥珀色 — 强调色（尚未使用） |
| Background | `oklch(0.985 0.002 65)` | 暖白背景 |
| Foreground | `oklch(0.21 0.015 40)` | 深暖灰文字 |
| Font | Inter (400/500/600/700/800/900) | 单一字体 |

### 设计原则
- **Clean Modern Minimal** — 干净、呼吸感、功能优先
- 毛玻璃导航栏 + `container-narrow` (1120px) 居中约束
- 纯 Tailwind + shadcn，无自定义工具类

---

## 已完成 ✓

### 核心链路
- ✅ **Step 1 — 骨架**：项目初始化、数据库建表、全局样式
- ✅ **Step 2 — 用户系统**：注册/登录 API、JWT cookie、注册/登录页面
- ✅ **Step 3 — 图片生成**：文生图（text-to-image）
- ✅ **Step 4 — 视频生成**：文生视频（text-to-video，异步轮询）
- ✅ **Step 5 — 用户中心**：Dashboard + 积分显示

### 进阶功能
- ✅ **P1-P7**：图生图 / 图生视频 / 详情页 / 积分系统 / 设置 / UI/UX / 交互优化

### Tier 1 — 安全 & 架构（5/5）
| # | 任务 | 说明 |
|---|------|------|
| ✅ | S1 下载代理安全性 | `user_id` 所有权校验 |
| ✅ | S2 Layout + Navbar | 路由组布局，6 页面移除重复 header |
| ✅ | S3 Dashboard 分页 | API `limit/offset` + Load More 按钮 |
| ✅ | S4 Spinner 组件 | 提取 `LoadingSpinner`，替换内联 SVG |
| ✅ | S5 API Client | `api.get/post/put/delete`，统一 401 跳转 |

### Tier 2 — 用户体验（7/7）
| # | 任务 | 说明 |
|---|------|------|
| ✅ | U1 删除作品 | 详情页 + Dashboard 卡片删除 |
| ✅ | U2 分享功能 | 复制链接 + Twitter 分享 |
| ✅ | U3 可见性优化 | 页面隐藏时暂停视频轮询 |
| ✅ | U4 进度预估 | 推算剩余时间替代单纯百分比 |
| ✅ | U5 Prompt 示例 | 可点击快速填充 |
| ✅ | U6 登出确认 | `window.confirm` 二次确认 |
| ✅ | U7 XSS 防护 | 注册时 strip HTML |

### Tier 3 — 产品增长（7/7）
| # | 任务 | 说明 |
|---|------|------|
| ✅ | G1 作品展示增强 | 灯箱浏览 + 搜索筛选 + 卡片优化 |
| ✅ | G2 Onboarding | 欢迎弹窗 + Create 页提示条 |
| ✅ | G3 真实支付 | Stripe Checkout + Webhook |
| ✅ | G4 测试基础设施 | Jest + Playwright 配置 |
| ✅ | G5 CI/CD | GitHub Actions（lint → build → test） |
| ✅ | G6 密码重置 | forgot-password → token → reset |
| ✅ | G7 `.env.example` | 环境变量文档 |

---

## ✅ 已完成 — 语言切换

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **L1 翻译文件** | 创建 `en.json` / `zh.json`，覆盖全站 UI 文本 |
| ✅ | **L2 LocaleProvider** | React Context 管理语言状态，localStorage 持久化 |
| ✅ | **L3 LanguageSwitcher** | 导航栏语言切换按钮，中英即时切换 |
| ✅ | **L4 全站翻译** | 所有页面（首页/工作台/创作/设置/积分/详情/登录/注册/密码重置）使用 `t()` 函数 |
| ✅ | **L5 构建验证** | `next build` 零错误 |

---

## 后续规划

### Tier 4 — UI & 交互手感优化

#### P0 — 立竿见影 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **O1 卡片 hover 图片缩放** | Dashboard 缩略图 `group-hover:scale-105` 微放大 |
| ✅ | **O2 Toast 美化** | 主题色 token + 图标 + 关闭按钮 |
| ✅ | **O3 骨架屏主题化** | `bg-gray-200` → `bg-muted` |
| ✅ | **O4 删除双字体加载** | 移除 globals.css 中 `@import url(...)` Inter |
| ✅ | **O5 Lightbox 增强 + 移动端适配** | 加关闭 X 按钮；移动端 delete 常显 |

#### P1 — 体验质感提升 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **O6 页面过渡动画** | View Transitions API cross-fade |
| ✅ | **O7 图片上传拖放** | Drag-over 视觉反馈 + 缩放 |
| ✅ | **O8 Focus-visible 补齐** | 统计卡片、示例 chips、上传区 |
| ✅ | **O9 空状态插图** | Dashboard 空列表 SVG 插图 |
| ✅ | **O10 复制链接动画** | checkmark 图标 + animate-scale-in |

#### P2 — 深层打磨 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **O11 涟漪按钮效果** | active 状态增强 |
| ✅ | **O12 移动端 Bottom sheet** | 移动端底部抽屉样式 |
| ✅ | **O13 Scrollbar 美化** | 自定义细滚动条 |
| ✅ | **O14 Lightbox focus trap** | Tab 循环 + 自动聚焦 |
| ✅ | **O15 Accent 色应用** | Check In 按钮使用琥珀色 |

---

## 已知问题

| 问题 | 状态 | 说明 |
|------|------|------|
| Video CDN 速度慢 | ⚠️ 待解决 | `platform-outputs.agnes-ai.space` 直连绕过服务端中转 |
| 无 lint-staged / pre-commit | ❌ | 提交前无自动检查 |
| 未使用 Image 优化 | 🟢 低 | CDN 图片未用 next/image |
| `--accent` `--chart-*` 未使用 | 🟢 低 | 已定义但代码中未引用 |
| 类型断言 `as T` | 🟢 低 | SQLite 返回类型未包装 |
| SQLite 位置 | 🟢 低 | 数据库文件在工作目录，生产需调整 |

---

## 项目结构

```
src/
  lib/
    db.ts              — SQLite 数据库
    auth.ts            — JWT 生成/验证
    image.ts           — 图片生成 API 封装（T2I + I2I）
    video.ts           — 视频生成 API 封装（T2V + I2V，异步轮询）
    utils.ts           — shadcn cn() + downloadFile()
    api-client.ts      — 统一 API 请求封装
    stripe.ts          — Stripe 支付客户端
  proxy.ts             — Next.js Proxy 中间件（路由保护）
  __tests__/           — Jest 单元测试
  components/
    ui/                — shadcn/ui 组件（Button, Card, Badge, Tabs, Input, Textarea, Label）
    navbar.tsx         — 导航栏（home/app/detail 三种变体）
    theme-toggle.tsx
    sign-out-button.tsx
    toast.tsx          — Toast 提示系统
    skeleton.tsx       — 骨架屏组件
    loading-spinner.tsx
  app/
    (dashboard)/       — 路由组：create, dashboard
    (detail)/          — 路由组：image/[id], video/[id], credits, settings
    page.tsx           — 首页
    login/             — 登录
    register/          — 注册
    forgot-password/   — 忘记密码
    reset-password/    — 密码重置
    api/
      auth/forgot-password, auth/reset-password
      register, login, logout, me, me/images, me/videos
      generate/image, generate/video
      proxy/video, proxy/download
      credits/checkin, credits/checkout, credits/recharge, credits/transactions, credits/webhook
      image/[id], video/[id]
      settings/password
e2e/                   — Playwright E2E 测试
.github/workflows/     — GitHub Actions CI
```

## 数据库表

| 表 | 字段 | 备注 |
|---|---|---|
| `users` | id, name, email, password, credits, created_at | ✅ |
| `images` | id, user_id, prompt, model, url, created_at | ✅ |
| `videos` | id, user_id, prompt, model, status, progress, task_id, url, created_at | ✅ |
| `credit_transactions` | id, user_id, type, amount, description, created_at | ✅ |
| `password_resets` | id, user_id, token, expires_at, used, created_at | ✅ |

## 构建状态

- `npm run build` — 零错误，零警告 ✅
- `npm test` — 2/2 passed ✅
