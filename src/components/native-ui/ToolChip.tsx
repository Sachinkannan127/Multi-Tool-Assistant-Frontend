import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface ToolChipProps {
  toolName: string;
  emoji?: string;
  label?: string;
  input?: string;
  output?: string;
  status: 'running' | 'completed' | 'failed';
  durationMs?: number;
}

export function ToolChip({
  toolName,
  emoji = '⚙️',
  label,
  input,
  output,
  status,
  durationMs,
}: ToolChipProps) {
  const [expanded, setExpanded] = useState(false);

  const displayLabel = label || toolName;

  return (
    <div className="w-fit max-w-full mb-2 animate-fade-slide-up">
      <div className="border border-white/[0.05] bg-white/[0.02] rounded-xl overflow-hidden hover:border-white/[0.08] transition-all">
        {/* Toggle Chip */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-all select-none"
        >
          {status === 'running' && (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          )}
          {status === 'completed' && (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          )}
          {status === 'failed' && (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}

          <span className="font-medium flex items-center gap-1.5">
            <span>{emoji}</span>
            <span>{displayLabel}</span>
          </span>

          {durationMs !== undefined && (
            <span className="text-[9px] text-[var(--text-muted)] font-mono bg-white/[0.04] px-1 rounded">
              {(durationMs / 1000).toFixed(2)}s
            </span>
          )}

          {expanded ? (
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
          )}
        </button>

        {/* Details Area */}
        {expanded && (
          <div className="px-3.5 pb-3.5 pt-1.5 border-t border-white/[0.04] bg-black/10 text-left min-w-[280px] max-w-[500px]">
            {input && (
              <div className="mb-2">
                <div className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wide mb-0.5">Arguments</div>
                <pre className="text-[11px] font-mono text-[var(--text-secondary)] bg-black/20 p-2 rounded-lg border border-white/[0.03] whitespace-pre-wrap break-all max-h-24 overflow-y-auto leading-normal">
                  {input}
                </pre>
              </div>
            )}
            
            {status === 'running' && (
              <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-medium pt-1 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Executing tool logic...
              </div>
            )}

            {output && status === 'completed' && (
              <div>
                <div className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wide mb-0.5">Result</div>
                <pre className="text-[11px] font-mono text-[var(--text-secondary)] bg-emerald-500/[0.02] p-2 rounded-lg border border-emerald-500/10 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-normal">
                  {output}
                </pre>
              </div>
            )}

            {status === 'failed' && (
              <div>
                <div className="text-[9px] text-red-400/80 font-mono uppercase tracking-wide mb-0.5">Error Details</div>
                <pre className="text-[11px] font-mono text-red-300 bg-red-500/[0.02] p-2 rounded-lg border border-red-500/10 whitespace-pre-wrap break-all leading-normal">
                  {output || 'Unknown execution failure.'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
