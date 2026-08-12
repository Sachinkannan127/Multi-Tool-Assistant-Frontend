"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * CODE BLOCK
 * Agent-written code streams line by line; copy is live.
 * Supports rendering custom code dynamically.
 * ───────────────────────────────────────────────────────── */

interface CodeLineToken {
  t: string;
  c?: "kw" | "str" | "num" | "fn" | "dim";
}

interface CodeBlockProps {
  filename?: string;
  language?: string;
  lines?: CodeLineToken[][];
  rawCode?: string;
  holdMs?: number;
  lineMs?: number;
}

const COLORS: Record<string, string> = {
  kw: "#a855f7", // Purple keyword
  str: "#22c55e", // Green string
  num: "#eab308", // Yellow number
  fn: "#3b82f6", // Blue function
  dim: "rgba(255,255,255,0.4)", // Muted dim text
};

// Simple helper to tokenize a line of code for basic syntax highlighting
function tokenizeLine(line: string): CodeLineToken[] {
  const tokens: CodeLineToken[] = [];
  // Match keywords, strings, numbers, etc.
  const regex = /(await|async|export|function|const|let|var|return|if|else|for|while)|("[^"]*"|'[^']*')|(\b\d+\b)|(\b\w+\b(?=\())|([{}()\[\];.,])/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ t: line.substring(lastIndex, match.index) });
    }

    if (match[1]) {
      tokens.push({ t: match[1], c: "kw" });
    } else if (match[2]) {
      tokens.push({ t: match[2], c: "str" });
    } else if (match[3]) {
      tokens.push({ t: match[3], c: "num" });
    } else if (match[4]) {
      tokens.push({ t: match[4], c: "fn" });
    } else if (match[5]) {
      tokens.push({ t: match[5], c: "dim" });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ t: line.substring(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ t: line }];
}

export function CodeBlock({
  filename = "churn.ts",
  language = "TypeScript",
  lines,
  rawCode = "",
  holdMs = 3200,
  lineMs = 120, // faster line rendering for dynamic outputs
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Compute display lines: either custom tokens, tokenized rawCode, or fallback
  const displayLines = React.useMemo(() => {
    if (lines) return lines;
    if (rawCode) {
      return rawCode.split("\n").map(tokenizeLine);
    }
    return [
      [{ t: "export async function ", c: "kw" }, { t: "churnBatch", c: "fn" }, { t: "() {", c: "dim" }],
      [{ t: "  const ", c: "kw" }, { t: "flavor = " }, { t: "await ", c: "kw" }, { t: "getFlavor", c: "fn" }, { t: "(", c: "dim" }, { t: "\"pistachio\"", c: "str" }, { t: ");", c: "dim" }],
      [{ t: "  const ", c: "kw" }, { t: "base = " }, { t: "await ", c: "kw" }, { t: "dairy." }, { t: "fetch", c: "fn" }, { t: "({ flavor });", c: "dim" }],
      [{ t: "  await ", c: "kw" }, { t: "freezer." }, { t: "store", c: "fn" }, { t: "(base, { temp: ", c: "dim" }, { t: "\"-14C\"", c: "str" }, { t: " });", c: "dim" }],
      [{ t: "  return ", c: "kw" }, { t: "base.gallons;" }],
      [{ t: "}", c: "dim" }],
    ];
  }, [lines, rawCode]);

  const [count, setCount] = useState(0);
  const done = count >= displayLines.length;

  useEffect(() => {
    // Reset count if lines change (e.g. streaming content grows)
    setCount(c => Math.min(c, displayLines.length));
  }, [displayLines.length]);

  useEffect(() => {
    const t = setTimeout(
      () => setCount((c) => (c >= displayLines.length ? c : c + 1)),
      count === 0 ? 200 : done ? holdMs : lineMs,
    );
    return () => clearTimeout(t);
  }, [count, done, displayLines.length, holdMs, lineMs]);

  const copy = useCallback(() => {
    const textToCopy = rawCode || displayLines.map(line => line.map(tok => tok.t).join("")).join("\n");
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [rawCode, displayLines]);

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white/[0.01] border border-white/[0.04] shadow-xl backdrop-blur-md my-4">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
        <span className="flex items-baseline gap-2.5">
          <span className="font-mono text-[12px] font-semibold text-white/90">{filename}</span>
          <span className="text-[11px] text-white/35 font-medium">{language}</span>
        </span>
        <button
          aria-label="Copy code"
          onClick={copy}
          className={`flex h-6 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-colors hover:bg-white/[0.04] ${
            copied ? "text-emerald-400" : "text-white/40 hover:text-white/80"
          }`}
        >
          {copied ? (
            <Check className="w-3 h-3 stroke-[3]" />
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* code */}
      <pre className="min-h-[137px] bg-black/25 px-4 py-3 font-mono text-[11.5px] leading-relaxed overflow-x-auto">
        {displayLines.slice(0, count).map((line, i) => (
          <div
            key={i}
            className="flex"
            style={{ animation: "fade-up 250ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <span className="w-5 shrink-0 text-right text-[10.5px] leading-relaxed text-white/20 select-none pr-1">
              {i + 1}
            </span>
            <span className="pl-3.5 whitespace-pre">
              {line.map((tok, j) => (
                <span key={j} style={{ color: tok.c ? COLORS[tok.c] : "rgba(255,255,255,0.7)" }}>
                  {tok.t}
                </span>
              ))}
              {i === count - 1 && !done && (
                <span className="ml-0.5 inline-block h-3 w-[3px] translate-y-0.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </span>
          </div>
        ))}
      </pre>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default CodeBlock;
