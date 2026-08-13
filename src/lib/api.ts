/**
 * API client for the Multi-Tool AI Assistant backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  tools_used?: string[];
  latency_ms?: number;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  chat_history?: ChatMessage[];
  temperature?: number;
  stream?: boolean;
  web_search?: boolean;
  speed_mode?: 'fast' | 'slow' | 'pro';
  require_approval?: boolean;
}

export interface SSEEvent {
  type: 'tool_start' | 'tool_end' | 'token' | 'done' | 'error' | 'tool_approval_request' | 'research_step' | 'fallback';
  tool?: string;
  emoji?: string;
  label?: string;
  content?: string;
  error?: string;
  input?: string;
  output?: string;
  latency_ms?: number;
  approval_id?: string;
  message?: string;
  session_id?: string;
  from?: string;
  to?: string;
  reason?: string;
}

export interface UploadResponse {
  status: string;
  session_id: string;
  file: { name: string; size_mb: number };
  indexing: {
    status: string;
    filename: string;
    pages_estimated: number;
    chunks_created: number;
    characters_extracted: number;
  };
  message: string;
}

export interface SessionInfo {
  session_id: string;
  title: string;
  message_count: number;
  created_at: string;
}

export interface AppSettings {
  llm_provider: string;
  gemini_model?: string;
  mistral_model?: string;
  answering_method: string;
  system_prompt: string;
  github_token?: string;
  slack_token?: string;
  linkedin_token?: string;
  apify_token?: string;
  email_token?: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
}

export interface CompareResponse {
  google: { response: string; latency_ms: number };
  groq: { response: string; latency_ms: number };
}

export interface PlaygroundResponse {
  request_json: string;
  response_json: string;
  output: string;
  latency_ms: number;
}

export interface CouncilResponse {
  researcher: string;
  grok: string;
  gemini: string;
}

export interface RouteTestResponse {
  route: 'math' | 'pdf' | 'search' | 'code' | 'none';
  confidence: number;
  reason: string;
}

export interface CodeGenResponse {
  code: string;
  language: string;
  latency_ms: number;
}

// ─── Chat ──────────────────────────────────────────────────────
export async function sendMessageStream(
  request: ChatRequest,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          try { onEvent(JSON.parse(jsonStr)); } catch { /* skip */ }
        }
      }
    }
  }
}

export async function sendMessage(request: ChatRequest): Promise<{
  session_id: string; response: string; tools_used: string[]; timestamp: string;
}> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: false }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// ─── Files & Sessions ──────────────────────────────────────────
export async function uploadFile(file: File, sessionId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) formData.append('session_id', sessionId);
  const response = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed: ${response.status}`);
  }
  return response.json();
}

export async function getSessions(): Promise<{ sessions: SessionInfo[] }> {
  const response = await fetch(`${API_BASE}/api/sessions`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function getSession(sessionId: string): Promise<{
  session_id: string; messages: ChatMessage[]; created_at: string;
}> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend unavailable');
  return response.json();
}

// ─── Settings ──────────────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const response = await fetch(`${API_BASE}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

// ─── Memory ────────────────────────────────────────────────────
export async function getMemories(): Promise<{ memories: MemoryItem[] }> {
  const response = await fetch(`${API_BASE}/api/memories`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/memories/${memoryId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

// ─── Tools ─────────────────────────────────────────────────────
export async function compareModels(message: string): Promise<CompareResponse> {
  const response = await fetch(`${API_BASE}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, stream: false }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function runPlayground(params: {
  prompt: string; system_prompt: string; temperature: number; max_tokens: number;
}): Promise<PlaygroundResponse> {
  const response = await fetch(`${API_BASE}/api/playground`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`Playground error! status: ${response.status}`);
  return response.json();
}

export async function runCouncil(topic: string): Promise<CouncilResponse> {
  const response = await fetch(`${API_BASE}/api/council`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!response.ok) throw new Error(`Council debate failed! status: ${response.status}`);
  return response.json();
}

export async function runRouteTest(query: string): Promise<RouteTestResponse> {
  const response = await fetch(`${API_BASE}/api/route-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(`Route test failed! status: ${response.status}`);
  return response.json();
}

export async function runDeepResearchStream(
  topic: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
    signal,
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          try { onEvent(JSON.parse(jsonStr)); } catch { /* skip */ }
        }
      }
    }
  }
}

export async function runCodeGen(params: {
  description: string;
  language: string;
  temperature?: number;
}): Promise<CodeGenResponse> {
  const response = await fetch(`${API_BASE}/api/code-gen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`Code generation failed! status: ${response.status}`);
  return response.json();
}

export async function approveTool(approvalId: string, approved: boolean): Promise<any> {
  const response = await fetch(`${API_BASE}/api/approve/${approvalId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Approval failed: ${response.status}`);
  }
  return response.json();
}
