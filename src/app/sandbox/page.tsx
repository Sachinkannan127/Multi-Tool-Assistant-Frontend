'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, ShieldCheck, Sparkles, Cpu, Send, Layers } from 'lucide-react';
import { AiLoadingState } from '../../components/native-ui/AiLoadingState';
import { AiThinking } from '../../components/native-ui/AiThinking';
import { ToolApprovalCard } from '../../components/native-ui/ToolApprovalCard';
import { ToolChip } from '../../components/native-ui/ToolChip';

type SimulatorState = 'idle' | 'loading' | 'thinking' | 'approval' | 'executing' | 'completed_tool' | 'streaming' | 'done';

const MOCK_THOUGHTS = [
  "Understanding query: 'Find the current stock price of Apple and calculate 15% growth prediction.'\n",
  "Detected multiple steps:\n  1. Fetch stock price for APPL via web_search.\n  2. Perform math calculation for growth projection.\n",
  "Executing step 1: Querying web_search tool with arguments: {'query': 'AAPL current stock price'}.\n",
  "Waiting for required human-in-the-loop permission to execute web_search...",
];

const MOCK_STREAMING_TEXT = `Based on the latest financial market data, Apple Inc. (AAPL) is currently trading at **$187.32** per share.

To project a **15% growth rate**, we compute:
$$\\$187.32 \\times 1.15 = \\$215.42$$

Here is the projected breakdown:
* **Current Price:** $187.32
* **Target Price (15% growth):** $215.42
* **Net Increase:** +$28.10

This estimate assumes typical market conditions and does not account for unforeseen macroeconomic updates. Let me know if you would like to run any other financial projection scenarios!`;

