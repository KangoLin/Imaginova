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

### 核心链路
- ✅ **Step 1 — 骨架**：项目初始化、数据库建表（users/images/videos）、全局样式
- ✅ **Step 2 — 用户系统**：注册/登录 API、JWT cookie、注册/登录页面
- ✅ **Step 3 — 图片生成**：文生图（text-to-image）
- ✅ **Step 4 — 视频生成**：文生视频（text-to-video，异步轮询）
- ✅ **Step 5 — 用户中心**：Dashboard（历史记录、积分显示）

### 进阶功能
- ✅ **P1 — 图生图 (img2img)**：图片上传、FormData 处理
- ✅ **P2 — 图生视频 (I2V)**：图片上传、参数传递
- ✅ **P3 — 作品详情页**：`/image/[id]`、`/video/[id]`
- ✅ **P4 — 积分系统**：签到（日限）、Mock 充值、交易流水
- ✅ **P5 — 用户设置**：修改密码
- ✅ **P6 — UI/UX 完善**：暗色模式、骨架屏、Toast、错误边界、动画 & 响应式
- ✅ **P7 — 交互手感优化**：下载代理、Textarea 自动扩展、Cmd+Enter、按钮按压反馈

### 基础设施
- ✅ **Proxy 中间件**：`src/proxy.ts` 全局路由保护
- ✅ **Agnes AI API 迁移**：端点迁移、URL 提取修复
- ✅ **代理/流式优化**：proxy route 流式传输
- ✅ **GUI 逻辑修复 8 项**：H1-H3、M1-M3、L1-L3
- ✅ **UI 最终版**：teal/amber 配色，纯 Tailwind + shadcn
- ✅ **Navbar 组件**：`src/components/navbar.tsx` 三种变体

## 已知问题

- ⚠️ **Video CDN 速度慢**（`platform-outputs.agnes-ai.space`），目前直连绕过服务端中转
- ⚠️ **下载代理缺少所有权校验**：任何登录用户可下载任意文件（需加 `user_id` 匹配）
- ⚠️ **无分页**：Dashboard 全量加载，数据增长后不可用

---

## 项目审计（2026-07-09）

### 安全风险

| 严重度 | 问题 | 位置 | 说明 |
|--------|------|------|------|
| 🔴 高 | 下载无所有权校验 | `api/proxy/download/route.ts` | 任何登录用户可枚举 URL 下载他人文件 |
| 🟡 中 | XSS 风险 | `{user.name}` 多处直接渲染 | name 未转义 |
| 🟢 低 | SQLite 位置 | `src/lib/db.ts` | 数据库文件在工作目录，生产需调整 |
| 🟢 低 | 无 CSRF | 各 POST/PUT API | 使用 JWT cookie + fetch，风险较低 |

### 架构债务

| 严重度 | 问题 | 涉及文件 | 说明 |
|--------|------|----------|------|
| 🔴 高 | Navbar 组件未使用 | 7 个页面有内联 header | `navbar.tsx` 已定义但无页面引用，改导航需改 7 处 |
| 🔴 高 | 无共享 Layout | 每个页面重复 header/main 结构 | 缺少 `app/layout.tsx` 分层 |
| 🟡 中 | 重复代码 | 各页面 | 401 处理、Spinner SVG、fetch 三板斧重复出现 |
| 🟡 中 | Spinner 未提取 | 5 处内联 SVG | 应提取为 `<LoadingSpinner>` 组件 |
| 🟡 中 | 无 API Client | 全部使用裸 fetch | 缺少统一错误处理、类型化封装 |
| 🟢 低 | 类型断言 | 多处 `as T` | SQLite 返回类型未包装 |

### 性能问题

| 严重度 | 问题 | 说明 |
|--------|------|------|
| 🟡 中 | Dashboard 无分页 | 全量加载 images/videos |
| 🟡 中 | 视频轮询无可见性优化 | 页面隐藏时依然每 3s 轮询 |
| 🟢 低 | 未使用 Image 优化 | CDN 图片未用 next/image |

### 测试 & 工程化

