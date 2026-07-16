# Imaginova UI 优化方案

> 生成日期：2026-07-16
> 最后更新：2026-07-16（P0+P1 已实施完成）
> 审核范围：用户面向页面（Home、Create、Dashboard、Image/Video Detail、Settings、Credits）
> 基于：UI Skills (baseline-ui + improve-ui) 评估

---

## 设计语言审计

- **审核表面**: Imaginova 用户端全部页面（Home / Create / Dashboard / Image/[id] / Video/[id] / Settings / Credits）
- **设计来源**: `design-system/imaginova/MASTER.md`（页面级: login.md, home.md, dashboard.md, create.md）
- **已记录决策**: 青绿(Teal)主色调 + 琥珀(Amber)强调色；OKLCH 色彩空间；shadcn/ui base-nova 风格
- **实际代码主题**: `globals.css`（`:root` + `.dark`）使用 OKLCH 变量
- **未同步**: `design-system/imaginova/MASTER.md` 仍描述 "AI purple + generation pink"（`#7C3AED` + `#EC4899`），与当前代码的 teal/amber 主题不符

---

## 一、P0 — 关键问题

### 1.1 设计文档与实际代码不一致

- **涉及**: `design-system/imaginova/MASTER.md`
- **问题**: 设计规范定义的是紫色(`#7C3AED`)主色 + 粉色(`#EC4899`)强调色，但实际代码使用青绿(teal, `oklch(0.55 0.13 185)`) + 琥珀(amber, `oklch(0.72 0.14 75)`)
- **影响**: 设计文档无法作为可靠参考，新功能开发时 AI/开发者会被误导
- **方案**: 更新 MASTER.md 中的色板与实际代码一致

### 1.2 未登录用户暴露受保护页面骨架屏

- **涉及**: `/create`、`/dashboard`、`/credits`、`/settings`、`/image/[id]`、`/video/[id]`
- **问题**: 受保护页面无前置登录检查，用户先看到 loading 骨架 + 页面标题，API 返回 401 后才跳转 `/login`，造成闪屏
- **影响**: 糟糕的首屏体验，用户可见布局闪烁
- **来源**: `docs/GUI-ISSUES.md` H1
- **方案**: 添加 `middleware.ts` 做全局路由保护，或在页面入口做轻量 token 检查后再渲染

### 1.3 视频生成轮询阻塞用户体验

- **涉及**: `src/app/(dashboard)/create/page.tsx`
- **问题**: 
  - 视频生成期间页面被轮询阻塞，用户无法做其他操作
  - 离开页面后轮询自动停止，但用户不知道视频仍在后台生成
  - 没有"可离开页面"的提示
- **来源**: `docs/GUI-ISSUES.md` M1
- **方案**: 添加 Toast 提示"视频正在后台生成，你可以去 Dashboard 查看进度"

---

## 二、P1 — 中等问题

### 2.1 登录后跳转到首页而非工作流

- **涉及**: `src/app/login/page.tsx`
- **问题**: 登录成功后 `router.push("/")` 回到首页，用户需要再点一次才能开始使用
- **来源**: `docs/GUI-ISSUES.md` M2
- **方案**: 改为 `router.push("/dashboard")`

### 2.2 Toast 系统未统一使用

- **涉及**: Dashboard、Credits、Settings 等多页面
- **问题**: `toast.tsx` 提供了完整的 `useToast` 系统，但各页面自建内联消息（`<div>` + `setTimeout`），样式不统一
- **来源**: `docs/GUI-ISSUES.md` M3
- **方案**: 全局搜索 `setTimeout.*set(Error|Message)` 和手动消息 `<div>`，统一替换为 `useToast`

### 2.3 Logout 使用原生 form 提交

- **涉及**: 首页 `<form action="/api/logout" method="POST">`
- **问题**: 原生 form 提交导致全页刷新，破坏 SPA 体验
- **来源**: `docs/GUI-ISSUES.md` L1
- **方案**: 改为 `fetch("/api/logout", { method: "POST" })` + `router.push("/")` + `router.refresh()`

### 2.4 设计系统 Token 在 `@theme inline` 中内联过长

- **涉及**: `src/app/globals.css:126`
- **问题**: `@theme inline` 块将所有 Tailwind token 映射写在一行（超长行），难以维护
- **影响**: 可读性差，修改需要搜索长字符串
- **方案**: 拆分为多行，每行一个 token 映射

### 2.5 部分页面缺少语义化 HTML 结构

