import Link from 'next/link';
import {
  Sparkles, ArrowRight, Search, Calculator, FileText, Zap,
  GitCompare, Users, Layers, MessageSquare, Shield, Globe,
  CheckCircle, Star, Twitter, Github, Linkedin, ChevronRight,
  Bot, BrainCircuit, Cpu, Code2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — Root Route  /
═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ToolsSection />
        <WorkspacesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════ */
function Header() {
  const navLinks = [
    { label: 'Features',   href: '#features' },
    { label: 'Tools',      href: '#tools' },
    { label: 'Workspaces', href: '#workspaces' },
    { label: 'Docs',       href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">multi</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-semibold text-blue-400 tracking-wide">
            BETA
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
          >
            Sign in
          </Link>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px"
          >
            Try for free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-orange-500/6 rounded-full blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-secondary)] shadow-lg animate-fade-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" />
          Powered by Gemini &amp; Grok — now in beta
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 animate-fade-slide-up" style={{ animationDelay: '80ms' }}>
          One AI.{' '}
          <br className="sm:hidden" />
          <span className="gradient-text-multi">Infinite tools.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-slide-up" style={{ animationDelay: '160ms' }}>
          multi is your AI workspace that searches the web, solves math, reads PDFs, and compares top models — all from a single, beautifully designed interface.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-slide-up" style={{ animationDelay: '240ms' }}>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-base font-semibold transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <MessageSquare className="w-5 h-5" />
            Start chatting — free
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-base font-medium transition-all hover:bg-[var(--bg-hover)] hover:-translate-y-0.5"
          >
            See what it can do
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Hero preview card */}
        <div className="relative mx-auto max-w-3xl animate-fade-slide-up" style={{ animationDelay: '320ms' }}>
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 blur-sm" />
          <div className="relative rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-2xl">
            {/* Mock header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/60">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-4 h-6 bg-[var(--bg-card)] rounded-lg flex items-center px-3">
                <span className="text-[10px] text-[var(--text-muted)]">localhost:3000/chat</span>
              </div>
            </div>

            {/* Mock chat */}
            <div className="p-6 flex flex-col gap-4 text-left">
              {/* User */}
              <div className="flex justify-end">
                <div className="max-w-[65%] px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl rounded-tr-sm text-sm text-[var(--text-primary)]">
                  What are the latest AI breakthroughs this week?
                </div>
              </div>

              {/* Tool badge */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full text-[10px] text-[var(--text-secondary)] font-medium">
                  🔍
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Searching Tavily…
                </span>
              </div>

              {/* AI response */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Here are the top AI breakthroughs from this week:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">▸</span>OpenAI launches new reasoning model with 2× improvement in coding tasks</li>
                    <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">▸</span>Google DeepMind's AlphaFold 3 predicts RNA structures with 91% accuracy</li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span>Anthropic releases Claude constitutional AI training methodology paper</li>
                  </ul>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--text-muted)]">
                    <span className="text-blue-400 font-mono">1.2s response</span>
                    <span>•</span>
                    <span>web_search</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl">
                <span className="text-sm text-[var(--text-muted)] flex-1">Ask anything…</span>
                <div className="w-7 h-7 rounded-xl bg-blue-600/80 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Search,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Real-time Web Search',
    desc: 'Powered by Tavily — instantly searches the live web and synthesizes accurate, cited answers.',
  },
  {
    icon: Calculator,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Math & Calculation',
    desc: 'From compound interest to symbolic calculus — the agent solves math precisely without hallucinating.',
  },
  {
    icon: FileText,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'PDF Intelligence',
    desc: 'Upload any PDF and ask questions. RAG-powered semantic search extracts exactly what you need.',
  },
  {
    icon: BrainCircuit,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Agent Memory',
    desc: 'multi remembers your preferences, facts, and rules across sessions — like a true personal assistant.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Smart Auto-routing',
    desc: 'No need to pick a tool manually. The AI router classifies your query and picks the right tool instantly.',
  },
  {
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    title: 'Private by default',
    desc: 'Runs entirely on your own infrastructure. No data leaves your machine without your explicit action.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Capabilities</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Everything you need.{' '}
            <span className="gradient-text-multi">Nothing you don't.</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base leading-relaxed">
            multi combines the best AI models with powerful tools into a single, coherent experience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="group p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--border-mid)] hover:bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOOLS SHOWCASE
═══════════════════════════════════════════════════════════════ */
function ToolsSection() {
  const tools = [
    {
      label: 'Web Search',
      emoji: '🔍',
      example: '"What happened in the tech industry today?"',
      response: 'Fetches live results, summarizes from multiple sources, and cites them inline.',
      color: 'blue',
    },
    {
      label: 'Math Solver',
      emoji: '🧮',
      example: '"What is 12% compound interest on $50,000 over 10 years?"',
      response: 'Calculates step-by-step with exact numbers. Never guesses.',
      color: 'orange',
    },
    {
      label: 'PDF Q&A',
      emoji: '📄',
      example: '"Summarize Chapter 3 of the uploaded contract."',
      response: 'Chunks and semantically indexes your PDF, returning grounded answers.',
      color: 'purple',
    },
    {
      label: 'Direct Reasoning',
      emoji: '💡',
      example: '"Explain quantum entanglement to a 10-year-old."',
      response: 'Uses the raw model with your system prompt for fast, creative responses.',
      color: 'emerald',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/8',
    orange: 'text-orange-400 border-orange-500/20 bg-orange-500/8',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/8',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/8',
  };

  return (
    <section id="tools" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Built-in Tools</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            The right tool,{' '}
            <span className="gradient-text-multi">chosen automatically.</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base leading-relaxed">
            No toggles. No configuration. multi detects what you need from your natural query.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map(({ label, emoji, example, response, color }) => (
            <div
              key={label}
              className={`p-6 rounded-2xl border ${colorMap[color]} transition-all hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{emoji}</span>
                <span className={`text-sm font-semibold ${colorMap[color].split(' ')[0]}`}>{label}</span>
              </div>
              <div className="bg-[var(--bg-base)]/60 rounded-xl px-4 py-3 mb-3 border border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">You ask:</p>
                <p className="text-sm text-[var(--text-primary)] font-medium">{example}</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{response}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORKSPACES
═══════════════════════════════════════════════════════════════ */
function WorkspacesSection() {
  const workspaces = [
    {
      icon: MessageSquare,
      title: 'Chat',
      desc: 'Full-featured streaming chat with tool use, memory, and PDF upload.',
      color: 'blue',
    },
    {
      icon: GitCompare,
      title: 'Compare',
      desc: 'Run any prompt through Gemini and Grok simultaneously and compare side-by-side.',
      color: 'purple',
    },
    {
      icon: Zap,
      title: 'Playground',
      desc: 'Tweak temperature, max tokens, and system prompts. Inspect raw API request/response JSON.',
      color: 'yellow',
    },
    {
      icon: Users,
      title: 'Council',
      desc: 'Three AI perspectives — Researcher, Grok, and Gemini — debate your topic.',
      color: 'emerald',
    },
    {
      icon: Layers,
      title: 'Auto-route',
      desc: 'Visualise how multi\'s router classifies any query and the confidence score behind it.',
      color: 'orange',
    },
  ];

  const colorMap: Record<string, string> = {
    blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <section id="workspaces" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Workspaces</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Five modes.{' '}
            <span className="gradient-text-multi">One sidebar.</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base leading-relaxed">
            Switch between powerful AI workspaces instantly — no reloads, no context loss.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {workspaces.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--border-mid)] hover:bg-[var(--bg-card)] transition-all hover:-translate-y-1 group"
            >
              <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 group-hover:text-white transition-colors">{title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    quote: "multi replaced three separate AI apps for me. The auto-routing alone saves me so much time — I just ask and it figures out what tool to use.",
    name: 'Priya S.',
    role: 'Product Manager',
    stars: 5,
  },
  {
    quote: "The PDF Q&A feature is incredible. I uploaded a 200-page report and got pinpoint answers in seconds. No other tool does this as cleanly.",
    name: 'James K.',
    role: 'Research Analyst',
    stars: 5,
  },
  {
    quote: "Being able to compare Gemini vs Grok on the same prompt taught me so much about how different models reason. The Playground is a must for any developer.",
    name: 'Aditya R.',
    role: 'ML Engineer',
    stars: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Loved by users</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Built for people who{' '}
            <span className="gradient-text-multi">demand more.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role, stars }) => (
            <div
              key={name}
              className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl flex flex-col gap-4 hover:border-[var(--border-mid)] transition-colors"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">"{quote}"</p>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
                <p className="text-xs text-[var(--text-muted)]">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA SECTION
═══════════════════════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)]">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Free to start · No credit card required
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          Ready to meet your{' '}
          <span className="gradient-text-multi">AI workspace?</span>
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed mb-10">
          Join thousands of researchers, engineers, and professionals who run smarter with multi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-base font-semibold transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
          >
            <MessageSquare className="w-5 h-5" />
            Launch multi — it's free
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-base font-medium transition-all hover:bg-[var(--bg-hover)] hover:-translate-y-0.5"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'Features',    href: '#features' },
        { label: 'Workspaces',  href: '#workspaces' },
        { label: 'Changelog',   href: '#' },
        { label: 'Roadmap',     href: '#' },
      ],
    },
    {
      heading: 'Developers',
      links: [
        { label: 'API Docs',       href: 'http://localhost:8000/docs', external: true },
        { label: 'GitHub',         href: 'https://github.com', external: true },
        { label: 'Self-hosting',   href: '#' },
        { label: 'Configuration',  href: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About',       href: '#' },
        { label: 'Blog',        href: '#' },
        { label: 'Privacy',     href: '#' },
        { label: 'Terms',       href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">multi</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6 max-w-[220px]">
              The AI assistant that searches, calculates, reads, and reasons — all in one place.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter,  href: '#', label: 'Twitter' },
                { icon: Github,   href: '#', label: 'GitHub' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-mid)] transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">{heading}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <a href={href} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {year} multi. Built with Gemini, Grok, and a lot of ☕</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
