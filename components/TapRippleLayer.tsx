"use client";

export type TapRipple = { id: number; x: number; y: number };

export function TapRippleLayer({ ripples }: { ripples: TapRipple[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="tap-ripple absolute rounded-full border-2 border-[#ffb7d5]/70 bg-[#ffd6e8]/25"
          style={{
            left: r.x,
            top: r.y,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes tapRippleExpand {
          0% {
            opacity: 0.85;
            transform: scale(0.4);
          }
          100% {
            opacity: 0;
            transform: scale(4.5);
          }
        }
        .tap-ripple {
          animation: tapRippleExpand 0.55s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

