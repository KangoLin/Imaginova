# UI 重塑 — GPT 方案执行计划

> 基于 GPT 的 "Apple + Aesop + 高级时尚杂志" 方向
> 配色：黑 (#0B0B0D) + 米白 (#F8F6F1) + 灰 (#888888) + 香槟金 (#C8A96A)

---

## Week 1 — 设计系统 + 首页

### 1.1 全局设计 Token（globals.css）

**CSS 变量重构：**

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#F8F6F1` (米白) | `#0B0B0D` (近黑) |
| `--foreground` | `#0B0B0D` | `#F8F6F1` |
| `--card` | `#FFFFFF` | `#1A1A1E` |
| `--card-elevated` | `#F0EDE6` | `#252529` |
| `--primary` | `#C8A96A` (香槟金) | `#D4B87A` (亮金) |
| `--accent` | `#0B0B0D` (纯黑点缀) | `#F8F6F1` (米白点缀) |
| `--border` | `#E5E0D6` | `#2C2C32` |
| `--ring` | `#C8A96A` | `#D4B87A` |

**Radius 调整：**
- `--radius`: `0.375rem` (6px — 工具感)
- `--radius-pill`: `9999px` (CTA 保留)

**删除：**
- `@utility text-gradient`（不再需要紫青渐变）
- `@utility glow-primary`, `@utility glow-accent`
- `.dark body` 中的紫青 radial-gradient 背景

**字体：**
- 外文字体: Inter (已有) 或 Geist Sans
- 中文字体: 保持系统字体

### 1.2 首页重构（home-content.tsx）

**结构：**

```
Section 1 — Hero
- 大标题: "Create visuals that sell."
- 副标题: "AI-powered fashion images, campaign videos and brand content."
- 按钮: "Create your campaign"（金色胶囊）+ "Explore examples"（描边）
- 背景: 全屏高清时尚大片（交替轮播或固定一张）
- 去掉"实时在线"badge、紫色渐变

Section 2 — What can AI create?
- 标题: "What can AI create?"
- 3 张大卡片:
  1. Fashion Campaign（模特大片 + "Turn one product image into a complete campaign"）
  2. Product Photography（商品图）
  3. Social Content（短视频）
- 卡片风格: 图片背景 + 白色叠加文字，无紫青元素

Section 3 — From product to campaign
- 标题: "From product to campaign in seconds."
- 流程展示: Upload → Generate → Publish（三步）
- 配简单动效

Section 4 — Showcase（保留现有 4 格展示，但全部替换为时尚案例图片）
- 是否保留取决于 Week 4 的 50 个案例准备进度

Section 5 — CTA
- "Ready to create your next campaign?"
- 金色胶囊按钮
```

**文案变更：**
- 当前英文文案全部替换为 GPT 推荐的 fashion 指向文案
- locale keys 需要更新（en.json / zh.json）

### 1.3 Navbar 适配新配色

- Logo 颜色: 金色 (#C8A96A)
- 背景: 透明 / 米白
- 按钮: 描边金

---

## Week 2 — Create 页重构

### 2.1 导航架构重组

**从平铺 5 模式 → 分类入口：**

```
┌──────────────────────────────────────┐
│ Creative Studio                      │
│                                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Fashion │ │  Brand  │ │ Portrait │ │
│ │  👗     │ │  📋     │ │  👤     │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│                                      │
│ Virtual Try-On    Poster      Style  │
│ Product Shoot     Banner       Age   │
│ Fashion Video     Ads        Gender  │
└──────────────────────────────────────┘
```

**实现方式：**
- 去掉当前 5 个并排按钮
- 增加大分类卡片（Fashion / Brand / Portrait）
- 选中分类后展示子模式
- 每次切换保留独立 URL（兼容现有路由）

### 2.2 左右分栏布局（Fashion Studio）

**左侧（~400px）：表单面板**
- 上传区: 纯背景色块（无虚线），hover 时显示细实线边框
  - `bg-zinc-100 dark:bg-zinc-900 border border-transparent hover:border-border`
- 场景选择: Segmented Control / 横向滚动胶囊
- 生成按钮: 固定在底部（sticky）

**右侧（剩余空间）：实时预览**
- 初始: 品牌 logo 呼吸动画占位
- 生成后: 大图展示 + 下载/重新生成按钮

### 2.3 上传区改造

- 去掉 `border-2 border-dashed`
- 改为：纯色背景块 + 拖入时高亮

---

## Week 3 — Auth + Dashboard

### 3.1 登录/注册页

**杂志跨页布局：**
```
┌───────────────────┬──────────────────┐
│                   │                  │
│    AI 时尚大片     │   登录表单        │
│    （全屏覆盖）    │   垂直居中        │
│                   │                  │
│  每 10 秒切换     │  极简 input      │
│                   │  无图标           │
│                   │                  │
└───────────────────┴──────────────────┘
```

- `grid grid-cols-1 md:grid-cols-2 h-screen`
- 左侧: `object-cover` 全屏时尚大片（随机/轮播）
- 右侧: 纯白/纯黑底 + 居中表单

### 3.2 Dashboard → Creative Library

**风格：Behance / Pinterest 瀑布流**
- 去掉统计卡片（Images 11 / Videos 5 / Credits 1150）
- 改为 "Your Creative Library" + "24 campaigns created"
- 作品网格保留，但去掉大圆角（12px → 8px）
- 去掉 framer-motion 的过渡动效（性能），改用简单 CSS transition

---

## Week 4 — 细节打磨

### 4.1 动效

- 首页文字渐显（已有 `animate-fade-in`，保留）
- 图片缓慢缩放的视差效果
- 生成流程的状态展示（"Analyzing product → Generating model → Rendering"）

### 4.2 生成体验优化

当前 loading spinner → 改成：
```
Creating your campaign...

▸ Analyzing product    ✓
▸ Generating model     ◌ (active)
▸ Rendering final      ◌
```

### 4.3 字体

- 确保 Inter/Geist 正确加载
- 中文：HarmonyOS Sans 可选项（通过 next/font）

### 4.4 案例填充

- 至少准备 10-20 个高质量 fashion 案例
- 上传到 `public/images/campaigns/`
- 首页 showcase 全部替换

---

## 文件清单与影响范围

| 文件 | Week | 改动 |
|------|------|------|
| `src/app/globals.css` | W1 | 全部 CSS 变量重写 |
| `src/components/home-content.tsx` | W1 | 完全重写 |
| `src/app/layout.tsx` | W1 | 字体调整 |
| `src/locales/en.json` | W1 | 首页文案更新 |
| `src/locales/zh.json` | W1 | 首页文案更新 |
| `src/app/(dashboard)/create/page.tsx` | W2 | 导航 + 布局重构 |
| `src/app/login/page.tsx` | W3 | 跨页布局 |
| `src/app/register/page.tsx` | W3 | 跨页布局 |
| `src/app/(dashboard)/dashboard/page.tsx` | W3 | 风格调整 |
| `src/components/navbar.tsx` | W1 | 配色适配 |
| `src/proxy.ts` | — | 无改动 |
| `src/lib/*` | — | 无改动 |
| `src/app/api/*` | — | 无改动 |
| `public/images/campaigns/*` | W4 | 新案例图 |

---

## 验证方式

```bash
npm run lint    # 每次改动后
npm run build   # 每阶段结束时
npm test        # 确保不破坏现有测试
```