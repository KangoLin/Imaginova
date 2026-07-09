# Imaginova — UI 组件库 & 设计 Skill 资源清单

> 整理日期：2026-07-09

---

## 一、优秀 UI 组件库

### 1. shadcn/ui — 当前 React 生态主导地位
- **GitHub**: https://github.com/shadcn-ui/ui (100K+ stars)
- **网站**: https://ui.shadcn.com
- **核心特点**: copy-paste 分发模式，组件代码完全归你，零黑盒依赖
- **底层**: Radix UI（无障碍）+ Tailwind CSS
- **你的适用性**: ⭐⭐⭐⭐⭐ 你的项目已用 Tailwind CSS v4 + CSS 变量主题，和 shadcn 模式高度匹配
- **社区生态**: [awesome-shadcn/ui](https://ui.shadcn.com/awesome) 80+ 第三方扩展

### 2. Aceternity UI — 动画组件标杆
- **网站**: https://ui.aceternity.com
- **核心特点**: 200+ 生产级组件/block，Hero sections、Bento Grids、Parallax
- **依赖**: Framer Motion + Tailwind CSS
- **适合**: 首页营销区域、Create 页的视觉特效

### 3. Radix UI — 无障碍底层基元
- **GitHub**: https://github.com/radix-ui/primitives
- **网站**: https://www.radix-ui.com
- **核心特点**: 无样式、可访问的 UI 基元（Dialog、DropdownMenu、Tabs、Tooltip 等）
- **定位**: shadcn/ui 的内核，适合自建设计系统的团队

### 4. Cult UI — shadcn 动画扩展
- **网站**: https://www.cult-ui.com
- **核心特点**: 80+ 开源 animated components，直接 copy-paste 到 shadcn 项目
- **适合**: 需要开箱即用动画组件时

### 5. Motion Primitives — 动画基元
- **网站**: https://motion-primitives.com
- **核心特点**: 基于 Framer Motion 的可组合动画组件
- **适合**: 精细控制页面动效

### 6. DaisyUI — 快速原型
- **网站**: https://daisyui.com
- **GitHub**: 21K+ stars
- **核心特点**: 63 组件 + 30+ 主题，纯 CSS 零 JS 运行时开销
- **适合**: 需要快速出效果的纯 Tailwind 项目

### 7. Ninna UI — 2026 新秀，Tailwind v4 原生
- **GitHub**: https://github.com/ninna-ui/ninna-ui
- **核心特点**: 69 组件，零运行时主题（无 ThemeProvider），Tailwind CSS v4 优先
- **适合**: 想要 npm install 即用的现代组件库

### 8. Mantine — 功能全面的老牌库
- **网站**: https://mantine.dev
- **核心特点**: 组件覆盖全面、hook 丰富、文档优秀
- **适合**: 需要大量开箱即用组件时

---

## 二、AI 前端设计 Skill（用于 Claude Code / OpenCode）

### 1. UI UX Pro Max — 当前最火的 UI 设计 Skill（102K+ stars）
- **GitHub**: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **特点**: 57 种 UI 风格、95 色板、56 字体对、支持 16 种技术栈
- **安装**: `npm install -g uipro-cli && uipro install`
- **适用**: Claude Code、Cursor、Windsurf、GitHub Copilot、**OpenCode** 等

### 2. Taste Skill — 品味控制（37K+ stars）
- **GitHub**: https://github.com/ 搜索 "taste-skill"
- **特点**: 给 AI 提供"品味"控制参数，避免千篇一律的 AI 风 UI
- **子变体**: `elite-frontend-design-2026`、`bugbuster`

### 3. frontend-design（Anthropic 官方 Skill）— 已在你的 Skill 列表中
- **位置**: 本项目的系统 prompt 中已注册
- **特点**: 设计哲学 + 美学准则 + 代码规范，指导 AI 生成有辨识度的 UI
- **使用方法**: 加载 `skill frontend-design` 即可调用

### 4. Skill UI — 反向工程真实网站设计（12K+ stars）
- **GitHub**: https://github.com/ 搜索 "skill-ui"
- **特点**: 从真实网站提取设计系统，生成可用的 SKILL.md
- **适合**: 想模仿某个参考网站风格时

### 5. Pretext Layout — Canvas 文本布局
- **特点**: 用于生成海报、排版密集型页面的 canvas 文本布局 skill

### 6. Color Palette — 无障碍色板生成
- **GitHub**: https://github.com/ 搜索 "color-palette skill"
- **特点**: 生成符合 WCAG 标准的无障碍色板

### 7. Web Accessibility Website Audit — WCAG 审计
- **特点**: 自动检查 JSX 中的 ARIA 属性、heading 层级、颜色对比度等

### 8. Stitch — 设计反馈循环
- **特点**: 改进 Claude Code 的设计反馈流程，迭代式 UI 优化

### 9. 21st.dev — 组件级细节提升
- **特点**: 聚焦组件细节和交互质量，给 AI 生成的 UI 增加细节

### 10. Claude Design（Anthropic 官方产品，2026-04 发布）
- **特点**: Anthropic Labs 原生设计工具，生成原型、幻灯片、mockup
- **输出**: Canva、PDF、PPTX、HTML
- **注意**: 非 Skill 文件，是独立产品（Claude 内置功能）

---

## 三、对你项目最有价值的选择

按投入产出比推荐：

| 优先级 | 推荐 | 理由 |
|--------|------|------|
| 1 | **shadcn/ui** 引入 Button、Card、Dialog、Form 等组件 | 代码风格与项目一致，逐步替换手写 UI |
| 2 | **Aceternity UI** 首页动画 | 首页营销感强，适合 Hero + Bento Grid |
| 3 | **UI UX Pro Max Skill** | 新手引导设计系统生成，提升 AI 输出质量 |

是否要我开始引入？比如先从 **shadcn/ui** 开始改造现有组件？