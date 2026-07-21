# Imaginova GUI 使用逻辑问题清单

> 识别日期：2026-07-09
> 关联优化方案：`design-plans/ui-optimization-plan.md`（2026-07-16 更新）

---

## 优先级：高

### H1 — 受保护页面暴露 loading 骨架给未登录用户

**涉及**：`/create`、`/dashboard`、`/credits`、`/settings`、`/image/[id]`、`/video/[id]`

**问题**：所有受保护页面没有前置登录检查，用户在未登录状态下访问会先看到 loading 骨架屏和页面标题，然后 API 返回 401 才跳转到 `/login`。造成闪屏体验。

**方案**：添加 `middleware.ts` 做全局路由保护，或在页面入口做轻量 token 检查。

### H2 — 生成结果不跳转详情页，刷新后丢失

**涉及**：`src/app/create/page.tsx`

**问题**：图片/视频生成成功后 `setResultUrl(data.url)` 只存在 React state 中，页面刷新后结果消失。用户必须去 Dashboard 历史列表手动寻找，且没有任何"刚刚生成的那条"的标识。

**方案**：生成成功后自动跳转到 `/image/${data.id}` 或 `/video/${data.id}` 详情页。

---

## 2. 优先级：中

### M1 — 视频生成轮询期间 UX 不友好

**涉及**：`src/app/create/page.tsx`

**问题**：
- 用户发起视频生成后页面被轮询阻塞，无法做其他操作
- 离开页面后轮询自动停止（`pollingRef` cleanup），但用户不知道视频仍在后台生成中
- 没有"可以离开，去 Dashboard 查看"的提示

**方案**：添加 Toast 提示"视频正在后台生成，你可以去 Dashboard 查看进度"，并提供链接。

### M2 — 登录后跳到首页而非直接进入工作流

**涉及**：`src/app/login/page.tsx`

**问题**：登录成功后 `router.push("/")` 回到首页，用户需要再点一次"Start Creating"或导航 Create 链接才能开始用。多了一步操作。

**方案**：登录后直接 `router.push("/dashboard")`。

### M3 — 全局 Toast 系统未使用，消息样式不统一

**涉及**：Dashboard、Credits、Settings 等页面

**问题**：`toast.tsx` 提供了完整的 `useToast` 系统，但所有页面均使用内联消息（`<div>` + `setTimeout`），样式不统一。

**方案**：统一使用 `useToast`。

---

## 3. 优先级：低

### L1 — Logout 使用原生 form 提交导致全页刷新

**涉及**：首页、Create 页、Dashboard 页

**问题**：`<form action="/api/logout" method="POST">` 会导致浏览器全页刷新，破坏 SPA 体验。

**方案**：改为 fetch + `router.push("/")` + `router.refresh()`。

### L2 — Video 详情页不自动刷新状态

**涉及**：`src/app/video/[id]/page.tsx`

**问题**：如果视频正在 processing，页面不会自动轮询更新状态，用户需手动刷新。

**方案**：添加轮询逻辑，类似 Create 页的 `pollStatus`。

### L3 — Credits 页 recharge 后数据重复更新

**涉及**：`src/app/credits/page.tsx`

**问题**：`handleRecharge` 中先 `setUser` 手动更新，又调用 `fetchData()` 重新拉取，造成一次闪烁。

**方案**：去掉手动 `setUser`，只依赖 `fetchData()` 统一刷新。