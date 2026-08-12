"use client";

import React, { useEffect, useState } from "react";
import { Check, X, RotateCw, ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * TASK ROWS
 *
 *     0ms   rows enter staggered (80ms apart)
 *   600ms   row 1 ring sweeps 0 → 66%
 *  1500ms   row 1 expands — detail steps drop down
 *  3900ms   row 1 collapses; row 2 flips to Failed + retry
 *  5300ms   row 2 resolves to Completed
 * The status run completes once; task details stay clickable.
 * ───────────────────────────────────────────────────────── */

interface TaskDetail {
  label: string;
  meta: string;
}

interface TaskRowData {
  key: string;
  label: string;
  amount: string;
  status: "pending" | "running" | "completed" | "failed";
  details: TaskDetail[];
}

interface TaskRowsProps {
  variant?: "List" | "Capsules";
  tasks?: TaskRowData[];
}

const DEFAULT_TICKS = [600, 900, 2400, 1400, 2400, 600];

function useTick(intervals: number[]) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (tick >= intervals.length - 1) return;
    const t = setTimeout(() => setTick((x) => x + 1), intervals[tick]);
    return () => clearTimeout(t);
  }, [tick, intervals]);
  return tick;
}

function SpinnerRing({ active, children }: { active?: boolean; children?: React.ReactNode }) {
  const size = 24, stroke = 2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size} height={size} className="absolute inset-0"
        style={active ? { animation: "spin 1.1s linear infinite" } : undefined}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {active && (
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="rgba(255,255,255,0.6)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${c * 0.28} ${c * 0.72}`}
          />
        )}
      </svg>
      <span className="relative text-[10.5px] font-semibold tabular-nums text-white/80">{children}</span>
    </span>
  );
}

function Badge({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-white shadow-sm
        ${tone === "red" ? "bg-red-500 shadow-red-500/10" : "bg-emerald-500 shadow-emerald-500/10"}`}
      style={{ animation: "pop-in 300ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      {children}
    </span>
  );
}

export function TaskRows({ variant = "Capsules", tasks }: TaskRowsProps) {
  const tick = useTick(DEFAULT_TICKS);
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  const row2Status: "pending" | "failed" | "done" = tick < 3 ? "pending" : tick === 3 ? "failed" : "done";

  const defaultTasks = [
    {
      key: "verify",
      badge: <Badge tone="green"><Check className="w-3 h-3 stroke-[3.5]" /></Badge>,
      label: "Verified vendor records",
      amount: "12 suppliers",
      pill: (
        <span className="inline-flex h-5.5 items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 text-[11px] font-semibold text-emerald-400">
          Completed
        </span>
      ),
      details: [
        { label: "Matched tax and contact IDs", meta: "12/12" },
        { label: "Flagged stale records", meta: "0" },
      ],
    },
    {
      key: "index",
      badge: <SpinnerRing active={tick === 2}>2</SpinnerRing>,
      label: "Build reorder task list",
      amount: "7 SKUs",
      pill: null,
      details: [
        { label: "Reading POS export", meta: "3 files" },
        { label: "Scoring stockout risk", meta: "68%" },
      ],
    },
    {
      key: "draft",
      badge:
        row2Status === "pending" ? (
          <SpinnerRing>3</SpinnerRing>
        ) : row2Status === "failed" ? (
          <Badge tone="red"><X className="w-3 h-3 stroke-[3.5]" /></Badge>
        ) : (
          <Badge tone="green"><Check className="w-3 h-3 stroke-[3.5]" /></Badge>
        ),
      label: "Draft supplier emails",
      amount: "2 messages",
      pill:
        row2Status === "failed" ? (
          <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2 text-[11px] font-semibold text-red-400 animate-[fade-in_200ms_ease-out_both]">
            Failed <RotateCw className="w-3 h-3 animate-spin" />
          </span>
        ) : row2Status === "done" ? (
          <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 text-[11px] font-semibold text-emerald-400 animate-[fade-in_200ms_ease-out_both]">
            Completed
          </span>
        ) : null,
      details: [
        { label: "Cone supplier follow-up", meta: "draft" },
        { label: "Pistachio reorder note", meta: "draft" },
      ],
    },
  ];

  const displayTasks = tasks || defaultTasks;
  const listMode = variant === "List";

  return (
    <div
      className={`flex w-full max-w-sm flex-col ${
        listMode ? "gap-0 overflow-hidden rounded-2xl bg-white/[0.01] border border-white/[0.04] shadow-xl" : "gap-2"
      }`}
    >
      {displayTasks.map((row, i) => {
        const open = manualOpen[row.key] ?? (row.key === "index" && tick === 2);
        return (
          <div
            key={row.key}
            className={`self-stretch overflow-hidden transition-[border-radius] duration-300 ${
              listMode ? "border-b border-white/[0.04] last:border-0" : "bg-white/[0.01] border border-white/[0.04] shadow-md"
            }`}
            style={{
              borderRadius: listMode ? 0 : open ? 14 : 22,
              animation: `fade-up 450ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms both`,
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setManualOpen((current) => ({ ...current, [row.key]: !open }))}
              className="flex h-11 w-full items-center gap-2.5 px-3.5 text-left transition-colors duration-100 hover:bg-white/[0.02]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {row.badge}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/80">
                {row.label}
              </span>
              <span className="text-[12px] text-white/40 font-medium tabular-nums">{row.amount}</span>
              {row.pill}
              <span
                aria-hidden="true"
                className="-ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 hover:text-white/60 transition-colors"
              >
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-300"
                  style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
                />
              </span>
            </button>

            {/* dropdown detail — same expandable grammar as Chain of Thought */}
            <div
              className="grid transition-[grid-template-rows,opacity] duration-300"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                opacity: open ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <div className="overflow-hidden">
                <div className="mb-3 grid grid-cols-[24px_1fr] gap-2.5 px-3.5">
                  <span aria-hidden className="mx-auto h-full w-px bg-white/[0.04]" />
                  <div className="flex flex-col gap-2 py-0.5">
                    {row.details.map((d, j) => (
                      <div
                        key={d.label}
                        className="flex items-center justify-between"
                        style={
                          open
                            ? { animation: `fade-up 300ms cubic-bezier(0.23,1,0.32,1) ${120 + j * 100}ms both` }
                            : undefined
                        }
                      >
                        <span className="text-[12px] text-white/50">{d.label}</span>
                        <span className="font-mono text-[10.5px] text-white/35 tabular-nums">
                          {d.meta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default TaskRows;
