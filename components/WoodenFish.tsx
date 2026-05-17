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

function WoodenFishArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 168"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="woodBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8b878" />
          <stop offset="45%" stopColor="#c8874a" />
          <stop offset="100%" stopColor="#8f5a2e" />
        </linearGradient>
        <linearGradient id="woodHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff2d6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff2d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="woodShadow" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#5c3a1e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5c3a1e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 木鱼侧身：圆腹、鱼尾、鱼鳍 */}
      <ellipse cx="98" cy="88" rx="72" ry="58" fill="url(#woodBody)" />
      <ellipse cx="98" cy="88" rx="72" ry="58" fill="url(#woodShadow)" />
      <ellipse
        cx="88"
        cy="72"
        rx="48"
        ry="36"
        fill="url(#woodHighlight)"
      />
      {/* 鱼尾 */}
      <path
        d="M158 78 Q188 68 194 88 Q188 108 158 98 Q168 88 158 78Z"
        fill="#a66b38"
      />
      <path
        d="M162 82 Q182 76 186 88 Q182 100 162 94Z"
        fill="#c8874a"
      />
      {/* 背鳍 */}
      <path
        d="M72 42 Q98 28 118 38 L112 48 Q96 40 78 50Z"
        fill="#b87440"
      />
      {/* 腹鳍 */}
      <path
        d="M58 108 Q78 118 96 112 L92 104 Q76 110 62 102Z"
        fill="#9a6032"
      />
      {/* 木鱼开口（中空缝） */}
      <path
        d="M38 72 Q52 58 78 62 Q98 66 108 78 Q98 108 72 112 Q48 110 38 92 Q34 82 38 72Z"
        fill="#4a2f18"
      />
      <path
        d="M42 76 Q54 66 76 70 Q94 74 102 82 Q92 100 70 102 Q52 100 42 88 Q40 82 42 76Z"
        fill="#2a1810"
        opacity="0.85"
      />
      {/* 木纹理 */}
      <path
        d="M52 52 Q88 44 120 56"
        fill="none"
        stroke="#7a4e28"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M48 100 Q90 108 128 96"
        fill="none"
        stroke="#6b4224"
        strokeWidth="1"
        opacity="0.3"
      />
      <ellipse
        cx="128"
        cy="86"
        rx="6"
        ry="8"
        fill="#d4a064"
        opacity="0.5"
      />
    </svg>
  );
}

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
      aria-label="敲木鱼祈福"
      className={[
        "wooden-fish-btn group relative flex h-56 w-64 select-none flex-col items-center justify-center border-0 bg-transparent p-2 transition-transform duration-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb7d5] focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:scale-[1.02] active:scale-[0.92]",
        burst === "normal" && !reduceMotion ? "fish-hit-normal" : "",
        burst === "crit" && !reduceMotion ? "fish-hit-crit" : "",
        tapPulse > 0 && !reduceMotion ? "fish-tap-pulse" : "",
      ].join(" ")}
    >
      <span className="relative flex h-full w-full items-center justify-center">
        <TapRippleLayer ripples={ripples} />
        <WoodenFishArt className="relative z-10 h-44 w-auto max-w-full drop-shadow-[0_14px_28px_rgba(120,72,40,0.35)] transition-transform duration-75 group-active:scale-95" />
        {burst === "crit" && !reduceMotion && (
          <span className="pointer-events-none absolute inset-4 z-20 rounded-[3rem] ring-4 ring-[#ff9ec4]/50 ring-offset-2 ring-offset-transparent" />
        )}
      </span>

      <style jsx global>{`
        @keyframes fishHitNormal {
          0% {
            transform: scale(1);
          }
          35% {
            transform: scale(0.94) translateY(2px);
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
            transform: scale(0.92) rotate(-3deg);
          }
          50% {
            transform: scale(1.04) rotate(3deg);
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
            filter: brightness(1.08);
          }
          100% {
            filter: brightness(1);
          }
        }
        .fish-hit-normal {
          animation: fishHitNormal 0.26s ease-out;
        }
        .fish-hit-crit {
          animation: fishHitCrit 0.4s ease-out;
        }
        .wooden-fish-btn.fish-tap-pulse {
          animation: fishTapPulse 0.12s ease-out;
        }
      `}</style>
    </button>
  );
}