- **涉及**: 多处页面
- **问题**: `<main>` 标签使用不一致，部分页面用 `div` 替代；heading 层级（h1→h2→h3）需检查
- **方案**: 确保所有页面使用 `<main>` 包裹内容，heading 层级连续

---

## 三、P2 — 优化建议

### 3.1 使用 `dvh` 替代 `vh`

- **涉及**: `src/app/(dashboard)/dashboard/page.tsx` 中 lightbox 使用 `max-h-[70dvh]`（已正确），需全局检查其他 `vh` 使用
- **baseline-ui 规则**: MUST use `h-dvh`，NEVER use `h-screen` / `vh`
- **方案**: grep 全局搜索 `h-screen` 和 `[0-9]*vh`，替换为 `dvh` 等效

### 3.2 移动端 `safe-area-inset` 支持

- **涉及**: 所有固定定位元素（navbar, lightbox）
- **baseline-ui 规则**: MUST respect `safe-area-inset` for fixed elements
- **方案**: 为固定元素添加 `pt-[env(safe-area-inset-top)]` 和 `pb-[env(safe-area-inset-bottom)]`

### 3.3 图片/视频详情页按钮布局优化

- **涉及**: `src/app/(detail)/image/[id]/page.tsx:102-119`
- **问题**: 5 个按钮在移动端布局 3 行，Delete 按钮独占一行靠右，视觉效果不均衡
- **来源**: `docs/mobile-ui-issues.md` 2.1
- **方案**: 移动端改用 `grid grid-cols-2` 布局

### 3.4 Video 详情页状态自动刷新

- **涉及**: `src/app/(detail)/video/[id]/page.tsx`
- **问题**: 如果视频正在 processing，页面不会自动轮询更新状态，用户需手动刷新
- **来源**: `docs/GUI-ISSUES.md` L2
- **方案**: 添加轮询逻辑，类似 Create 页的 `startSSE`

### 3.5 Credits 页 recharge 后数据重复更新

- **涉及**: `src/app/(detail)/credits/page.tsx`
- **问题**: `handleRecharge` 中先手动 `setUser`，又调用 `fetchData()` 重新拉取，造成一次闪烁
- **来源**: `docs/GUI-ISSUES.md` L3
- **方案**: 去掉手动 `setUser`，只依赖 `fetchData()` 统一刷新

### 3.6 动画性能合规检查

