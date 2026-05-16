export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** 昵称哈希 ID（当前方案） */
export const NAME_ID_RE = /^n_[a-f0-9]{24}$/i;

export function isValidVisitorId(id: string): boolean {
  return UUID_RE.test(id) || NAME_ID_RE.test(id);
}
