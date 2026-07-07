# Imaginova — AI 图像与视频生成平台

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | **Next.js 16** (App Router) |
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

## 后续计划

### 阶段一：核心功能补齐

#### P1 — 图生图 (img2img) 🔥
原计划 Step 3 未完成的部分。上传参考图 + prompt 生成变体。

| 文件 | 内容 |
|---|---|
| `src/lib/image.ts` | 新增 `generateImageEdit()` 调用 Agnes AI `/v1/images/edits`，支持 image + mask 参数 |
| `src/app/api/generate/image/route.ts` | 接收 `FormData`（图片文件 + prompt），转为 base64 调用 API |
| `src/app/create/page.tsx` | Image tab 增加图片上传控件 + "参考图" 模式切换 |
| `next.config.ts` | 可能需要调整 body size 限制 |

#### P2 — 图生视频 (Image-to-Video) 🔥
原计划 Step 4 未完成的部分。上传图片 + prompt 生成动态视频。

| 文件 | 内容 |
|---|---|
| `src/lib/video.ts` | `createVideo()` 增加 `image_url` 参数支持 |
| `src/app/api/generate/video/route.ts` | 接收图片上传，传给 video API |
| `src/app/create/page.tsx` | Video tab 增加图片上传 |

---

### 阶段二：产品体验完善

#### P3 — 作品详情页
原计划 Step 6 中的「作品详情页」（社区画廊已跳过，但详情页保留）。

| 文件 | 内容 |
|---|---|
| `src/app/image/[id]/page.tsx` | 图片详情：全屏展示、prompt、模型、时间、下载按钮 |
| `src/app/video/[id]/page.tsx` | 视频详情：播放器、prompt、模型、时间、下载 |
| `src/app/dashboard/page.tsx` | 点击条目跳转到详情页 |

#### P4 — 积分系统完善
原计划 Step 5 中的「配额管理」。

| 文件 | 内容 |
|---|---|
| DB 迁移 | 新增 `credit_transactions` 表（type, amount, description, created_at） |
| `src/app/api/credits/transactions/route.ts` | 积分流水记录 |
| `src/app/api/credits/checkin/route.ts` | 每日签到接口（+1 积分） |
| `src/app/api/credits/recharge/route.ts` | 充值接口（mock，后续对接支付） |
| `src/app/dashboard/page.tsx` | 显示积分流水、签到按钮 |
| `src/app/credits/page.tsx` | 积分充值页面 |

#### P5 — 用户设置

| 文件 | 内容 |
|---|---|
| `src/app/api/settings/password/route.ts` | 修改密码 |
| `src/app/settings/page.tsx` | 设置页面 |

---

### 阶段三：工程打磨

#### P6 — UI/UX 完善
- 骨架屏加载状态
- 错误边界 & Toast 提示
- 暗色模式切换
- 过渡动画
- Responsive 优化

---

## 项目结构

```
src/
  lib/
    db.ts              — SQLite 数据库
    auth.ts            — JWT 生成/验证
    image.ts           — 图片生成 API 封装
    video.ts           — 视频生成 API 封装
  app/
    page.tsx           — 首页
    login/page.tsx     — 登录
    register/page.tsx  — 注册
    create/page.tsx    — 生成页（图文 Tab 切换）
    dashboard/page.tsx — 用户面板 & 历史记录
    image/[id]/page.tsx — 图片详情（P3）
    video/[id]/page.tsx — 视频详情（P3）
    credits/page.tsx   — 积分充值（P4）
    settings/page.tsx  — 用户设置（P5）
    api/
      register/route.ts
      login/route.ts
      me/route.ts
      me/images/route.ts
      me/videos/route.ts
      generate/image/route.ts
      generate/video/route.ts
      credits/transactions/route.ts（P4）
      credits/checkin/route.ts（P4）
      credits/recharge/route.ts（P4）
      settings/password/route.ts（P5）
```

## 数据库表

| 表 | 字段 | 备注 |
|---|---|---|
| `users` | id, name, email, password, credits, created_at | 已实现 |
| `images` | id, user_id, prompt, model, url, created_at | 已实现 |
| `videos` | id, user_id, prompt, model, status, progress, task_id, url, created_at | 已实现 |
| `credit_transactions` | id, user_id, type, amount, description, created_at | P4 待建 |

## 开发顺序

P1 → P2 → P3 → P4 → P5 → P6