- **涉及**: 全局
- **baseline-ui 规则**: 
  - MUST animate only compositor props (`transform`, `opacity`)
  - NEVER animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`)
  - NEVER exceed `200ms` for interaction feedback
- **方案**: 审查现有动画 `transition-all` 使用，确保无障碍合成器属性

### 3.7 使用 lucide-react 图标组件替代内联 SVG

- **涉及**: 多处定义和使用内联 SVG（lightbox 箭头、关闭按钮、HamburgerIcon 等）
- **问题**: 项目已安装 `lucide-react`，但多处使用手写内联 SVG，增加维护成本
- **方案**: 将内联 SVG 替换为 lucide-react 的对应图标组件（`X`、`ChevronLeft`、`ChevronRight`、`Menu` 等）

### 3.8 原生 select 替换为 shadcn/ui 组件

- **涉及**: `src/app/(dashboard)/create/page.tsx` 中多个 `<select>` 元素
- **问题**: 页面使用原生 select，与项目已使用的 shadcn/ui 风格不一致
- **方案**: 
  - 低投入：保持原生但添加 shadcn 样式
  - 推荐：引入 shadcn Select 或使用 Base UI Select

---

## 四、跨平台 & 跨浏览器兼容性

> 目标平台：iOS Safari / Android Chrome / 微信内置浏览器（X5 Blink）/ 其他 WebView

### 4.1 iOS Safari

| # | 问题 | 影响 | 当前代码 | 修复方案 |
|---|------|------|----------|----------|
| 4.1.1 | `min-h-screen` → `min-h-dvh` | iOS Safari 上 `100vh` 包含地址栏高度，底部内容被地址栏遮挡 | **10 处**使用 `min-h-screen`（layout.tsx ×2, login/register/forgot/reset/not-found/error/home/dashboard/detail layout） | 全部改为 `min-h-dvh`。Tailwind v4 已支持 `min-h-dvh` 类 |
| 4.1.2 | `backdrop-filter: blur()` 性能 | iOS Safari 上 `backdrop-blur-xl` 在低内存设备上可能导致滚动卡顿 | `navbar.tsx:70`, `admin-navbar.tsx:52`, `home-content.tsx:60` 及多个 lightbox 按钮 | 添加降级：`bg-background/95` 兜底，不支持 `backdrop-filter` 的设备自动降级 |
| 4.1.3 | 固定定位 + 键盘弹出 | iOS Safari 键盘弹出时 `fixed` 元素定位错乱，工具栏覆盖输入框 | Create 页无此问题（无底部 fixed 元素），需确认其他页面 | 确保没有输入框位于底部固定元素内。Create 页 navbar 是顶部 fixed，安全 |
| 4.1.4 | 表单字号自动缩放 | iOS Safari 上 `<input>`/`<select>` 字号 `<16px` 时自动放大，影响布局 | Create 页 input 使用 `text-base`（16px）✅；但 select 标签 `text-sm`（14px）需检查 | 确保所有 `<input>`/`<select>`/`<textarea>` 使用 `text-base`（16px），或全局 CSS 设置 `font-size: 16px` |
| 4.1.5 | Clipboard API 兼容性 | iOS Safari 14+ 支持 `navigator.clipboard`，但需要 HTTPS 上下文 | `image/[id]/page.tsx:59`, `video/[id]/page.tsx:91` 使用 `navigator.clipboard.writeText` | 添加 fallback：`document.execCommand('copy')` 兜底 |
| 4.1.6 | `-webkit-scrollbar` 样式无效 | iOS Safari 不支持自定义滚动条样式 | `globals.css:129-132` 定义了 `::-webkit-scrollbar` | 这些样式在 iOS 上仅静默失效，不影响功能；保持现状 |
| 4.1.7 | `overscroll-behavior` 未使用 | iOS Safari 上模态框/lightbox 下拉会露出底部背景 | Lightbox (`dashboard/page.tsx`) 有 `document.body.style.overflow = "hidden"`，但未设置 `overscroll-behavior` | Lightbox 打开时添加 `document.body.style.overscrollBehavior = "none"` |

### 4.2 Android Chrome / WebView

| # | 问题 | 影响 | 当前代码 | 修复方案 |
|---|------|------|----------|----------|
| 4.2.1 | `backdrop-filter` 低端设备卡顿 | 部分低端 Android 设备（如 Redmi、OPPO 中低端）GPU 不支持硬件加速 blur | 同 4.1.2，navbar 和 lightbox 多处使用 | 添加 `@supports (backdrop-filter: blur())` 检测；不支持时使用 `bg-background/95` 纯色背景 |
| 4.2.2 | `object-fit: cover` 渲染精度 | 部分 Android 浏览器对 `object-fit: cover` 在 `<Image>` 中使用时渲染不一致 | 多处使用 `<Image fill className="object-contain/cover">` | ✅ Next.js Image 组件已处理大部分差异；需确保 `sizes` 属性正确 |
| 4.2.3 | 300ms 点击延迟 | 部分旧版 Android WebView 仍有触摸延迟 | 未发现专门处理 | Tailwind 的 `active:` 变体已在 button 中使用（`active:scale-[0.97]`），建议添加全局 touch-action: manipulation |
| 4.2.4 | 微信 X5 Blink 内核 | 微信内置浏览器基于 X5 Blink，对 ES2020+ 特性支持可能有限 | 未发现使用 `?.` 或 `??` 之外的高级 ES 特性 | 确保构建工具（Next.js）已配置合适的 target/transpile |
| 4.2.5 | Android 原生 select 外观 | 各厂商 ROM 对 `<select>` 渲染差异大，华为/小米/Oppo 样式各不相同 | Create 页 6 处 `<select>` 使用原生 | 使用 shadcn/ui Select 或 Base UI Select 统一风格 |

### 4.3 微信内置浏览器（X5 Blink）

| # | 问题 | 影响 | 修复方案 |
|---|------|------|----------|
| 4.3.1 | localStorage 可能不可用 | 部分微信内置浏览器在无痕/隐身模式下 localStorage 写入会抛异常 | 当前代码已有 `try/catch` 包裹（`layout.tsx:48-60`）✅ |
| 4.3.2 | 字体渲染差异 | 微信浏览器对 `Inter` 字体加载可能失败，fallback 到系统字体 | root layout 已设置 `font-family: var(--font-sans), system-ui, -apple-system, sans-serif` ✅ |
| 4.3.3 | 视频播放限制 | 微信内置浏览器可能限制视频自动播放 | `video/[id]/page.tsx` 使用 `controls autoPlay` → 需添加 `playsInline` 和 `muted` |
| 4.3.4 | HTTPS 要求 | 微信内置浏览器对混合内容严格限制 | 确保所有资源使用 HTTPS，图片/视频 URL 已代理通过 `/api/proxy/` ✅ |

### 4.4 Safari 桌面版（macOS）

| # | 问题 | 修复方案 |
|---|------|----------|
| 4.4.1 | Safari 对 `dvh` 支持晚（15.4+） | 使用 `@supports (height: 100dvh)` 检测；不支持时 fallback 到 `100vh` |
| 4.4.2 | Safari 字体渲染偏细 | Nightly 中 `font-weight` 需要比 Chrome 略粗的值才能达到相同视觉效果；可考虑全局 `-webkit-font-smoothing: antialiased` ✅ 已有 `system-ui, -apple-system` fallback |

### 4.5 性能优化

| # | 优化点 | 说明 | 方案 |
|---|--------|------|------|
| 4.5.1 | 图片懒加载 | 使用 Next.js `<Image>` 默认 lazy loading，但 dashboard grid 可能同时加载过多图片 | Dashboard 分页 + 确保 `loading="lazy"` + `sizes` 属性优化 |
| 4.5.2 | CSS 动画性能 | `transition-all` 会触发重排 | 审查所有 `transition-all` 使用，替换为 `transition-[transform,opacity]` |
| 4.5.3 | 触摸事件优化 | iOS 和 Android 触摸滚动优化 | 添加 `-webkit-overflow-scrolling: touch` 到滚动容器 |

---

## 五、设计文档更新清单

| 文件 | 需要更新 | 状态 |
|------|----------|------|
| `design-system/imaginova/MASTER.md` | 色板全部更新（紫色→青绿，粉色→琥珀） | ✅ 已更新 |
| `design-system/imaginova/pages/dashboard.md` | 验证是否匹配 | ⏳ 待验证 |
| `design-system/imaginova/pages/create.md` | 验证是否匹配 | ⏳ 待验证 |
| `design-system/imaginova/pages/home.md` | 验证是否匹配 | ⏳ 待验证 |
| `docs/UI-RESOURCES.md` | ✅ 已更新 | ✅ |
| `docs/GUI-ISSUES.md` | 完成后标记已修复 | ⏳ 待跟踪 |
| `docs/mobile-ui-issues.md` | ✅ 已全部完成 | ✅ |

---

## 六、执行状态

```
                     已完成 (P0+P1)                         待完成 (P2)
