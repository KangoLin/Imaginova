# Imaginova 部署指南

> 适用部署方式：Docker + VPS（服务器）

---

## 前置要求

| 项目 | 说明 |
|------|------|
| 一台 Linux 服务器 | 推荐 Ubuntu 22.04+，2GB 内存起 |
| 一个域名 | 可选，建议有（HTTPS 需要） |
| Stripe 账号 | 用于支付收款 |
| Agnes AI API 密钥 | 用于图像/视频生成 |

---

## 第一步：环境变量

在项目根目录创建 `.env` 文件（复制 `.env.example`）：

```env
AUTH_SECRET=<运行 openssl rand -hex 32 生成>
OPENAI_API_KEY=<你的 Agnes AI API Key>
STRIPE_SECRET_KEY=<Stripe 生产环境 Secret Key>
STRIPE_WEBHOOK_SECRET=<Stripe Webhook Secret>
```

---

## 第二步：服务器上安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sudo sh
sudo apt install -y docker-compose-plugin
```

---

## 第三步：上传代码

方式 A — Git clone：

```bash
git clone <你的仓库地址> /opt/imaginova
cd /opt/imaginova
```

方式 B — 手动上传（scp）：

```bash
# 本地执行
scp -r . 用户@服务器IP:/opt/imaginova
```

---

## 第四步：创建 .env 并启动

```bash
cd /opt/imaginova
# 编辑 .env（粘贴第一步生成的内容）
nano .env

# 启动
docker compose up -d --build
```

检查日志：

```bash
docker compose logs -f
```

---

## 第五步：配置 Nginx 反向代理 + HTTPS

安装 Nginx：

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

创建 Nginx 配置 `/etc/nginx/sites-available/imaginova`：

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点并申请 SSL：

```bash
sudo ln -s /etc/nginx/sites-available/imaginova /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d 你的域名.com
```

---

## 第六步：配置 Stripe Webhook

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. 点击 **Add endpoint**
3. Endpoint URL: `https://你的域名/api/credits/webhook`
4. 监听事件: `checkout.session.completed`
5. 创建后复制 **Signing secret**，粘贴到 `.env` 的 `STRIPE_WEBHOOK_SECRET`
6. 重启容器：`docker compose restart`

---

## 常用维护命令

```bash
# 查看日志
docker compose logs -f

# 重启
docker compose restart

# 更新（拉取新代码后）
git pull
docker compose up -d --build

# 停止
docker compose down

# 数据备份
docker run --rm -v imaginova_imaginova_data:/data -v $(pwd):/backup alpine tar czf /backup/imaginova-backup-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 注意事项

- SQLite 数据库存储在 Docker volume 中，删除容器不会丢失数据
- 首次启动会自动建表，无需手动初始化
- 如需更换域名，需同步更新 Stripe Webhook 和 Nginx 配置
- 生产环境建议定期备份 `imaginova_data` volume
