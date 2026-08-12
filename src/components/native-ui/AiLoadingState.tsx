"use client";

import React, { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * LOADING STATE — pixel-grid loader for long-running work
 *
 * Variants:
 *   Drive  — square cells, chevron wavefront driving right;
 *            the 650ms cycle is shorter than the sweep, so
 *            two fronts are always in flight
 *   Dots   — same wavefront, circular cells
 *   Orbit  — a comet lapping the grid perimeter
 *
 * Paired with a shimmering label and a live elapsed timer
 * in mono tabular figures.
 * ───────────────────────────────────────────────────────── */

const chevron = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i);
  return k === -1 ? null : k * 110;
});

const PATTERNS: Record<string, { delays: (number | null)[]; dur: number; round: boolean }> = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots: { delays: chevron, dur: 650, round: true },
  Orbit: { delays: orbit, dur: 950, round: false },
};

function useElapsed() {
  const [ds, setDs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, []);
  
  const total = ds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

interface AiLoadingStateProps {
  label?: string;
  variant?: "Drive" | "Dots" | "Orbit";
}

export function AiLoadingState({
  label = "Synthesizing response...",
  variant = "Drive",
}: AiLoadingStateProps) {
  const elapsed = useElapsed();
  const { delays, dur, round } = PATTERNS[variant] ?? PATTERNS.Drive;

  return (
    <div className="flex w-fit items-center gap-3.5 bg-white/[0.02] border border-white/[0.04] p-3 px-4 rounded-xl shadow-lg backdrop-blur-md animate-[fade-in_300ms_ease-out]">
      {/* 3x3 Pixel Grid Loader */}
      <span aria-hidden className="grid grid-cols-[repeat(3,5px)] gap-[2px] shrink-0">
        {delays.map((d, i) => (
          <span
            key={i}
            className={`w-[5px] h-[5px] transition-all duration-300 ${
              round ? "rounded-full" : "rounded-[1.5px]"
            }`}
            style={{
              backgroundColor: d === null ? "rgba(255, 255, 255, 0.05)" : "rgba(168, 85, 247, 0.15)",
              animation: d === null ? "none" : `pixel-on ${dur}ms ease-in-out ${d}ms infinite`,
            }}
          />
        ))}
      </span>

      {/* Shimmering Text Label */}
      <span
        className="text-[12.5px] font-semibold tracking-wider uppercase text-transparent bg-clip-text"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.4) 65%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-text 1.4s linear infinite",
        }}
      >
        {label}
      </span>

      {/* Tabular Monospace Timer */}
      <span className="font-mono text-[11.5px] text-white/35 font-semibold tabular-nums tracking-wide">
        {elapsed}
      </span>

      <style>{`
        @keyframes pixel-on {
          0%, 100% {
            background-color: rgba(168, 85, 247, 0.15);
            box-shadow: none;
          }
          50% {
            background-color: rgba(168, 85, 247, 0.95);
            box-shadow: 0 0 6px 1.5px rgba(168, 85, 247, 0.6);
          }
        }
        @keyframes shimmer-text {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default AiLoadingState;