| 问题 | 说明 |
|------|------|
| ❌ 零测试 | 无测试文件、无测试运行器 |
| ❌ 无 CI/CD | 无自动化流程 |
| ❌ 无 lint-staged / pre-commit | 提交前无自动检查 |
| ❌ 无环境变量文档 | 缺少 `.env.example` |

---

## 设计系统

| Token | 色值 | 说明 |
|-------|------|------|
| Primary | `oklch(0.55 0.13 185)` | 青碧色 — 主按钮/链接 |
| Accent | `oklch(0.72 0.14 75)` | 琥珀色 — 强调色 |
| Background | `oklch(0.985 0.002 65)` | 暖白背景 |
| Foreground | `oklch(0.21 0.015 40)` | 深暖灰文字 |
| Font | Inter (400/500/600/700/800/900) | 单一字体 |

### 设计原则
- **Clean Modern Minimal** — 干净、呼吸感、功能优先
- 毛玻璃导航栏 + `container-narrow` (1120px) 居中约束
- 纯 Tailwind + shadcn，无自定义工具类

---

## 后续规划

### 第 1 梯队 — 安全 & 架构（必须修）

| # | 任务 | 说明 | 文件/模块 |
|---|------|------|-----------|
| ✅ | ~~S1 修复下载代理安全性~~ | 添加 `user_id` 所有权校验 | `api/proxy/download/route.ts` |
| S2 | 提取根 Layout + 启用 Navbar | 消除 7 个页面的 header 重复 | `app/layout.tsx`, `app/(main)/layout.tsx`, 所有页面 |
| S3 | Dashboard 分页/无限滚动 | 避免数据量增长后不可用 | `app/dashboard/page.tsx` |
| S4 | 提取 Spinner 组件 | 消除 5 处内联 SVG | `components/loading-spinner.tsx`, 各页面 |
| S5 | 提取通用 fetch 封装 | 统一 401 处理 + 错误解析 | `lib/api-client.ts` |

### 第 2 梯队 — 用户体验（应该修）

| # | 任务 | 说明 | 文件/模块 |
|---|------|------|-----------|
| U1 | 添加删除作品功能 | Dashboard 和详情页增加删除按钮 | `api/image/[id]`, `api/video/[id]`, 详情页 |
| U2 | 分享功能 | 复制链接 / 社交媒体分享 | 详情页 |
| U3 | 视频轮询可见性优化 | 页面隐藏时暂停轮询 | `app/create/page.tsx` |
| U4 | 视频生成进度预估 | 显示预估剩余时间替代单纯百分比 | `app/create/page.tsx` |
| U5 | Prompt 模板 / 快速示例 | 降低新用户输入门槛 | `app/create/page.tsx` |
| U6 | 登出二次确认 | 防止误触 Sign Out | `components/sign-out-button.tsx` |
| U7 | 添加 XSS 防护 | name 输出转义 | 所有渲染 `user.name` 处 |

### 第 3 梯队 — 产品增长（可以修）

| # | 任务 | 说明 | 优先级 |
|---|------|------|--------|
| G1 | 作品展示页 / Gallery | 让用户发现和浏览他人作品 | ⭐⭐⭐ |
| G2 | 新手引导 / Onboarding | 提高新用户留存 | ⭐⭐⭐ |
| G3 | 真实支付集成 | 商业化前提 | ⭐⭐ |
| G4 | 添加测试基础设施 | Jest + Playwright 配置 | ⭐⭐ |
| G5 | CI/CD 配置 | GitHub Actions | ⭐⭐ |
| G6 | 密码重置流程 | 解决"忘记密码"场景 | ⭐⭐ |
| G7 | `.env.example` 文档 | 降低新开发者上手成本 | ⭐ |

---

## 项目结构

```
src/
  lib/
    db.ts              — SQLite 数据库
    auth.ts            — JWT 生成/验证
    image.ts           — 图片生成 API 封装（T2I + I2I）
    video.ts           — 视频生成 API 封装（T2V + I2V，异步轮询）
    utils.ts           — shadcn cn() + downloadFile() 工具函数
  proxy.ts             — Next.js 16 Proxy 中间件（路由保护）
  components/
    ui/                — shadcn/ui 组件
    navbar.tsx         — 导航栏（home/app/detail 三种变体）
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
      proxy/video, proxy/download
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
