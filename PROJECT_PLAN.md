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

### Tier 1 — 安全 & 架构（6/6）
| # | 任务 | 说明 |
|---|------|------|
| ✅ | S1 下载代理安全性 | `user_id` 所有权校验 |
| ✅ | S2 Layout + Navbar | 路由组布局，6 页面移除重复 header |
| ✅ | S3 Dashboard 分页 | API `limit/offset` + Load More 按钮 |
| ✅ | S4 Spinner 组件 | 提取 `LoadingSpinner`，替换内联 SVG |
| ✅ | S5 API Client | `api.get/post/put/delete`，统一 401 跳转 |
| ✅ | S6 邮箱验证 | 格式校验 + DNS MX + 验证码邮件 (nodemailer/QQ SMTP) + 60s 限频 |

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

### Tier 5 — 管理后台 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **A1 数据库迁移** | users 加 `role`，images/videos 加 `flagged/reported/reviewed`，新建 `api_usage` 表 |
| ✅ | **A2 管理 API** | 6 个 API：统计 / 用户列表 / 内容列表 / 审核操作 / 举报 / 用量记录 |
| ✅ | **A3 管理后台前端** | 概览统计页 + 内容审核页 + 用户管理页 |
| ✅ | **A4 用户举报** | 详情页举报按钮，作品在审核页显示"已举报" |
| ✅ | **A5 导航入口** | 管理员自动显示"管理后台"导航入口 |
| ✅ | **A6 中英翻译** | 全部管理后台文案覆盖 |

### Tier 6 — 代理集成 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **P1 添加视频状态路由** | agnes-pool 代理新增 `GET /v1/videos/{task_id}` |
| ✅ | **P2 指向号池代理** | `AI_API_BASE_URL` 改为 `http://localhost:8000`，移除直连 Key |

### Tier 8 — SEO 首页 + 实时进度推送 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **S1 营销落地页** | 重写首页：英雄区 + 功能卡片 + 使用步骤 + CTA 区 |
| ✅ | **S2 SEO 元数据** | layout.tsx 添加 OG / Twitter / robots 标签 |
| ✅ | **S3 双语翻译** | 新增 20+ 条首页营销文案（中/英） |
| ✅ | **S4 SSE 后端端点** | `GET /api/video/[id]/stream` 实时推送视频进度 |
| ✅ | **S5 前端改用 SSE** | Create 页 + Detail 页用 EventSource 替代轮询 |

### Tier 7 — Docker 部署 ✅

| # | 任务 | 说明 |
|---|------|------|
| ✅ | **D1 开启 standalone 输出** | `next.config.ts` 添加 `output: "standalone"` |
| ✅ | **D2 Imaginova Dockerfile** | 多阶段构建：deps → builder → runner |
| ✅ | **D3 根目录 docker-compose** | 串联 imaginova + agnes-pool 两个服务 |
| ✅ | **D4 .dockerignore** | 排除 node_modules / .next / .git / data 等 |

启动命令：
```bash
docker compose up -d
# 前台: http://localhost:3000
# 号池: http://localhost:8000
```

> **注意**：构建前需确保 Docker Desktop 已启动。首次构建需下载 Node.js / Python 基础镜像。

---

## 已知问题

| 问题 | 状态 | 说明 |
|------|------|------|
| Video CDN 速度慢 | ✅ 已解决 | 视频 `<video>` 改为 `/api/proxy/video?url=` 代理转发 |
| 未使用 Image 优化 | ✅ 已解决 | 4 处 `<img>` 替换为 `next/image`，`remotePatterns` 新增 `**.agnes-ai.space` |
| `--chart-*` 未使用 | ✅ 已解决 | Dashboard 统计卡片使用 `chart-2/4/5` 作为数字色 + 左侧边框色 |
| husky + lint-staged | ✅ 已解决 | 提交前自动 `eslint --fix` |
| 类型断言 `as T` | ✅ 已解决 | 改为 `Pick<RowType, ...>` 集中类型引用 |
| SQLite 位置 | ✅ 已解决 | 支持 `DATABASE_PATH` 环境变量 |

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
| `users` | id, name, email, password, credits, **role**, created_at | ✅ |
| `images` | id, user_id, prompt, model, url, **flagged, reported, reviewed**, created_at | ✅ |
| `videos` | id, user_id, prompt, model, status, progress, task_id, url, **flagged, reported, reviewed**, created_at | ✅ |
| `credit_transactions` | id, user_id, type, amount, description, created_at | ✅ |
| `password_resets` | id, user_id, token, expires_at, used, created_at | ✅ |
| `api_usage` | id, user_id, action, cost, created_at | ✅ (新增) |

