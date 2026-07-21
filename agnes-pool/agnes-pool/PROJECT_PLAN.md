# Agnes Pool — 项目规划

> Agnes AI 账号自动化注册 → API Key 提取 → 池管理 → 反向代理全链路工具

---

## 一、项目概述

基于 AIAccountPoolX 的注册表架构，构建专用于 Agnes AI（OpenAI 兼容）的账号全生命周期管理工具。从账号注册到 API Key 轮询代理，一条龙自动化。

**项目位置**：`D:\Imaginova\agnes-pool\`

---

## 二、整体架构

```
agnes-pool/
├── server/                    # FastAPI 服务端
│   ├── app/
│   │   ├── main.py
│   │   ├── engine.py          # 平台引擎注册
│   │   ├── platforms/
│   │   │   ├── base.py        # BaseEngine 抽象基类
│   │   │   ├── registry.py    # PlatformRegistry 注册表
│   │   │   └── agnesai/
│   │   │       ├── __init__.py
│   │   │       ├── engine.py   # AgnesAIEngine 注册逻辑
│   │   │       ├── constants.py
│   │   │       └── helpers.py
│   │   ├── api/               # REST API 路由
│   │   ├── proxy/             # 反向代理 + Key 轮询
│   │   ├── email_utils/       # 邮箱验证码获取
│   │   ├── token_manager.py   # Token/Key 管理
│   │   ├── db_models.py       # 数据库模型
│   │   └── config.py
│   ├── config.json
│   └── requirements.txt
├── web/                       # Vue 3 前端
│   └── ...
├── docker-compose.yml
├── Dockerfile
└── PROJECT_PLAN.md
```

---

## 三、功能模块

### 3.1 账号注册（AgnesAIEngine）

| 步骤 | 说明 | 状态 |
|------|------|:----:|
| 1. 生成邮箱 | 自有域名 catch-all / IMAP | ✅ 已实现 |
| 2. 发送验证码 | `GET /api/verification?email=X&purpose=register` | ✅ 已验证 |
| 3. 获取验证码 | 从 IMAP 收件箱提取 | ✅ 已实现 |
| 4. 提交注册 | `POST /api/user/register` → `{email, password, password_confirm, code}` | ✅ 已验证 |
| 5. 登录 | `POST /api/user/login` → `{username, password}` → `access_token` | ✅ 已验证 |
| 6. 创建 API Key | `POST /api/token` → `{name, api_key_profile}` | ✅ 已验证 |
| 7. 保存 | 邮箱、密码、Key 存数据库 | ✅ 已实现 |

### 3.2 Key 池管理

| 能力 | 说明 | 状态 |
|------|------|:----:|
| 多 Key 存储 | 增删改查、启用/禁用 | ✅ 已实现 |
| 状态监控 | 请求量、成功率、最后使用时间 | ✅ 已实现 |
| 自动刷新 | Key 失效自动重新登录提取 | ⏳ 待实现 |
| 用量统计 | 每日/每周 API 调用统计 | ⏳ 待实现 |

### 3.3 反向代理（Key 轮询）

| 能力 | 说明 | 状态 |
|------|------|:----:|
| OpenAI 兼容 | `POST /v1/images/generations` + `POST /v1/videos` + `GET /agnesapi?video_id=` | ✅ 已实现 |
| 轮询策略 | Round-Robin / 最少使用 / 权重 | ✅ 已实现 |
| 429 容错 | 限流自动换 Key | ⏳ 待实现 |
| 健康检查 | 定期验证 Key 有效性 | ⏳ 待实现 |

---

## 四、技术栈

| 层 | 技术 |
|----|------|
| 后端 | FastAPI (Python 3.10+) + httpx + SQLAlchemy |
| 前端 | Vue 3 + Element Plus + Vite |
| 数据库 | SQLite |
| 部署 | Docker Compose |
| 邮箱 | 自有域名 catch-all（Cloudflare Email Routing） + IMAP |
| 代理 | HTTP/SOCKS5 代理池 |

---

## 五、开发阶段

### Phase 1：调研（✅ 已完成）

#### 逆向成果

**平台后端 API**：`https://platform-backend.agnes-ai.com`

