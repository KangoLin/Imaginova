# 管理后台 — 使用量统计 & 内容审核 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Imaginova 构建管理后台，包含使用量统计看板与内容审核功能

**Architecture:** 在现有 Next.js 16 App Router 中新增 `/admin` 路由组，独立于前台布局。后端 API 复用 `src/lib/db.ts` 的数据库连接和 `src/lib/auth.ts` 的 JWT 认证，通过 `role` 字段区分管理员。前端使用现有 shadcn/ui 组件和 Tailwind CSS 4。

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, SQLite (better-sqlite3), Recharts (图表库)

---

## 文件结构

```
后端 (API):
  src/lib/db.ts                        — 修改: 增加 role/flagged 列迁移 + api_usage 表
  src/app/api/admin/stats/route.ts     — 新建: 统计数据 API
  src/app/api/admin/users/route.ts     — 新建: 用户列表 API
  src/app/api/admin/items/route.ts     — 新建: 内容审核列表 API
  src/app/api/admin/items/[id]/route.ts— 新建: 审核操作 API (标记违规/删除)
  src/app/api/admin/reports/route.ts   — 新建: 用户举报 API
  src/lib/auth.ts                      — 修改: 增加 getSessionUser() 返回完整用户信息

前端 (Pages):
  src/app/(admin)/layout.tsx           — 新建: 管理后台布局 (独立导航)
  src/app/(admin)/page.tsx             — 新建: 管理后台首页 (概览统计)
  src/app/(admin)/moderation/page.tsx  — 新建: 内容审核页
  src/app/(admin)/users/page.tsx       — 新建: 用户管理页 (可选)
  src/components/admin-navbar.tsx      — 新建: 管理后台导航栏

前端 (共享):
  src/components/locale-provider.tsx   — 修改: 增加 admin 相关翻译键
  src/locales/zh.json                  — 修改: 增加管理后台中文翻译
  src/locales/en.json                  — 修改: 增加管理后台英文翻译
  src/components/navbar.tsx            — 修改: 管理员用户增加管理后台入口
```

---

## 后端实施

### Task 1: 数据库迁移 — role 字段 + api_usage 表 + 审核列

**文件:**
- 修改: `src/lib/db.ts`

- [ ] **Step 1: 在 db.ts 中添加迁移逻辑**

在 `db.ts` 末尾（`export default db` 之前）添加迁移代码：

```typescript
// user role migration
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"); } catch {}

// moderation columns for images
try { db.exec("ALTER TABLE images ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE images ADD COLUMN reported INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE images ADD COLUMN reviewed INTEGER NOT NULL DEFAULT 0"); } catch {}

// moderation columns for videos
try { db.exec("ALTER TABLE videos ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN reported INTEGER NOT NULL DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE videos ADD COLUMN reviewed INTEGER NOT NULL DEFAULT 0"); } catch {}

// api_usage table for statistics
db.exec(`
  CREATE TABLE IF NOT EXISTS api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    cost INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
```

同时在 `UserRow` 接口中补充 `role` 字段:

```typescript
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  credits: number;
  role: string;
  created_at: string;
}
```

在 `ImageRow` 和 `VideoRow` 中补充审核字段:

```typescript
export interface ImageRow {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  url: string;
  flagged: number;
  reported: number;
  reviewed: number;
  created_at: string;
}

