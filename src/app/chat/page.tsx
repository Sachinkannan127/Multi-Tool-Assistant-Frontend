'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus, Search, Settings2, ChevronLeft, ChevronRight,
  MessageSquare, Zap, Layers, GitCompare, Users, ArrowRight,
  Send, Paperclip, Mic, StopCircle, Volume2, VolumeX,
  Copy, Check, Loader2, Brain, Trash2, X, FileText,
  BarChart2, Globe, Calculator, Sparkles, Bot, User,
  Github, Hash, Linkedin, Box, Mail, ShieldAlert, ShieldCheck
} from 'lucide-react';
import {
  sendMessageStream, uploadFile, getSessions, getSession, deleteSession,
  healthCheck, getSettings, updateSettings, getMemories, deleteMemory,
  compareModels, runPlayground, runCouncil, runRouteTest, runDeepResearchStream,
  approveTool,
  type ChatMessage, type SSEEvent, type SessionInfo, type AppSettings,
  type MemoryItem, type CompareResponse, type PlaygroundResponse, type CouncilResponse,
} from '@/lib/api';
import { cn, formatTime } from '@/lib/utils';
import { AiThinking } from '../../components/native-ui/AiThinking';
import { ToolApprovalCard } from '../../components/native-ui/ToolApprovalCard';
import { ToolChip } from '../../components/native-ui/ToolChip';
import { AiLoadingState } from '../../components/native-ui/AiLoadingState';
import { CodeBlock } from '../../components/native-ui/CodeBlock';

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type Mode = 'chat' | 'compare' | 'playground' | 'autoroute' | 'research';
type ActiveTool = { tool: string; emoji: string; label: string };

