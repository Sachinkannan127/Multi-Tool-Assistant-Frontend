"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Home, ClipboardList, Inbox, Layers, BarChart3, Plus, Search, ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV
 * Workspace navigation with direct selection and search.
 * ───────────────────────────────────────────────────────── */

interface NavigationItem {
  key: string;
  label: string;
  section: "Workspace" | "Objects";
  count?: boolean;
  plus?: boolean;
}

interface SidebarNavProps {
  items?: NavigationItem[];
  onSelect?: (key: string) => void;
  activeKey?: string;
}

const DEFAULT_ITEMS: NavigationItem[] = [
  { key: "activity", label: "Home", section: "Workspace" },
  { key: "tasks", label: "Agent tasks", section: "Workspace", count: true },
  { key: "dashboard", label: "Inbox", section: "Workspace" },
  { key: "spaces", label: "Suppliers", section: "Objects", plus: true },
  { key: "analytics", label: "Inventory", section: "Objects" },
];

function Icon({ kind }: { kind: string }) {
  switch (kind) {
    case "activity":
      return <Home className="w-3.5 h-3.5" />;
    case "tasks":
      return <ClipboardList className="w-3.5 h-3.5" />;
    case "dashboard":
      return <Inbox className="w-3.5 h-3.5" />;
    case "spaces":
      return <Layers className="w-3.5 h-3.5" />;
    case "analytics":
      return <BarChart3 className="w-3.5 h-3.5" />;
    default:
      return <Layers className="w-3.5 h-3.5" />;
  }
}

export function SidebarNav({
  items = DEFAULT_ITEMS,
  onSelect,
  activeKey = "tasks",
}: SidebarNavProps) {
  const [active, setActive] = useState(activeKey);
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [query, setQuery] = useState("");
  const [badge, setBadge] = useState(4);
  const sections = ["Workspace", "Objects"] as const;
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const container = navRef.current;
    const target = itemRefs.current[hovered ?? active];
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setBox({
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [hovered, active]);

  const handleSelect = (key: string) => {
    setActive(key);
    onSelect?.(key);
  };

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-60 bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl shadow-xl backdrop-blur-md">
      {/* workspace row */}
      <button
        type="button"
        className="mb-3.5 flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-all duration-100 hover:bg-white/[0.03] active:scale-[0.97]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black text-[13px] font-bold shadow-md">
          C
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-white/90 leading-tight">Creamery Ops</span>
          <span className="block truncate text-[10.5px] text-white/40 leading-tight mt-0.5">Production Workspace</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-white/30" />
      </button>

      {/* quick search */}
      <label className="mb-2 flex h-8.5 items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] px-2.5 shadow-inner">
        <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Quick search"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white/80 outline-none placeholder:text-white/30"
        />
        <kbd className="flex h-4.5 w-4.5 items-center justify-center rounded-md bg-white/[0.06] border border-white/[0.04] text-[9px] font-bold text-white/40 shadow-sm">
          /
        </kbd>
      </label>

      {/* accent action */}
      <button
        type="button"
        onClick={() => {
          setBadge((current) => current + 1);
          handleSelect("tasks");
        }}
        className="mb-3.5 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 transition-all active:scale-[0.97] hover:bg-purple-500/20"
      >
        <span className="min-w-0 flex-1 truncate text-left">New task</span>
        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
          <Plus className="w-3 h-3 stroke-[3]" />
        </span>
      </button>

      {/* items */}
      <div
        ref={navRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex flex-col gap-2"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-lg bg-white/[0.03]"
          style={{
            top: box?.top ?? 0,
            height: box?.height ?? 0,
            opacity: box ? 1 : 0,
            transition: "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
          }}
        />
        {sections.map((section) => {
          const sectionItems = filteredItems.filter((item) => item.section === section);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="flex flex-col gap-1">
              <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                {section}
              </div>
              <div className="flex flex-col gap-px">
                {sectionItems.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <button
                      key={item.key}
                      ref={(el) => {
                        itemRefs.current[item.key] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setHovered(item.key)}
                      onFocus={() => setHovered(item.key)}
                      onBlur={() => setHovered(null)}
                      onClick={() => handleSelect(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative z-10 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all active:scale-[0.97]"
                    >
                      <span className={isActive ? "text-white/80" : "text-white/30"}>
                        <Icon kind={item.key} />
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-[12.5px] transition-colors duration-150
                          ${isActive ? "font-semibold text-white/90" : "font-medium text-white/60"}`}
                      >
                        {item.label}
                      </span>
                      {item.count && (
                        <span
                          key={badge}
                          className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10.5px] font-bold tabular-nums border ${
                            isActive 
                              ? "bg-neutral-800 border-white/[0.04] text-white/60" 
                              : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          }`}
                          style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
                        >
                          {badge}
                        </span>
                      )}
                      {item.plus && (
                        <span
                          className="flex h-4.5 w-4.5 items-center justify-center rounded text-white/35 opacity-0 transition-opacity duration-100 group-hover:opacity-100 hover:bg-white/[0.04] hover:text-white"
                          style={isActive ? { opacity: 1 } : undefined}
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SidebarNav;
