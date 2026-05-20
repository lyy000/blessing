#!/usr/bin/env node
/**
 * 查看祈福次数较高的用户，便于填写 penalize-users.json。
 * 用法：DATA_DIR=/var/lib/blessing npm run db:list-visitors
 */
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const LIMIT = Number(process.env.LIMIT ?? "30");
const MIN_BLESS = Number(process.env.MIN_BLESS ?? "1000");

function getDataDirectory() {
  const custom = process.env.DATA_DIR?.trim();
  if (custom) {
    return path.isAbsolute(custom)
      ? custom
      : path.join(process.cwd(), custom);
  }
  return path.join(process.cwd(), "data");
}

function databaseUrl() {
  const dir = getDataDirectory();
  const filePath = path.join(dir, "bless.db");
  return `file:${filePath.replace(/\\/g, "/")}`;
}

async function main() {
  if (!fs.existsSync(path.join(getDataDirectory(), "bless.db"))) {
    console.error("[list] 未找到 bless.db，请检查 DATA_DIR。");
    process.exit(1);
  }

  const db = createClient({ url: databaseUrl() });
  const res = await db.execute({
    sql: `SELECT id, display_name, total_bless, crit_bless, updated_at
          FROM visitors
          WHERE total_bless >= ?
          ORDER BY total_bless DESC
          LIMIT ?`,
    args: [MIN_BLESS, LIMIT],
  });

  if (res.rows.length === 0) {
    console.log(`[list] 没有 total_bless >= ${MIN_BLESS} 的用户。`);
    return;
  }

  console.log(
    `[list] total_bless >= ${MIN_BLESS}，前 ${LIMIT} 名（供复制到 penalize-users.json）：\n`,
  );
  for (const row of res.rows) {
    const name = String(row.display_name);
    const id = String(row.id);
    const total = Number(row.total_bless ?? 0);
    console.log(`  昵称: ${name}`);
    console.log(`  ID:   ${id}`);
    console.log(`  祈福: ${total}  暴击: ${row.crit_bless ?? 0}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
