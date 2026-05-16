# 祈福站（blessing-site）

敲木鱼、积功德的 Next.js 小站，含排行榜与祈福特效。

## 目录结构

```
app/              # 页面与 API 路由
components/       # React 组件
lib/              # 数据库、校验、文案等
deploy/           # Nginx 配置示例
scripts/          # 构建后处理脚本
ecosystem.config.cjs   # PM2 进程配置（自有服务器）
DEPLOY.md         # 完整部署文档（Vercel / 腾讯云）
```

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000。未配置环境变量时，数据保存在 `data/bless.db`。

## 部署

| 方式 | 说明 |
|------|------|
| [Vercel + Turso](DEPLOY.md#一注册-turso-并创建数据库免费档) | 免费托管，需配置 Turso 远程库 |
| [腾讯云轻量服务器](DEPLOY.md#七腾讯云轻量服务器opencloudos-9) | 本机 SQLite，PM2 + Nginx |

详细步骤见 **[DEPLOY.md](./DEPLOY.md)**。

### 腾讯云：Git 更新后构建（勿上传 node_modules）

代码只通过 Git 同步；**永远不要**把本机 `node_modules`、`.next` 提交或上传到服务器。

```bash
cd /var/www/blessing
git pull
chmod +x deploy/install-on-server.sh
./deploy/install-on-server.sh
pm2 restart blessing   # 若已用 PM2 启动过
```

`Cannot find native binding` 多半是服务器上残留了 Windows 的 `node_modules`，用上述脚本会先删掉再重装。

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或服务器上的 `.env`（生产），按需填写。参见 `.env.example` 注释。
