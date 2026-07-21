# 移动端 UI 适配问题记录

> 审查日期：2026-07-15
> 目标平台：Android / iOS / 各默认浏览器（Chrome、Safari、微信内置浏览器等）

---

## 目录

1. [严重问题](#1-严重问题)
2. [中等问题](#2-中等问题)
3. [小问题](#3-小问题)
4. [iOS 兼容性注意事项](#4-ios-兼容性注意事项)

---

## 1. 严重问题

### 1.1 Home 页面导航栏无移动端菜单

- **文件**: `src/components/home-content.tsx:29`
- **当前代码**:
  ```tsx
  <nav className="flex items-center gap-6 text-sm">
  ```
- **问题描述**: 所有导航项（Create、Dashboard、用户名、Sign Out、Language Switcher）都在一个 `flex` 行中，没有 `hidden md:flex` 响应式隐藏，也没有汉堡菜单。在 375px 视口下所有导航项同时可见，水平溢出。
- **影响**: CSRNavigation items overflow horizontally; users cannot access content beyond viewport
- **修复方案**: 添加 `hidden md:flex` 桌面端显示，移动端添加汉堡菜单下拉组件

### 1.2 Dashboard 统计网格始终 3 列

- **文件**: `src/app/(dashboard)/dashboard/page.tsx:345`
- **当前代码**:
  ```tsx
  <div className="grid grid-cols-3 gap-3 mb-8">
  ```
- **问题描述**: `grid-cols-3` 无响应式变体。在 375px 视口（`px-6` 后可用宽度 ~327px），每列仅 ~101px，卡片内 `p-4` 后内容区域仅 ~69px。中文标签和大额数字拥挤。
- **影响**: Cards cramped; labels may wrap awkwardly or overflow
- **修复方案**: 改为 `grid-cols-3 gap-2 sm:gap-3`，移动端缩小间距

### 1.3 Admin 导航栏无移动端菜单

- **文件**: `src/components/admin-navbar.tsx:19-37`
- **问题描述**: "Imaginova Admin" Logo + 3 个导航链接 + "Back to App" 链接都在一个 flex 行中，无响应式隐藏和汉堡菜单。在 375px 视口下严重溢出。
- **影响**: Severe horizontal overflow; "Back to App" pushed off-screen
- **修复方案**: 添加 `hidden md:flex` + 移动端汉堡菜单

### 1.4 视频详情页 3 列元信息过挤

- **文件**: `src/app/(detail)/video/[id]/page.tsx:142`
- **当前代码**:
  ```tsx
  <div className="flex gap-4 text-sm">
    <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">...</div>
    <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">...</div>
    <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">...</div>
  </div>
  ```
- **问题描述**: 三个 `flex-1` 子元素 + `gap-4`，每列 ~98px，`px-3` 后内容区域 ~74px。模型名如 "agnes-image-2.1-flash" 和日期会截断或换行混乱。
- **影响**: Content cramped, text wraps, layout looks broken
- **修复方案**: 移动端改为垂直堆叠，桌面端保持 3 列

### 1.5 Credits 页面余额数字无响应式

- **文件**: `src/app/(detail)/credits/page.tsx:107`
- **当前代码**:
  ```tsx
  <p className="text-6xl font-bold tracking-tight text-primary">{user.credits}</p>
  ```
- **问题描述**: `text-6xl`（60px）在 375px 屏幕上过大。大额数字（如 "1,234"）可能超过可用宽度。
- **影响**: Oversized number dominates viewport; large balances may overflow
- **修复方案**: 改为 `text-4xl sm:text-5xl lg:text-6xl`

### 1.6 Admin 审核页 Tabs 溢出

- **文件**: `src/app/admin/moderation/page.tsx:105-121`
- **当前代码**:
  ```tsx
  <div className="flex items-center gap-3 mb-6">
    <Tabs>...</Tabs>
    <Tabs>...</Tabs>
  </div>
  ```
- **问题描述**: 两个 TabsList 共 7 个标签在 `flex` 行中无 `flex-wrap`。在 375px 视口下严重溢出。
- **影响**: Tabs overflow off-screen; some tabs unreachable
- **修复方案**: 添加 `flex-col sm:flex-row`，移动端垂直堆叠

---

## 2. 中等问题

### 2.1 图片详情页按钮布局问题

- **文件**: `src/app/(detail)/image/[id]/page.tsx:102-119`
- **当前代码**:
  ```tsx
  <div className="flex flex-wrap gap-3">
    <Button>Download</Button>
    <Button variant="secondary">Copy Link</Button>
    <Button variant="outline">Share</Button>
    <Button size="sm" variant="ghost">Report</Button>
    <Button variant="destructive" className="ml-auto">Delete</Button>
  </div>
  ```
- **问题描述**: 5 个按钮 + `ml-auto` 在移动端形成 3 行布局，Delete 按钮独占一行靠右，视觉效果不均衡。
- **影响**: 3 rows of buttons, excessive vertical height, visually odd layout
- **修复方案**: 移动端改用 `grid grid-cols-2` 或在按钮容器上移除 `ml-auto`，使布局更均匀

### 2.2 Admin 概览页用户行溢出

- **文件**: `src/app/admin/page.tsx:131-139`
- **问题描述**: 用户行中 name + email + generations 用 `justify-between` 排布，长邮箱地址无 `truncate` 截断，导致行溢出。
- **影响**: Horizontal overflow from long email addresses
- **修复方案**: 给 email 添加 `truncate` 和 `overflow-hidden`

### 2.3 Dashboard 搜索框与 Tabs 过挤

- **文件**: `src/app/(dashboard)/dashboard/page.tsx:395-413`
- **当前代码**:
  ```tsx
  <div className="flex items-center gap-3 mb-6">
    <Tabs>...</Tabs>
    <div className="relative ml-auto max-w-56">...</div>
  </div>
  ```
- **问题描述**: 两个 Tabs + 搜索输入框（max-w-56, 224px）同行。在 375px 视口可用宽度 327px 下，搜索占 224px + gap 12px + Tabs 仅 ~91px。两个标签在 91px 内很挤。
- **影响**: Tabs compressed; search input takes majority of row width
- **修复方案**: 移动端 `flex-col sm:flex-row`，搜索框 `max-w-full sm:max-w-56`

---

## 3. 小问题

### 3.1 标题字号无响应式

多处页面使用 `text-3xl`（30px）作为标题，在 375px 屏幕上偏大：

| 文件 | 行号 | 当前字号 |
|------|------|----------|
| `src/app/(dashboard)/dashboard/page.tsx` | 339 | `text-3xl` |
| `src/app/(dashboard)/create/page.tsx` | 166 | `text-3xl` |
| `src/app/(detail)/settings/page.tsx` | 44 | `text-3xl` |
| `src/components/home-content.tsx` | 92, 110, 127 | `text-3xl sm:text-4xl` |

- **修复方案**: 统一使用 `text-2xl sm:text-3xl` 或 `text-3xl lg:text-4xl`

### 3.2 视频详情页进度条固定宽度

- **文件**: `src/app/(detail)/video/[id]/page.tsx:126`
- **当前代码**: `<div className="w-64 bg-muted rounded-full h-2 overflow-hidden">`
- **问题描述**: 进度条固定 `w-64`（256px），不随视口自适应
- **修复方案**: 改为 `w-full max-w-xs` 或 `w-64 sm:w-80`

### 3.3 Not Found 页面 `text-7xl`

- **文件**: `src/app/not-found.tsx:7`
- **当前代码**: `<h1 className="text-7xl font-bold tracking-tight text-primary mb-4">404</h1>`
- **问题描述**: `text-7xl`（72px）在 375px 屏幕上比例失调
- **修复方案**: 改为 `text-6xl sm:text-7xl`

### 3.4 Home Hero 标题行高问题

- **文件**: `src/components/home-content.tsx:59`
- **当前代码**: `<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ...">`
- **问题描述**: `leading-[1.1]` 在 36px 字号下中文换行时行距过紧
- **修复方案**: 改为 `leading-[1.2] sm:leading-[1.1]`

### 3.5 Dashboard 标题行与按钮拥挤

- **文件**: `src/app/(dashboard)/dashboard/page.tsx:337-343`
- **问题描述**: `text-3xl` 标题 + Check In 按钮在 `justify-between` 行中，中文环境下标题较长时会拥挤
- **修复方案**: 改为 `flex-col sm:flex-row`

### 3.6 图像 Lightbox 移动端适配

- **文件**: `src/app/(dashboard)/dashboard/page.tsx:68-91`
- **当前代码**: 已经使用了 `items-end md:items-center` 和 `p-0 md:p-4`
- **问题描述**: 虽然已有响应式处理，但移动端 `max-h-[70vh]` 在 iOS Safari 上会忽略地址栏高度，导致图片区域计算不准确
- **修复方案**: 使用 `max-h-[70dvh]` 替代 `max-h-[70vh]`

---

## 4. iOS 兼容性注意事项

| 问题 | 说明 | 处理方式 |
|------|------|----------|
| `100vh` 地址栏问题 | iOS Safari 上 `100vh` 包含地址栏高度，导致底部被切 | 使用 `min-h-dvh` / `100dvh` |
| `backdrop-filter` 性能 | 部分低端安卓设备上 `backdrop-filter: blur()` 卡顿 | 降级方案：不支持时使用半透明纯色背景 |
| 表单自动缩放 | iOS Safari 上 `<input>` / `<select>` 字号 `<16px` 时自动缩放 | 保持 `font-size: 16px` 或添加 `font-size: 16px` 样式覆盖 |
| 点击响应延迟 | 部分浏览器仍有 300ms 点击延迟 | 已通过 Tailwind `active:` 变体处理，确保 Touch 事件绑定 |
| -webkit-scrollbar 兼容 | iOS 和部分安卓浏览器不支持自定义滚动条 | `::-webkit-scrollbar` 仅在支持时生效 |
| Overscroll 行为 | iOS 上 overscroll 会露底 | `overscroll-behavior: none` 在模态框上使用 |
| 固定定位 + 键盘弹出 | iOS Safari 上键盘弹出时 `fixed` 元素定位错乱 | 输入框避免在底部固定元素内 |
| viewport 图片宽度 | 安卓浏览器对 `object-fit: cover` 渲染精度不一致 | 使用 `Image` 组件 + `sizes` 属性精确控制 |
