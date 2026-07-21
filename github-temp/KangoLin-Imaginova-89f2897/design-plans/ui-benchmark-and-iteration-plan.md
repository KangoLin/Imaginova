# Imaginova UI 对标基准 & 迭代方案

> 生成日期：2026-07-17
> 范围：全站 UI 视觉升级（Landing / Create / Dashboard / Detail / Credits / Settings）
> 对标基准：全球顶级 AI 创意平台

---

## 一、对标基准网站

### 1. Krea.ai — 「暗色电影感」标杆
| 维度 | 特征 |
|------|------|
| 颜色 | 近黑画布 `#0b0f15`，纯黑 header `#000000`，纯白 CTA |
| 字体 | Suisse Intl（商业），display 72px/96px，weight 450 按钮 |
| 圆角 | 极简二分法：8px（卡片/输入框）/ 9999px（CTA 胶囊） |
| 间距 | 80-96px 段落间距，12-20px 元素间距 |
| 氛围 | 零装饰色，产品图片为唯一视觉主角 |
| 关键洞察 | **画布越暗，输出的 AI 内容越亮眼。白色 CTA 是页面上最亮元素** |

### 2. Leonardo.ai — 「创作者优先」平台
| 维度 | 特征 |
|------|------|
| 颜色 | 深色背景 + 紫色主色调渐变 |
| 字体 | 粗体无衬线 display，大字号标题 |
| 布局 | 产品截图 + 功能卡片 bento grid |
| 内容 | 强调生成物展示，大量使用用户作品 |
| 关键洞察 | **bento grid + 产品截图让用户秒懂产品价值** |

### 3. Armox.ai — 「节点工作流」视觉化
| 维度 | 特征 |
|------|------|
| 颜色 | 深色背景 + 品牌紫色 accent |
| 布局 | 三步节点引导（Add Node → Pick Model → Make Workflow） |
| 动效 | 交互式节点编辑器预览，拖拽感 |
| 关键洞察 | **可视化的 workflow 步骤极大降低用户认知负担** |

### 4. Aixio.app — 「设计工作室」精致感
| 维度 | 特征 |
|------|------|
| 颜色 | 深色渐变 + 白色/蓝色 accent |
| 字体 | 大号展示字体，紧凑 line-height |
| 布局 | 产品预览占据 50%+ 视口，左侧功能描述 |
| 关键洞察 | **以"真实编辑器截图"作为 hero，建立即时信任** |

### 5. Linear / Vercel — 极简开发工具
| 维度 | 特征 |
|------|------|
| 颜色 | 深色背景，白色为唯一 accent，无多余颜色 |
| 字体 | 紧凑 display tracking (-0.025em)，0 装饰 |
| 动效 | 极简微动效，只为功能服务 |
| 关键洞察 | **排版是唯一装饰。less is more 的最高执行者** |

---

## 二、Imaginova 当前问题诊断

### 首页 Landing Page

| 问题 | 严重度 | 描述 |
|------|--------|------|
| 深色模式不够深 | P0 | 当前 `--background: oklch(0.02)` ≈ `#050510`，对标 Krea 的 `#0b0f15`/`#000000`，太亮 |
| 缺少生成物展示 | P0 | 整个首页没有一张 AI 生成图片/视频展示，纯文字空洞 |
| CTA 对比度不足 | P1 | 主 CTA `bg-primary`(青绿) 在深色背景上缺乏冲击力，对标 Krea 的纯白 CTA |
| 特征卡片设计平淡 | P1 | 纯 `bg-card border` 卡片，没有层次感 |
| 缺少 social proof | P1 | 没有用户数量、创作者 logo 墙、评价等 |
| 动画太多无意义 | P2 | SplitText + fade-in + slide-up 同时使用，首屏加载太慢 |

### Create 页

| 问题 | 严重度 | 描述 |
|------|--------|------|
| 整体太窄 | P0 | `max-w-xl`（576px）过窄，输入区域局促 |
| 文件上传区简陋 | P0 | 虚线框 + 小图标，没有拖拽视觉反馈 |
| Select 组件风格不统一 | P1 | 原生 `<select>` 和 shadcn Select 混用 |
| 视频进度条太细 | P2 | 1.5px 进度条在宽屏上不易察觉 |
| 缺少模型切换 | P1 | 只有一个模型，没有展示模型选择能力 |

### Dashboard 页

