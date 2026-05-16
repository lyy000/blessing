"use client";

import { BlessingFloatLayer } from "@/components/BlessingEffects";
import { HealthMessage, type StatsPayload } from "@/components/HealthMessage";
import { Leaderboard, type LeaderRow } from "@/components/Leaderboard";
import { WoodenFish } from "@/components/WoodenFish";
import { randomUUID } from "@/lib/id";
import { useCallback, useEffect, useRef, useState } from "react";

type BlessResponse = {
  amount: number;
  critCount: number;
  normalCount: number;
  totalBless: number;
  critBless: number;
  rank: number;
  hadCrit: boolean;
};

const VISITOR_KEY = "bless_visitor_id";
const NAME_KEY = "bless_display_name";

export default function HomePage() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [selfTotal, setSelfTotal] = useState(0);
  const [selfCrit, setSelfCrit] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [tapBurst, setTapBurst] = useState<"normal" | "crit" | null>(null);
  const [floating, setFloating] = useState<
    { id: number; kind: "normal" | "crit"; text: string }[]
  >([]);
  const [rateLimited, setRateLimited] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const pending = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    setVisitorId(id);
    const savedName = localStorage.getItem(NAME_KEY) ?? "";
    setNickname(savedName);
    if (savedName.trim().length > 0) setNicknameSaved(true);
  }, []);

  const refreshPublic = useCallback(async () => {
    const [s, lUrl] = await Promise.all([
      fetch("/api/stats").then((r) => r.json() as Promise<StatsPayload>),
      visitorId
        ? fetch(`/api/leaderboard?limit=20&visitorId=${encodeURIComponent(visitorId)}`)
        : fetch("/api/leaderboard?limit=20"),
    ]);
    const l = (await lUrl.json()) as {
      leaderboard: LeaderRow[];
      me: LeaderRow | null;
      myRank: number | null;
    };
    setStats(s);
    setLeaderboard(l.leaderboard);
    if (l.me) {
      setSelfTotal(l.me.totalBless);
      setSelfCrit(l.me.critBless);
      if (l.myRank != null) setRank(l.myRank);
    } else {
      setSelfTotal(0);
      setSelfCrit(0);
      setRank(null);
    }
  }, [visitorId]);

  useEffect(() => {
    void refreshPublic();
    const t = setInterval(() => void refreshPublic(), 15000);
    return () => clearInterval(t);
  }, [refreshPublic]);

  const pushFloat = (kind: "normal" | "crit", text: string) => {
    const id = ++floatId.current;
    setFloating((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((x) => x.id !== id));
    }, 900);
  };

  const flushBless = useCallback(async () => {
    const n = pending.current;
    if (n <= 0 || !visitorId) return;
    pending.current = 0;
    const name = nickname.trim();
    if (name.length < 1) {
      pending.current += n;
      return;
    }

    try {
      const res = await fetch("/api/bless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          displayName: name,
          amount: n,
        }),
      });
      const data = (await res.json()) as BlessResponse & {
        error?: string;
        retryAfterSec?: number;
      };

      if (res.status === 429 && data.retryAfterSec) {
        pending.current += n;
        setRateLimited(`慢一点哦，${data.retryAfterSec} 秒后再试～`);
        setTimeout(() => setRateLimited(null), 3200);
        return;
      }
      if (!res.ok) {
        pending.current += n;
        setRateLimited("网络开小差了，稍后再试～");
        setTimeout(() => setRateLimited(null), 3200);
        return;
      }

      setSelfTotal(data.totalBless);
      setSelfCrit(data.critBless);
      setRank(data.rank);
      if (data.hadCrit) {
        setTapBurst("crit");
        pushFloat(
          "crit",
          data.critCount >= n ? "心念暴击！" : `暴击 ×${data.critCount}`,
        );
      } else {
        setTapBurst("normal");
        pushFloat("normal", `+${n}`);
      }
      setTimeout(() => setTapBurst(null), reduceMotion ? 200 : 420);
      void refreshPublic();
    } catch {
      pending.current += n;
      setRateLimited("发送失败，请检查网络～");
      setTimeout(() => setRateLimited(null), 3200);
    }
  }, [nickname, refreshPublic, visitorId, reduceMotion]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      void flushBless();
    }, 90);
  }, [flushBless]);

  const onTap = () => {
    const name = nickname.trim();
    if (name.length < 1 || !visitorId) return;
    if (!nicknameSaved) {
      localStorage.setItem(NAME_KEY, name);
      setNicknameSaved(true);
    }
    pending.current = Math.min(pending.current + 1, 25);
    scheduleFlush();
  };

  const saveNickname = () => {
    const name = nickname.trim();
    if (name.length < 1 || name.length > 24) return;
    localStorage.setItem(NAME_KEY, name);
    setNicknameSaved(true);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-10 pb-16 sm:px-8">
      <header className="text-center">
        <p className="mb-2 text-sm tracking-wide text-[color:var(--color-text-muted)]">
          给曼桢的一页小心愿
        </p>
        <h1
          className="font-display text-3xl text-[#c75b8c] sm:text-4xl"
          style={{ textShadow: "0 2px 18px rgba(255, 182, 213, 0.45)" }}
        >
          曼桢，愿你快快好起来
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:var(--color-text-muted)]">
          轻轻敲一敲木鱼，把祝福叠成软软的云。昵称只用来展示，统计会记在这台设备上。
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(199,91,140,0.12)] backdrop-blur-md">
            <label className="block text-sm font-medium text-[color:var(--color-text-muted)]">
              你的名字（无需密码）
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                className="min-w-0 flex-1 rounded-2xl border border-[#ffd6e8] bg-white/90 px-4 py-3 text-[color:var(--color-text)] outline-none ring-0 transition focus:border-[#ffb7d5] focus:shadow-[0_0_0_3px_rgba(255,183,213,0.35)]"
                maxLength={24}
                placeholder="例如：小桃"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button
                type="button"
                onClick={saveNickname}
                className="shrink-0 rounded-2xl bg-gradient-to-r from-[#ffb7d5] to-[#ffc9e4] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
              >
                保存昵称
              </button>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-gradient-to-b from-white/75 to-[#fff5f9]/90 p-8 shadow-[0_22px_60px_rgba(180,120,160,0.15)] backdrop-blur-md">
            {rateLimited && (
              <div className="absolute top-4 z-20 rounded-full bg-[#fff0f5] px-4 py-2 text-sm text-[#a65c7a] shadow">
                {rateLimited}
              </div>
            )}
            <WoodenFish
              disabled={nickname.trim().length < 1}
              burst={tapBurst}
              reduceMotion={reduceMotion}
              onTap={onTap}
            />
            <BlessingFloatLayer items={floating} reduceMotion={reduceMotion} />
            <p className="mt-6 max-w-sm text-center text-sm text-[color:var(--color-text-muted)]">
              可以连续点击；有时会触发「暴击」，特效会更闪亮一点。
            </p>
          </div>

          <HealthMessage stats={stats} />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(140,170,220,0.12)] backdrop-blur-md">
            <h2 className="font-display text-xl text-[#6b8cae]">
              我的心念
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[#fff8fb] p-4">
                <dt className="text-[color:var(--color-text-muted)]">累计祈福</dt>
                <dd className="mt-1 text-2xl font-bold text-[#c75b8c]">{selfTotal}</dd>
              </div>
              <div className="rounded-2xl bg-[#f5f9ff] p-4">
                <dt className="text-[color:var(--color-text-muted)]">暴击次数</dt>
                <dd className="mt-1 text-2xl font-bold text-[#7aa6e8]">{selfCrit}</dd>
              </div>
            </dl>
            {rank != null && (
              <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
                当前排名约第 <span className="font-semibold text-[#c75b8c]">{rank}</span> 位
              </p>
            )}
          </div>
          <Leaderboard rows={leaderboard} highlightId={visitorId} />
        </aside>
      </section>

      <footer className="mt-auto text-center text-xs text-[color:var(--color-text-muted)]">
        私人祝福页 · 数据保存在服务器（本地 SQLite 文件或 Turso 远程库）
      </footer>
    </main>
  );
}
