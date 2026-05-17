"use client";

import { BlessingFloatLayer } from "@/components/BlessingEffects";
import { HealthMessage, type StatsPayload } from "@/components/HealthMessage";
import { Leaderboard, type LeaderRow } from "@/components/Leaderboard";
import { MilestoneBlessModal } from "@/components/MilestoneBlessModal";
import { WoodenFish } from "@/components/WoodenFish";
import {
  MILESTONE_EVERY,
  pickRandomBlessingQuote,
} from "@/lib/blessingQuotes";
import { visitorIdFromDisplayName } from "@/lib/visitorId";
import { playWoodenFishKnock } from "@/lib/woodenFishSound";
import type { TapRipple } from "@/components/TapRippleLayer";
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

const NAME_KEY = "bless_display_name";

function apiErrorMessage(status: number, code?: string): string {
  if (status === 429) return "慢一点哦，稍后再试～";
  if (code === "invalid_name") return "昵称需要 1～24 个字～";
  if (code === "rate_limited") return "点击太快了，歇一会儿～";
  if (code === "server") return "服务器开小差了，稍后再试～";
  return "祈福没发送成功，请稍后再试～";
}

export default function HomePage() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [selfTotal, setSelfTotal] = useState(0);
  const [selfCrit, setSelfCrit] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [tapBurst, setTapBurst] = useState<"normal" | "crit" | null>(null);
  const [floating, setFloating] = useState<
    { id: number; kind: "normal" | "crit"; text: string; offsetX?: number }[]
  >([]);
  const [tapPulse, setTapPulse] = useState(0);
  const [ripples, setRipples] = useState<TapRipple[]>([]);
  const [rateLimited, setRateLimited] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneQuote, setMilestoneQuote] = useState("");
  const [milestoneLevel, setMilestoneLevel] = useState(100);

  const pending = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);
  const rippleId = useRef(0);
  const selfTotalRef = useRef(0);

  useEffect(() => {
    selfTotalRef.current = selfTotal;
  }, [selfTotal]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    localStorage.removeItem("bless_visitor_id");
    const savedName = localStorage.getItem(NAME_KEY) ?? "";
    setNickname(savedName);
    if (savedName.trim().length > 0) {
      setNicknameSaved(true);
      setVisitorId(visitorIdFromDisplayName(savedName));
    }
  }, []);

  const syncVisitorId = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setVisitorId(null);
      return null;
    }
    const id = visitorIdFromDisplayName(trimmed);
    setVisitorId(id);
    return id;
  }, []);

  const openMilestone = useCallback((level: number, quote: string) => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    pending.current = 0;
    setMilestoneLevel(level);
    setMilestoneQuote(quote);
    setMilestoneOpen(true);
    playWoodenFishKnock("milestone");
  }, []);

  const maybeShowMilestone = useCallback(
    (prevTotal: number, newTotal: number) => {
      const prevLevel = Math.floor(prevTotal / MILESTONE_EVERY);
      const newLevel = Math.floor(newTotal / MILESTONE_EVERY);
      if (newLevel > prevLevel && newTotal >= MILESTONE_EVERY) {
        openMilestone(newLevel * MILESTONE_EVERY, pickRandomBlessingQuote());
      }
    },
    [openMilestone],
  );

  const refreshPublic = useCallback(
    async (idOverride?: string | null) => {
      const id = idOverride ?? visitorId;
      const [s, lUrl] = await Promise.all([
        fetch("/api/stats").then((r) => r.json() as Promise<StatsPayload>),
        id
          ? fetch(
              `/api/leaderboard?limit=20&visitorId=${encodeURIComponent(id)}`,
            )
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
      } else if (!id) {
        setSelfTotal(0);
        setSelfCrit(0);
        setRank(null);
      }
    },
    [visitorId],
  );

  useEffect(() => {
    void refreshPublic();
    const t = setInterval(() => void refreshPublic(), 15000);
    return () => clearInterval(t);
  }, [refreshPublic]);

  const pushFloat = (kind: "normal" | "crit", text: string) => {
    const id = ++floatId.current;
    const offsetX = Math.round((Math.random() - 0.5) * 80);
    setFloating((prev) => [...prev, { id, kind, text, offsetX }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((x) => x.id !== id));
    }, 1000);
  };

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++rippleId.current;
    const ripple: TapRipple = {
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setRipples((prev) => [...prev, ripple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const showToast = (msg: string, ms = 3200) => {
    setRateLimited(msg);
    setTimeout(() => setRateLimited(null), ms);
  };

  const flushBless = useCallback(async () => {
    const n = pending.current;
    if (n <= 0) return;
    pending.current = 0;

    const name = nickname.trim();
    if (name.length < 1) {
      pending.current += n;
      showToast("请先输入并保存昵称～");
      return;
    }
    if (!nicknameSaved) {
      pending.current += n;
      showToast("请先点击「保存昵称」～");
      return;
    }

    const id = visitorIdFromDisplayName(name);
    const prevTotal = selfTotalRef.current;

    try {
      const res = await fetch("/api/bless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: id,
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
        showToast(`慢一点哦，${data.retryAfterSec} 秒后再试～`);
        return;
      }
      if (!res.ok) {
        pending.current += n;
        showToast(apiErrorMessage(res.status, data.error));
        return;
      }

      setSelfTotal(data.totalBless);
      setSelfCrit(data.critBless);
      setRank(data.rank);
      selfTotalRef.current = data.totalBless;
      maybeShowMilestone(prevTotal, data.totalBless);

      if (data.hadCrit) {
        setTapBurst("crit");
        playWoodenFishKnock("crit");
        pushFloat(
          "crit",
          data.critCount >= n ? "心念暴击！" : `暴击 ×${data.critCount}`,
        );
      } else if (n > 1) {
        setTapBurst("normal");
        pushFloat("normal", `+${n}`);
      } else {
        setTapBurst("normal");
      }
      setTimeout(() => setTapBurst(null), reduceMotion ? 200 : 420);
      void refreshPublic(id);
    } catch {
      pending.current += n;
      showToast("发送失败，请检查网络～");
    }
  }, [
    nickname,
    nicknameSaved,
    refreshPublic,
    reduceMotion,
    maybeShowMilestone,
  ]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      void flushBless();
    }, 90);
  }, [flushBless]);

  const onTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (milestoneOpen) return;
    const name = nickname.trim();
    if (name.length < 1) {
      showToast("请先输入昵称～");
      return;
    }
    if (!nicknameSaved) {
      showToast("请先点击「保存昵称」再敲木鱼～");
      return;
    }
    addRipple(e);
    setTapPulse((p) => p + 1);
    playWoodenFishKnock("normal");
    pushFloat("normal", "咚 +1");
    pending.current = Math.min(pending.current + 1, 25);
    scheduleFlush();
  };

  const saveNickname = () => {
    const name = nickname.trim();
    if (name.length < 1) {
      setSaveHint("昵称不能为空哦");
      setTimeout(() => setSaveHint(null), 3000);
      return;
    }
    if (name.length > 24) {
      setSaveHint("昵称最多 24 个字");
      setTimeout(() => setSaveHint(null), 3000);
      return;
    }
    localStorage.setItem(NAME_KEY, name);
    setNicknameSaved(true);
    const id = syncVisitorId(name);
    setSaveHint("已保存，可以敲木鱼祈福啦 ✓");
    setTimeout(() => setSaveHint(null), 4000);
    void refreshPublic(id);
  };

  const canTap =
    nicknameSaved && nickname.trim().length > 0 && !milestoneOpen;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-10 pb-16 sm:px-8">
      <MilestoneBlessModal
        open={milestoneOpen}
        quote={milestoneQuote}
        milestone={milestoneLevel}
        onClose={() => setMilestoneOpen(false)}
      />

      <header className="text-center">
        <p className="mb-2 text-sm tracking-wide text-[color:var(--color-text-muted)]">
          给曼桢的一页小心愿
        </p>
        <h1
          className="font-display text-3xl text-[#c75b8c] sm:text-4xl"
          style={{ textShadow: "0 2px 18px rgba(255, 182, 213, 0.45)" }}
        >
          曼桢，愿你感冒快快好起来
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:var(--color-text-muted)]">
          轻轻敲一敲木鱼，为曼桢送一句祝福：少咳几声、多喝温水、早点康复。
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
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameSaved(false);
                }}
              />
              <button
                type="button"
                onClick={saveNickname}
                className="shrink-0 rounded-2xl bg-gradient-to-r from-[#ffb7d5] to-[#ffc9e4] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
              >
                保存昵称
              </button>
            </div>
            {saveHint && (
              <p
                className={[
                  "mt-3 text-sm",
                  saveHint.includes("已保存")
                    ? "font-medium text-[#5a9e6f]"
                    : "text-[#a65c7a]",
                ].join(" ")}
                role="status"
              >
                {saveHint}
              </p>
            )}
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-gradient-to-b from-white/75 to-[#fff5f9]/90 p-8 shadow-[0_22px_60px_rgba(180,120,160,0.15)] backdrop-blur-md">
            {rateLimited && (
              <div
                className="absolute top-4 z-20 max-w-[90%] rounded-full bg-[#fff0f5] px-4 py-2 text-center text-sm text-[#a65c7a] shadow"
                role="alert"
              >
                {rateLimited}
              </div>
            )}
            <WoodenFish
              disabled={!canTap}
              burst={tapBurst}
              tapPulse={tapPulse}
              ripples={ripples}
              reduceMotion={reduceMotion}
              onTap={onTap}
            />
            <BlessingFloatLayer items={floating} reduceMotion={reduceMotion} />
            <p className="mt-6 max-w-sm text-center text-sm text-[color:var(--color-text-muted)]">
              每敲一次都有音效与飘字反馈；连点可攒祝福。累计每满 100 次会暂停并弹出随机祝福语。
            </p>
          </div>

          <HealthMessage stats={stats} />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(140,170,220,0.12)] backdrop-blur-md">
            <h2 className="font-display text-xl text-[#6b8cae]">我的心念</h2>
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
                当前排名约第{" "}
                <span className="font-semibold text-[#c75b8c]">{rank}</span> 位
              </p>
            )}
            {selfTotal > 0 && (
              <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
                距下一次百次祝福弹窗还差{" "}
                <span className="font-semibold text-[#c75b8c]">
                  {selfTotal % MILESTONE_EVERY === 0
                    ? MILESTONE_EVERY
                    : MILESTONE_EVERY - (selfTotal % MILESTONE_EVERY)}
                </span>{" "}
                次
              </p>
            )}
          </div>
          <Leaderboard rows={leaderboard} highlightId={visitorId} />
        </aside>
      </section>

      <footer className="mt-auto text-center text-xs text-[color:var(--color-text-muted)]">
        私人祝福页 · 愿曼桢感冒早日康复
      </footer>
    </main>
  );
}