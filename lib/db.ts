import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getDataDirectory(): string {
  const custom = process.env.DATA_DIR?.trim();
  if (custom) {
    return path.isAbsolute(custom)
      ? custom
      : path.join(process.cwd(), custom);
  }
  return path.join(process.cwd(), "data");
}

function defaultLocalFileUrl(): string {
  const dir = getDataDirectory();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, "bless.db");
  return `file:${filePath.replace(/\\/g, "/")}`;
}

/** 无持久磁盘、必须走远程库的平台（Vercel / Netlify 等） */
function requiresRemoteDatabase(): boolean {
  return Boolean(process.env.VERCEL) || Boolean(process.env.NETLIFY);
}

function resolveDatabaseUrl(): string {
  const fromEnv = (
    process.env.TURSO_DATABASE_URL ??
    process.env.DATABASE_URL ??
    ""
  ).trim();

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  if (requiresRemoteDatabase()) {
    throw new Error(
      "线上环境未配置数据库：请在托管平台设置 TURSO_DATABASE_URL 与 TURSO_AUTH_TOKEN（Turso）。详见 DEPLOY.md。",
    );
  }

  if (process.env.NODE_ENV === "production") {
    console.info(
      "[db] 使用本机 SQLite：",
      path.join(getDataDirectory(), "bless.db"),
    );
  }

  return defaultLocalFileUrl();
}

function createDbClient(): Client {
  const url = resolveDatabaseUrl();
  const token = process.env.TURSO_AUTH_TOKEN?.trim();
  const isRemote =
    url.startsWith("libsql:") ||
    url.startsWith("https:") ||
    url.includes(".turso.io");

  if (isRemote) {
    if (!token) {
      throw new Error(
        "使用 Turso 远程地址时必须设置 TURSO_AUTH_TOKEN。详见 DEPLOY.md。",
      );
    }
    return createClient({ url, authToken: token });
  }

  return createClient({ url });
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  total_bless INTEGER NOT NULL DEFAULT 0,
  crit_bless INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_visitors_total_desc ON visitors (total_bless DESC);

CREATE TABLE IF NOT EXISTS ratelimit (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);

CREATE TABLE IF NOT EXISTS bless_events (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  is_crit INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bless_events_visitor ON bless_events (visitor_id);
`;

export async function getDb(): Promise<Client> {
  if (!client) {
    client = createDbClient();
  }
  if (!schemaReady) {
    schemaReady = client.executeMultiple(SCHEMA_SQL);
  }
  await schemaReady;
  return client;
}