---

## 管理后台 (Admin Panel)

| # | 任务 | 状态 |
|---|------|------|
| ✅ | **T1 数据库迁移** — role/flagged/api_usage 表 & 接口 | ✅ |
| 🔲 | T2 api_usage 统计路由 | 🔲 |
| 🔲 | T3 用户管理 API (list/search/update credits) | 🔲 |
| 🔲 | T4 内容审核 API (list pending / approve / reject) | 🔲 |
| 🔲 | T5 管理员 Dashboard 页面 (统计概览) | 🔲 |
| 🔲 | T6 用户管理页面 (表格 + 搜索 + 编辑积分) | 🔲 |
| 🔲 | T7 内容审核页面 (图片/视频列表 + 审核操作) | 🔲 |
| 🔲 | T8 访问控制中间件 + 管理员角色守卫 | 🔲 |

## 构建状态

- `npm run build -- --webpack` — 零错误，零警告 ✅
- `npm test` — 2/2 passed ✅

## 🐛 线上问题记录 (2026-07-13)

| # | 问题 | 严重度 | 状态 | 修复方案 |
|---|------|--------|------|----------|
| 1 | **注册/登录 500** — POST API 路由因 Turbopack `req.json()` bug 全部崩溃 | **P0** | ✅ 已修复 | Dockerfile 改用 `--webpack`；`next.config.ts` 加 `serverExternalPackages` |
| 2 | **无 HTTPS** — 仅 HTTP 80，密码明文传输，无 SSL 证书 | **P0** | 🔲 待处理 | 配置 Nginx/Caddy + Let's Encrypt；或腾讯云免费 SSL |
| 3 | **缺少安全响应头** — 无 `X-Frame-Options`、`X-Content-Type-Options`、`CSP`、`HSTS` | **P0** | 🔲 待处理 | 在反向代理或 `next.config.ts` 的 `headers()` 中添加 |
| 4 | **`X-Powered-By: Next.js`** — 信息泄露 | P1 | ✅ 已修复 | `next.config.ts` 添加 `poweredByHeader: false` |
| 5 | **缺少 `robots.txt`** — 搜索引擎爬虫无指引 | P1 | 🔲 待处理 | 创建 `public/robots.txt` |
| 6 | **缺少 `sitemap.xml`** — 影响 SEO 收录 | P1 | 🔲 待处理 | 使用 Next.js `generateSitemaps()` 或手写 `public/sitemap.xml` |
| 7 | **缺少 `og:image`** — 社交分享无预览图 | P1 | 🔲 待处理 | 在 `layout.tsx` 中添加 `og:image` / `twitter:image` |
| 8 | **首页 JS chunk 过多**（12+ 个） | P2 | 🔲 待处理 | 检查 Turbopack/Webpack code splitting 配置 |
| 9 | **页面缓存策略过保守** — 首页 `private, no-cache, no-store` | P2 | 🔲 待处理 | 静态页面可放宽 Cache-Control |
| 10 | **登录间歇性失败** — `router.refresh()` 与 `router.push()` 竞态；`api-client.ts` 401 在登录页会触发不必要的页面重载 | **P0** | ✅ 已修复 | `login/page.tsx` 改用 `window.location.href`；`api-client.ts` 跳过已在 `/login` 时的 401 重定向；`dashboard/page.tsx` 401 时主动跳转 `/login` |

## 上线前安全修复 (2026-07-12)

