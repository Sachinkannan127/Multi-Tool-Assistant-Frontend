import React, { useState } from 'react';
import { ShieldAlert, Check, X, Loader2 } from 'lucide-react';

interface ToolApprovalCardProps {
  approvalId: string;
  toolName: string;
  emoji?: string;
  input: string;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string) => Promise<void> | void;
}

export function ToolApprovalCard({
  approvalId,
  toolName,
  emoji = '⚙️',
  input,
  onApprove,
  onReject,
}: ToolApprovalCardProps) {
  const [status, setStatus] = useState<'pending' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setStatus('approving');
    setError(null);
    try {
      await onApprove(approvalId);
      setStatus('approved');
    } catch (e: any) {
      setError(e.message || 'Approval failed');
      setStatus('pending');
    }
  };

  const handleReject = async () => {
    setStatus('rejecting');
    setError(null);
    try {
      await onReject(approvalId);
      setStatus('rejected');
    } catch (e: any) {
      setError(e.message || 'Rejection failed');
      setStatus('pending');
    }
  };

  return (
    <div className="w-full max-w-md my-4 animate-fade-slide-up">
      <div className="border border-amber-500/20 bg-amber-500/[0.02] rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/25">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Tool Approval Request
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
          <span>{emoji}</span>
          <span>Execute {toolName}?</span>
        </h4>

        {/* Input Details */}
        <div className="bg-black/25 border border-white/[0.04] rounded-xl p-3 mb-4">
          <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-1">Arguments:</div>
          <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap break-all leading-normal max-h-24 overflow-y-auto">
            {input || '{}'}
          </pre>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg p-2.5 mb-3 font-medium">
            {error}
          </div>
        )}

        {/* Actions or Status */}
        {status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/[0.06] bg-white/[0.01] hover:bg-red-500/10 hover:border-red-500/25 rounded-xl text-xs text-[var(--text-secondary)] hover:text-red-400 font-semibold transition-all select-none"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/10 transition-all select-none hover:-translate-y-px"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
          </div>
        )}

        {(status === 'approving' || status === 'rejecting') && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--text-secondary)] font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>{status === 'approving' ? 'Submitting approval...' : 'Submitting rejection...'}</span>
          </div>
        )}

        {status === 'approved' && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-400 font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Action approved. Executing tool...</span>
          </div>
        )}

        {status === 'rejected' && (
          <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-semibold">
            <X className="w-4 h-4 shrink-0" />
            <span>Action rejected by user.</span>
          </div>
        )}
      </div>
    </div>
  );
}
