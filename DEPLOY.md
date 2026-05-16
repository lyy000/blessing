# 免费部署：Vercel + Turso（平台默认域名）

本仓库已支持 **Turso 远程数据库**；在 **Vercel** 上部署时**不要**依赖本地 `data/bless.db`（无持久磁盘）。本地开发不配置环境变量时会自动使用 `data/bless.db`。

---

## 一、注册 Turso 并创建数据库（免费档）

1. 打开 [https://turso.tech](https://turso.tech) ，用 GitHub 等方式注册并登录。
2. 安装 Turso CLI（任选一种方式）：
   - **Windows（Scoop）**：`scoop install turso`
   - **或** 到 [Turso CLI Releases](https://github.com/tursodatabase/turso/releases) 下载对应系统的可执行文件，加入 PATH。
3. 在终端登录：

   ```bash
   turso auth login
   ```

4. 创建数据库（名称可自定，例如 `blessing`）：

   ```bash
   turso db create blessing
   ```

5. 查看 **libsql 连接 URL**：

   ```bash
   turso db show blessing --url
   ```

   复制输出的 `libsql://....` 整行，稍后填到 Vercel 的 `TURSO_DATABASE_URL`。

6. 创建 **只读/读写 Token**（部署用读写即可）：

   ```bash
   turso db tokens create blessing
   ```

   复制输出的 token，稍后填到 Vercel 的 `TURSO_AUTH_TOKEN`。

> 首次有用户访问 API 时，应用会自动执行建表语句，无需你在 Turso 里手动执行 SQL。

---

## 二、把代码放到 GitHub

1. 在 [GitHub](https://github.com) 新建一个仓库（可设为 Private）。
2. 在本项目目录初始化并推送（若尚未 git）：

   ```bash
   cd "d:\Data\blessing-site"
   git init
   git add .
   git commit -m "Initial blessing site"
   git remote add origin git@github.com:lyy000/blessing.git
   git branch -M main
   git push -u origin main
   ```

确保 **不要** 把 `.env.local`、含 token 的文件提交上去（仓库已有 `.gitignore` 忽略常见敏感文件）。

---

## 三、在 Vercel 部署

1. 打开 [https://vercel.com](https://vercel.com) ，用 GitHub 登录。
2. **Add New… → Project**，导入上一步的 GitHub 仓库。
3. **Framework Preset** 选 Next.js（一般会自动识别）。
4. **Environment Variables** 里新增两条（Production / Preview 建议都勾选）：

   | Name                 | Value                          |
   | -------------------- | ------------------------------ |
   | `TURSO_DATABASE_URL` | `turso db show` 复制的 libsql URL |
   | `TURSO_AUTH_TOKEN`   | `turso db tokens create` 得到的 token |

5. 点击 **Deploy**。等待构建完成。
6. 部署成功后，Vercel 会分配 **`https://你的项目名.vercel.app`**，把该链接发给朋友即可外网访问。

---

## 四、本地连接 Turso（可选）

若想在本地也用云端数据库调试，可在项目根目录创建 `.env.local`：

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

然后 `npm run dev`。不创建 `.env.local` 时仍使用本地 `data/bless.db`。

---

## 五、常见问题

- **构建通过但打开页面 API 报错**：检查 Vercel 里两条环境变量是否已保存、是否勾选了对应环境（Production）。
- **想用 Supabase 而不是 Turso**：需要把数据访问层改成 Postgres 驱动或 Supabase SDK，与本项目当前 `@libsql/client` 方案不同，需另做迁移。

---

## 六、费用说明（截至文档编写时的常见策略）

- **Vercel**：个人 Hobby 免费档有带宽与函数用量限制，小站一般够用。
- **Turso**：免费档有数据库数量与用量限制，本项目数据量通常足够。

具体额度以官网为准。

---

## 七、腾讯云轻量服务器（OpenCloudOS 9）

自有服务器有**持久磁盘**，可不配 Turso，默认把数据存在本机 SQLite（`data/bless.db` 或 `DATA_DIR` 指定目录）。构建使用 Next.js **standalone** 模式，由 **PM2** 守护进程、**Nginx** 对外提供 80/443。

### 7.1 腾讯云控制台

1. **防火墙 / 安全组**：放行 **22**（SSH）、**80**（HTTP）、**443**（HTTPS，上证书后用）。**不要**对公网开放 3000，仅本机 Nginx 反代即可。
2. 记下服务器 **公网 IP**，用 SSH 客户端（PowerShell、`ssh`、Xshell 等）登录：`ssh root@你的公网IP`。

### 7.2 服务器环境（首次）

**务必先 SSH 登录到 OpenCloudOS 服务器再执行**（`ssh root@公网IP`）。若在 **Windows 本机 PowerShell** 里跑上述命令，会报 `intended for RPM-based systems`，因为本机不是 Linux。

登录服务器后，可先确认环境：

```bash
cat /etc/os-release | head -5
uname -a
```

在服务器上执行（root 或带 sudo 的用户）：

```bash
sudo dnf update -y
sudo dnf install -y git nginx

# Node.js：OpenCloudOS 9 默认源多为 18.x，已满足本项目（需 >= 18.18）
sudo dnf install -y nodejs npm
node -v   # 例如 v18.20.8 即可继续，不必强行升到 20

# 若坚持要 Node 20（可选），OpenCloudOS 往往没有 nodejs module，用 nvm：
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
# source ~/.bashrc
# nvm install 20
# nvm alias default 20
# node -v

npm -v

sudo npm install -g pm2

# 可选：数据目录独立于代码，方便备份
sudo mkdir -p /var/lib/blessing
sudo chown "$USER":"$USER" /var/lib/blessing
```

### 7.3 上传代码并构建

**方式 A：Git（推荐）**

```bash
cd /var/www
sudo mkdir -p blessing && sudo chown "$USER":"$USER" blessing
cd blessing
git clone git@github.com:lyy000/blessing.git .
npm ci
npm run build
```

**方式 B：本机打包上传**

在 Windows 项目目录打包（排除 `node_modules`、`.next`），用 SFTP 传到服务器 `/var/www/blessing`，再在服务器执行 `npm ci && npm run build`。

### 7.4 环境变量与启动

在项目根目录创建 `.env`（勿提交到 Git）：

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATA_DIR=/var/lib/blessing
```

若仍想用 Turso 云端库，改为配置 `TURSO_DATABASE_URL` 与 `TURSO_AUTH_TOKEN`，可不设 `DATA_DIR`。

启动 / 重启应用：

```bash
cd /var/www/blessing
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 按提示执行一条 sudo 命令，实现开机自启
```

本机检查：`curl -s http://127.0.0.1:3000 | head` 应有 HTML 输出。

### 7.5 Nginx 反向代理

```bash
sudo cp deploy/nginx-blessing.conf.example /etc/nginx/conf.d/blessing.conf
sudo sed -i 's/你的域名.com/你的公网IP或域名/' /etc/nginx/conf.d/blessing.conf
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

浏览器访问 `http://公网IP` 应能看到站点。

**HTTPS（有域名且已备案时）**：

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com
```

### 7.6 更新站点

```bash
cd /var/www/blessing
git pull          # 若用 Git
npm ci
npm run build
pm2 restart blessing
```

### 7.7 常见问题

| 现象 | 处理 |
|------|------|
| 外网无法访问 | 检查腾讯云防火墙是否放行 80；`sudo systemctl status nginx` |
| 502 Bad Gateway | `pm2 status` 确认 `blessing` 为 online；`pm2 logs blessing` |
| API 报错 / 数据库 | `pm2 logs` 查看；确认 `/var/lib/blessing` 可写或 Turso 变量正确 |
| 构建内存不足 | 轻量 1G 可能 OOM，临时加 swap 或升级到 2G 后再 `npm run build` |
| NodeSource 报 RPM-based systems | 多半在 Windows 本机执行了；改 SSH 进服务器，或用 nvm 装 Node 20 |
| `dnf module list nodejs` 无结果 | OpenCloudOS 正常；用 `dnf install nodejs`，18.20+ 即可部署 |

临时加 swap 示例（1G 机器构建用）：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
