"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Paperclip, Sparkles, Send, Mic, Keyboard, CornerDownLeft, ArrowUp, ChevronDown, Check, X } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * MOCK SHADER ENGINE
 * Simulates glimm package to prevent dependency compile errors
 * while rendering a gorgeous Canvas rainbow sweep animation.
 * ───────────────────────────────────────────────────────── */
const ACCENTS = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#10b981",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#8b5cf6",
};

const RAINBOW = [
  ACCENTS.red,
  ACCENTS.orange,
  ACCENTS.yellow,
  ACCENTS.green,
  ACCENTS.cyan,
  ACCENTS.blue,
  ACCENTS.purple,
];

function createShader(canvas: HTMLCanvasElement, palette: string[]) {
  const ctx = canvas.getContext("2d");
  let frameId: number;
  let progress = 0;
  let isSweeping = false;

  const draw = () => {
    if (!ctx) return;
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    if (isSweeping) {
      // Draw active sweep gradient
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      palette.forEach((color, idx) => {
        // Shift colors across the screen based on progress
        const stop = (idx / (palette.length - 1) + progress) % 1.0;
        grad.addColorStop(stop, color);
      });
      ctx.fillStyle = grad;
      ctx.globalAlpha = Math.max(0, 0.15 - progress * 0.15); // Fade out as it sweeps
      ctx.fillRect(0, 0, w, h);
    }
  };

  return {
    startSweep: () => {
      isSweeping = true;
      progress = 0;
      const animate = () => {
        progress += 0.02;
        draw();
        if (progress < 1.0) {
          frameId = requestAnimationFrame(animate);
        } else {
          isSweeping = false;
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      animate();
    },
    destroy: () => {
      cancelAnimationFrame(frameId);
    }
  };
}

/* ─────────────────────────────────────────────────────────
 * PROMPT BAR
 * A composer with real controls: attach, @ data sources,
 * / commands, a model picker, dictation, and send.
 * ───────────────────────────────────────────────────────── */

const GLYPHS: Record<string, React.ReactNode> = {
  clip: <Paperclip className="w-3.5 h-3.5" />,
  chart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  layers: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  globe: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const BRANDS: Record<string, React.ReactNode> = {
  figma: (
    <svg width="11" height="16" viewBox="0 0 38 57" aria-hidden="true">
      <path d="M9.5 57A9.5 9.5 0 0 0 19 47.5V38H9.5a9.5 9.5 0 0 0 0 19z" fill="#0ACF83" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" fill="#A259FF" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" fill="#F24E1E" />
      <path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" fill="#FF7262" />
      <path d="M38 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0z" fill="#1ABCFE" />
    </svg>
  ),
  slack: (
    <svg width="14" height="14" viewBox="0 0 127 127" aria-hidden="true">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A" />
      <path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.3.7 54.4.7 47.1c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0" />
      <path d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V47.1zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33.2z" fill="#2EB67D" />
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E" />
    </svg>
  ),
  gmail: (
    <svg width="14" height="11" viewBox="0 0 256 193" aria-hidden="true">
      <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" fill="#4285F4" />
      <path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" fill="#34A853" />
      <path d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504 58.182 93.14Z" fill="#EA4335" />
      <path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" fill="#FBBC04" />
      <path d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" fill="#C5221F" />
    </svg>
  ),
};

interface Source {
  key: string;
  name: string;
  desc: string;
  glyph?: string;
  brand?: string;
  attach?: boolean;
  connect?: boolean;
}

const SOURCES: Source[] = [
  { key: "attach", name: "Add photos & files", desc: "Upload from your computer", glyph: "clip", attach: true },
  { key: "scoop", name: "Scoop Data", desc: "Sales & churn metrics", glyph: "chart" },
  { key: "flavors", name: "Flavor records", desc: "26 makers, tags, links", glyph: "layers" },
  { key: "web", name: "Web search", desc: "Real-time news and info", glyph: "globe" },
  { key: "figma", name: "Figma", desc: "Design-to-code workflows", brand: "figma" },
  { key: "slack", name: "Slack", desc: "Read and manage Slack", brand: "slack" },
  { key: "gmail", name: "Gmail", desc: "Read and manage Gmail", brand: "gmail", connect: true },
];

const COMMANDS = [
  { key: "compare", name: "/compare", desc: "Flavor vs. last summer" },
  { key: "churn-plan", name: "/churn-plan", desc: "Draft a churn schedule" },
  { key: "restock", name: "/restock", desc: "Build a reorder list" },
  { key: "draft-email", name: "/draft-email", desc: "Write a supplier email" },
  { key: "summarize", name: "/summarize", desc: "Digest the thread so far" },
];

const MODELS = [
  { key: "sprinkles-5", name: "Sprinkles 5", tag: "Flagship" },
  { key: "vanilla-1", name: "Vanilla 1", tag: "Basic" },
  { key: "freezer-burn", name: "Freezer Burn 0.4", tag: "Stale" },
];

const FILES = ["flavor-chart.png", "summer-menu.pdf", "pos-export.csv"];
const DICTATION = "Compare pistachio weekends to last summer";

const AUTO_STEPS = [
  { draft: "", connect: false, model: "vanilla-1", hold: 1100 },
  { draft: "@", active: 0, hold: 900 },
  { draft: "@", active: 1, hold: 620 },
  { draft: "@", active: 4, hold: 620 },
  { draft: "@", active: 6, hold: 700 },
  { draft: "@", active: 6, connect: true, hold: 1000 },
  { draft: "", hold: 700 },
  { draft: "/", active: 0, hold: 900 },
  { draft: "/", active: 1, hold: 620 },
  { draft: "/", active: 3, hold: 1000 },
  { draft: "", hold: 800 },
  { draft: "", modelOpen: true, hold: 1200 },
  { draft: "", model: "sprinkles-5", hold: 2400 },
  { draft: "", hold: 900 },
];

function parseToken(draft: string): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!match) return null;
  return {
    kind: match[2] === "@" ? "at" : "slash",
    query: match[3].toLowerCase(),
    start: match.index + match[1].length,
  };
}

export function PromptBar({ variant = "Rounded" }: { variant?: string }) {
  const pill = variant === "Pill";
  const [draft, setDraft] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [model, setModel] = useState(MODELS[1]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [auto, setAuto] = useState(true);
  const [autoStep, setAutoStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [modelBox, setModelBox] = useState<{ top: number; height: number } | null>(null);
  const [modelHovered, setModelHovered] = useState<number | null>(null);
  
  const controlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modelRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const glimmRef = useRef<HTMLCanvasElement>(null);
  const shaderRef = useRef<any>(null);

  const takeOver = (event: React.PointerEvent | React.KeyboardEvent) => {
    setAuto(false);
    if (auto && event.target === inputRef.current) setDraft("");
  };

  const token = dismissed ? null : parseToken(draft);
  const menu: "at" | "slash" | null = plusOpen ? "at" : token?.kind ?? null;
  const query = plusOpen ? "" : token?.query ?? "";

  const rows =
    menu === "at"
      ? SOURCES.filter((s) => s.name.toLowerCase().includes(query))
      : menu === "slash"
        ? COMMANDS.filter((c) => c.name.slice(1).startsWith(query))
        : [];

  useEffect(() => {
    setActive(0);
    setEngaged(false);
  }, [menu, query]);

  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (target) setRowBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [menu, query, active, connected, rows.length]);

  const modelIndex = MODELS.findIndex((m) => m.key === model.key);
  useLayoutEffect(() => {
    if (!modelOpen) return;
    const target = modelRowRefs.current[modelHovered ?? modelIndex];
    if (target) setModelBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [modelOpen, modelHovered, modelIndex]);

  useEffect(() => {
    if (!modelOpen) setModelHovered(null);
  }, [modelOpen]);

  useEffect(() => {
    const canvas = glimmRef.current;
    if (canvas) {
      shaderRef.current = createShader(canvas, RAINBOW);
    }
    return () => {
      shaderRef.current?.destroy();
    };
  }, []);

  const celebrate = () => {
    shaderRef.current?.startSweep();
  };

  const selectModel = (next: (typeof MODELS)[number]) => {
    setModel(next);
    setModelOpen(false);
    if (next.key === "sprinkles-5") celebrate();
  };

  useEffect(() => {
    if (!auto) return;
    const step = AUTO_STEPS[autoStep % AUTO_STEPS.length];
    setDraft(step.draft);
    if (step.active !== undefined) setActive(step.active);
    if (step.connect !== undefined) setConnected(step.connect);
    if (step.modelOpen !== undefined) setModelOpen(step.modelOpen);
    if (step.model) {
      const next = MODELS.find((m) => m.key === step.model);
      if (next) selectModel(next);
    }
    const t = setTimeout(() => setAutoStep((s) => s + 1), step.hold);
    return () => clearTimeout(t);
  }, [auto, autoStep]);

  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setDraft((current) => (current ? `${current.trimEnd()} ${DICTATION}` : DICTATION));
      setListening(false);
      inputRef.current?.focus();
    }, 2200);
    return () => clearTimeout(t);
  }, [listening]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const controls = controlsRef.current;
    const measure = measureRef.current;
    const modelButton = modelRef.current;
    if (!input || !controls || !measure || !modelButton) return;

    const fixedControlsWidth = 28 * 3 + modelButton.offsetWidth;
    const inlineGaps = 4 * 4;
    const inlineInputWidth = controls.clientWidth - fixedControlsWidth - inlineGaps;
    const needsFullWidth = draft.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) {
      setExpanded(needsFullWidth);
    }

    const minHeight = 28;
    const maxHeight = 100;
    input.style.height = "0px";
    const contentHeight = input.scrollHeight;
    input.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    input.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, [draft, expanded]);

  const closeMenus = () => {
    setPlusOpen(false);
    setModelOpen(false);
  };

  const pick = (row: { key: string; name: string }) => {
    const source = SOURCES.find((s) => s.key === row.key);
    if (source?.attach) {
      setAttachments((current) => [...current, FILES[current.length % FILES.length]]);
      if (token) setDraft(draft.slice(0, token.start));
    } else if (menu === "at") {
      setDraft(`${token ? draft.slice(0, token.start) : draft}@${row.name} `);
    } else {
      setDraft(`${token ? draft.slice(0, token.start) : draft}${row.name} `);
    }
    setPlusOpen(false);
    setDismissed(false);
    inputRef.current?.focus();
  };

  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const send = () => {
    if (!canSend) return;
    setDraft("");
    setAttachments([]);
    closeMenus();
  };

  return (
    <div
      className="flex min-h-[340px] w-full max-w-lg flex-col justify-end pb-4"
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <div className="relative">
        {/* At / Slash menu */}
        {menu && (
          <div
            onMouseLeave={() => setEngaged(false)}
            className="absolute inset-x-0 bottom-full z-10 mb-2 rounded-xl bg-neutral-900 border border-white/[0.06] p-1 shadow-2xl animate-[pop-in_180ms_cubic-bezier(0.23,1,0.32,1)_both]"
            style={{ transformOrigin: "bottom center" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 rounded-lg bg-white/[0.04]"
              style={{
                top: rowBox?.top ?? 0,
                height: rowBox?.height ?? 0,
                opacity: rowBox && engaged && rows.length > 0 ? 1 : 0,
                transition: "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
              }}
            />
            {rows.map((row, i) => {
              const source = menu === "at" ? SOURCES.find((s) => s.key === row.key) : undefined;
              return (
                <button
                  key={row.key}
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    setActive(i);
                    setEngaged(true);
                  }}
                  onClick={() => pick(row)}
                  className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-100"
                >
                  {source && (
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center text-white/50">
                      {source.brand ? BRANDS[source.brand] : GLYPHS[source.glyph ?? "clip"]}
                    </span>
                  )}
                  <span className="shrink-0 text-[12.5px] font-semibold text-white/90">
                    {row.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-white/40">{row.desc}</span>
                  {source?.connect && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(event) => {
                        event.stopPropagation();
                        setConnected(!connected);
                      }}
                      className={`shrink-0 text-[12px] font-semibold transition-colors duration-100 ${
                        connected ? "text-emerald-400" : "text-purple-400 hover:underline"
                      }`}
                    >
                      {connected ? "Connected" : "Connect"}
                    </span>
                  )}
                </button>
              );
            })}
            {rows.length === 0 && (
              <div className="flex h-9 items-center px-3 text-[12px] text-white/40">
                No matches for "{query}"
              </div>
            )}
            <div className="mt-1 border-t border-white/[0.04] px-3 pt-1.5 pb-1 text-[10.5px] text-white/40 font-medium">
              {menu === "at" ? "Type to search sources & files" : "Type to search commands"}
            </div>
          </div>
        )}

        {/* Model picker menu */}
        {modelOpen && (
          <div
            onMouseLeave={() => setModelHovered(null)}
            className="absolute right-0 bottom-full z-10 mb-2 w-44 rounded-xl bg-neutral-900 border border-white/[0.06] p-1 shadow-2xl animate-[pop-in_180ms_cubic-bezier(0.23,1,0.32,1)_both]"
            style={{ transformOrigin: "bottom right" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 rounded-lg bg-white/[0.04]"
              style={{
                top: modelBox?.top ?? 0,
                height: modelBox?.height ?? 0,
                opacity: modelBox && modelHovered !== null ? 1 : 0,
                transition: "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
              }}
            />
            {MODELS.map((m, i) => (
              <button
                key={m.key}
                type="button"
                ref={(el) => {
                  modelRowRefs.current[i] = el;
                }}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setModelHovered(i)}
                onClick={() => {
                  selectModel(m);
                  inputRef.current?.focus();
                }}
                className="relative z-10 flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left"
              >
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-white/80">{m.name}</span>
                <span className="shrink-0 text-[10px] font-bold text-white/30 uppercase tracking-wider">{m.tag}</span>
                <span className={`shrink-0 text-emerald-400 ${m.key === model.key ? "" : "invisible"}`}>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Composer container */}
        <div
          className={`relative isolate flex flex-col gap-1.5 overflow-hidden border border-white/[0.08] bg-white/[0.01] p-2 shadow-xl backdrop-blur-md transition-all duration-150 focus-within:border-white/[0.12] ${
            pill ? (attachments.length > 0 || expanded ? "rounded-[24px]" : "rounded-full") : "rounded-2xl"
          }`}
        >
          <canvas
            ref={glimmRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-60"
            style={{ borderRadius: "inherit" }}
          />
          <span
            ref={measureRef}
            aria-hidden="true"
            className="pointer-events-none absolute invisible whitespace-pre text-[13px] leading-[18px]"
          >
            {draft}
          </span>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 pt-0.5 ${pill ? "px-2" : "px-1"}`}>
              {attachments.map((file, i) => (
                <span
                  key={`${file}-${i}`}
                  className={`flex h-7 items-center gap-1.5 bg-white/[0.04] border border-white/[0.04] py-1 pr-1.5 pl-2 text-[11.5px] text-white/70 shadow-sm ${
                    pill ? "rounded-full" : "rounded-lg"
                  }`}
                  style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
                >
                  <Paperclip className="w-3 h-3 text-white/40" />
                  <span className="max-w-[120px] truncate font-medium">{file}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file}`}
                    onClick={() => setAttachments((current) => current.filter((_, j) => j !== i))}
                    className={`flex h-5 w-5 items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white transition-colors ${
                      pill ? "rounded-full" : "rounded"
                    }`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Inner Grid */}
          <div
            ref={controlsRef}
            className={`grid items-end gap-x-1.5 gap-y-2 ${
              expanded
                ? "grid-cols-[minmax(0,1fr)_auto_28px_28px]"
                : "grid-cols-[28px_minmax(0,1fr)_auto_28px_28px]"
            }`}
          >
            {/* Plus button */}
            <button
              type="button"
              aria-label="Add attachments and sources"
              aria-expanded={plusOpen}
              onClick={() => {
                setModelOpen(false);
                setPlusOpen(!plusOpen);
                inputRef.current?.focus();
              }}
              className={`flex h-7 w-7 shrink-0 items-center justify-center justify-self-start text-white/40 transition-all hover:bg-white/[0.04] hover:text-white active:scale-95 ${
                pill ? "rounded-full" : "rounded-lg"
              } ${plusOpen ? "bg-white/[0.04] text-white" : ""} ${expanded ? "col-start-1 row-start-2" : "col-start-1 row-start-1"}`}
            >
              <ArrowUp className="w-4 h-4 rotate-45" />
            </button>

            {/* Input Textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setDismissed(false);
                setPlusOpen(false);
              }}
              onKeyDown={(event) => {
                if (menu && rows.length > 0) {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setEngaged(true);
                    setActive((current) => (current + (event.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length);
                    return;
                  }
                  if ((event.key === "Enter" && !event.shiftKey) || event.key === "Tab") {
                    event.preventDefault();
                    pick(rows[active]);
                    return;
                  }
                }
                if (event.key === "Escape") {
                  setDismissed(true);
                  closeMenus();
                  return;
                }
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder={listening ? "Listening…" : "Message Multi..."}
              aria-label="Prompt"
              className={`min-h-[28px] min-w-0 w-full resize-none bg-transparent px-1 py-1 text-[13px] leading-[18px] text-white/90 outline-none placeholder:text-white/30 ${
                expanded ? "col-span-full col-start-1 row-start-1" : "col-start-2 row-start-1"
              }`}
            />

            {/* Model picker button */}
            <button
              ref={modelRef}
              type="button"
              aria-expanded={modelOpen}
              aria-label="Choose model"
              onClick={() => {
                setPlusOpen(false);
                setModelOpen(!modelOpen);
              }}
              className={`flex h-7 shrink-0 items-center gap-1.5 px-2.5 text-[11.5px] font-semibold text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white ${
                pill ? "rounded-full" : "rounded-lg"
              } ${expanded ? "col-start-2 row-start-2" : "col-start-3 row-start-1"}`}
            >
              {model.name}
              <ChevronDown className="w-3.5 h-3.5 text-white/30" />
            </button>

            {/* Dictation dictating bar */}
            <button
              type="button"
              aria-label={listening ? "Stop dictation" : "Start dictation"}
              aria-pressed={listening}
              onClick={() => setListening(!listening)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center transition-all active:scale-95 ${
                pill ? "rounded-full" : "rounded-lg"
              } ${listening ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-white/40 hover:bg-white/[0.04] hover:text-white"} ${
                expanded ? "col-start-3 row-start-2" : "col-start-4 row-start-1"
              }`}
            >
              {listening ? (
                <span className="flex h-3.5 items-center gap-[2px]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-[2px] rounded-full bg-current"
                      style={{ height: "100%", animation: `eq-bounce 900ms ease-in-out ${i * 150}ms infinite` }}
                    />
                  ))}
                </span>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Send button */}
            <button
              type="button"
              aria-label="Send"
              disabled={!canSend}
              onClick={send}
              className={`flex h-7 w-7 shrink-0 items-center justify-center transition-all enabled:active:scale-95 ${
                pill ? "rounded-full" : "rounded-lg"
              } ${expanded ? "col-start-4 row-start-2" : "col-start-5 row-start-1"}`}
              style={{
                backgroundColor: canSend ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.05)",
                color: canSend ? "#000" : "rgba(255, 255, 255, 0.3)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes eq-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default PromptBar;
