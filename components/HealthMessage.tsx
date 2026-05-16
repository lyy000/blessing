"use client";

export type StatsPayload = {
  globalTotal: number;
  totalVisitors: number;
  encouragement: string;
  milestones: { id: string; reached: boolean; label: string }[];
};

export function HealthMessage({ stats }: { stats: StatsPayload | null }) {
  if (!stats) {
    return (
      <div
        className="h-32 animate-pulse rounded-[2rem] bg-white/40"
        aria-hidden
      />
    );
  }
  const reached = stats.milestones.filter((m) => m.reached);
  const latest = reached.length ? reached[reached.length - 1] : null;

  return (
    <div className="rounded-[2rem] border border-[#ffe4ef] bg-gradient-to-r from-[#fff8fb] to-[#f3f8ff] p-6 shadow-inner">
      <p className="text-sm font-medium text-[#c75b8c]">大家的心意</p>
      <p className="mt-2 text-lg leading-relaxed text-[color:var(--color-text)]">
        {stats.encouragement}
      </p>
      <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
        全站累计{" "}
        <span className="font-semibold text-[#c75b8c]">{stats.globalTotal}</span>{" "}
        次祈福 · {stats.totalVisitors} 位朋友参与
      </p>
      {latest && (
        <p className="mt-4 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm leading-relaxed text-[color:var(--color-text)]">
          {latest.label}
        </p>
      )}
    </div>
  );
}
