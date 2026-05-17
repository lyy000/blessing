"use client";

import { TapRippleLayer, type TapRipple } from "@/components/TapRippleLayer";
type Props = {
  disabled: boolean;
  burst: "normal" | "crit" | null;
  tapPulse: number;
  ripples: TapRipple[];
  reduceMotion: boolean;
  onTap: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WoodenFish({
  disabled,
  burst,
  tapPulse,
  ripples,
  reduceMotion,
  onTap,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      aria-label="点击祈福"
      className={[
        "wooden-fish-btn relative flex h-52 w-52 select-none flex-col items-center justify-center overflow-hidden rounded-full border-4 border-[#ffd6e8] bg-gradient-to-br from-[#fff5f9] via-[#ffe8f2] to-[#e8f4ff] shadow-[inset_0_-12px_30px_rgba(255,182,213,0.35),0_16px_40px_rgba(200,140,170,0.25)] transition-transform duration-75",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:scale-[1.02] active:scale-[0.88]",
        burst === "normal" && !reduceMotion ? "fish-hit-normal" : "",
        burst === "crit" && !reduceMotion ? "fish-hit-crit" : "",
        tapPulse > 0 && !reduceMotion ? "fish-tap-pulse" : "",
      ].join(" ")}
      style={
        tapPulse > 0 && !reduceMotion
          ? ({ ["--tap-pulse" as string]: tapPulse } as React.CSSProperties)
          : undefined
      }
    >
      <TapRippleLayer ripples={ripples} />

      {!reduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-[#ffb7d5]/10 to-transparent opacity-80"
          aria-hidden
        />
      )}

      <span
        className="relative z-10 font-display text-2xl text-[#c75b8c]"
        aria-hidden
      >
        咚
      </span>
      <span className="relative z-10 mt-1 text-xs text-[color:var(--color-text-muted)]">
        敲木鱼 · 祈福
      </span>

      {burst === "crit" && !reduceMotion && (
        <span className="pointer-events-none absolute inset-0 z-20 rounded-full ring-4 ring-[#ff6b9d]/50 ring-offset-2" />
      )}

      <style jsx global>{`
        @keyframes fishHitNormal {
          0% {
            transform: scale(1);
            box-shadow: inset 0 -12px 30px rgba(255, 182, 213, 0.35),
              0 16px 40px rgba(200, 140, 170, 0.25);
          }
          35% {
            transform: scale(0.9);
            box-shadow: inset 0 -6px 20px rgba(255, 182, 213, 0.5),
              0 8px 24px rgba(200, 140, 170, 0.35);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes fishHitCrit {
          0% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(0.88) rotate(-4deg);
          }
          50% {
            transform: scale(1.05) rotate(4deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes fishTapPulse {
          0% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.12);
          }
          100% {
            filter: brightness(1);
          }
        }
        .fish-hit-normal {
          animation: fishHitNormal 0.28s ease-out;
        }
        .fish-hit-crit {
          animation: fishHitCrit 0.42s ease-out;
        }
        .wooden-fish-btn.fish-tap-pulse {
          animation: fishTapPulse 0.15s ease-out;
        }
      `}</style>
    </button>
  );
}