/* ═══════════════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<Mode>('chat');
  const [settings, setSettings] = useState<AppSettings>({
    llm_provider: 'google',
    gemini_model: 'gemini-2.5-flash-lite',
    answering_method: 'tool_calling',
    system_prompt: '',
  });
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadSession, setLoadSession] = useState<SessionInfo | null>(null);
  const [chatKey, setChatKey] = useState<string>('new-' + Date.now());

  const refreshSessions = () => {
    getSessions()
      .then(r => setSessions(r.sessions.slice(0, 20)))
      .catch(() => {});
  };

  // Load settings + initial sessions
  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
    healthCheck()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
    refreshSessions();
  }, []);

  const handleSaveSettings = async (s: AppSettings) => {
    await updateSettings(s);
    setSettings(s);
  };

  const handleNewChat = () => {
    setLoadSession(null);
    setActiveSessionId(null);
    setChatKey('new-' + Date.now());
    setMode('chat');
  };

  const handleLoadSession = (s: SessionInfo) => {
    setLoadSession(s);
    setActiveSessionId(s.session_id);
    setChatKey(s.session_id);
    setMode('chat');
  };

  const handleDeleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sid);
      setSessions(prev => prev.filter(s => s.session_id !== sid));
      if (activeSessionId === sid) {
        setLoadSession(null);
        setActiveSessionId(null);
      }
    } catch {}
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        mode={mode}
        onModeChange={setMode}
        onOpenSettings={() => setSettingsOpen(true)}
        backendStatus={backendStatus}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {mode === 'chat' && (
          <ChatView
            key={chatKey}
            settings={settings}
            backendOnline={backendStatus === 'online'}
            initialSession={loadSession}
            onSessionCreated={(sid, title) => {
              setActiveSessionId(sid);
              refreshSessions();
            }}
            onSessionUpdated={refreshSessions}
          />
        )}
        {mode === 'compare' && <CompareView />}
        {mode === 'playground' && <PlaygroundView />}
        {mode === 'autoroute' && <AutoRouteView />}
        {mode === 'research' && <ResearchWorkspace />}
      </main>

      {/* Settings modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
const NAV = [
  { id: 'chat' as Mode,       icon: MessageSquare, label: 'Chat' },
  { id: 'research' as Mode,   icon: Brain,         label: 'Deep Research' },
  { id: 'compare' as Mode,    icon: GitCompare,    label: 'Compare' },
  { id: 'playground' as Mode, icon: Zap,           label: 'Playground' },
  { id: 'autoroute' as Mode,  icon: Layers,        label: 'Auto-route' },
];

function Sidebar({
  open, onToggle, mode, onModeChange, onOpenSettings, backendStatus,
  sessions, activeSessionId, onNewChat, onLoadSession, onDeleteSession,
}: {
  open: boolean;
  onToggle: () => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onOpenSettings: () => void;
  backendStatus: 'online' | 'offline' | 'checking';
  sessions: SessionInfo[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onLoadSession: (s: SessionInfo) => void;
  onDeleteSession: (sid: string, e: React.MouseEvent) => void;
}) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 shrink-0 z-20',
        open ? 'w-64' : 'w-16',
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--border-subtle)] h-14">
        {open && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">multi</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto"
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-blue-300 hover:border-blue-400/40 hover:text-blue-200 transition-all text-sm font-medium',
            !open && 'justify-center',
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {open && <span>New chat</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={cn(
              'sidebar-item',
              mode === id && 'active',
              !open && 'justify-center px-0',
            )}
            title={!open ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {open && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Recent sessions */}
      {open && (
        <div className="flex-1 overflow-y-auto px-2 mt-4 min-h-0">
          {sessions.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold px-3 mb-2">Recent</p>
          )}
          <div className="flex flex-col gap-0.5">
            {sessions.map(s => (
              <div
                key={s.session_id}
                onClick={() => onLoadSession(s)}
                className={cn(
                  'group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-xs',
                  activeSessionId === s.session_id
                    ? 'bg-blue-500/15 border border-blue-500/25 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <span className="truncate flex-1">{s.title || 'Untitled chat'}</span>
                <button
                  onClick={(e) => onDeleteSession(s.session_id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className={cn('mt-auto px-2 pb-4 flex flex-col gap-0.5 border-t border-[var(--border-subtle)] pt-3')}>
        {/* Backend status */}
        <div className={cn('sidebar-item', !open && 'justify-center')}>
          <div className={cn(
            'w-2 h-2 rounded-full shrink-0',
            backendStatus === 'online' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse' :
            backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse',
          )} />
          {open && <span className="text-xs">{backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Offline' : 'Checking…'}</span>}
        </div>
        <button
          onClick={onOpenSettings}
          className={cn('sidebar-item', !open && 'justify-center')}
          title={!open ? 'Settings' : undefined}
        >
          <Settings2 className="w-4 h-4 shrink-0" />
          {open && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT VIEW
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  { icon: '🔍', text: 'What are the latest AI breakthroughs this week?',   desc: 'Web search' },
  { icon: '🧮', text: 'Calculate compound interest: $10,000 at 7% for 5 years', desc: 'Math' },
  { icon: '📄', text: 'Summarize the uploaded PDF document for me',        desc: 'PDF RAG' },
  { icon: '💡', text: 'Explain quantum computing in simple terms',          desc: 'Reasoning' },
];

interface ToolStep {
  id: string;
  tool: string;
  emoji: string;
  label: string;
  input?: string;
  output?: string;
  status: 'pending_approval' | 'running' | 'completed' | 'failed';
}

function ChatView({
  settings, backendOnline, initialSession, onSessionCreated, onSessionUpdated,
}: {
  settings: AppSettings;
  backendOnline: boolean;
  initialSession: SessionInfo | null;
  onSessionCreated: (sid: string, title: string) => void;
  onSessionUpdated: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeTools, setActiveTools] = useState<ActiveTool[]>([]);
  const [toolSteps, setToolSteps] = useState<ToolStep[]>([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; sessionId: string } | null>(null);
  const [speedMode, setSpeedMode] = useState<'fast' | 'slow'>('fast');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.session_id ?? null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleApprove = async (approvalId: string) => {
    try {
      await approveTool(approvalId, true);
      setToolSteps(prev =>
        prev.map(step =>
          step.id === approvalId
            ? { ...step, status: 'running' }
            : step
        )
      );
    } catch (e: any) {
      console.error("Approve error", e);
      throw e;
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await approveTool(approvalId, false);
      setToolSteps(prev =>
        prev.map(step =>
          step.id === approvalId
            ? { ...step, status: 'failed', output: 'Tool execution rejected by user.' }
            : step
        )
      );
    } catch (e: any) {
      console.error("Reject error", e);
      throw e;
    }
  };

  // Load history when a session is selected from the sidebar
  useEffect(() => {
    if (!initialSession) return;
    getSession(initialSession.session_id)
      .then(data => {
        setMessages(data.messages ?? []);
        setSessionId(initialSession.session_id);
      })
      .catch(() => {});
  }, [initialSession?.session_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, activeTools]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent('');
    setActiveTools([]);
    setToolSteps([]);

    const controller = new AbortController();
    abortRef.current = controller;
    const start = Date.now();
    let fullContent = '';
    const isFirstMessage = messages.length === 0;

    try {
      await sendMessageStream(
        {
          message: text,
          session_id: sessionId ?? uploadedFile?.sessionId,
          chat_history: messages,
          answering_method: settings.answering_method,
          speed_mode: speedMode,
          require_approval: requireApproval,
          web_search: webSearchEnabled,
        } as any,
        (event: SSEEvent) => {
          if (event.type === 'tool_approval_request') {
            setToolSteps(prev => [
              ...prev,
              {
                id: event.approval_id!,
                tool: event.tool!,
                emoji: event.emoji || '⚙️',
                label: event.label || `Approval requested for ${event.tool}`,
                input: event.input,
                status: 'pending_approval',
              },
            ]);
          } else if (event.type === 'tool_start') {
            setActiveTools(prev => [...prev, { tool: event.tool!, emoji: event.emoji!, label: event.label! }]);
            setToolSteps(prev => {
              const exists = prev.some(s => s.tool === event.tool && (s.status === 'pending_approval' || s.status === 'running'));
              if (exists) {
                return prev.map(s =>
                  s.tool === event.tool && (s.status === 'pending_approval' || s.status === 'running')
                    ? { ...s, status: 'running', input: event.input || s.input }
                    : s
                );
              } else {
                return [
                  ...prev,
                  {
                    id: `${event.tool}-${Date.now()}`,
                    tool: event.tool!,
                    emoji: event.emoji || '⚙️',
                    label: event.label || `Using ${event.tool}...`,
                    input: event.input,
                    status: 'running',
                  },
                ];
              }
            });
          } else if (event.type === 'tool_end') {
            setActiveTools(prev => prev.filter(t => t.tool !== event.tool));
            setToolSteps(prev =>
              prev.map(s =>
                s.tool === event.tool && s.status === 'running'
                  ? { ...s, status: 'completed', output: event.output }
                  : s
              )
            );
          } else if (event.type === 'token') {
            fullContent += event.content || '';
            setStreamingContent(fullContent);
          } else if (event.type === 'done') {
            const latency = Date.now() - start;
            const assistantMsg: ChatMessage = {
              role: 'assistant',
              content: fullContent || event.content || '',
              timestamp: new Date().toISOString(),
              tools_used: event.tool ? [event.tool] : [],
              latency_ms: latency,
            };
            
            const finishedTools = toolSteps
              .filter(s => s.status === 'completed')
              .map(s => s.tool);
            if (finishedTools.length > 0) {
              assistantMsg.tools_used = Array.from(new Set([...(assistantMsg.tools_used || []), ...finishedTools]));
            }

            setMessages(prev => [...prev, assistantMsg]);
            setStreamingContent('');
            setIsStreaming(false);
            setActiveTools([]);
            setToolSteps([]);
            
            const newSessionId = event.session_id || sessionId;
            if (newSessionId && newSessionId !== sessionId) {
              setSessionId(newSessionId);
            }

            if (isFirstMessage) {
              onSessionCreated(newSessionId ?? '', text.slice(0, 50));
            } else {
              onSessionUpdated();
            }
          } else if (event.type === 'error') {
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: `Error: ${event.error}`, timestamp: new Date().toISOString() },
            ]);
            setStreamingContent('');
            setIsStreaming(false);
            setActiveTools([]);
            setToolSteps([]);
          }
        },
        controller.signal,
      );
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Connection error: ${e.message}`, timestamp: new Date().toISOString() },
        ]);
      }
      setStreamingContent('');
      setIsStreaming(false);
      setActiveTools([]);
      setToolSteps([]);
    }
  }, [isStreaming, messages, settings, uploadedFile, speedMode, sessionId, requireApproval, toolSteps, onSessionCreated, onSessionUpdated]);

  const handleStop = () => {
    abortRef.current?.abort();
    if (streamingContent) {
      setMessages(prev => [...prev, { role: 'assistant', content: streamingContent, timestamp: new Date().toISOString() }]);
    }
    setStreamingContent('');
    setIsStreaming(false);
    setActiveTools([]);
    setToolSteps([]);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadFile(file);
      setUploadedFile({ name: file.name, sessionId: result.session_id });
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto" id="chat-scroll">
        {messages.length === 0 && !isStreaming ? (
          <GeminiWelcome onSend={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}

            {/* Active tools */}
            {activeTools.length > 0 && (
              <div className="flex flex-wrap gap-2 my-2 animate-fade-in">
                {activeTools.map((t, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] font-medium"
                  >
                    <span>{t.emoji}</span>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{t.label}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Streaming message */}
            {isStreaming && (streamingContent || toolSteps.length > 0) && (
              <ChatBubble
                message={{ role: 'assistant', content: streamingContent }}
                isStreaming
                toolSteps={toolSteps}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}

            {/* Typing dot indicator */}
            {isStreaming && !streamingContent && activeTools.length === 0 && toolSteps.length === 0 && (
              <AiLoadingState />
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Uploaded file chip */}
      {uploadedFile && (
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-secondary)] w-fit mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[180px]">{uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="w-full max-w-3xl mx-auto px-4 md:px-6 pb-4">
        <GeminiInput
          onSend={handleSend}
          onStop={handleStop}
          onUpload={handleFileUpload}
          isStreaming={isStreaming}
          disabled={!backendOnline}
          speedMode={speedMode}
          onSpeedModeChange={setSpeedMode}
          requireApproval={requireApproval}
          onRequireApprovalChange={setRequireApproval}
          webSearchEnabled={webSearchEnabled}
          onWebSearchChange={setWebSearchEnabled}
        />
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-2.5 select-none">
          multi may display inaccurate info — always double-check its responses.
        </p>
      </div>
    </div>
  );
}

/* ─── Gemini Welcome ─────────────────────────────────────────── */
function GeminiWelcome({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex flex-col justify-between h-full max-w-3xl mx-auto px-4 md:px-6 py-8 min-h-[calc(100vh-120px)]">
      <div className="mt-12 md:mt-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-2">
          <span className="gradient-text-multi">Hello, friend.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-muted)] font-medium">
          How can I help you today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-auto mb-6">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSend(s.text)}
            className="suggestion-card text-left animate-fade-slide-up flex flex-col justify-between min-h-[110px]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{s.text}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold tracking-wide uppercase">{s.desc}</span>
              <span className="text-base">{s.icon}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Gemini Input ───────────────────────────────────────────── */
function GeminiInput({
  onSend, onStop, onUpload, isStreaming, disabled, speedMode, onSpeedModeChange,
  requireApproval, onRequireApprovalChange,
  webSearchEnabled, onWebSearchChange,
}: {
  onSend: (t: string) => void;
  onStop: () => void;
  onUpload: (f: File) => void;
  isStreaming: boolean;
  disabled: boolean;
  speedMode: 'fast' | 'slow';
  onSpeedModeChange: (m: 'fast' | 'slow') => void;
  requireApproval: boolean;
  onRequireApprovalChange: (b: boolean) => void;
  webSearchEnabled: boolean;
  onWebSearchChange: (b: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isFast = speedMode === 'fast';

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 200)}px`; }
  };

  const submit = () => {
    const t = value.trim();
    if (!t || isStreaming || disabled) return;
    onSend(t);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="gemini-input-wrapper w-full">
      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); autoResize(); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={disabled ? 'Backend offline…' : 'Message multi…'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none leading-6 max-h-[200px] overflow-y-auto py-0.5"
        />

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">

          {/* Speed mode toggle */}
          <button
            onClick={() => onSpeedModeChange(isFast ? 'slow' : 'fast')}
            title={isFast ? 'Fast mode: Groq (click to switch to Slow/Gemini)' : 'Slow mode: Gemini (click to switch to Fast/Groq)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all select-none ${
              isFast
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            {isFast ? (
              <><Zap className="w-3 h-3" /> Fast</>
            ) : (
              <><Brain className="w-3 h-3" /> Slow</>
            )}
          </button>

          {/* Web Search toggle */}
          <button
            onClick={() => onWebSearchChange(!webSearchEnabled)}
            title={webSearchEnabled ? 'Web Search: ON (click to turn off)' : 'Web Search: OFF (click to turn on)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all select-none ${
              webSearchEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-white/5 border-white/10 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-secondary)]'
            }`}
          >
            <Globe className="w-3 h-3" /> Search
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Upload file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) { onUpload(e.target.files[0]); e.target.value = ''; } }}
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
              title="Stop"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                value.trim() && !disabled
                  ? 'bg-[var(--accent-blue)] text-white hover:bg-blue-500'
                  : 'text-[var(--text-muted)] cursor-not-allowed',
              )}
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Parse thoughts and content helper ─────────────────────── */
function parseThoughtsAndContent(rawText: string) {
  let thoughts = '';
  let content = rawText;
  let isThinking = false;

  const completeMatch = rawText.match(/<thought>([\s\S]*?)<\/thought>/i);
  if (completeMatch) {
    thoughts = completeMatch[1].trim();
    content = rawText.replace(completeMatch[0], '').trim();
  } else {
    const partialMatch = rawText.match(/<thought>([\s\S]*)/i);
    if (partialMatch) {
      thoughts = partialMatch[1].trim();
      content = rawText.substring(0, partialMatch.index).trim();
      isThinking = true;
    }
  }

  return { thoughts, content, isThinking };
}

/* ─── Chat Bubble ────────────────────────────────────────────── */
function ChatBubble({
  message,
  isStreaming,
  toolSteps = [],
  onApprove,
  onReject,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  toolSteps?: ToolStep[];
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string) => Promise<void> | void;
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const { thoughts, content, isThinking } = parseThoughtsAndContent(message.content);

  const sources = useMemo(() => {
    const urls = new Map<string, { name: string; domain: string; href: string }>();
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[1];
      const href = match[2];
      try {
        const url = new URL(href);
        if (!urls.has(href)) {
          let name = text;
          if (/^\d+$/.test(name)) name = url.hostname;
          else if (name.length > 35) name = name.substring(0, 35) + '...';
          urls.set(href, { name, domain: url.hostname, href });
        }
      } catch (e) {}
    }
    return Array.from(urls.values());
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeak = () => {
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(content);
    utt.onend = () => setSpeaking(false);
    speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-slide-up">
        <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.timestamp && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-right">{formatTime(message.timestamp)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3 mb-4 animate-fade-slide-up">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shrink-0 mt-1">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        
        {/* Active Tool Steps during streaming */}
        {isStreaming && toolSteps.length > 0 && (
          <div className="flex flex-col gap-2 mb-3 animate-fade-in">
            {toolSteps.map((step) => {
              if (step.status === 'pending_approval') {
                return (
                  <ToolApprovalCard
                    key={step.id}
                    approvalId={step.id}
                    toolName={step.tool}
                    emoji={step.emoji}
                    input={step.input || ''}
                    onApprove={onApprove!}
                    onReject={onReject!}
                  />
                );
              }
              return (
                <ToolChip
                  key={step.id}
                  toolName={step.tool}
                  emoji={step.emoji}
                  label={step.label}
                  input={step.input}
                  output={step.output}
                  status={
                    step.status === 'running'
                      ? 'running'
                      : step.status === 'completed'
                      ? 'completed'
                      : 'failed'
                  }
                />
              );
            })}
          </div>
        )}

        {/* Completed tool chips for past/historical messages */}
        {!isStreaming && message.tools_used && message.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.tools_used.map((t, i) => (
              <ToolChip
                key={i}
                toolName={t}
                status="completed"
                label={`Used ${t}`}
              />
            ))}
          </div>
        )}

        {/* Collapsible Thoughts Block */}
        {(thoughts || (isStreaming && isThinking)) && (
          <AiThinking
            content={thoughts}
            isThinking={isThinking}
            durationMs={isThinking ? undefined : 1500}
            defaultExpanded={isStreaming}
          />
        )}

        {/* Content markdown */}
        {content && (
          <div className="prose-gemini text-[var(--text-primary)] text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const lang = /language-(\w+)/.exec(className || '');
                  if (!lang) {
                    return (
                      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-overlay)] text-orange-300 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlock
                      filename={lang[1] === 'typescript' || lang[1] === 'ts' ? 'churn.ts' : `output.${lang[1]}`}
                      language={lang[1]}
                      rawCode={String(children).replace(/\n$/, '')}
                    />
                  );
                },
                a({ href, children }) {
                  if (href && children) {
                    const childStr = children.toString();
                    const isCitation = /^\d+$/.test(childStr) || /^\[\d+\]$/.test(childStr);
                    if (isCitation) {
                      let domain = href;
                      try { domain = new URL(href).hostname; } catch (e) {}
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-0 mr-1 inline-flex h-5 translate-y-[-1px] items-center gap-1.5 rounded-[5px] bg-white/[0.04] px-1.5 align-middle font-mono text-[10.5px] text-white/60 shadow-sm border border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.08] hover:text-white/90 no-underline"
                          style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
                        >
                          <Globe className="w-3 h-3 text-white/40" />
                          <span>{domain}</span>
                        </a>
                      );
                    }
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">{children}</a>;
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-[3px] h-[14px] bg-blue-400 opacity-80 animate-[typing-blink_1s_ease-in-out_infinite] ml-0.5 align-middle rounded-full" />
            )}
          </div>
        )}

        {/* Action bar */}
        {!isStreaming && content && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all" title="Copy">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleSpeak} className={cn('p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-all', speaking ? 'text-blue-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')} title={speaking ? 'Stop' : 'Read aloud'}>
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            {message.latency_ms !== undefined && (
              <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">
                {(message.latency_ms / 1000).toFixed(2)}s
              </span>
            )}
            {message.timestamp && (
              <span className="text-[10px] text-[var(--text-muted)]">{formatTime(message.timestamp)}</span>
            )}
            {sources.length > 0 && (
              <>
                <div className="w-px h-3.5 bg-white/10 mx-1" />
                <button
                  type="button"
                  aria-expanded={sourcesOpen}
                  onClick={() => setSourcesOpen((current) => !current)}
                  className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-left transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <span className="flex -space-x-1">
                    {sources.slice(0, 3).map((source, i) => (
                      <div key={i} className="flex size-4 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--canvas)] z-10 relative shadow-sm">
                        <Globe className="w-2.5 h-2.5 text-white/40" />
                      </div>
                    ))}
                    {sources.length > 3 && (
                      <div className="flex size-4 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--canvas)] z-10 relative shadow-sm text-[8px] font-bold text-white/50">
                        +{sources.length - 3}
                      </div>
                    )}
                  </span>
                  <span className="text-[11px] font-medium text-white/50">{sources.length} sources</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Expandable Sources Drawer */}
        {!isStreaming && sources.length > 0 && (
          <div
            className="grid transition-[grid-template-rows,opacity] duration-300"
            style={{
              gridTemplateRows: sourcesOpen ? "1fr" : "0fr",
              opacity: sourcesOpen ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <div className="overflow-hidden">
              <div className="mt-2 flex flex-col rounded-[10px] bg-white/[0.02] border border-white/[0.04] p-1 shadow-sm">
                {sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 text-[12px] text-white/60 transition-colors duration-150 hover:bg-white/[0.04] hover:text-white/90"
                  >
                    <Globe className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="truncate flex-1 font-medium underline decoration-white/20 underline-offset-2 hover:decoration-white/50 transition-colors">{source.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-white/40 shrink-0">{source.domain}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPARE VIEW
═══════════════════════════════════════════════════════════════ */
function CompareView() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await compareModels(query)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <WorkspaceShell title="Model Compare" icon={GitCompare} desc="Run the same prompt through Gemini and Grok side-by-side">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Enter a prompt to compare…"
          className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/40"
        />
        <button onClick={run} disabled={loading || !query.trim()} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Compare
        </button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {[
            { label: '🟠 Gemini', key: 'google', color: 'blue' },
            { label: '🟢 Groq (Llama)', key: 'groq', color: 'purple' },
          ].map(({ label, key, color }) => (
            <div key={key} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
                <span className={`text-[10px] text-${color}-400 font-mono`}>{((result as any)[key].latency_ms / 1000).toFixed(2)}s</span>
              </div>
              <div className="prose-gemini text-sm flex-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{(result as any)[key].response}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND VIEW
═══════════════════════════════════════════════════════════════ */
function PlaygroundView() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await runPlayground({ prompt, system_prompt: systemPrompt, temperature, max_tokens: maxTokens })); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <WorkspaceShell title="LLM Playground" icon={Zap} desc="Experiment with raw API parameters and inspect request/response JSON">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="System prompt…"
            rows={2}
            className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-blue-500/40 font-mono"
          />
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="User prompt…"
            rows={4}
            className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <label className="block">
            <span className="text-[var(--text-muted)] text-xs">Temperature: {temperature}</span>
            <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full mt-1 accent-blue-500" />
          </label>
          <label className="block">
            <span className="text-[var(--text-muted)] text-xs">Max tokens: {maxTokens}</span>
            <input type="range" min={64} max={4096} step={64} value={maxTokens} onChange={e => setMaxTokens(+e.target.value)} className="w-full mt-1 accent-blue-500" />
          </label>
          <button onClick={run} disabled={loading || !prompt.trim()} className="mt-auto w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Output</span>
              <span className="text-[10px] text-blue-400 font-mono">{(result.latency_ms / 1000).toFixed(2)}s</span>
            </div>
            <div className="prose-gemini text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.output}</ReactMarkdown></div>
          </div>
          <div className="flex flex-col gap-2">
            <pre className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl p-4 text-[10px] text-[var(--text-secondary)] overflow-auto max-h-52 font-mono">
              <span className="text-[var(--text-muted)] block mb-1">Request</span>
              {result.request_json}
            </pre>
            <pre className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl p-4 text-[10px] text-[var(--text-secondary)] overflow-auto max-h-52 font-mono">
              <span className="text-[var(--text-muted)] block mb-1">Response</span>
              {result.response_json}
            </pre>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUNCIL VIEW
═══════════════════════════════════════════════════════════════ */
function CouncilView() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await runCouncil(topic)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const panels = result ? [
    { label: '🔬 Researcher', key: 'researcher', color: 'emerald' },
    { label: '⚫ Grok',       key: 'grok',        color: 'purple' },
    { label: '🔵 Gemini',     key: 'gemini',      color: 'blue' },
  ] : [];

  return (
    <WorkspaceShell title="AI Council" icon={Users} desc="Three AI perspectives debate a topic: Researcher, Grok, and Gemini">
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Enter a topic to debate…"
          className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/40"
        />
        <button onClick={run} disabled={loading || !topic.trim()} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Debate
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[var(--text-secondary)] text-sm py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Council is deliberating…
        </div>
      )}

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {panels.map(({ label, key, color }) => (
            <div key={key} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4">
              <p className={`text-xs font-semibold text-${color}-400 mb-3`}>{label}</p>
              <div className="prose-gemini text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{(result as any)[key]}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTO-ROUTE VIEW
═══════════════════════════════════════════════════════════════ */
const ROUTE_ICONS: Record<string, React.ReactNode> = {
  'Tool Calling': <Calculator className="w-5 h-5 text-orange-400" />,
  'RAG': <FileText className="w-5 h-5 text-blue-400" />,
  'LLM': <Bot className="w-5 h-5 text-purple-400" />,
};

function AutoRouteView() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ route: string; confidence: number; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await runRouteTest(query)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <WorkspaceShell title="Auto-Route" icon={Layers} desc="Inspect how the router classifies your query and chooses a tool">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Enter any query to classify…"
          className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/40"
        />
        <button onClick={run} disabled={loading || !query.trim()} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Route
        </button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

      {result && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col gap-5 animate-fade-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center">
              {ROUTE_ICONS[result.route] ?? <Bot className="w-5 h-5 text-[var(--text-muted)]" />}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold">Route</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{result.route}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">Confidence</p>
            <div className="h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{(result.confidence * 100).toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">Reason</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.reason}</p>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORKSPACE SHELL
═══════════════════════════════════════════════════════════════ */
function WorkspaceShell({
  title, icon: Icon, desc, children,
}: {
  title: string;
  icon: React.ElementType;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS MODAL
═══════════════════════════════════════════════════════════════ */
function SettingsModal({
  settings, onSave, onClose,
}: {
  settings: AppSettings;
  onSave: (s: AppSettings) => Promise<void>;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  const [tab, setTab] = useState<'prefs' | 'memory' | 'integrations'>('prefs');
  const [saving, setSaving] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loadingMem, setLoadingMem] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'memory') {
      setLoadingMem(true);
      getMemories().then(r => setMemories(r.memories)).catch(() => {}).finally(() => setLoadingMem(false));
    }
  }, [tab]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try { await onSave(local); onClose(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch { }
  };

  const field = (label: string, content: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      {content}
    </div>
  );

  const select = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/40"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Settings</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-subtle)] px-6 overflow-x-auto no-scrollbar">
          {([['prefs', 'Preferences'], ['memory', 'Agent Memory'], ['integrations', 'Integrations']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'py-3 px-3 text-xs font-medium border-b-2 transition-all',
                tab === id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'prefs' ? (
            <div className="flex flex-col gap-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>}

              {field('LLM Provider', select(local.llm_provider, v => setLocal(l => ({ ...l, llm_provider: v })), [
                { value: 'google', label: 'Google Gemini' },
                { value: 'groq', label: 'Groq (Llama 3)' },
              ]))}

              {local.llm_provider === 'google' && field('Gemini Model', select(local.gemini_model, v => setLocal(l => ({ ...l, gemini_model: v })), [
                { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Free / Fast)' },
                { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
                { value: 'gemini-2.0-flash-lite', label: 'gemini-2.0-flash-lite' },
              ]))}

              {field('Answering Method', select(local.answering_method, v => setLocal(l => ({ ...l, answering_method: v })), [
                { value: 'tool_calling', label: 'Agent (Web Search + Calculator + PDF RAG)' },
                { value: 'pdf_faq', label: 'PDF QA Mode (from uploaded PDF only)' },
                { value: 'direct_llm', label: 'Direct Chat (no tools)' },
              ]))}

              {field('Custom System Prompt', (
                <textarea
                  value={local.system_prompt}
                  onChange={e => setLocal(l => ({ ...l, system_prompt: e.target.value }))}
                  placeholder="Leave blank to use the default system prompt…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-blue-500/40"
                />
              ))}
            </div>
          ) : tab === 'integrations' ? (
            <div className="flex flex-col gap-5 animate-fade-slide-up">
              <div className="text-xs text-[var(--text-muted)] mb-1">
                Connect external services to your AI agent. These tokens are stored securely in your local environment.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GitHub */}
                <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                    <Github className="w-4 h-4" /> GitHub
                  </div>
                  <input
                    type="password"
                    value={local.github_token || ''}
                    onChange={e => setLocal(l => ({ ...l, github_token: e.target.value }))}
                    placeholder="Personal Access Token..."
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                
                {/* Slack */}
                <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                    <Hash className="w-4 h-4" /> Slack
                  </div>
                  <input
                    type="password"
                    value={local.slack_token || ''}
                    onChange={e => setLocal(l => ({ ...l, slack_token: e.target.value }))}
                    placeholder="Slack Bot Token (xoxb-...)"
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                
                {/* LinkedIn */}
                <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </div>
                  <input
                    type="password"
                    value={local.linkedin_token || ''}
                    onChange={e => setLocal(l => ({ ...l, linkedin_token: e.target.value }))}
                    placeholder="LinkedIn API Token..."
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                
                {/* Apify */}
                <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                    <Box className="w-4 h-4" /> Apify
                  </div>
                  <input
                    type="password"
                    value={local.apify_token || ''}
                    onChange={e => setLocal(l => ({ ...l, apify_token: e.target.value }))}
                    placeholder="Apify API Token..."
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                
                {/* Email */}
                <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-3 md:col-span-2">
                  <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                    <Mail className="w-4 h-4" /> Email (SMTP/IMAP App Password)
                  </div>
                  <input
                    type="password"
                    value={local.email_token || ''}
                    onChange={e => setLocal(l => ({ ...l, email_token: e.target.value }))}
                    placeholder="App Password..."
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-fade-slide-up">
              {loadingMem ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
              ) : memories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <Brain className="w-10 h-10 text-[var(--text-muted)]/30 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">No memories yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">The agent saves facts you mention — e.g. "Remember I prefer Python"</p>
                  </div>
                </div>
              ) : (
                memories.map(m => (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">{m.content}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(m.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleDeleteMemory(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-400 transition-all shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[var(--border-subtle)]">
          {tab === 'prefs' ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 flex items-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESEARCH WORKSPACE
═══════════════════════════════════════════════════════════════ */
function ResearchWorkspace() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<{ tool: string; message: string }[]>([]);
  const [report, setReport] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const startResearch = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError('');
    setSteps([]);
    setReport('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await runDeepResearchStream(
        topic,
        (event) => {
          if (event.type === 'research_step') {
            setSteps(prev => [...prev, { tool: event.tool || '', message: event.message || '' }]);
          } else if (event.type === 'token') {
            setReport(prev => prev + (event.content || ''));
          } else if (event.type === 'done') {
            setLoading(false);
          } else if (event.type === 'error') {
            setError(event.error || 'An error occurred during research');
            setLoading(false);
          }
        },
        controller.signal
      );
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e.message);
        setLoading(false);
      }
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Deep Research" icon={Brain} desc="Autonomous agent that searches and scrapes the web to compile definitive reports">
      {/* Input section */}
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && startResearch()}
          disabled={loading}
          placeholder="What would you like me to deeply research?"
          className="flex-1 px-5 py-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-500/40 transition-colors"
        />
        {loading ? (
          <button onClick={handleStop} className="px-6 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-2">
            <StopCircle className="w-4 h-4" /> Stop
          </button>
        ) : (
          <button onClick={startResearch} disabled={!topic.trim()} className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2">
            <Search className="w-4 h-4" /> Research
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

      <div className="flex flex-col gap-4 mt-2">
        {/* Progress log */}
        {(steps.length > 0 || loading) && (
          <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-widest mb-1">
              <Brain className="w-3.5 h-3.5" /> Agent Progress
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto text-[var(--text-muted)]" />}
            </div>
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] animate-fade-slide-up">
                <span className="text-purple-400/50 mt-0.5">❯</span>
                <span className="leading-relaxed">{s.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Final Report */}
        {report && (
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl animate-fade-slide-up">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-6 border-b border-[var(--border-subtle)] pb-4">
              <FileText className="w-4 h-4" /> Synthesized Report
            </div>
            <div className="prose-gemini text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
