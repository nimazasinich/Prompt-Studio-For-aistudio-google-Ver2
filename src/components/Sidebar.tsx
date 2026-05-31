/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  MessageSquare, Plus, Trash2, Github, Cloud, BookOpen, Layers, 
  Settings, FolderKanban, CheckSquare, RefreshCw, GitFork, Sliders, User
} from "lucide-react";
import { PromptSession, UserProfile } from "../types";

interface SidebarProps {
  sessions: PromptSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenSettings: (initialTab?: string) => void;
  uiScale: "compact" | "comfortable" | "spacious";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser: UserProfile | null;
  onAuthClick: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  activeTab,
  onChangeTab,
  onOpenSettings,
  uiScale,
  isCollapsed = false,
  onToggleCollapse,
  currentUser,
  onAuthClick
}: SidebarProps) {
  const isCompact = uiScale === "compact";
  const isSpacious = uiScale === "spacious";

  const PRIMARY_LINKS = [
    { id: "workspace", label: "Prompt Workspace", icon: MessageSquare },
    { id: "testing", label: "AI Testing Core", icon: CheckSquare },
    { id: "feedback", label: "Feedback Auditor", icon: RefreshCw },
    { id: "knowledge", label: "Prompt Library", icon: BookOpen },
  ];

  const AUXILIARY_LINKS: { id: string; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "assets", label: "Assets Folder", icon: FolderKanban },
    { id: "pipelines", label: "Pipelines", icon: Layers, badge: "Beta" },
    { id: "integrations", label: "Integrations Hub", icon: Cloud },
  ];

  const renderNavItem = (id: string, label: string, Icon: React.ElementType, badge?: string) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => onChangeTab(id)}
        className={`group relative flex items-center transition-all duration-200 ease-out rounded-xl leading-none cursor-pointer ${
          isCollapsed
            ? `w-11 h-11 p-0 justify-center ${
                isActive
                  ? "bg-accent-mint/[0.08] text-accent-mint shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]"
                  : "text-brand-muted/55 hover:bg-white/[0.04] hover:text-brand-primary/80"
              }`
            : `w-full justify-between px-2.5 py-2 text-xs tracking-wider uppercase ${
                isActive
                  ? "bg-accent-mint/[0.06] text-accent-mint font-black"
                  : "text-brand-muted/60 hover:bg-accent-mint/[0.03] hover:text-brand-primary/90"
              }`
        }`}
        title={isCollapsed ? label : undefined}
      >
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r transition-all duration-200 ease-out ${
          isActive
            ? "h-3 bg-accent-mint opacity-100 shadow-[0_0_6px_rgba(108,236,200,0.4)]"
            : "h-2 bg-accent-mint/50 opacity-0 group-hover:opacity-50"
        }`} />

        <div className="flex items-center gap-2.5 w-full min-w-0 pl-1">
          <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 ${
            isActive
              ? "text-accent-mint drop-shadow-[0_0_3px_rgba(108,236,200,0.3)]"
              : "text-brand-muted/40 group-hover:text-accent-mint/70"
          }`} />
          {!isCollapsed && <span className="text-[11px] font-bold tracking-wide truncate min-w-0 block">{label}</span>}
        </div>
        {!isCollapsed && isActive && !badge && (
          <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-accent-mint shadow-[0_0_4px_rgba(108,236,200,0.5)] mr-0.5"></span>
        )}
        {!isCollapsed && badge && (
          <span className="text-[7.5px] font-mono bg-accent-violet/15 text-accent-violet border border-accent-violet/25 px-1.5 py-0.5 rounded uppercase font-black shrink-0 mr-0.5 leading-none">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`flex flex-col theme-sidebar border-r text-brand-primary select-none shrink-0 transition-all duration-300 ease-in-out h-screen overflow-x-hidden overflow-y-hidden ${
      isCollapsed ? "w-[68px] p-2 space-y-3 items-center" : (isCompact ? "w-[230px] p-3 space-y-2" : isSpacious ? "w-[250px] p-5 space-y-3.5" : "w-[235px] p-4 space-y-3")
    }`}>
      {/* Brand */}
      <div className={`flex h-12 items-center px-1.5 select-none shrink-0 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-accent-mint to-accent-violet p-1.5 flex items-center justify-center shadow-lg shadow-accent-mint/10 hover:rotate-6 transition-all duration-300">
            <Layers className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 max-w-full">
              <span className="text-xs font-space font-extrabold tracking-widest text-brand-primary block uppercase leading-none truncate">PROMPT</span>
              <span className="text-[9px] font-mono font-bold text-accent-mint tracking-[0.2em] block uppercase mt-0.5 truncate">ARCHITECT</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile / Account Identity Capsule */}
      <button
        onClick={onAuthClick}
        className={`flex items-center transition-all duration-250 ease-out shrink-0 cursor-pointer group relative ${
          isCollapsed
            ? "w-12 h-12 p-0 justify-center rounded-full bg-gradient-to-br from-brand-secondary to-brand-deep ring-2 ring-accent-mint/20 hover:ring-accent-mint/40 shadow-[0_0_12px_color-mix(in_srgb,var(--accent-primary)_6%,transparent)] hover:shadow-[0_0_18px_color-mix(in_srgb,var(--accent-primary)_12%,transparent)] hover:scale-105 active:scale-95"
            : "w-full gap-2.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-brand-secondary/70 to-brand-deep/50 border border-accent-mint/8 hover:border-accent-mint/20 hover:shadow-[0_0_16px_color-mix(in_srgb,var(--accent-primary)_6%,transparent)] hover:translate-y-[-1px]"
        }`}
        title={currentUser ? `Signed in as ${currentUser.name}` : "Sign In / Profile"}
      >
        <div className={`relative flex items-center justify-center font-bold text-xs shrink-0 rounded-full bg-gradient-to-br from-[var(--profile-gradient-from)] to-[var(--profile-gradient-to)] flex-none transition-all duration-250 ${
          isCollapsed
            ? "h-8 w-8 ring-[1.5px] ring-accent-mint/30 group-hover:ring-accent-mint/50 shadow-[0_0_8px_color-mix(in_srgb,var(--accent-primary)_10%,transparent)]"
            : "h-8 w-8 ring-[1.5px] ring-accent-mint/20 group-hover:ring-accent-mint/40 shadow-[0_0_6px_color-mix(in_srgb,var(--accent-primary)_8%,transparent)] group-hover:shadow-[0_0_10px_color-mix(in_srgb,var(--accent-primary)_15%,transparent)]"
        }`}>
          {currentUser ? (
            <span className="font-space font-extrabold text-accent-mint text-[11px] leading-none uppercase tracking-wide">
              {currentUser.name.charAt(0)}
            </span>
          ) : (
            <User className="h-3.5 w-3.5 text-accent-mint/80 group-hover:text-accent-mint transition-all duration-200" />
          )}
          {currentUser ? (
            <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-accent-mint border-[1.5px] border-brand-deep shadow-[0_0_6px_var(--accent-primary)]"></span>
          ) : (
            <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-amber-500/80 border-[1.5px] border-brand-deep shadow-[0_0_4px_rgba(245,158,11,0.4)]"></span>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0 max-w-full flex flex-col text-left">
            <span className="uppercase text-[10.5px] font-black tracking-wider text-brand-primary truncate group-hover:text-accent-mint transition-colors duration-200 leading-tight">
              {currentUser ? currentUser.name : "Local Architect"}
            </span>
            <span className="text-[8px] font-mono text-brand-muted/35 uppercase tracking-widest leading-none mt-0.5 group-hover:text-brand-muted/55 transition-colors duration-200 truncate">
              {currentUser ? "Enterprise A" : "Offline Sandbox"}
            </span>
          </div>
        )}
      </button>

      <div className="border-t border-glass w-full shrink-0"></div>

      {/* Workspace Modes */}
      <div className={`space-y-0.5 shrink-0 ${isCollapsed ? "w-11 items-center flex flex-col" : "w-full"}`}>
        {!isCollapsed && (
          <span className="text-[9px] font-mono text-brand-muted/35 uppercase tracking-[0.2em] px-3 select-none block mb-1 truncate">Workspace Modes</span>
        )}
        {PRIMARY_LINKS.map((l) => renderNavItem(l.id, l.label, l.icon))}
      </div>

      {/* Asset Pipelines */}
      <div className={`space-y-0.5 shrink-0 ${isCollapsed ? "w-11 items-center flex flex-col" : "w-full"}`}>
        {!isCollapsed && (
          <span className="text-[9px] font-mono text-brand-muted/35 uppercase tracking-[0.2em] px-3 select-none block mb-1 truncate">Asset Pipelines</span>
        )}
        {AUXILIARY_LINKS.map((l) => renderNavItem(l.id, l.label, l.icon, l.badge))}
      </div>

      <div className="border-t border-glass w-full shrink-0"></div>

      {/* Sessions list — hidden scrollbar */}
      <div className={`flex-1 overflow-y-auto sidebar-no-scrollbar overflow-x-hidden space-y-1 min-h-0 ${isCollapsed ? "w-11 flex flex-col items-center" : "w-full"}`}>
        <div className={`flex items-center justify-between mb-1.5 w-full ${isCollapsed ? "justify-center" : "px-2"}`}>
          {!isCollapsed && <span className="text-[9px] font-mono text-brand-muted/35 uppercase tracking-[0.2em] truncate min-w-0">Saved Sessions</span>}
          <button
            onClick={onCreateSession}
            className={`flex h-6 w-6 items-center justify-center rounded-lg bg-accent-mint/10 text-accent-mint border border-accent-mint/20 hover:bg-accent-mint/20 hover:border-accent-mint/40 transition-all cursor-pointer shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
            title="Create new active session"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {sessions.length === 0 ? (
          !isCollapsed && (
            <div className="text-center py-3 bg-white/[0.01] rounded-xl border border-dashed border-glass select-none">
              <p className="text-[9px] text-brand-muted/25 italic uppercase font-mono truncate px-2">No active logs</p>
            </div>
          )
        ) : (
          sessions.map((sess) => {
            const isSelected = activeSessionId === sess.id;
            return (
              <div
                key={sess.id}
                className={`group relative flex items-center transition-all duration-200 ease-out cursor-pointer rounded-xl overflow-hidden ${
                  isCollapsed ? "w-11 h-10 p-0 justify-center" : "w-full justify-between px-3 py-2"
                } ${
                  isSelected
                    ? "bg-accent-mint/[0.05] text-accent-mint font-semibold"
                    : "text-brand-muted/55 hover:bg-white/[0.03] hover:text-brand-primary/80"
                }`}
                onClick={() => onSelectSession(sess.id)}
                title={isCollapsed ? (sess.name || "Draft Instruction") : undefined}
              >
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-3 rounded-r bg-accent-mint transition-all duration-200 ${
                  isSelected ? "opacity-80" : "opacity-0 group-hover:opacity-35"
                }`} />
                <div className={`flex items-center overflow-hidden flex-1 ${isCollapsed ? "justify-center" : "gap-2 min-w-0"}`}>
                  <MessageSquare className={`h-3 w-3 shrink-0 ${isSelected ? "text-accent-mint" : "text-brand-muted/30"}`} />
                  {!isCollapsed && (
                    <span className={`truncate text-[11px] tracking-wide min-w-0 ${isSelected ? "font-bold text-accent-mint" : "font-medium"}`}>
                      {sess.name || "Draft Instruction"}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(sess.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-white/25 hover:text-red-400 transition-all ml-1 cursor-pointer shrink-0"
                    title="Delete session"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Settings (bottom) */}
      <div className="pt-1.5 border-t border-glass w-full shrink-0">
        {isCollapsed ? (
          <button
            onClick={() => onOpenSettings("general")}
            className="h-11 w-11 mx-auto rounded-xl bg-brand-secondary/40 hover:bg-brand-secondary/70 hover:text-white border border-glass hover:border-accent-mint/15 flex items-center justify-center transition-all duration-200 group cursor-pointer text-brand-muted/70 hover:scale-105"
            title="Main Settings"
          >
            <Settings className="h-4.5 w-4.5 group-hover:rotate-45 transition-all duration-350 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => onOpenSettings("general")}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-brand-secondary/35 hover:bg-brand-secondary/60 border border-white/[0.04] hover:border-accent-mint/15 text-left transition-all duration-200 cursor-pointer group text-white"
            title="Main Settings and Options"
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.03] border border-glass flex items-center justify-center group-hover:border-accent-mint/25 transition-colors duration-200">
              <Settings className="h-4 w-4 text-brand-muted/70 group-hover:text-white transition-colors duration-200 group-hover:rotate-45 duration-350" />
            </div>
            <div className="flex-1 min-w-0 max-w-full">
              <p className="text-[11px] font-bold text-brand-primary/90 truncate group-hover:text-white transition-colors duration-200 uppercase tracking-wider">System Settings</p>
              <p className="text-[8.5px] font-mono text-brand-muted/40 tracking-wider uppercase mt-0.5 font-semibold truncate">Adjust preferences</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
export { Sidebar };
