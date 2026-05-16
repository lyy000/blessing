import { createHash } from "crypto";

/** 昵称规范化：去首尾空白、合并连续空格 */
export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** 由昵称生成稳定访客 ID（同一昵称始终对应同一用户） */
export function visitorIdFromDisplayName(name: string): string {
  const normalized = normalizeDisplayName(name);
  const hash = createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex")
    .slice(0, 24);
  return `n_${hash}`;
}

/** 浏览器端与服务器相同的 ID 算法 */
export async function visitorIdFromDisplayNameAsync(
  name: string,
): Promise<string> {
  const normalized = normalizeDisplayName(name);
  const data = new TextEncoder().encode(normalized);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `n_${hex.slice(0, 24)}`;
}
