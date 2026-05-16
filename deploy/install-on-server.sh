#!/usr/bin/env bash
# 在 OpenCloudOS / Linux 服务器项目根目录执行：
#   chmod +x deploy/install-on-server.sh
#   ./deploy/install-on-server.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "==> 项目目录: $ROOT"
echo "==> 架构: $(uname -m)"
echo "==> Node: $(node -v)"

# 构建阶段不要用 production，否则 devDependencies（Tailwind）不会安装
unset NODE_ENV
export NODE_ENV=

if [[ -d node_modules ]]; then
  echo "==> 删除旧 node_modules（避免 Windows 上传的原生模块）"
  rm -rf node_modules
fi

if [[ -d .next ]]; then
  echo "==> 删除旧 .next"
  rm -rf .next
fi

echo "==> 安装依赖（含 Tailwind 的 Linux 原生包）"
npm install

ARCH="$(uname -m)"
if [[ "$ARCH" == "x86_64" ]]; then
  echo "==> 确保 @tailwindcss/oxide-linux-x64-gnu 已安装"
  npm install @tailwindcss/oxide-linux-x64-gnu --save-dev --no-save 2>/dev/null || true
fi

echo "==> 构建"
npm run build

echo "==> 完成。接下来可配置 .env 并执行: pm2 start ecosystem.config.cjs"