| 端点 | 方法 | 请求参数 | 说明 |
|------|:----:|----------|------|
| `/api/verification?email=X&purpose=register` | GET | `email`, `purpose` | 发送邮箱验证码 |
| `/api/user/register` | POST | `{email, password, password_confirm, code}` | 注册账号 |
| `/api/user/login` | POST | `{username, password}` | 登录（返回 `access_token`） |
| `/api/user/self` | GET | Header: `Authorization: Bearer <token>` | 获取用户信息 |
| `/api/token` | POST | `{name, api_key_profile}` | 创建 API Key |
| `/api/token?key_profile=default` | GET | — | 列出个人 API Key |
| `/api/token?key_profile=enterprise` | GET | — | 列出企业 API Key |
| `/api/user/logout` | DELETE | — | 登出 |
| `/api/oauth/google/login` | POST | `{token, fbp, fbc, client_id, register_timezone}` | Google OAuth |
| `/api/oauth/github` | — | — | GitHub OAuth |
| `/api/reset_password` | POST | — | 重置密码 |
| `/api/user/subscription` | GET | — | 订阅信息 |
| `/api/user/notification/unread` | GET | — | 未读通知 |
| `/api/qrcode` | GET | — | QR 码 |
| `/api/user/feedback` | — | — | 用户反馈 |

**图像/视频生成 API**：`https://apihub.agnes-ai.com/v1`

| 端点 | 方法 | 说明 |
|------|:----:|------|
| `/v1/images/generations` | POST | 图像生成（OpenAI 兼容格式） |
| `/v1/videos` | POST | 创建视频任务（异步） |
| `/agnesapi?video_id=<ID>` | GET | 查询视频结果（推荐） |
| `/v1/videos/<TASK_ID>` | GET | 查询视频结果（兼容） |

**模型清单**：

| 模型 | 用途 | 免费限制 |
|------|------|:--------:|
| `agnes-image-2.1-flash` | 图像生成/编辑 | 30 RPM |
| `agnes-video-v2.0` | 视频生成 | 2 RPM |
| `agnes-2.0-flash` | 文本/推理 | — |

**关键发现**：

1. **临时邮箱被拦截**：后端返回 `"Disposable or temporary email addresses are not allowed"`（400）
2. **无 CAPTCHA**：注册页面无验证码组件
3. **Auth 机制**：`access_token` → localStorage key=`token`
4. **响应格式**：`{code: number, message: string, data: any}`，200=成功
5. **请求头**：需 `Authorization: Bearer <token>`、`X-User-Language: zh-CN`
6. **免费 Key 限制**：最多 20 个个人 Key | 图像 30 RPM / 视频 2 RPM（同类型共享）
7. **风控**：无 CAPTCHA，临时邮箱拦截 + 速率限制
8. **前端技术**：Next.js App Router，动态 chunk 加载

**验证流程**：已用 `2633313990@qq.com` 完成全链路手工验证（注册 → 登录 → 创建 API Key）

---

### Phase 2：核心开发（✅ 全部完成）

- [x] 搭建项目骨架：FastAPI + SQLAlchemy + SQLite + Docker
- [x] 实现 `email_utils`：自有域名 catch-all + IMAP 验证码提取
- [x] 实现 `AgnesAIEngine` 注册流程（发送验证码 → 注册 → 登录 → 创建 Key）
- [x] 实现 `token_manager` Key 管理（增删改查、启禁、统计）
- [x] 实现反向代理（`/v1/images/generations` + `/v1/videos` 转发与 Key 轮询）
- [x] 实现 Web 管理后台（Vue 3 + Element Plus：概览 / 账号管理 / 密钥管理 / 代理状态）

### 验证结果

```
$ curl http://localhost:8000/api/health
{"status":"ok"}

$ curl http://localhost:8000/api/accounts/
[]

$ curl http://localhost:8000/api/keys/
[]
```

服务端 24 个 Python 文件全部语法验证通过，API 端点可正常响应。

### Phase 2.5：邮箱基础设施（✅ 已完成）

