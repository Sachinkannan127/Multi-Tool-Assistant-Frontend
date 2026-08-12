"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * THINKING — expandable agent trace, four variants
 * Adapts the user's beautiful UI design to the real data
 * stream from the assistant.
 * ───────────────────────────────────────────────────────── */

interface AiThinkingProps {
  content: string;
  isThinking?: boolean;
  durationMs?: number;
  defaultExpanded?: boolean;
  variant?: "Steps" | "Reasoning" | "Search" | "Coding";
}

function Dot({ tone }: { tone: string }) {
  return (
    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-white ${tone}`}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </span>
  );
}

const TONES = ["bg-purple-500", "bg-amber-500", "bg-emerald-500"];

export function AiThinking({
  content,
  isThinking = false,
  durationMs,
  defaultExpanded = true,
  variant = "Steps"
}: AiThinkingProps) {
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  // Split thoughts content into rows dynamically
  const lines = content 
    ? content.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    : [];

  const rows = lines.map((line, i) => {
    // If it's a tool execution pattern, try to parse details
    const isToolPattern = line.startsWith("Reading") || line.startsWith("Executing") || line.startsWith("Running");
    return {
      primary: line,
      secondary: isToolPattern ? "tool trace" : undefined,
      mono: isToolPattern
    };
  });

  const autoExpanded = isThinking ? true : defaultExpanded;
  const expanded = manualExpanded ?? autoExpanded;
  const visible = rows.length;

  useLayoutEffect(() => {
    if (traceRef.current) {
      setLineHeight(traceRef.current.offsetHeight);
    }
  }, [visible, expanded, variant, content, isThinking]);

  if (!content && !isThinking) return null;

  const durationStr = durationMs !== undefined 
    ? `Thought for ${(durationMs / 1000).toFixed(1)}s` 
    : "Thought complete";

  const headerLabel = isThinking ? "Thinking Process" : durationStr;

  return (
    <div className="flex w-full flex-col mb-4 animate-fade-slide-up bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 shadow-sm">
      {/* header */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded(!expanded)}
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-100 hover:bg-white/[0.04]"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={isThinking ? "text-purple-400 animate-spin-slow" : "text-emerald-400"}
        >
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
        {isThinking ? (
          <span
            className="bg-clip-text text-[13px] font-semibold whitespace-nowrap text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-shimmer"
            style={{
              backgroundSize: "200% 100%",
            }}
          >
            Thinking...
          </span>
        ) : (
          <span className="text-[13px] font-semibold whitespace-nowrap text-white/70">
            {headerLabel}
          </span>
        )}
        <svg
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-transform duration-300 text-white/40"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* expandable trace */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-2 ml-[9px] pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] w-px bg-white/[0.08]"
              style={{ 
                top: 0, 
                height: lineHeight ? lineHeight - 6 : 0, 
                transition: "height 300ms cubic-bezier(0.23,1,0.32,1)" 
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-1.5 py-1">
              {rows.map((row, i) => {
                const isLastRow = i === rows.length - 1;
                const showSpinner = isLastRow && isThinking;

                const contentEl = (
                  <>
                    {variant === "Search" && <Dot tone={TONES[i % 3]} />}
                    {variant === "Steps" && (
                      !showSpinner ? (
                        <svg 
                          width="13" 
                          height="13" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="shrink-0 text-emerald-500/80"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span 
                          className="h-3 w-3 shrink-0 rounded-full border border-purple-500/30 border-t-purple-400 animate-spin" 
                        />
                      )
                    )}
                    <span className={`min-w-0 text-[12.5px] leading-relaxed ${variant === "Reasoning" ? "whitespace-normal text-white/60" : "font-medium text-white/80"} ${variant === "Search" ? "underline decoration-white/20 underline-offset-2" : ""}`}>
                      {row.primary}
                    </span>
                    {row.secondary && (
                      <span className={`shrink-0 text-[11px] text-white/40 px-1.5 py-0.5 rounded bg-white/[0.04] font-medium ${row.mono ? "font-mono" : ""}`}>
                        {row.secondary}
                      </span>
                    )}
                  </>
                );

                const rowClass = "flex min-h-7 w-full items-start gap-2.5 rounded-lg px-2 py-1 text-left hover:bg-white/[0.02] transition-colors";
                const animationStyle = { animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${i * 60}ms both` };

                return (
                  <div key={i} className={rowClass} style={animationStyle}>
                    {contentEl}
                  </div>
                );
              })}

              {isThinking && rows.length === 0 && (
                <div className="flex items-center gap-2 px-2 py-1 text-white/40 text-[12px] font-medium">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-purple-500/30 border-t-purple-400 animate-spin" />
                  <span>Analyzing trace...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AiThinking;