export default function SandboxPage() {
  // State for the interactive simulator
  const [simState, setSimState] = useState<SimulatorState>('idle');
  const [thoughtText, setThoughtText] = useState('');
  const [streamedText, setStreamedText] = useState('');
  
  // States for standalone demos
  const [isStandaloneThinking, setIsStandaloneThinking] = useState(true);
  const [standaloneThought, setStandaloneThought] = useState("Researching Rust compiler options...\nChecking optimized flags...\nFinalizing command invocation.");
  const [standaloneApprovalStatus, setStandaloneApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Timers for simulator
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Run the full AI workflow simulator
  const startSimulator = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSimState('loading');
    setThoughtText('');
    setStreamedText('');
    
    // Phase 1: Loading -> Thinking
    timerRef.current = setTimeout(() => {
      setSimState('thinking');
      streamThoughts(0);
    }, 1800);
  };

  const streamThoughts = (index: number) => {
    if (index < MOCK_THOUGHTS.length) {
      setThoughtText(prev => prev + MOCK_THOUGHTS[index]);
      timerRef.current = setTimeout(() => {
        streamThoughts(index + 1);
      }, 1500);
    } else {
      // Transition to Approval Card
      setSimState('approval');
    }
  };

  const handleApprovalApprove = async (id: string) => {
    setSimState('executing');
    
    // Simulate execution running
    timerRef.current = setTimeout(() => {
      setSimState('completed_tool');
      
      // Post-tool execution thinking/streaming
      timerRef.current = setTimeout(() => {
        setSimState('streaming');
        streamTextContent(0);
      }, 1200);
    }, 2000);
  };

  const handleApprovalReject = async (id: string) => {
    setSimState('done');
    setStreamedText('⚠️ Error: Tool execution was rejected by the user. Run aborted.');
  };

  const streamTextContent = (charIndex: number) => {
    if (charIndex <= MOCK_STREAMING_TEXT.length) {
      setStreamedText(MOCK_STREAMING_TEXT.substring(0, charIndex));
      
      // Variable speed for realism
      const delay = MOCK_STREAMING_TEXT[charIndex] === '\n' ? 120 : Math.random() * 20 + 10;
      timerRef.current = setTimeout(() => {
        streamTextContent(charIndex + 1);
      }, delay);
    } else {
      setSimState('done');
    }
  };

  const resetSimulator = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSimState('idle');
    setThoughtText('');
    setStreamedText('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="p-2 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-md uppercase">
                  Designer Studio
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">v1.1</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white mt-1">AI Native UI Elements</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/10 transition-all select-none hover:-translate-y-px"
            >
              <Cpu className="w-3.5 h-3.5" />
              Go to Active Chat
            </Link>
          </div>
        </header>

        {/* Two-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: The Interactive Simulator (Simulator Sandbox) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 shadow-xl relative overflow-hidden flex-1 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.04]">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Interactive Workflow Simulator
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Simulate a live multi-tool AI response including thoughts, tools approvals, chips and streaming markdown.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {simState === 'idle' ? (
                    <button
                      onClick={startSimulator}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Run Demo
                    </button>
                  ) : (
                    <button
                      onClick={resetSimulator}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Mock Chat Viewport */}
              <div className="flex-1 flex flex-col bg-black/30 border border-white/[0.03] rounded-2xl overflow-hidden min-h-[460px]">
                
                {/* Viewport Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04] text-[10px] text-[var(--text-muted)] font-mono">
                  <span>MOCK CLIENT STREAMING PORT</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${simState !== 'idle' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="uppercase text-[9px]">{simState}</span>
                  </div>
                </div>

                {/* Viewport Content */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {simState === 'idle' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-secondary)]">
                      <Sparkles className="w-8 h-8 text-white/20 mb-3 animate-pulse" />
                      <h3 className="text-xs font-bold text-white mb-1">Simulator Ready</h3>
                      <p className="text-[11px] text-[var(--text-muted)] max-w-xs leading-normal">
                        Click the "Run Demo" button above to view the high-fidelity streaming interface in action.
                      </p>
                    </div>
                  )}

                  {/* 1. Loading State */}
                  {simState === 'loading' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono">
                        <span>[SSE] CLIENT CONNECTION INITIATED</span>
                      </div>
                      <AiLoadingState />
                    </div>
                  )}

                  {/* 2. Thinking State */}
                  {(simState === 'thinking' || simState === 'approval' || simState === 'executing' || simState === 'completed_tool' || simState === 'streaming' || simState === 'done') && (
                    <AiThinking
                      content={thoughtText}
                      isThinking={simState === 'thinking'}
                      durationMs={simState === 'thinking' ? undefined : 4500}
                    />
                  )}

                  {/* 3. Approval Card State */}
                  {simState === 'approval' && (
                    <ToolApprovalCard
                      approvalId="sim-approval-01"
                      toolName="web_search"
                      emoji="🌐"
                      input={`{\n  "query": "AAPL current stock price"\n}`}
                      onApprove={handleApprovalApprove}
                      onReject={handleApprovalReject}
                    />
                  )}

                  {/* 4. Tool Execution Chip State */}
                  {simState === 'executing' && (
                    <ToolChip
                      toolName="web_search"
                      emoji="🌐"
                      input={`{\n  "query": "AAPL current stock price"\n}`}
                      status="running"
                    />
                  )}

                  {/* 5. Tool Completed Chip State */}
                  {(simState === 'completed_tool' || simState === 'streaming' || simState === 'done') && (
                    <ToolChip
                      toolName="web_search"
                      emoji="🌐"
                      input={`{\n  "query": "AAPL current stock price"\n}`}
                      output={`{\n  "status": "success",\n  "data": {\n    "ticker": "AAPL",\n    "price": 187.32,\n    "currency": "USD",\n    "change": "+1.42%"\n  }\n}`}
                      status={simState === 'done' && streamedText.startsWith('⚠️') ? 'failed' : 'completed'}
                      durationMs={2000}
                    />
                  )}

                  {/* 6. Streaming Markdown Answer */}
                  {(simState === 'streaming' || simState === 'done') && streamedText && (
                    <div className="prose-gemini border-t border-white/[0.04] pt-4 animate-fade-slide-up">
                      <div className="font-semibold text-[10px] tracking-wide text-blue-400 uppercase font-mono mb-2">Final Answer</div>
                      <div className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {streamedText}
                        {simState === 'streaming' && (
                          <span className="inline-block w-1.5 h-3.5 bg-blue-400 opacity-60 animate-pulse ml-1 align-middle" />
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Standalone Interactive Components Playground */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Component 1: AiThinking Container */}
            <div className="border border-white/[0.05] bg-white/[0.01] rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Component: AiThinking</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Interactive</span>
              </h3>
              
              <div className="bg-black/20 p-4 rounded-xl border border-white/[0.02] mb-3">
                <AiThinking
                  content={standaloneThought}
                  isThinking={isStandaloneThinking}
                  durationMs={isStandaloneThinking ? undefined : 3200}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsStandaloneThinking(!isStandaloneThinking)}
                  className="flex-1 py-1.5 border border-white/[0.08] hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-white rounded-lg text-xs font-semibold transition-all select-none"
                >
                  Toggle Thinking Pulse ({isStandaloneThinking ? 'Running' : 'Done'})
                </button>
                <button
                  onClick={() => {
                    setStandaloneThought(prev => prev + "\nExecuting Rust compilation optimizations...");
                  }}
                  className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold transition-all"
                >
                  Add Logs
                </button>
              </div>
            </div>

            {/* Component 2: ToolApprovalCard States */}
            <div className="border border-white/[0.05] bg-white/[0.01] rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Component: ToolApprovalCard</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Live Flow</span>
              </h3>

              <div className="bg-black/20 p-4 rounded-xl border border-white/[0.02] mb-3 flex justify-center">
                {standaloneApprovalStatus === 'pending' && (
                  <ToolApprovalCard
                    approvalId="sandbox-standalone-approve"
                    toolName="execute_python"
                    emoji="🐍"
                    input={`import os\nos.system("rm -rf /") # Safety check demo`}
                    onApprove={() => setStandaloneApprovalStatus('approved')}
                    onReject={() => setStandaloneApprovalStatus('rejected')}
                  />
                )}
                {standaloneApprovalStatus === 'approved' && (
                  <div className="w-full max-w-md p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                    <p className="text-xs text-emerald-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Allowed
                    </p>
                    <button
                      onClick={() => setStandaloneApprovalStatus('pending')}
                      className="px-3 py-1 bg-white/[0.05] hover:bg-white/[0.08] text-white text-[10px] rounded-lg transition-all"
                    >
                      Reset State
                    </button>
                  </div>
                )}
                {standaloneApprovalStatus === 'rejected' && (
                  <div className="w-full max-w-md p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                    <p className="text-xs text-red-400 font-semibold mb-2">Denied Execution</p>
                    <button
                      onClick={() => setStandaloneApprovalStatus('pending')}
                      className="px-3 py-1 bg-white/[0.05] hover:bg-white/[0.08] text-white text-[10px] rounded-lg transition-all"
                    >
                      Reset State
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Component 3: Tool Chips States */}
            <div className="border border-white/[0.05] bg-white/[0.01] rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-white mb-3">
                Component: ToolChip (States Matrix)
              </h3>
              
              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/[0.02]">
                <div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono uppercase mb-1">State: Running</div>
                  <ToolChip
                    toolName="fetch_webpage"
                    emoji="📄"
                    input="url: 'https://react.dev/reference/react'"
                    status="running"
                  />
                </div>

                <div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono uppercase mb-1">State: Completed</div>
                  <ToolChip
                    toolName="fetch_webpage"
                    emoji="📄"
                    input="url: 'https://react.dev/reference/react'"
                    output={`{\n  "title": "React Reference API",\n  "status": 200,\n  "bytes": 45290\n}`}
                    status="completed"
                    durationMs={840}
                  />
                </div>

                <div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono uppercase mb-1">State: Failed</div>
                  <ToolChip
                    toolName="fetch_webpage"
                    emoji="📄"
                    input="url: 'https://non-existent-site.xyz'"
                    output="Error 404: Webpage Domain Not Resolved. Host unreachable."
                    status="failed"
                    durationMs={1200}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
