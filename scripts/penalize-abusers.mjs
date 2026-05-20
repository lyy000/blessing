#!/usr/bin/env node
/**
 * 按名单一次性处理指定用户（改为负数 + 生成公告 JSON）。
 * 不会自动扫描「超过 N 次」的全部用户，每次需你自行编辑名单。
 *
 * 1. 复制 scripts/penalize-users.example.json → penalize-users.json 并填写
 * 2. 执行：DATA_DIR=/var/lib/blessing npm run db:penalize
 *
 * 名单文件查找顺序：
 *   DATA_DIR/penalize-users.json
 *   scripts/penalize-users.json
 */
import { createClient } from "@libsql/client";
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

function databaseUrl() {
  const dir = getDataDirectory();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, "bless.db");
  return `file:${filePath.replace(/\\/g, "/")}`;
}

function resolveListPath() {
  const envPath = process.env.PENALIZE_LIST?.trim();
  if (envPath) {
    return path.isAbsolute(envPath)
      ? envPath
      : path.join(process.cwd(), envPath);
  }
  const inData = path.join(getDataDirectory(), "penalize-users.json");
  if (fs.existsSync(inData)) return inData;
  const inScripts = path.join(process.cwd(), "scripts", "penalize-users.json");
  if (fs.existsSync(inScripts)) return inScripts;
  return inData;
}

function loadTargetList() {
  const listPath = resolveListPath();
  if (!fs.existsSync(listPath)) {
    console.error(`[penalize] 未找到名单文件：${listPath}`);
    console.error(
      "[penalize] 请复制 scripts/penalize-users.example.json 为 penalize-users.json 并填写要处理的昵称或 ID。",
    );
    console.error(
      "[penalize] 可先运行：DATA_DIR=/var/lib/blessing npm run db:list-visitors",
    );
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(listPath, "utf8"));
  const users = raw.users ?? raw;
  if (!Array.isArray(users) || users.length === 0) {
    console.error("[penalize] 名单为空，请至少填写一个用户。");
    process.exit(1);
  }
  return { listPath, users };
}

async function findVisitor(db, entry) {
  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const displayName =
    typeof entry.displayName === "string" ? entry.displayName.trim() : "";

  if (id) {
    const byId = await db.execute({
      sql: `SELECT id, display_name, total_bless FROM visitors WHERE id = ?`,
      args: [id],
    });
    if (byId.rows[0]) return byId.rows[0];
  }

  if (displayName) {
    const byName = await db.execute({
      sql: `SELECT id, display_name, total_bless FROM visitors WHERE display_name = ?`,
      args: [displayName],
    });
    if (byName.rows[0]) return byName.rows[0];
  }

  return null;
}

async function main() {
  const { listPath, users: targets } = loadTargetList();
  const db = createClient({ url: databaseUrl() });
  const dir = getDataDirectory();
  const penalized = [];
  const now = Date.now();

  console.log(`[penalize] 使用名单：${listPath}（共 ${targets.length} 人，仅处理名单内用户）`);

  for (const entry of targets) {
    const row = await findVisitor(db, entry);
    if (!row) {
      const label =
        entry.id || entry.displayName || JSON.stringify(entry);
      console.warn(`[penalize] 未找到用户，已跳过：${label}`);
      continue;
    }

    const id = String(row.id);
    const displayName = String(row.display_name);
    const previousTotal = Number(row.total_bless ?? 0);

    if (previousTotal <= 0) {
      console.log(
        `[penalize] ${displayName} (${id}) 已是 ${previousTotal}，跳过。`,
      );
      continue;
    }

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

  if (penalized.length === 0) {
    console.log("[penalize] 没有成功处理任何用户。");
    process.exit(1);
  }

  const payload = {
    updatedAt: new Date(now).toISOString(),
    note: "本次为人工指定名单的一次性处理，非自动封禁规则。",
    users: penalized,
  };

  const outPath = path.join(dir, "penalized-announcement.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`[penalize] 已写入 ${outPath}，共 ${penalized.length} 条。`);
  console.log("[penalize] 刷新网页即可看到公告；下次若有新问题请重新编辑名单再执行。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
