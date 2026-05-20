#!/usr/bin/env node
/**
 * 将祈福次数超过阈值的记录改为负数，并生成公告用 JSON。
 * 用法：DATA_DIR=/var/lib/blessing node scripts/penalize-abusers.mjs
 * 可选：THRESHOLD=10000 node scripts/penalize-abusers.mjs
 */
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const THRESHOLD = Number(process.env.THRESHOLD ?? "10000");

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
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, "bless.db");
  return `file:${filePath.replace(/\\/g, "/")}`;
}

async function main() {
  const db = createClient({ url: databaseUrl() });
  const dir = getDataDirectory();

  const found = await db.execute({
    sql: `SELECT id, display_name, total_bless, crit_bless
          FROM visitors WHERE total_bless > ?
          ORDER BY total_bless DESC`,
    args: [THRESHOLD],
  });

  if (found.rows.length === 0) {
    console.log(`[penalize] 未发现 total_bless > ${THRESHOLD} 的记录。`);
    return;
  }

  const penalized = [];
  const now = Date.now();

  for (const row of found.rows) {
    const id = String(row.id);
    const displayName = String(row.display_name);
    const previousTotal = Number(row.total_bless ?? 0);
    const nextTotal = -Math.abs(previousTotal);

    await db.execute({
      sql: `UPDATE visitors SET total_bless = ?, updated_at = ? WHERE id = ?`,
      args: [nextTotal, now, id],
    });

    penalized.push({
      id,
      displayName,
      previousTotal,
      totalBless: nextTotal,
    });

    console.log(
      `[penalize] ${displayName} (${id}): ${previousTotal} → ${nextTotal}`,
    );
  }

  const payload = {
    updatedAt: new Date(now).toISOString(),
    threshold: THRESHOLD,
    users: penalized,
  };

  const outPath = path.join(dir, "penalized-announcement.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`[penalize] 已写入 ${outPath}，共 ${penalized.length} 条。`);
  console.log("[penalize] 请部署最新前端后刷新页面查看公告。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
