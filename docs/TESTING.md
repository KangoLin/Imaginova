# Imaginova 本地功能测试指南

> 适用场景：本地 `npm run dev`（http://localhost:3000）逐项验证功能。
> 按真实用户路径编排，先跑核心流程，再跑横切检查。

---

## 准备工作

| 项目 | 说明 |
|------|------|
| 环境 | `npm run dev` 已启动，`http://localhost:3000` 可访问（构建需 `AUTH_SECRET`，见 `.env.local`） |
| 浏览器 | 建议使用**无痕窗口**，避免旧 cookie 干扰登录 / 语言 / 暗色模式判断 |
| 测试账号 | 已种好：`screenshot@test.com` / `test123456`（50 credits，见 `scripts/seed-user.mjs`） |
| 真实邮箱 | 注册 / 忘记密码需要收验证码；未配置 SMTP 时验证码打印在 dev server 控制台 / `server-out.log` |
| 注意 | 生成图片 / 视频会**真实消耗 credits** 并调用 Agnes AI，需联网且确认 `OPENAI_API_KEY` 有效 |

---

## 阶段 1：环境冒烟

1. 打开 `/` → 首页正常加载，F12 无 404/500，Navbar 有"登录 / 注册"
2. 未登录访问受保护页 `/dashboard` → 重定向到 `/login?redirect=%2Fdashboard`
3. `/login` 空提交 → 提示"请填写所有字段"（非白屏 / 非 500）

---

## 阶段 2：注册与验证码

1. `/register` 填写邮箱 + 密码 → 点"获取验证码" → 邮箱收到 6 位验证码
2. 输入**错误验证码**提交 → 提示验证码不匹配
3. 60 秒内重复发送 → 提示"发送过于频繁"（限流）
4. 正确验证码注册成功 → 进入站点，新用户初始 **50 credits**
5. 重复注册同一邮箱 → 提示"邮箱已注册"

---

## 阶段 3：登录 / 登出 / 会话

1. `/login` 用 `screenshot@test.com` / `test123456` 登录 → 成功进入 `/dashboard`
2. 错误密码 → 回到登录页并提示错误
3. 登出 → 回首页；再次访问 `/dashboard` 被拦截
4. 已登录状态访问 `/login` → 自动跳回 `/dashboard`

---

## 阶段 4：创作（核心，请逐项验证）

1. `/create` 五个 Studio 切换：产品摄影 / 时尚 / 游戏素材 / 风格迁移 / 自由创作，标题与说明随模式变化
2. 自由创作 → **文生图**：提交 → loading → 成功进入 `/image/[id]` 详情，可下载 / 复制；返回 Dashboard 缩略图正常显示（走 `/api/file/` 原生 `<img>` + auth cookie，不要用 `next/image` 访问该接口）
3. **图生图**：上传参考图 → 生成
4. **文生视频**：详情页进度条通过 **SSE 实时更新**（`GET /api/video/[id]/stream`，EventSource）；完成后视频可播放（本地 `/api/file/videos/...`，支持拖动进度 / Range）；生成中刷新页面，状态应保持继续
5. **图生视频**：参考图 → 视频
6. 生成失败场景（可选）：断网或填非法提示词 → 应有明确错误提示，credits 扣费逻辑符合预期

---

## 阶段 5：积分与任务

1. `/credits` 每日签到 → +30，连续签到 streak 递增；**同一天重复签到被拒绝**
2. 首页任务卡片（注册 / 首次生成 / 邀请等）：条件未满足显示锁定，满足后可领取，奖励到账
3. 交易记录：type（签到 / 充值 / 消费）与金额显示正确
4. 充值（Stripe，可选）：测试卡 `4242 4242 4242 4242 4242` 走 checkout → webhook 回调后 credits 到账（本地需 `STRIPE_WEBHOOK_SECRET` 配置或 CLI 转发 webhook）

---

## 阶段 6：设置 + 管理端

### 设置
1. `/settings` 修改密码：旧密码错误 → 拒绝；修改成功后**旧密码登录失败、新密码成功**
2. 修改昵称 / 邮箱 → 即时生效，刷新保持

### 管理端（需 `role = admin`）
- 提升权限：`UPDATE users SET role = 'admin' WHERE email = '...'`（用 `node -e` 或 DB 工具操作 `data.db`）
1. `/admin` stats：用户数、作品数、积分发放/消耗、14 天趋势、Top 用户、API 用量
2. `/admin/users`：列表、分页
3. `/admin/moderation`：对作品 标记 / 审核 / 下架；被处理内容在用户端正确隐藏或提示

---

## 阶段 7：横切检查（每个页面都过一遍）

| 检查项 | 验证点 |
|--------|--------|
| i18n | 中 / EN 切换即时生效；刷新后保持（localStorage + cookie）；页面无中英混杂、无 `t('key')` 泄漏 |
| 暗色模式 | 切换后布局 / 对比度正常；**无紫色 / 青色残留**（当前为单色黑灰设计） |
| 移动端 | DevTools 375px：无横向溢出；touch 目标 ≥ 44px；滚动行（`overflow-x-auto` + snap）可用；hover 效果均有 `active:` 或 `aria-selected` 兜底 |
| 动画 | 滚动 / 切换无明显卡顿；不依赖 `hover` 单独交互 |
| 控制台 | 全程无 401/404/500、无未捕获异常（原生 `<img>` 的 `no-img-element` 提示属预期） |

---

## 自动化验证（快速回归）

```bash
npm run lint      # 0 errors（警告可接受）
npm run build     # 生产构建通过，41 条路由
npm test          # Jest 单元测试
npm run test:e2e  # Playwright E2E（默认英文断言，已注入 en cookie）
```

### API 冒烟（可选，Python 示例）
```bash
python -c "
import urllib.request, json
base = 'http://localhost:3000'
def post(path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    rq = urllib.request.Request(base+path, data=data, method='POST')
    if data: rq.add_header('Content-Type','application/json')
    rq.add_header('Host','localhost:3000')
    try:
        r = urllib.request.urlopen(rq)
        return r.status
    except urllib.error.HTTPError as e:
        return e.code
# 空 body 应返回 400（登录为跳转），不应 500
for p in ['/api/register','/api/auth/send-code','/api/auth/forgot-password','/api/auth/reset-password']:
    print(p, post(p))
print('/api/login valid', post('/api/login', {'email':'screenshot@test.com','password':'test123456'}))
"
```

---

## 已知注意点

- 空 body / 畸形 JSON 的 POST 路由已加固（返回 400 而非 500），但**新写 POST 路由请沿用 `req.text()` + `JSON.parse()` 并捕获解析异常**（Docker 冷启动下 `req.json()` 有已知问题）
- 图片 / 视频 URL 以 `/api/file/...` 开头表示已落盘本地；外部 Agnes 临时 URL 会过期，遇到过期图先跑迁移思路（见 `scripts/migrate-server-images.js`）
- 语言默认 `zh`，Cookie 名 `imaginova-locale`，主题 localStorage 键 `theme`