| 问题 | 严重度 | 描述 |
|------|--------|------|
| stat cards 颜色硬编码 | P0 | `text-purple-400`、`text-cyan-400`、`text-amber-400` 与主题无关 |
| 网格间距紧凑 | P1 | `gap-3` 太挤，图片卡片信息密集 |
| skeleton 太普通 | P1 | 纯 `animate-pulse` 灰色块 |
| 空状态缺少创意 | P2 | 纯图标 + 文字，没有引导性 |
| 无批量操作 | P2 | 只能逐一删除 |

### Credits 页

| 问题 | 严重度 | 描述 |
|------|--------|------|
| 充值按钮全禁用 | P0 | "Coming Soon" 状态显示为不可点击，但 UI 占位不美观 |
| 余额展示太单调 | P1 | 纯文字数字，没有环状进度或视觉化 |
| 交易记录无分页 | P1 | 所有交易一次性加载 |

---

## 三、UI 迭代方案（分阶段执行）

### Phase 1 — 视觉基调重塑（P0）

#### 1.1 重新设计颜色系统
对标 Krea 的"暗色画布"哲学：

```css
/* 新深色主题 */
:root.dark {
  --background: oklch(0.015 0.003 280);   /* ≈ #07070a — 更黑 */
  --card: oklch(0.035 0.005 280);          /* ≈ #0a0a0e — 卡片微亮 */
  --card-elevated: oklch(0.055 0.008 280); /* ≈ #111116 — 悬浮卡片 */
  --primary: oklch(0.65 0.22 280);         /* 青绿更亮，在暗色上更醒目 */
  --accent: oklch(0.85 0.18 200);          /* 琥珀作为辅助色 */
  /* 保持纯白用于 CTA 文字和高亮元素 */
}
```

#### 1.2 重新设计 Landing Page 结构
```
Current:  Hero(h1+p+2btn) → Features(4 cards) → HowItWorks(3 steps) → CTA
New:      Hero(生成物背景 + h1 + 白CTA) → [生成物画廊] → Features(Bento grid) → HowItWorks → Logo wall → Testimonials → CTA
```

- Hero 改用全屏暗色 + AI 生成图片作为背景（类似 Krea 的 desk photography approach）
- 主 CTA 改用纯白填充（类似 Krea "Start for free" pill）
- 增加 **产品截图** 或 **生成物展示区域** — 让用户第一眼看到产品能做什么
- 增加 **Logo 信任墙**（类似 Armox "trusted by 12000+ creators"）

#### 1.3 圆角体系对齐
```
Current:  --radius: 0.5rem (8px) 单一值
New:      8px (卡片/输入) / 14px (弹窗/特殊容器) / 9999px (CTA pill)
```

---

### Phase 2 — Dashboard 重构（P0-P1）

#### 2.1 Stat Cards 重新设计
```tsx
// Before: 简单文字 + 硬编码颜色
// After: 微卡片 + 微型 sparkline / 环状进度 + 主题色 token
```
- 改为 `bg-card border border-border/60` + 内置微型数据可视化
- 移除硬编码颜色类，改用 `text-primary` / `text-accent`

#### 2.2 网格间距 & 卡片升级
- `gap-3` → `gap-4`（桌面），`gap-3`（移动端保持）
- 卡片 hover 增加 `shadow-lg shadow-primary/5` 更加明显
- 增加卡片顶部"操作栏"（下载/分享/删除快捷按钮在 hover 时展示）

#### 2.3 Skeleton 升级
- 从纯 `animate-pulse` 改为 `shimmer` 效果（斜向渐变扫光）

---

### Phase 3 — Create 页优化（P0-P1）

#### 3.1 布局扩大
- `max-w-xl` → `max-w-2xl`，给图片上传和参数更多空间
- prompt 输入框使用更大的字号 `text-base` → `text-lg`

#### 3.2 文件上传区重做
```tsx
// Before: border-2 border-dashed + 小图标
// After:  大面积 drop zone + 缩略图预览 + 清晰的操作提示 + 拖动时的放大动效
```
- 增加视觉反馈：拖动时 border 颜色 + 背景色渐变 + 缩放
- 上传后显示清晰的预览卡片含 X 关闭按钮

#### 3.3 Tab 切换动画
- Image/Video 切换时增加内容 fade + slide 过渡（framer-motion AnimatePresence）

