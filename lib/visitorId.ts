import { sha256Hex } from "@/lib/sha256hex";

/** 昵称规范化：去首尾空白、合并连续空格 */
export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** 由昵称生成稳定访客 ID（同步，HTTP 站点也可用） */
export function visitorIdFromDisplayName(name: string): string {
  const normalized = normalizeDisplayName(name);
  const hash = sha256Hex(normalized).slice(0, 24);
  return `n_${hash}`;
}
