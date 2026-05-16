"use client";

export type FloatingTag = { id: number; kind: "normal" | "crit"; text: string };

export function BlessingFloatLayer({
  items,
  reduceMotion,
}: {
  items: FloatingTag[];
  reduceMotion: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      {items.map((f) => (
        <span
          key={f.id}
          className={
            reduceMotion
              ? "float-soft absolute left-1/2 top-1/3 -translate-x-1/2 text-base font-semibold text-[#c75b8c]"
              : f.kind === "crit"
                ? "float-crit absolute left-1/2 top-1/3 -translate-x-1/2 text-lg font-bold text-[#ff6b9d]"
                : "float-normal absolute left-1/2 top-1/3 -translate-x-1/2 text-base font-semibold text-[#c75b8c]"
          }
        >
          {f.text}
        </span>
      ))}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -56px) scale(1.05);
          }
        }
        @keyframes floatCrit {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1) rotate(-4deg);
            filter: drop-shadow(0 0 8px #ffb7d5);
          }
          40% {
            transform: translate(-50%, -12px) scale(1.25) rotate(4deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -72px) scale(1.35) rotate(0deg);
          }
        }
        .float-normal {
          animation: floatUp 0.85s ease-out forwards;
        }
        .float-crit {
          animation: floatCrit 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes floatSoft {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .float-soft {
          animation: floatSoft 0.55s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