export interface VideoRow {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  status: string;
  progress: number;
  task_id: string | null;
  url: string | null;
  flagged: number;
  reported: number;
  reviewed: number;
  created_at: string;
}
```

### Task 2: auth.ts 增加 getSessionUser()

**文件:**
- 修改: `src/lib/auth.ts`

- [ ] **Step 1: 添加 getSessionUser 函数**

在 `getSessionUserId` 之后添加:

```typescript
import db, { type UserRow } from "@/lib/db";

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = db.prepare("SELECT id, name, email, credits, role, created_at FROM users WHERE id = ?").get(userId) as Pick<UserRow, "id" | "name" | "email" | "credits" | "role" | "created_at"> | undefined;
  return user || null;
}
```

### Task 3: 管理后台 API — 认证中间件

- [ ] **Step 1: 创建 admin 认证辅助函数**

无需单独文件。在每个 admin API 中统一调用:

```typescript
async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return user;
}
```

### Task 4: API — 使用量统计 GET /api/admin/stats

**文件:**
- 新建: `src/app/api/admin/stats/route.ts`

- [ ] **Step 1: 编写统计 API**

```typescript
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  const totalImages = (db.prepare("SELECT COUNT(*) as c FROM images").get() as { c: number }).c;
  const totalVideos = (db.prepare("SELECT COUNT(*) as c FROM videos").get() as { c: number }).c;
  const totalCredits = (db.prepare("SELECT COALESCE(SUM(amount), 0) as c FROM credit_transactions WHERE type = 'checkin' OR type = 'recharge'").get() as { c: number }).c;
  const totalSpent = (db.prepare("SELECT COALESCE(SUM(cost), 0) as c FROM api_usage").get() as { c: number }).c;

  // daily registrations (last 14 days)
  const dailyRegistrations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM users WHERE created_at >= datetime('now', '-14 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // daily generations (last 14 days)
  const dailyGenerations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM api_usage WHERE created_at >= datetime('now', '-14 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // top users by generation count
  const topUsers = db.prepare(`
    SELECT u.id, u.name, u.email, COUNT(a.id) as generations
    FROM users u LEFT JOIN api_usage a ON a.user_id = u.id
    GROUP BY u.id ORDER BY generations DESC LIMIT 10
  `).all();

  // key usage stats from agnes-pool (cross-reference via proxy logs or manual import)
  const keyUsage = db.prepare(`
    SELECT action, COUNT(*) as count, SUM(cost) as total_cost
    FROM api_usage GROUP BY action
  `).all();

  return NextResponse.json({
    totalUsers, totalImages, totalVideos, totalCredits, totalSpent,
    dailyRegistrations, dailyGenerations, topUsers, keyUsage,
  });
}
```

### Task 5: API — 用户列表 GET /api/admin/users

**文件:**
- 新建: `src/app/api/admin/users/route.ts`

```typescript
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.credits, u.role, u.created_at,
      (SELECT COUNT(*) FROM images WHERE user_id = u.id) as image_count,
      (SELECT COUNT(*) FROM videos WHERE user_id = u.id) as video_count
    FROM users u ORDER BY u.created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;

  return NextResponse.json({ items: users, total });
}
```

### Task 6: API — 内容列表 GET /api/admin/items

**文件:**
- 新建: `src/app/api/admin/items/route.ts`

```typescript
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all"; // all | images | videos
  const filter = searchParams.get("filter") || "all"; // all | flagged | reported | unreviewed
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  function buildQuery(table: string, conditions: string[]) {
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const items = db.prepare(`SELECT i.*, u.name as user_name, u.email as user_email FROM ${table} i JOIN users u ON u.id = i.user_id ${where} ORDER BY i.created_at DESC LIMIT ? OFFSET ?`).all(limit, offset);
    const total = (db.prepare(`SELECT COUNT(*) as c FROM ${table} i ${where}`).get() as { c: number }).c;
    return { items, total };
  }

  const conds: string[] = [];
  if (filter === "flagged") conds.push("i.flagged = 1");
  else if (filter === "reported") conds.push("i.reported = 1");
  else if (filter === "unreviewed") conds.push("i.reviewed = 0 AND i.flagged = 0");

  if (type === "all") {
    const images = buildQuery("images", conds);
    const videos = buildQuery("videos", conds);
    return NextResponse.json({ images, videos });
  } else if (type === "images") {
    return NextResponse.json(buildQuery("images", conds));
  } else {
    return NextResponse.json(buildQuery("videos", conds));
  }
}
```

### Task 7: API — 审核操作 PATCH /api/admin/items/[id]

**文件:**
- 新建: `src/app/api/admin/items/[id]/route.ts`

```typescript
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const TABLES = { image: "images", video: "videos" } as const;
type ItemType = keyof typeof TABLES;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { type, action } = body; // type: "image" | "video", action: "flag" | "unflag" | "reviewed" | "delete"
  const id = parseInt(params.id);
  if (!type || !TABLES[type as ItemType]) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  if (action === "delete") {
    const item = db.prepare(`SELECT * FROM ${TABLES[type as ItemType]} WHERE id = ?`).get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    db.prepare(`DELETE FROM ${TABLES[type as ItemType]} WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  }

  const updates: Record<string, number> = { reviewed: 1 };
  if (action === "flag") updates.flagged = 1;
  else if (action === "unflag") updates.flagged = 0;

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(updates);
  db.prepare(`UPDATE ${TABLES[type as ItemType]} SET ${setClause} WHERE id = ?`).run(...values, id);

  return NextResponse.json({ success: true });
}
```

### Task 8: API — 用户举报 POST /api/admin/reports

**文件:**
- 新建: `src/app/api/admin/reports/route.ts`

```typescript
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { type, id } = body; // type: "image" | "video", id: number
  if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 });

  const table = type === "image" ? "images" : "videos";
  db.prepare(`UPDATE ${table} SET reported = 1 WHERE id = ?`).run(id);

  return NextResponse.json({ success: true });
}
```

### Task 9: 在生成 API 中记录 api_usage

**文件:**
- 修改: `src/app/api/generate/image/route.ts`
- 修改: `src/app/api/generate/video/route.ts`

- [ ] **Step 1: 在图片生成成功时插入 api_usage 记录**

在 `src/app/api/generate/image/route.ts` 中，扣除积分后添加：

```typescript
db.prepare("INSERT INTO api_usage (user_id, action, cost) VALUES (?, 'image_generation', ?)").run(userId, 1);
```

- [ ] **Step 2: 在视频生成成功时插入 api_usage 记录**

在 `src/app/api/generate/video/route.ts` 中，扣除积分后添加：

```typescript
db.prepare("INSERT INTO api_usage (user_id, action, cost) VALUES (?, 'video_generation', ?)").run(userId, 2);
```

---

## 前端实施

### Task 10: 管理后台布局 (admin) 路由组

**文件:**
- 新建: `src/app/(admin)/layout.tsx`
- 新建: `src/components/admin-navbar.tsx`

- [ ] **Step 1: 创建管理后台导航栏**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

export function AdminNavbar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const links = [
    { href: "/admin", label: "admin.overview" },
    { href: "/admin/moderation", label: "admin.moderation" },
    { href: "/admin/users", label: "admin.users" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-sm border-b border-border">
      <div className="container-narrow px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-primary">Imaginova <span className="text-xs font-normal text-muted-foreground">Admin</span></Link>
          <nav className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t("admin.backToApp")}
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 创建 admin 布局**

```tsx
import { AdminNavbar } from "@/components/admin-navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <main className="pt-14">{children}</main>
    </>
  );
}
```

- [ ] **Step 3: 在 `proxy.ts` 的 matcher 中添加 `/admin` 路径保护** (仍在布局内，但需确保 `/admin` 经过 proxy)

在 `src/proxy.ts` 的 `protectedPaths` 中添加 `/admin`:

```typescript
const protectedPaths = [
  "/create", "/dashboard", "/credits", "/settings",
  "/image/", "/video/", "/admin",
];
```

### Task 11: 管理后台首页 — 概览统计

**文件:**
- 新建: `src/app/(admin)/page.tsx`

- [ ] **Step 1: 创建统计概览页面**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Stats {
  totalUsers: number; totalImages: number; totalVideos: number;
  totalCredits: number; totalSpent: number;
  dailyRegistrations: { date: string; count: number }[];
  dailyGenerations: { date: string; count: number }[];
  topUsers: { id: number; name: string; email: string; generations: number }[];
  keyUsage: { action: string; count: number; total_cost: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Stats>("/api/admin/stats")
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container-narrow px-6 py-12 flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="container-narrow px-6 py-12 text-center">
      <p className="text-destructive font-medium">{t("admin.accessDenied")}</p>
      <button onClick={() => router.push("/dashboard")} className="mt-4 text-sm text-primary hover:underline">{t("admin.backToApp")}</button>
    </div>
  );

  if (!stats) return null;

  const statCards = [
    { label: t("admin.totalUsers"), value: stats.totalUsers, color: "border-l-chart-2" },
    { label: t("admin.totalImages"), value: stats.totalImages, color: "border-l-chart-4" },
    { label: t("admin.totalVideos"), value: stats.totalVideos, color: "border-l-chart-5" },
    { label: t("admin.totalCredits"), value: stats.totalCredits.toLocaleString(), color: "border-l-primary" },
    { label: t("admin.totalSpent"), value: stats.totalSpent.toLocaleString(), color: "border-l-accent" },
  ];

  const actionLabels: Record<string, string> = {
    image_generation: t("admin.imageGeneration"),
    video_generation: t("admin.videoGeneration"),
  };

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.overview")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("admin.overviewSubtitle")}</p>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-card rounded-lg p-4 border border-border/60 ${card.color} border-l-4`}>
            <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* daily trend - registrations */}
        <div className="bg-card rounded-lg border border-border/60 p-5">
          <h2 className="text-sm font-semibold mb-4">{t("admin.dailyRegistrations")}</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.dailyRegistrations.map((d) => {
              const max = Math.max(...stats.dailyRegistrations.map((r) => r.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{d.count}</span>
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }} />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* daily trend - generations */}
        <div className="bg-card rounded-lg border border-border/60 p-5">
          <h2 className="text-sm font-semibold mb-4">{t("admin.dailyGenerations")}</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.dailyGenerations.map((d) => {
              const max = Math.max(...stats.dailyGenerations.map((r) => r.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{d.count}</span>
                  <div className="w-full bg-chart-4/60 rounded-t" style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }} />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* key usage breakdown */}
      <div className="bg-card rounded-lg border border-border/60 p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">{t("admin.keyUsage")}</h2>
        <div className="space-y-2">
          {stats.keyUsage.map((k) => (
            <div key={k.action} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <span className="text-sm">{actionLabels[k.action] || k.action}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{k.count} {t("admin.times")}</span>
                <span className="font-medium">{k.total_cost} {t("admin.creditsCost")}</span>
              </div>
            </div>
          ))}
          {stats.keyUsage.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("admin.noUsage")}</p>
          )}
        </div>
      </div>

      {/* top users */}
      <div className="bg-card rounded-lg border border-border/60 p-5">
        <h2 className="text-sm font-semibold mb-4">{t("admin.topUsers")}</h2>
        <div className="space-y-2">
          {stats.topUsers.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-5 text-xs text-muted-foreground font-medium">#{i + 1}</span>
                <span className="text-sm font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </div>
              <span className="text-sm text-muted-foreground">{u.generations} {t("admin.generations")}</span>
            </div>
          ))}
          {stats.topUsers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("admin.noUsers")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Task 12: 内容审核页面

**文件:**
- 新建: `src/app/(admin)/moderation/page.tsx`

- [ ] **Step 1: 创建审核页面**

```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Item {
  id: number; prompt: string; url: string | null; model: string;
  user_id: number; user_name: string; user_email: string;
  flagged: number; reported: number; reviewed: number;
  created_at: string; status?: string;
}

export default function ModerationPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [tab, setTab] = useState<"all" | "images" | "videos">("all");
  const [filter, setFilter] = useState<"all" | "reported" | "flagged" | "unreviewed">("unreviewed");
  const [images, setImages] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [imageTotal, setImageTotal] = useState(0);
  const [videoTotal, setVideoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Item | null>(null);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.get<{ images: { items: Item[]; total: number }; videos: { items: Item[]; total: number } }>(
        `/api/admin/items?type=${tab}&filter=${filter}&limit=50`
      );
      setImages(data.images.items);
      setImageTotal(data.images.total);
      setVideos(data.videos.items);
      setVideoTotal(data.videos.total);
    } catch { toast(t("admin.loadFailed"), "error"); }
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, [tab, filter]);

  async function handleAction(item: Item, type: "image" | "video", action: string) {
    try {
      await api.patch(`/api/admin/items/${item.id}`, { type, action });
      toast(action === "flag" ? t("admin.flagSuccess") : action === "unflag" ? t("admin.unflagSuccess") : t("admin.deleteSuccess"), "success");
      loadItems();
    } catch { toast(t("admin.actionFailed"), "error"); }
  }

  function renderItem(item: Item, type: "image" | "video") {
    const isVideo = type === "video";

    return (
      <div key={`${type}-${item.id}`} className="bg-card rounded-lg border border-border/60 overflow-hidden hover:shadow-sm transition-shadow">
        <div className="aspect-[4/3] bg-muted relative cursor-pointer overflow-hidden" onClick={() => setPreview(item)}>
          {item.url && !isVideo ? (
            <Image src={item.url} alt={item.prompt} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
          ) : item.url && isVideo ? (
            <video src={`/api/proxy/video?url=${encodeURIComponent(item.url)}`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">{item.status || "no preview"}</div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.reported === 1 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("admin.reported")}</Badge>}
            {item.flagged === 1 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("admin.flagged")}</Badge>}
            {item.reviewed === 0 && item.flagged === 0 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">{t("admin.pending")}</Badge>}
          </div>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-xs font-medium truncate" title={item.prompt}>{item.prompt}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{item.user_name}</span>
            <span>&middot;</span>
            <span>{item.created_at}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleAction(item, type, item.flagged === 1 ? "unflag" : "flag")}>
              {item.flagged === 1 ? t("admin.unflag") : t("admin.flag")}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={() => {
              if (window.confirm(t("admin.deleteConfirm"))) handleAction(item, type, "delete");
            }}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.moderation")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.moderationSubtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>{t("admin.refresh")}</Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="unreviewed">{t("admin.unreviewed")}</TabsTrigger>
            <TabsTrigger value="reported">{t("admin.reported")}</TabsTrigger>
            <TabsTrigger value="flagged">{t("admin.flagged")}</TabsTrigger>
            <TabsTrigger value="all">{t("admin.all")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">{t("admin.allItems")}</TabsTrigger>
            <TabsTrigger value="images">{t("dashboard.images")}</TabsTrigger>
            <TabsTrigger value="videos">{t("dashboard.videos")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <>
          {(tab === "all" || tab === "images") && (
            <div className="mb-8">
              {tab === "all" && <h2 className="text-sm font-semibold mb-3 text-muted-foreground">{t("dashboard.images")} ({imageTotal})</h2>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((item) => renderItem(item, "image"))}
              </div>
              {images.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("admin.noItems")}</p>}
            </div>
          )}
          {(tab === "all" || tab === "videos") && (
            <div>
              {tab === "all" && <h2 className="text-sm font-semibold mb-3 text-muted-foreground">{t("dashboard.videos")} ({videoTotal})</h2>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {videos.map((item) => renderItem(item, "video"))}
              </div>
              {videos.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">{t("admin.noItems")}</p>}
            </div>
          )}
        </>
      )}

      {/* preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
            {preview.url ? (
              preview.status !== undefined ? (
                <video src={`/api/proxy/video?url=${encodeURIComponent(preview.url)}`} controls autoPlay className="max-w-full max-h-[90vh] mx-auto" />
              ) : (
                <Image src={preview.url} alt={preview.prompt} width={1024} height={768} className="max-w-full max-h-[90vh] object-contain mx-auto" />
              )
            ) : (
              <div className="text-muted-foreground text-center py-20">{t("common.loading")}</div>
            )}
            <div className="bg-card p-4">
              <p className="text-sm font-medium">{preview.prompt}</p>
              <p className="text-xs text-muted-foreground mt-1">{preview.user_name} ({preview.user_email}) &middot; {preview.created_at}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Task 13: 用户管理页面

**文件:**
- 新建: `src/app/(admin)/users/page.tsx`

- [ ] **Step 1: 创建用户管理页面** (精简版 — 仅查看列表)

```tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number; name: string; email: string; credits: number;
  role: string; created_at: string;
  image_count: number; video_count: number;
}

export default function AdminUsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ items: User[]; total: number }>(`/api/admin/users?limit=${limit}&offset=${offset}`);
      if (offset === 0) setUsers(data.items);
      else setUsers((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [offset]);

  return (
    <div className="container-narrow px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{t("admin.users")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("admin.usersSubtitle", { total })}</p>

      {users.length === 0 && loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <div className="bg-card rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">{t("auth.name")}</th>
                  <th className="text-left p-3 font-medium">{t("auth.email")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.credits")}</th>
                  <th className="text-center p-3 font-medium">{t("admin.role")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.images")}</th>
                  <th className="text-right p-3 font-medium">{t("dashboard.videos")}</th>
                  <th className="text-right p-3 font-medium">{t("common.created")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground text-xs">{u.id}</td>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-right font-medium">{u.credits}</td>
                    <td className="p-3 text-center">
                      <Badge variant={u.role === "admin" ? "default" : "outline"} className="text-[10px] px-1.5">
                        {u.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{u.image_count}</td>
                    <td className="p-3 text-right text-muted-foreground">{u.video_count}</td>
                    <td className="p-3 text-right text-muted-foreground text-xs">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {users.length < total && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setOffset((o) => o + limit)} disabled={loading} className="text-sm text-primary hover:underline disabled:opacity-50">
            {t("dashboard.loadMore")} ({users.length}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
```

### Task 14: 翻译文件 — 新增管理后台翻译

**文件:**
- 修改: `src/locales/zh.json`
- 修改: `src/locales/en.json`

- [ ] **Step 1: 添加 zh.json 翻译**

在 `zh.json` 末尾添加：

```json
  "admin.overview": "管理后台",
  "admin.overviewSubtitle": "平台使用量概览",
  "admin.moderation": "内容审核",
  "admin.moderationSubtitle": "审核用户生成的内容",
  "admin.users": "用户管理",
  "admin.usersSubtitle": "共 {total} 位用户",
  "admin.totalUsers": "总用户",
  "admin.totalImages": "总图片",
  "admin.totalVideos": "总视频",
  "admin.totalCredits": "总发放积分",
  "admin.totalSpent": "总消耗积分",
  "admin.dailyRegistrations": "每日注册趋势（近14天）",
  "admin.dailyGenerations": "每日生成趋势（近14天）",
  "admin.keyUsage": "Key 用量分布",
  "admin.topUsers": "生成排行 Top 10",
  "admin.times": "次",
  "admin.creditsCost": "积分",
  "admin.imageGeneration": "图片生成",
  "admin.videoGeneration": "视频生成",
  "admin.noUsage": "暂无使用记录",
  "admin.noUsers": "暂无用户",
  "admin.backToApp": "← 返回前台",
  "admin.accessDenied": "无权访问管理后台",
  "admin.unreviewed": "待审核",
  "admin.reported": "已举报",
  "admin.flagged": "已标记",
  "admin.all": "全部",
  "admin.allItems": "全部作品",
  "admin.pending": "待审",
  "admin.noItems": "暂无待处理内容",
  "admin.flag": "标记违规",
  "admin.unflag": "取消标记",
  "admin.refresh": "刷新",
  "admin.loadFailed": "加载失败",
  "admin.actionFailed": "操作失败",
  "admin.flagSuccess": "已标记为违规",
  "admin.unflagSuccess": "已取消标记",
  "admin.deleteSuccess": "已删除",
  "admin.deleteConfirm": "确定删除该作品？不可撤销。",
  "admin.role": "角色"
```

- [ ] **Step 2: 添加 en.json 翻译**

在 `en.json` 末尾添加对应的英文翻译。

### Task 15: 导航栏 — 增加管理后台入口

**文件:**
- 修改: `src/components/navbar.tsx`

- [ ] **Step 1: 在 app variant 导航栏中添加管理后台链接**

在 `navbar.tsx` 的 `app` variant 导航中，在 `LanguageSwitcher` 之前添加：

```tsx
{user?.role === "admin" && (
  <Link href="/admin" className={linkClass}>{t("nav.admin")}</Link>
)}
```

- [ ] **Step 2: 传递 user.role 到 Navbar**

`NavbarProps` 接口增加 `role` 字段：

```typescript
interface NavbarProps {
  variant?: "home" | "app" | "detail";
  user?: { name: string; role?: string } | null;
}
```

在 `(dashboard)/layout.tsx` 和 `(detail)/layout.tsx` 中，将 `user.role` 传入 Navbar。

- [ ] **Step 3: 添加翻译键**

在 `zh.json` 添加 `"nav.admin": "管理后台"`，在 `en.json` 添加 `"nav.admin": "Admin"`。

### Task 16: 详情页 — 增加举报按钮

**文件:**
- 修改: `src/app/(detail)/image/[id]/page.tsx`
- 修改: `src/app/(detail)/video/[id]/page.tsx`

- [ ] **Step 1: 在图片详情页添加举报按钮**

```tsx
const [reported, setReported] = useState(false);

async function handleReport() {
  try {
    await api.post("/api/admin/reports", { type: "image", id });
    setReported(true);
    toast(t("admin.reported"), "success");
  } catch { toast(t("admin.actionFailed"), "error"); }
}

// 在操作按钮组中添加:
{!reported ? (
  <Button size="sm" variant="ghost" onClick={handleReport} className="text-muted-foreground">
    {t("admin.report")}
  </Button>
) : (
  <span className="text-xs text-muted-foreground">{t("admin.reported")}</span>
)}
```

- [ ] **Step 2: 在视频详情页同样添加举报按钮**

### Task 17: 设置管理员账号

- [ ] **Step 1: 在 `src/app/api/register/route.ts` 中设置初始管理员**

首次注册时如果需要自动设置为管理员（可选）。更简单的办法：在数据库迁移脚本中预设。

为简化，提供 SQL 命令手动设置：

```bash
# 登录 SQLite 执行
sqlite3 data.db "UPDATE users SET role='admin' WHERE email='你的邮箱';"
```

---

## 验证

| 验证项 | 命令 | 预期 |
|--------|------|------|
| 构建 | `npm run build` | 零错误零警告 |
| 接口测试 | `curl http://localhost:3000/api/admin/stats` | 401 (未登录) |
| 接口测试 | 管理员登录后访问 `/api/admin/stats` | 返回 JSON 数据 |
| 前端访问 | 浏览器打开 `/admin` | 管理员能看到统计页面 |
| 前端访问 | 普通用户访问 `/admin` | 提示无权访问 |
| 审核功能 | 管理员打开 `/admin/moderation` | 能查看所有作品并操作 |
| 举报功能 | 详情页点击举报 | 作品在审核页显示"已举报"标识 |
| 数据库 | `sqlite3 data.db ".schema users"` | 应包含 `role` 字段 |