#### 3.4 原生 Select 替换
- 将 6 处 `<select>` 全部替换为 shadcn/ui Select 组件（代码中已存在）

---

### Phase 4 — Credits & Detail 页增强（P1-P2）

#### 4.1 Credits 余额可视化
- 余额数字旁边增加**环形进度条**（展示已用/总量比例）
- 充值卡改为视觉化 pricing card（类似 Aixio 的 pricing 风格）

#### 4.2 图片 Detail 页
- 按钮布局移动端改为 `grid grid-cols-2`（已计划）
- 增加"下一张/上一张"导航（用户在同一次 session 中连续查看）

#### 4.3 Video Detail 页
- 确认自动轮询已实现（SSE）
- 增加生成完成后 Toast 通知

---

### Phase 5 — 动效 & 微交互升级（P1-P2）

#### 5.1 页面过渡
- 路由切换时：`animate-fade-in` 改为 framer-motion page transition（`duration: 0.2`）
- 去掉 Landing Page 首屏过多动画（SplitText + fade-in + slide-up 同时触发）

#### 5.2 按钮微交互
- 所有 Button 增加 `active:scale-[0.97]`（已部分实现，统一化）
- Primary CTA 增加 hover 发光效果（`box-shadow` glow）
- Loading 按钮增加骨架脉冲动画

#### 5.3 Scroll 动画
- Dashboard 加载使用 framer-motion stagger（已有 `containerVariants` ✅）
- Landing Page 特征卡片用 scroll-triggered 动画（而非页面加载就触发）

---

### Phase 6 — 设计 Token 体系对齐

#### 6.1 更新 MASTER.md
- 确认设计文档中的色板与实际代码完全一致
- 增加新的 token：`--card-elevated`、`--shadow-glow`、`--radius-pill`

#### 6.2 统一组件变体
- 确保所有 shadcn/ui 组件使用一致 variant 命名
- Badge 变体对齐：default / secondary / outline / destructive

---

## 四、执行优先级矩阵

```
                    高影响
                      │
      Phase 2         │     Phase 1
      Dashboard       │     视觉基调
      (高 effort)     │     (中 effort)
                      │
 ─────────────────────┼─────────────────────
                      │
      Phase 5         │     Phase 3 + 4
      动效升级         │     Create + Credits
      (低 effort)     │     (中 effort)
                      │
                    低影响

              低 effort     →     高 effort
```

### 推荐执行顺序

| 顺序 | Phase | 预估工时 | 原因 |
|------|-------|----------|------|
| 1 | **Phase 1** 视觉基调 | 2-3h | 立竿见影，所有页面受益 |
| 2 | **Phase 3** Create 页 | 1-2h | 核心功能页面，直接影响用户留存 |
| 3 | **Phase 2** Dashboard | 2-3h | 用户高频访问页面 |
| 4 | **Phase 4** Credits/Detail | 1-2h | 辅助页面，低 effort 高回报 |
| 5 | **Phase 5** 动效 | 1h | 锦上添花 |
| 6 | **Phase 6** 设计 Token | 0.5h | 维护性 |

---

## 五、参考截图（For AI Agent 视觉参考）

> 以下 URL 可以直接用于 AI 视觉理解：

| 网站 | URL | 学习重点 |
|------|-----|----------|
| Krea.ai | https://www.krea.ai/ | 暗色画布 + 纯白 CTA + 产品照片 hero |
| Leonardo.ai | https://leonardo.ai/ | Bento grid + 用户作品展示 |
| Armox.ai | https://armox.ai/ | Workflow 可视化 + Logo 信任墙 |
| Aixio.app | https://aixio.app/ | 编辑器预览作为 hero + 大字号排版 |
| shadcn Solaris | https://www.shadcn.io/template/solaris | AI SaaS 暗色模板，高质量 shadcn 参考 |

---

## 六、核心设计原则（TL;DR）

1. **画布更暗，内容更亮** — 背景接近纯黑，让 AI 生成物成为视觉主角
2. **白色 CTA 是最高对比武器** — 纯白按钮在暗色背景上不可忽视
3. **展示生成物，而不是描述功能** — 用 AI 图片/视频说话，去掉冗余文案
4. **圆角二分法** — 8px（功能元素）/ pill（CTA），没有中间态
5. **排版即装饰** — 大字号 display + 紧凑 tracking + 0 多余装饰图形
6. **减少首屏动画数量** — 一个主要动画胜过三个同时触发
