"use client";

import React, { useState } from "react";
import { Check, X, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * APPROVAL CARD (human-in-the-loop)
 * One question at a time; elongated pills show progress;
 * the circular arrow up top advances (↑ sends on the last).
 * Choices, paging, and submission are directly controlled.
 * ───────────────────────────────────────────────────────── */

interface Question {
  q: string;
  type: "radio" | "check";
  options: string[];
}

interface InteractiveApprovalCardProps {
  questions?: Question[];
  onComplete?: (answers: Record<number, number[]>, custom: Record<number, string>) => void;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    q: "How many flavors should we launch?",
    type: "radio",
    options: ["Three (core line)", "Five (full case)", "Just one hero"],
  },
  {
    q: "Which mix-ins should we stock?",
    type: "check",
    options: ["Chocolate chips", "Waffle bits", "Sprinkles"],
  },
  {
    q: "Which market do we enter first?",
    type: "radio",
    options: ["Food trucks", "Grocery freezers", "Scoop shops"],
  },
];

export function InteractiveApprovalCard({
  questions = DEFAULT_QUESTIONS,
  onComplete,
}: InteractiveApprovalCardProps) {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [custom, setCustom] = useState<Record<number, string>>({});
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(true);
  
  const question = questions[qi];
  const last = qi === questions.length - 1;
  const selected = answers[qi] ?? [];
  const hasAnswer = selected.length > 0 || Boolean(custom[qi]?.trim());

  const toggle = (index: number) => {
    setAnswers((current) => {
      const picked = current[qi] ?? [];
      const next = question.type === "radio"
        ? [index]
        : picked.includes(index)
          ? picked.filter((item) => item !== index)
          : [...picked, index];
      return { ...current, [qi]: next };
    });

    if (question.type === "radio") {
      setCustom((current) => ({ ...current, [qi]: "" }));
      // single-choice auto-advances
      window.setTimeout(() => {
        if (qi === questions.length - 1) {
          setSent(true);
          onComplete?.(answers, custom);
        } else {
          setQi((current) => Math.min(questions.length - 1, current + 1));
        }
      }, 480);
    }
  };

  const reset = () => {
    setQi(0);
    setAnswers({});
    setCustom({});
    setSent(false);
    setOpen(true);
  };

  if (!open) {
    return (
      <button 
        type="button" 
        onClick={() => setOpen(true)} 
        className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.04] shadow-sm"
      >
        Open approval card
      </button>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-sm bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {sent ? (
        <div className="flex h-44 flex-col items-center justify-center gap-2.5 p-5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            style={{ animation: "pop-in 300ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </span>
          <span className="text-[13px] font-semibold text-white/80" style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) 100ms both" }}>
            Answers sent
          </span>
          <button type="button" onClick={reset} className="text-[12px] font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors mt-1">
            Start over
          </button>
        </div>
      ) : (
        <div key={qi} className="p-5 flex flex-col gap-3" style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[13.5px] font-semibold text-white/90 leading-snug">{question.q}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {question.options.map((option, i) => {
              const on = selected.includes(i);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(i)}
                  className="-mx-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-100 hover:bg-white/[0.03]"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center transition-all duration-200
                      ${question.type === "radio" ? "rounded-full" : "rounded-md"}
                      ${on ? "bg-white text-black" : "border-2 border-white/20 text-transparent"}`}
                  >
                    {question.type === "radio" ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-black transition-transform duration-200" style={{ transform: on ? "scale(1)" : "scale(0)" }} />
                    ) : (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </span>
                  <span className={`text-[12.5px] font-medium transition-colors duration-200 ${on ? "text-white" : "text-white/60"}`}>
                    {option}
                  </span>
                </button>
              );
            })}
            <label className="-mx-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors duration-100 focus-within:bg-white/[0.02] hover:bg-white/[0.02]">
              <span aria-hidden="true" className="w-4 h-4 shrink-0" />
              <input
                value={custom[qi] ?? ""}
                onChange={(event) => {
                  setCustom((current) => ({ ...current, [qi]: event.target.value }));
                  if (question.type === "radio") setAnswers((current) => ({ ...current, [qi]: [] }));
                }}
                placeholder="Type custom answer…"
                aria-label="Custom answer"
                className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
              />
            </label>
          </div>
        </div>
      )}

      {/* footer — progress tracker + send arrow */}
      {!sent && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous"
              disabled={qi === 0}
              onClick={() => setQi((current) => Math.max(0, current - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="flex items-center gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to question ${i + 1}`}
                  aria-current={i === qi ? "step" : undefined}
                  onClick={() => setQi(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === qi ? 8 : 6,
                    height: i === qi ? 8 : 6,
                    backgroundColor: i === qi ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.2)",
                  }}
                />
              ))}
            </span>
            <button
              type="button"
              aria-label="Next"
              disabled={last}
              onClick={() => setQi((current) => Math.min(questions.length - 1, current + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </span>
          <button
            type="button"
            aria-label={last ? "Send answers" : "Next question"}
            disabled={!hasAnswer}
            onClick={() => {
              if (last) {
                setSent(true);
                onComplete?.(answers, custom);
              } else {
                setQi((current) => current + 1);
              }
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-20 disabled:scale-100"
            style={{
              backgroundColor: hasAnswer ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.05)",
              color: hasAnswer ? "#000" : "rgba(255, 255, 255, 0.3)",
            }}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default InteractiveApprovalCard;