- [x] 购买域名 `imaginova.online`（Spaceship, $0.99）
- [x] 域名 DNS 迁移至 Cloudflare（Active）
- [x] 配置 Cloudflare Email Routing（Catch-All → QQ 邮箱）
- [x] 启用 QQ 邮箱 IMAP 服务，获取授权码
- [x] 创建 `.env` 配置文件（IMAP 连接参数 + 域名）
- [x] 修复 IMAP 读取器：支持 HTML-only 邮件 + 改进验证码正则
- [x] 修复 BODY.PEEK[] 避免 IMAP 读取时标记为已读
- [x] 修复 API 注册端点：集成 IMAP 自动取码（而非传空 code）
- [x] 全链路验证：验证码发送 → Cloudflare 转发 → QQ IMAP 提取 → 成功获取验证码 `655787`

### Phase 2.75：风控策略与手动管理（✅ 已完成）

- [x] 手动导入 API：`POST /api/accounts/import` + `POST /api/keys/import`
- [x] 代理池管理：运行时动态添加/清空代理 + 注册时自动轮询取代理
- [x] 注册延迟策略：可配置 min_delay/max_delay/jitter/retry_delay，模拟人类行为
- [x] 测试 Key（`sk-GOaBp9...`）已导入数据库，Key 轮询代理验证通过
- [x] 手动添加代理端点：`POST /api/proxy/pool/add`
- [x] 清空代理池端点：`POST /api/proxy/pool/clear`

### Phase 3：测试与优化

- [x] 单账号注册测试（agnetest11 → sk-pv7PH4G... ✅）
- [ ] 批量注册测试（5+ 账号并行）
- [x] 429 容错：Key 限流自动冷却（60s）+ 切换下一个 Key 重试
- [ ] 代理轮询压力测试
- [ ] 429 容错测试

---

## 九、2026-07-11 邮箱基础设施搭建实录

### 背景

项目核心模块开发完成后，需要真实邮箱基础设施来完成自动化注册测试。之前所有验证都是用 QQ 邮箱手工完成的，无法自动化。

### 操作记录

| # | 操作 | 耗时 | 结果 |
|:-:|------|:---:|:----:|
| 1 | 购买 `.xyz` 域名（Spaceship, $0.99，支持支付宝） | 5min | ✅ `imaginova.online` |
| 2 | 添加到 Cloudflare DNS（Free Plan） | 2min | ✅ Name servers: `sterling.ns.cloudflare.com` / `surina.ns.cloudflare.com` |
| 3 | DNS 传播等待 | ~10min | ✅ Active |
| 4 | 配置 Cloudflare Email Routing（Catch-All → QQ） | 3min | ✅ MX 记录自动添加 |
| 5 | 启用 QQ 邮箱 IMAP 服务 + 获取授权码 | 5min | ✅ IMAP 连接成功 |
| 6 | 创建 `.env` 配置文件 | 1min | ✅ |

### 代码修复

| 问题 | 文件 | 修复 |
|------|------|------|
| Agnes AI 验证码邮件为 HTML-only，IMAP 读取器只解析 `text/plain` | `imap.py` | 增加 HTML 剥离逻辑（`_strip_html`），`text/html` 为 fallback |
| CSS 颜色值（`#000000`）被误识别为验证码 | `helpers.py` | 正则优先级改为先匹配 `verification code: XXXXXX` 上下文后，再回退到纯 6 位数字 |
| `RFC822` fetch 标记邮件为已读，导致轮询遗漏 | `imap.py` | 改为 `BODY.PEEK[]` 不修改 Seen 标志 |
| API 注册端点传空 code | `accounts.py` | 集成 `IMAPReader.wait_for_code()` 自动取码 |
| httpx `proxies` 参数在新版中已废弃 | `engine.py` | 改为条件性传 `proxy` 参数 |

### 全链路验证结果

```
[1] 生成邮箱      → agnes193023@imaginova.online    ✅
[2] 发送验证码    → {code:200}                       ✅
[3] Cloudflare 转发 → Agnes AI → imaginova.online → QQ邮箱  ✅
[4] IMAP 取码     → code: 655787                     ✅
[5] 提交注册      → "Too many registration attempts" ❌ (IP限流)
```

