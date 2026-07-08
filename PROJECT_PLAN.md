# Imaginova — AI 图像与视频生成平台

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | **Next.js 16** (App Router, Turbopack) |
| 样式 | **Tailwind CSS 4** |
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
