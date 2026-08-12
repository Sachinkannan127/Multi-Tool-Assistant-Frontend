"use client";

import React, { useEffect, useState } from "react";
import { Copy, RotateCw, ThumbsUp, ThumbsDown, Link, CornerDownLeft } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * STREAMING TEXT
 * Words resolve out of blur, inline citations appear in
 * context, then actions and follow-up prompts become usable.
 * ───────────────────────────────────────────────────────── */

interface Source {
  name: string;
  domain: string;
  href: string;
  image: string;
}

interface AiStreamingTextProps {
  content: string;
  isStreaming?: boolean;
  sources?: Source[];
  followUps?: string[];
  onFollowUpClick?: (text: string) => void;
}

const SOURCE_IMAGES = {
  scoop:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%231f7a5f'/%3E%3Cpath d='M20 36c0 7 5.4 12 12 12s12-5 12-12H20Z' fill='%23fff'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23bff3dd'/%3E%3Cpath d='M24 24c4-7 13-7 17 0' fill='none' stroke='%231f7a5f' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E",
  trends:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%232f6fec'/%3E%3Cpath d='M15 43 27 31l8 7 14-18' fill='none' stroke='%23fff' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='49' cy='20' r='5' fill='%23bfe0ff'/%3E%3C/svg%3E",
  market:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23e56d24'/%3E%3Cpath d='M17 45V25h8v20h-8Zm11 0V16h8v29h-8Zm11 0V30h8v15h-8Z' fill='%23fff'/%3E%3Cpath d='M16 49h32' stroke='%23ffd6b8' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E",
};

const DEFAULT_SOURCES: Source[] = [
  { name: "Scoop Data", domain: "scoopdata.io", href: "https://scoopdata.io/", image: SOURCE_IMAGES.scoop },
  { name: "Trends Index", domain: "trends.google.com", href: "https://trends.google.com/trends/", image: SOURCE_IMAGES.trends },
  { name: "Market Basket", domain: "marketbasket.io", href: "https://marketbasket.io/", image: SOURCE_IMAGES.market },
];

function SourceChip({ source }: { source: Source }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer"
      className="ml-1 mr-1 inline-flex h-5 items-center gap-1 rounded-md bg-white/[0.04] pr-1.5 pl-1 align-middle font-mono text-[10px] text-white/50 border border-white/[0.04] transition-all hover:bg-white/[0.08] hover:text-white"
      style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <img src={source.image} alt="" className="w-3.5 h-3.5 rounded" />
      <span>{source.domain}</span>
    </a>
  );
}

export function AiStreamingText({
  content,
  isStreaming = false,
  sources = DEFAULT_SOURCES,
  followUps = [],
  onFollowUpClick,
}: AiStreamingTextProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const done = !isStreaming;

  // Split content by spaces to apply the word resolving transition
  const words = content.split(" ");

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Streaming Words */}
      <div className="text-[14px] leading-relaxed text-white/90">
        {words.map((word, i) => {
          // Check if this word indicates a citation placeholder (e.g. "[cite1]" or similar)
          const isCitation = word.match(/^\[cite\d+\]$/);
          if (isCitation) {
            const citeIndex = parseInt(word.replace(/\D/g, "")) - 1;
            const source = sources[citeIndex % sources.length];
            return <SourceChip key={i} source={source} />;
          }

          return (
            <span
              key={i}
              className="inline-block [will-change:filter,opacity] mr-1 animate-[stream-in_300ms_cubic-bezier(0.22,0.61,0.25,1)_both]"
              style={{
                animationDelay: `${Math.min(i * 10, 300)}ms`,
              }}
            >
              {word}
            </span>
          );
        })}
        {isStreaming && (
          <span className="inline-block w-[3px] h-[14px] bg-blue-400 opacity-80 animate-[typing-blink_1s_ease-in-out_infinite] ml-0.5 align-middle rounded-full" />
        )}
      </div>

      {/* Action icons row + sources toggle */}
      {done && (
        <div className="flex items-center gap-1.5 opacity-0 animate-[fade-in_350ms_ease-out_both] mt-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
            title="Copy response"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
            title="Good response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
            title="Bad response"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {sources.length > 0 && (
            <button
              type="button"
              aria-expanded={sourcesOpen}
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-left bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
            >
              <span className="flex -space-x-1">
                {sources.slice(0, 3).map((source, i) => (
                  <img
                    key={i}
                    src={source.image}
                    alt=""
                    className="w-3.5 h-3.5 rounded-full border border-black"
                  />
                ))}
              </span>
              <span className="text-[11px] text-white/50">{sources.length} sources</span>
            </button>
          )}
        </div>
      )}

      {/* Sources list */}
      {done && sources.length > 0 && (
        <div
          className="grid transition-[grid-template-rows,opacity] duration-300 overflow-hidden"
          style={{
            gridTemplateRows: sourcesOpen ? "1fr" : "0fr",
            opacity: sourcesOpen ? 1 : 0,
          }}
        >
          <div className="min-h-0 bg-white/[0.01] border border-white/[0.04] rounded-xl p-1.5 flex flex-col gap-0.5 mt-1">
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] text-white/60 hover:bg-white/[0.03] hover:text-white transition-colors"
              >
                <img src={source.image} alt="" className="w-4 h-4 rounded" />
                <span className="font-medium">{source.name}</span>
                <span className="ml-auto font-mono text-[10px] text-white/35">{source.domain}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {done && followUps.length > 0 && (
        <div className="flex flex-col gap-1 mt-2.5 opacity-0 animate-[fade-in_400ms_ease-out_150ms_both]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-1">Follow-ups</p>
          <div className="flex flex-col gap-0.5">
            {followUps.map((text, i) => (
              <button
                key={i}
                onClick={() => onFollowUpClick?.(text)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-white/70 hover:bg-white/[0.03] hover:text-white transition-colors group"
              >
                <CornerDownLeft className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                <span>{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes stream-in {
          0% { filter: blur(3px); opacity: 0; transform: translateY(1px); }
          100% { filter: blur(0); opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AiStreamingText;