┌─────────────────────────────────────────┐   ┌──────────────────────────────┐
│ ✅ 1.1 MASTER.md 色板同步               │   │ ⏳ 3.2 safe-area-inset      │
│ ✅ 1.2 middleware 路由保护               │   │ ⏳ 3.3 按钮布局优化         │
│ ✅ 1.3 视频生成提示（locale 已存在）      │   │ ⏳ 3.4 Video 轮询           │
│ ✅ 4.1.1 min-h→dvh（10处）              │   │ ⏳ 3.5 Credits 刷新         │
│ ✅ 4.3.3 视频 playsInline+muted         │   │ ⏳ 3.6 动画合规              │
│ ✅ 4.2.5 Select 组件化                  │   │ ⏳ 3.7 lucide 图标替换      │
│ ✅ 2.1 登录跳转 Dashboard               │   │ ⏳ 4.1.5 Clipboard fallback │
│ ✅ 2.2 Toast 系统（关键页面已统一）       │   │ ⏳ 4.1.2 backdrop-filter   │
│ ✅ 2.3 Logout 改造                      │   │ ⏳ 4.5.2 transition-all   │
│ ✅ 2.4 @theme 格式化                    │   │ ⏳ 4.5.3 scroll优化        │
│ ✅ 2.5 HTML 语义化                      │   │                            │
│ ✅ 4.1.4 表单字号 16px                  │   │                            │
│ ✅ 4.1.7 overscroll-behavior            │   │                            │
│ ✅ 4.2.3 touch-action                   │   │                            │
└─────────────────────────────────────────┘   └──────────────────────────────┘
```
```

> 引用文档：
> - `docs/mobile-ui-issues.md` — 移动端适配（已全部完成 ✅）
> - `docs/GUI-ISSUES.md` — GUI 逻辑问题（部分待修复）
> - `docs/UI-RESOURCES.md` — UI 组件库资源清单
> - `design-system/imaginova/MASTER.md` — 设计规范（需同步实际代码）
> - `C:\Users\xgame\.config\opencode\skills\baseline-ui\SKILL.md` — UI 基线约束
> - `C:\Users\xgame\.config\opencode\skills\improve-ui\SKILL.md` — UI 审计方法论
