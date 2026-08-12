'use client';

import React, { useState, useRef, useEffect } from 'react';
import { runCodeGen, type CodeGenResponse } from '@/lib/api';
import {
  Code2, Copy, Check, Loader2, Zap, ChevronDown,
  Play, RotateCcw, Thermometer,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   LANGUAGE CATALOGUE
════════════════════════════════════════════════════════ */
const LANGUAGES = [
  { label: 'Python',      value: 'Python',      color: '#3b82f6', ext: 'py'  },
  { label: 'JavaScript',  value: 'JavaScript',  color: '#facc15', ext: 'js'  },
  { label: 'TypeScript',  value: 'TypeScript',  color: '#60a5fa', ext: 'ts'  },
  { label: 'Java',        value: 'Java',        color: '#f97316', ext: 'java'},
  { label: 'C',           value: 'C',           color: '#6366f1', ext: 'c'   },
  { label: 'C++',         value: 'C++',         color: '#8b5cf6', ext: 'cpp' },
  { label: 'C#',          value: 'C#',          color: '#a855f7', ext: 'cs'  },
  { label: 'Go',          value: 'Go',          color: '#06b6d4', ext: 'go'  },
  { label: 'Rust',        value: 'Rust',        color: '#f97316', ext: 'rs'  },
  { label: 'Swift',       value: 'Swift',       color: '#f43f5e', ext: 'swift'},
  { label: 'Kotlin',      value: 'Kotlin',      color: '#a78bfa', ext: 'kt'  },
  { label: 'Ruby',        value: 'Ruby',        color: '#ef4444', ext: 'rb'  },
  { label: 'PHP',         value: 'PHP',         color: '#818cf8', ext: 'php' },
  { label: 'Scala',       value: 'Scala',       color: '#dc2626', ext: 'scala'},
  { label: 'R',           value: 'R',           color: '#2563eb', ext: 'r'   },
  { label: 'Dart',        value: 'Dart',        color: '#0ea5e9', ext: 'dart'},
  { label: 'Bash',        value: 'Bash',        color: '#22c55e', ext: 'sh'  },
  { label: 'PowerShell',  value: 'PowerShell',  color: '#3b82f6', ext: 'ps1' },
  { label: 'SQL',         value: 'SQL',         color: '#f59e0b', ext: 'sql' },
  { label: 'PostgreSQL',  value: 'PostgreSQL',  color: '#60a5fa', ext: 'sql' },
  { label: 'MySQL',       value: 'MySQL',       color: '#f97316', ext: 'sql' },
  { label: 'HTML',        value: 'HTML',        color: '#fb923c', ext: 'html'},
  { label: 'CSS',         value: 'CSS',         color: '#38bdf8', ext: 'css' },
  { label: 'SCSS',        value: 'SCSS',        color: '#ec4899', ext: 'scss'},
  { label: 'React (JSX)', value: 'React',       color: '#06b6d4', ext: 'jsx' },
  { label: 'Vue',         value: 'Vue',         color: '#22c55e', ext: 'vue' },
  { label: 'YAML',        value: 'YAML',        color: '#a3a3a3', ext: 'yaml'},
  { label: 'Dockerfile',  value: 'Dockerfile',  color: '#0ea5e9', ext: ''    },
  { label: 'Terraform',   value: 'Terraform',   color: '#818cf8', ext: 'tf'  },
  { label: 'GraphQL',     value: 'GraphQL',     color: '#e879f9', ext: 'gql' },
];

/* ════════════════════════════════════════════════════════
   EXAMPLE PROMPTS
════════════════════════════════════════════════════════ */
const EXAMPLES = [
  { language: 'Python',     description: 'Binary search algorithm with step-by-step comments' },
  { language: 'TypeScript', description: 'Generic fetch wrapper with retry logic, timeout, and typed responses' },
  { language: 'SQL',        description: 'Find the top 5 customers by total revenue in the last 30 days' },
  { language: 'Go',         description: 'Concurrent HTTP server with rate limiting middleware' },
  { language: 'Rust',       description: 'Fibonacci sequence using memoization with HashMap' },
  { language: 'Bash',       description: 'Script to back up a directory with timestamp and log output' },
  { language: 'React',      description: 'Accessible modal component with focus trap and keyboard navigation' },
];

/* ════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════ */
export default function CodeGenWorkspace() {
  const [language, setLanguage] = useState('Python');
  const [description, setDescription] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [result, setResult] = useState<CodeGenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find(l => l.value === language) ?? LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px`; }
  }, [description]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await runCodeGen({ description: description.trim(), language, temperature });
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? 'Code generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setLanguage(ex.language);
    setDescription(ex.description);
    setCharCount(ex.description.length);
    setResult(null);
  };

  const handleReset = () => {
    setDescription('');
    setResult(null);
    setError('');
    setCharCount(0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full px-2 pb-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${selectedLang.color}33, ${selectedLang.color}66)`, border: `1px solid ${selectedLang.color}44` }}
        >
          <Code2 className="w-5 h-5" style={{ color: selectedLang.color }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Code Generator</h2>
          <p className="text-xs text-[var(--text-secondary)]">Generate production-ready code in any language</p>
        </div>
      </div>

      {/* ── Examples ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => {
          const lang = LANGUAGES.find(l => l.value === ex.language);
          return (
            <button
              key={ex.description}
              onClick={() => loadExample(ex)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lang?.color }} />
              <span className="font-medium">{ex.language}</span>
              <span className="opacity-60 truncate max-w-[120px]">{ex.description.split(' ').slice(0, 4).join(' ')}…</span>
            </button>
          );
        })}
      </div>

      {/* ── Input Panel ────────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">

        {/* Language selector + temperature row */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button
              id="lang-selector"
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-all text-sm font-medium"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: selectedLang.color }} />
              <span style={{ color: selectedLang.color }}>{selectedLang.label}</span>
              {selectedLang.ext && (
                <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-60">.{selectedLang.ext}</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-52 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-1">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => { setLanguage(lang.value); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${lang.value === language ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'}`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lang.color }} />
                      <span className="text-[var(--text-primary)] font-medium">{lang.label}</span>
                      {lang.ext && <span className="ml-auto text-[10px] font-mono text-[var(--text-secondary)] opacity-50">.{lang.ext}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2 ml-auto">
            <Thermometer className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-secondary)] w-8">{temperature.toFixed(1)}</span>
            <input
              type="range" min={0} max={1} step={0.1}
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              className="w-24 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Description textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="code-description"
            value={description}
            onChange={e => { setDescription(e.target.value); setCharCount(e.target.value.length); }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
            placeholder={`Describe what you want to build in ${selectedLang.label}…\n\nExample: "A recursive binary search function with detailed comments"`}
            rows={4}
            className="w-full resize-none rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all leading-relaxed"
            style={{ minHeight: '100px', maxHeight: '240px', overflowY: 'auto' }}
          />
          <div className="absolute bottom-2 right-3 text-[10px] text-[var(--text-secondary)] opacity-40 pointer-events-none">
            {charCount > 0 ? `${charCount} chars · ⌘↵ to generate` : '⌘↵ to generate'}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="generate-code-btn"
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Play className="w-4 h-4" /> Generate Code</>
            )}
          </button>

          {(result || description) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          {result && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[var(--text-secondary)] opacity-70">
              <Zap className="w-3 h-3" />
              {(result.latency_ms / 1000).toFixed(2)}s
            </span>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* ── Output Panel ───────────────────────────────────────── */}
      {result && (
        <div
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm"
          style={{ borderTop: `2px solid ${selectedLang.color}66` }}
        >
          {/* Output header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: selectedLang.color }} />
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {result.language}
                {selectedLang.ext ? ` · .${selectedLang.ext}` : ''}
              </span>
            </div>
            <button
              id="copy-code-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          {/* Code block */}
          <div className="overflow-x-auto">
            <pre className="p-5 text-sm leading-relaxed text-[var(--text-primary)] font-mono whitespace-pre">
              <code>{result.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────── */}
      {loading && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-subtle)]">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs text-[var(--text-secondary)]">
              Generating {language} code…
            </span>
          </div>
          <div className="p-5 space-y-2.5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded-md bg-[var(--bg-hover)] animate-pulse"
                style={{ width: `${[90, 75, 85, 60, 80, 55, 70, 45][i]}%`, animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