| # | 问题 | 严重度 | 修复 |
|---|------|--------|------|
| ✅ | Cookie `secure: false` → 生产环境 `true` | P0 | `src/lib/auth.ts` |
| ✅ | 开发密钥回退 → 强制要求 `AUTH_SECRET` | P0 | `src/lib/auth.ts`, `src/proxy.ts` |
| ✅ | 密码重置 token 在生产环境不暴露 | P0 | `src/app/api/auth/forgot-password/route.ts` |
| ✅ | 创建 404 页面 (`not-found.tsx`) | P1 | `src/app/not-found.tsx` |
| ✅ | 创建错误页面 (`error.tsx`) | P1 | `src/app/error.tsx` |
| ✅ | 删除按钮 focus-visible 可见 + focus trap | P1 | Dashboard lightbox |
| ✅ | ErrorBoundary 硬编码颜色 → 主题色 | P1 | `src/components/error-boundary.tsx` |
| ✅ | 详情页硬编码背景色 → `bg-muted` | P1 | image & video detail pages |
| ✅ | 模拟充值接口生产环境禁用 | P1 | `src/app/api/credits/recharge/route.ts` |
| ✅ | Dashboard 排序加 `useMemo` 缓存 | P2 | `src/app/(dashboard)/dashboard/page.tsx` |
| ✅ | Toast 悬停暂停自动消失 + `aria-hidden` | P2 | `src/components/toast.tsx` |
| ✅ | 创建 `.env.example` | P2 | `.env.example` |

---

## 移动端 UI 适配优化 (2026-07-15)

| # | 问题 | 文件 | 修复内容 |
|---|------|------|----------|
| ✅ | **1. Home 导航栏无移动端菜单** | `src/components/home-content.tsx` | 添加汉堡菜单 + `hidden md:flex` |
| ✅ | **2. Dashboard 统计网格 3 列过挤** | `src/app/(dashboard)/dashboard/page.tsx` | 缩小移动端 `gap-2`，标题行 `flex-col sm:flex-row` |
| ✅ | **3. Admin 导航栏无移动端菜单** | `src/components/admin-navbar.tsx` | 添加汉堡菜单 + `hidden md:flex` + email 截断 |
| ✅ | **4. 视频详情 3 列元信息过挤** | `src/app/(detail)/video/[id]/page.tsx` | `flex-col sm:flex-row` 垂直堆叠 |
| ✅ | **5. Credits 余额数字无响应式** | `src/app/(detail)/credits/page.tsx` | `text-4xl sm:text-5xl lg:text-6xl` |
| ✅ | **6. Admin 审核 Tabs 溢出** | `src/app/admin/moderation/page.tsx` | `flex-col sm:flex-row` 垂直堆叠 |
| ✅ | **7. 图片详情按钮 3 行布局** | `src/app/(detail)/image/[id]/page.tsx` | `sm:ml-auto` 替换 `ml-auto`，缩小 `gap-2 sm:gap-3` |
| ✅ | **8. Admin 用户行长邮箱溢出** | `src/app/admin/page.tsx` | `truncate` + `hidden sm:inline` |
| ✅ | **9. Dashboard 搜索 + Tabs 过挤** | `src/app/(dashboard)/dashboard/page.tsx` | `flex-col sm:flex-row` + `w-full sm:max-w-56` |
| ✅ | **10. 多页面标题 `text-3xl` 无响应式** | create/settings/dashboard | `text-2xl sm:text-3xl` |
| ✅ | **11. 视频进度条固定 `w-64`** | `src/app/(detail)/video/[id]/page.tsx` | `w-full max-w-xs` |
| ✅ | **12. Not Found `text-7xl`** | `src/app/not-found.tsx` | `text-6xl sm:text-7xl` |
| ✅ | **13. Home Hero 行高过紧** | `src/components/home-content.tsx` | `leading-[1.2] sm:leading-[1.1]` |
| ✅ | **14. iOS `dvh` 兼容性** | dashboard lightbox/video modal | `vh` → `dvh` 避免 Safari 地址栏问题 |
| ✅ | **15. 视频详情按钮布局** | `src/app/(detail)/video/[id]/page.tsx` | 同步图片页按钮修复 |
