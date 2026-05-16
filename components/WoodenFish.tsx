"use client";

type Props = {
  disabled: boolean;
  burst: "normal" | "crit" | null;
  reduceMotion: boolean;
  onTap: () => void;
};

export function WoodenFish({ disabled, burst, reduceMotion, onTap }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      aria-label="点击祈福"
      className={[
        "relative flex h-52 w-52 select-none flex-col items-center justify-center rounded-full border-4 border-[#ffd6e8] bg-gradient-to-br from-[#fff5f9] via-[#ffe8f2] to-[#e8f4ff] shadow-[inset_0_-12px_30px_rgba(255,182,213,0.35),0_16px_40px_rgba(200,140,170,0.25)] transition",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:scale-[1.02] active:scale-95",
        burst === "normal" && !reduceMotion ? "animate-pulse-once" : "",
        burst === "crit" && !reduceMotion ? "animate-crit-shake" : "",
      ].join(" ")}
    >
      <span className="font-display text-lg text-[#c75b8c]">
        木鱼
      </span>
      <span className="mt-1 text-xs text-[color:var(--color-text-muted)]">点点祈福</span>
      {burst === "crit" && !reduceMotion && (
        <span className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-[#ffb7d5]/60 ring-offset-2 ring-offset-transparent" />
      )}
      <style jsx>{`
        @keyframes pulseOnce {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes critShake {
          0% {
            transform: rotate(0deg) scale(1);
          }
          20% {
            transform: rotate(-3deg) scale(1.08);
          }
          40% {
            transform: rotate(3deg) scale(1.1);
          }
          60% {
            transform: rotate(-2deg) scale(1.06);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }
        :global(.animate-pulse-once) {
          animation: pulseOnce 0.42s ease-out;
        }
        :global(.animate-crit-shake) {
          animation: critShake 0.45s ease-out;
        }
      `}</style>
    </button>
  );
}
