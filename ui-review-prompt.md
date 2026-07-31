# UI 优化分析提示词

## 项目背景
**Imaginova** — AI 创意内容生成平台（SaaS），主打 Fashion e‑commerce 虚拟试穿（Virtual Try‑On），后续扩展至其他垂直领域。

- 技术栈：Next.js 16 App Router + Tailwind CSS 4 + shadcn/ui
- 主题色：Primary = oklch(0.5 0.22 280)（紫色），Accent = oklch(0.55 0.2 200)（青色）
- 圆角系统：8px（功能元素）、14px（容器/模态框）、9999px（CTA 按钮）
- 暗黑模式：class 驱动（`.dark`）
- 移动端：≤375px 适配，触摸目标 ≥36px（理想 44px）
- 所有 `min-h-screen` → `min-h-dvh`

## 需要分析的页面

所有页面已截图保存在 `D:\Imaginova\screenshots\` 目录下，共 6 张：

| 文件名 | 页面 | 说明 |
|--------|------|------|
| `homepage.png` | `/` 首页 | Hero + 3 卡片 Studio 入口 + 4 张 Showcase + CTA |
| `create-general.png` | `/create` 创作总页 | 顶部 5 张横排模式卡片（AI Image / Try‑On / Style Transfer / Gender Swap / Age Transform），下方为默认表单 |
| `create-try-on.png` | `/create?mode=try-on` | 虚拟试穿模式表单 |
| `create-style-transfer.png` | `/create?mode=style-transfer` | 风格迁移模式表单 |
| `create-gender-swap.png` | `/create?mode=gender-swap` | 性别转换模式表单 |
| `create-age-transform.png` | `/create?mode=age-transform` | 年龄变换模式表单 |

## 分析要求

请逐页面做以下分析，每个页面都要覆盖：

### 1. 布局与信息层级
- 视觉重心是否正确？用户第一眼看到的是否是核心操作？
- 留白是否合理？是否有过度拥挤或过度空旷的区域？
- 内容分组是否清晰？Card / Section 的分隔是否直观？
- 页面长度是否合适？是否有不必要的滚动？

### 2. 颜色与对比度
- Primary / Accent 紫色 + 青色是否协调？是否需要调整饱和度或明度？
- 背景色、卡片背景、文字颜色的对比度是否满足 WCAG AA？
- 按钮颜色是否传达正确状态（主操作 / 次操作 / 危险）？
- 暗黑模式是否有单独考虑？

### 3. 排版（Typography）
- 字号层级（标题 / 副标题 / 正文 / 辅助文字）是否分明？
- 行高、字间距是否易读？
- 长文本（如果有）是否在合适宽度（~65ch）内？

### 4. 交互与反馈
- 按钮 / 链接 / 卡片是否有 hover / active / focus 状态？
- 表单输入是否有占位符提示、验证反馈、成功/错误状态？
- 加载状态是否有 skeleton / spinner？
- 点击区域是否够大（≥44px for touch）？

### 5. 移动端适配（≤375px 视口）
- 布局是否响应式折叠？
- 文字是否过小？
- 是否有水平滚动或溢出？
- 触摸目标是否足够？

### 6. 一致性
- 与 shadcn/ui 设计规范是否一致？
- 圆角、阴影、间距是否统一？
- 图标风格、按钮样式是否一致？

### 7. 可参考的 UI 灵感
- 参考电商 / DTC 品牌网站的 UI 设计（如 Nike、SHEIN、ZARA、SSENSE、Farfetch、Goat、StockX 等）
- 重点分析：商品（图片）展示方式、卡片网格布局、筛选/搜索交互、购买/转化漏斗的视觉引导
- 将电商领域成熟的视觉信任感、图片优先的布局、清晰的行动引导借鉴到 Imaginova 的"创作"流程中

### 8. 改进建议
- 给出具体、可落地的修改方案（含 CSS / Tailwind 类名建议）
- 按优先级分 P0（必须改）、P1（建议改）、P2（锦上添花）
- 同时考虑开发成本与视觉收益的平衡

---

请开始逐页面分析。先通读所有截图，然后按页面逐一输出分析结果和改进建议。