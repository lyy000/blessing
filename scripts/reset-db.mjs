#!/usr/bin/env node
/**
 * 清空本地 SQLite 数据（祈福记录、排行榜、限流计数）。
 * 用法：DATA_DIR=/var/lib/blessing node scripts/reset-db.mjs
 */
import fs from "fs";
import path from "path";

function getDataDirectory() {
  const custom = process.env.DATA_DIR?.trim();
  if (custom) {
    return path.isAbsolute(custom)
      ? custom
      : path.join(process.cwd(), custom);
  }
  return path.join(process.cwd(), "data");
}

const dir = getDataDirectory();
const files = ["bless.db", "bless.db-wal", "bless.db-shm"];

let removed = 0;
for (const file of files) {
  const full = path.join(dir, file);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log(`[reset-db] 已删除 ${full}`);
    removed++;
  }
}

if (removed === 0) {
  console.log(`[reset-db] 未找到数据库文件（目录: ${dir}）`);
} else {
  console.log("[reset-db] 完成。请重启应用: pm2 restart blessing");
}