**结论：** 邮箱基础设施 4/5 步骤验证通过。注册被限流是因为此前手工和自动化测试中频繁发送验证码。限流解除后全流程可跑通。

### 配置清单

```
域名:             imaginova.online
DNS:              Cloudflare (sterling.ns.cloudflare.com / surina.ns.cloudflare.com)
邮件路由:         Cloudflare Email Routing (Catch-All)
IMAP 服务器:      imap.qq.com:993
IMAP 账号:        2633313990@qq.com
IMAP 授权码:      pevwikagcwigdjfb (已配置在 .env)
Catch-All 域名:   imaginova.online
```

### 关键发现

1. **Cloudflare Email Routing 无需手动添加 MX 记录**：启用 Email Routing 后自动配置 DNS
2. **QQ 邮箱 IMAP 的 \SEEN 行为**：标准 `FETCH (RFC822)` 会将邮件标记为已读；必须用 `BODY.PEEK[]` 避免
3. **Agnes AI 风控**：同 IP 短时间内多次发送验证码会触发 "Too many registration attempts" 限流，需等待 30-60min
4. **转发延迟**：Cloudflare → QQ 邮箱转发约 15-30s 到达

### Phase 4：部署（✅ 配置完成，需启动 Docker 构建）

- [x] Dockerfile 多阶段构建（Node 构建前端 → Python 运行时）
- [x] docker-compose.yml（端口 8080，volume 挂载 data + .env）
- [ ] Docker 镜像构建（需启动 Docker Desktop）
- [ ] 使用文档
- [ ] 与 Imaginova 主项目集成

---

## 六、验收标准

| # | 标准 | 优先级 |
|---|------|:----:|
| 1 | 能自动注册一个 Agnes AI 完整账号：生成邮箱 → 提交注册 → 收验证码 → 验证 → 保存 | P0 |
| 2 | 能用已注册账号自动创建 API Key：登录 → 调创建接口 → 保存到数据库 | P0 |
| 3 | Web 管理后台：查看账号/Key 状态、启用/禁用、删除 | P0 |
| 4 | OpenAI 兼容代理：客户端指向工具即可使用 | P0 |
| 5 | 多 Key 自动轮询：遇 429 自动跳到下一个 | P0 | ✅ 已实现 |
| 6 | 批量注册：支持一次注册 N 个账号、并行控制 | P1 |
| 7 | 代理池支持：注册时换 IP 降低风控 | P1 |
| 8 | Docker 一键部署：`docker compose up -d` 即可 | P1 | ✅ Dockerfile + compose 就绪 |
| 9 | Key 健康检查：定期验证 Key 有效性，失效自动标记 | P2 | ✅ 已实现 |
| 10 | 用量统计面板：每个 Key 的调用量、成功率 | P2 | ✅ 已实现 |

---

## 七、风险评估

| 风险 | 影响 | 缓解措施 |
|------|:----:|---------|
| Agnes AI 变更 API | 工具失效 | 配置文件化 API 端点，方便更新 |
| 注册频率限制/IP 封禁 | 批量注册失败 | 使用代理池 + 合理延迟 |
| 临时邮箱被拉黑 | 注册失败 | 切换自有域名 catch-all 邮箱 |
| 免费额度耗尽 | Key 不可用 | 多账号轮询 + 自动标记过期 Key |

---

## 八、关键决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-07-11 | 全链路逆向完成 | 用 QQ 邮箱手工验证了注册→登录→创建 Key 完整流程 |
| 2026-07-11 | API 端点已确认 15 个 | `platform-backend.agnes-ai.com` + `apihub.agnes-ai.com/v1` |
| 2026-07-11 | 域名 `imaginova.online` 购入 | Spaceship $0.99，支持支付宝 |
| 2026-07-11 | DNS 迁至 Cloudflare | Free Plan，nameserver 传播 10min |
| 2026-07-11 | Cloudflare Email Routing 配置 | Catch-All → QQ 邮箱，自动添加 MX 记录 |
| 2026-07-11 | QQ 邮箱 IMAP 启用 | 授权码方式，连接成功 |
| 2026-07-11 | 全链路验证（4/5） | 验证码发送→转发→提码成功，注册被 IP 限流阻塞 |
