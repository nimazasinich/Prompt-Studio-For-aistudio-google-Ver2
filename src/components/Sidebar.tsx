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
    { id: "workspace", label: "Prompt Workspace", icon: MessageSquare, desc: "Craft & iterate prompts" },
    { id: "testing", label: "AI Testing Core", icon: CheckSquare, desc: "Stress test outputs" },
    { id: "feedback", label: "Feedback Auditor", icon: RefreshCw, desc: "Auto-correct behaviors" },
    { id: "knowledge", label: "Prompt Library", icon: BookOpen, desc: "Reference templates" },
  ];

  const AUXILIARY_LINKS = [
    { id: "assets", label: "Assets Folder", icon: FolderKanban, badge: null },
    { id: "pipelines", label: "Pipelines", icon: Layers, badge: "Beta" },
    { id: "integrations", label: "Integrations Hub", icon: Cloud, badge: null },
  ];

  const renderNavButton = (
    id: string,
    label: string,
    IconComponent: React.ElementType,
    badge?: string | null
  ) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => onChangeTab(id)}
        className={`group relative flex items-center transition-all duration-200 ease-out rounded-xl overflow-hidden leading-none cursor-pointer ${
          isCollapsed 
            ? `w-11 h-11 p-0 justify-center ${
                isActive 
                  ? "bg-[#6CECC8]/[0.07] text-[#6CECC8] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" 
                  : "text-[#9BAAD4]/55 hover:bg-white/[0.04] hover:text-[#EDF2FF]/80"
              }`
            : `w-full justify-between px-2.5 py-2 text-xs tracking-wider uppercase ${
                isActive 
                  ? "bg-[#6CECC8]/[0.05] text-[#6CECC8] font-black" 
                  : "text-[#9BAAD4]/60 hover:bg-white/[0.03] hover:text-[#EDF2FF]/85"
              }`
        }`}
        title={isCollapsed ? label : undefined}
      >
        {/* Left-edge indicator */}
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r transition-all duration-200 ease-out ${
          isActive 
            ? "w-[2px] h-3 bg-[#6CECC8] opacity-100 shadow-[0_0_4px_rgba(108,236,200,0.3)]" 
            : "w-[2px] h-2.5 bg-[#6CECC8]/60 opacity-0 group-hover:opacity-50"
        }`} />

        <div className="flex items-center gap-2.5 w-full min-w-0 pl-1">
          <IconComponent className={`h-4 w-4 shrink-0 transition-all duration-200 ${
            isActive 
              ? "text-[#6CECC8]" 
              : "text-[#9BAAD4]/40 group-hover:text-[#6CECC8]/60"
          }`} />
          {!isCollapsed && (
            <span className="text-[11px] font-bold tracking-wide truncate min-w-0 block">
              {label}
            </span>
          )}
        </div>
        {!isCollapsed && isActive && !badge && (
          <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-[#6CECC8] shadow-[0_0_3px_rgba(108,236,200,0.5)] mr-0.5"></span>
        )}
        {!isCollapsed && badge && (
          <span className="text-[8px] font-mono bg-[#B48FFF]/15 text-[#B48FFF] border border-[#B48FFF]/30 px-1.5 py-0.5 rounded uppercase font-black shrink-0 mr-0.5">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`flex flex-col border-r border-[#6CECC8]/10 bg-[#040910] text-[#EDF2FF] select-none shrink-0 transition-all duration-300 ease-in-out h-screen overflow-x-hidden overflow-y-hidden ${
      isCollapsed ? "w-[68px] p-2 space-y-3.5 items-center" : (isCompact ? "w-[230px] p-3 space-y-2.5" : isSpacious ? "w-[250px] p-5.5 space-y-4" : "w-[235px] p-4 space-y-3.5")
    }`}>
      {/* Brand logo container */}
      <div className={`flex h-14 items-center px-1.5 group select-none shrink-0 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-[#6CECC8] to-[#B48FFF] p-2 flex items-center justify-center shadow-lg hover:rotate-6 transition-all duration-300">
            <Layers className="h-4.5 w-4.5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 max-w-full">
              <span className="text-xs font-space font-extrabold tracking-widest text-[#EDF2FF] block uppercase leading-none truncate">
                PROMPT
              </span>
              <span className="text-[9px] font-mono font-bold text-[#6CECC8] tracking-[0.2em] block uppercase mt-0.5 truncate">
                ARCHITECT
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile/Account identity capsule */}
      <button
        onClick={onAuthClick}
        className={`flex items-center gap-2.5 transition-all duration-250 ease-out shrink-0 cursor-pointer group relative ${
          isCollapsed 
            ? "w-11 h-11 p-0 justify-center rounded-full bg-[#07101F]/80 border border-[#6CECC8]/10 hover:border-[#6CECC8]/25 shadow-[0_1px_6px_rgba(108,236,200,0.04)] hover:shadow-[0_2px_10px_rgba(108,236,200,0.08)] hover:scale-105 active:scale-95" 
            : "w-full px-3 py-2 rounded-2xl bg-[#07101F]/55 border border-white/[0.04] hover:border-[#6CECC8]/15 hover:bg-[#6CECC8]/[0.03] hover:translate-y-[-0.5px] hover:shadow-[0_2px_12px_rgba(108,236,200,0.05)]"
        }`}
        title={currentUser ? `Signed in as ${currentUser.name}` : "Sign In / Profile"}
      >
        <div className={`relative flex items-center justify-center font-bold text-xs shrink-0 rounded-full bg-gradient-to-tr from-[#040910] to-[#0a1525] flex-none transition-all duration-250 ${
          isCollapsed 
            ? "h-8 w-8 ring-1 ring-[#6CECC8]/20 group-hover:ring-[#6CECC8]/35 shadow-[0_0_4px_rgba(108,236,200,0.06)]" 
            : "h-7.5 w-7.5 ring-1 ring-[#6CECC8]/15 group-hover:ring-[#6CECC8]/30 shadow-sm"
        }`}>
          {currentUser ? (
            <span className="font-space font-extrabold text-[#6CECC8] text-[10px] leading-none uppercase tracking-wide">
              {currentUser.name.charAt(0)}
            </span>
          ) : (
            <User className="h-3.5 w-3.5 text-[#6CECC8]/90 group-hover:text-[#6CECC8] transition-all duration-200" />
          )}
          
          {currentUser ? (
            <span className="absolute -bottom-px -right-px h-1.5 w-1.5 rounded-full bg-[#6CECC8] border border-[#040910]"></span>
          ) : (
            <span className="absolute -bottom-px -right-px h-1.5 w-1.5 rounded-full bg-amber-500/70 border border-[#040910]"></span>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0 max-w-full flex flex-col text-left">
            <span className="uppercase text-[10.5px] font-black tracking-wider text-[#EDF2FF] truncate group-hover:text-[#6CECC8] transition-colors duration-200 leading-tight">
              {currentUser ? currentUser.name : "Local Architect"}
            </span>
            <span className="text-[8px] font-mono text-[#9BAAD4]/35 uppercase tracking-widest leading-none mt-1 group-hover:text-[#9BAAD4]/50 transition-colors duration-200 truncate">
              {currentUser ? "Enterprise A" : "Offline Sandbox"}
            </span>
          </div>
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-white/5 w-full shrink-0"></div>

      {/* Main Mode Navigation Section */}
      <div className={`space-y-1 shrink-0 ${isCollapsed ? "w-11 items-center flex flex-col" : "w-full"}`}>
        {!isCollapsed && (
          <span className="text-[9px] font-mono text-[#9BAAD4]/35 uppercase tracking-[0.2em] px-3 select-none block mb-1.5 truncate">
            Workspace Modes
          </span>
        )}
        {PRIMARY_LINKS.map((link) => renderNavButton(link.id, link.label, link.icon))}
      </div>

      {/* Auxiliary Workspace Assets & Pipelines */}
      <div className={`space-y-1 shrink-0 ${isCollapsed ? "w-11 items-center flex flex-col" : "w-full"}`}>
        {!isCollapsed && (
          <span className="text-[9px] font-mono text-[#9BAAD4]/35 uppercase tracking-[0.2em] px-3 select-none block mb-1.5 truncate">
            Asset Pipelines
          </span>
        )}
        {AUXILIARY_LINKS.map((link) => renderNavButton(link.id, link.label, link.icon, link.badge))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 w-full shrink-0"></div>

      {/* Live Active Conversations list */}
      <div className={`flex-1 overflow-y-auto sidebar-no-scrollbar overflow-x-hidden space-y-1 min-h-0 ${isCollapsed ? "w-11 flex flex-col items-center" : "w-full"}`}>
        <div className={`flex items-center justify-between mb-2 w-full ${isCollapsed ? "justify-center" : "px-2"}`}>
          {!isCollapsed && <span className="text-[9px] font-mono text-[#9BAAD4]/35 uppercase tracking-[0.2em] truncate min-w-0">Saved Sessions</span>}
          <button
            onClick={onCreateSession}
            className={`flex h-6 w-6 items-center justify-center rounded-lg bg-[#6CECC8]/10 text-[#6CECC8] border border-[#6CECC8]/20 hover:bg-[#6CECC8]/20 hover:border-[#6CECC8]/40 transition-all cursor-pointer shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
            title="Create new active session"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          !isCollapsed && (
            <div className="text-center py-4 bg-white/[0.01] rounded-xl border border-dashed border-white/5 select-none">
              <p className="text-[9px] text-[#9BAAD4]/25 italic uppercase font-mono truncate px-2">No active logs</p>
            </div>
          )
        ) : (
          sessions.map((sess) => {
            const isSelected = activeSessionId === sess.id;
            return (
              <div
                key={sess.id}
                className={`group relative flex items-center transition-all duration-200 ease-out cursor-pointer rounded-xl overflow-hidden ${
                  isCollapsed ? "w-11 h-11 p-0 justify-center" : "w-full justify-between px-3 py-2.5"
                } ${
                  isSelected
                    ? "bg-[#6CECC8]/[0.04] text-[#6CECC8] font-semibold"
                    : "text-[#9BAAD4]/60 hover:bg-white/[0.03] hover:text-[#EDF2FF]/80"
                }`}
                onClick={() => onSelectSession(sess.id)}
                title={isCollapsed ? (sess.name || "Draft Instruction") : undefined}
              >
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-3.5 rounded-r bg-[#6CECC8] transition-all duration-200 ${
                  isSelected ? "opacity-80" : "opacity-0 group-hover:opacity-40"
                }`} />

                <div className={`flex items-center overflow-hidden flex-1 ${isCollapsed ? "justify-center" : "gap-2 min-w-0"}`}>
                  <MessageSquare className={`h-3 w-3 shrink-0 ${isSelected ? "text-[#6CECC8]" : "text-[#9BAAD4]/30"}`} />
                  {!isCollapsed && (
                    <span className={`truncate text-xs tracking-wide min-w-0 ${isSelected ? "font-bold text-[#6CECC8]" : "font-medium"}`}>
                      {sess.name || "Draft Instruction"}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-white/25 hover:text-red-400 transition-all ml-1.5 cursor-pointer shrink-0"
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

      {/* Settings Section (at bottom) */}
      <div className="pt-2 border-t border-white/5 w-full shrink-0">
        {isCollapsed ? (
          <button
            onClick={() => onOpenSettings("general")}
            className="h-11 w-11 mx-auto rounded-xl bg-[#07101F]/40 hover:bg-[#07101F]/70 hover:text-white border border-white/5 hover:border-[#6CECC8]/15 flex items-center justify-center transition-all duration-200 group cursor-pointer shadow-sm text-[#9BAAD4]/70 hover:scale-105"
            title="Main Settings"
          >
            <Settings className="h-4.5 w-4.5 group-hover:rotate-45 transition-all duration-350 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => onOpenSettings("general")}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#07101F]/35 hover:bg-[#07101F]/65 border border-white/[0.04] hover:border-[#6CECC8]/15 text-left transition-all duration-200 cursor-pointer group shadow-sm text-white"
            title="Main Settings and Options"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-[#6CECC8]/25 transition-colors duration-200">
              <Settings className="h-4 w-4 text-[#9BAAD4]/75 group-hover:text-white transition-colors duration-200 group-hover:rotate-45 duration-350" />
            </div>
            
            <div className="flex-1 min-w-0 max-w-full">
              <p className="text-xs font-bold text-[#EDF2FF]/90 truncate group-hover:text-white transition-colors duration-200 uppercase tracking-wider">
                System Settings
              </p>
              <p className="text-[9px] font-mono text-[#9BAAD4]/40 tracking-wider uppercase mt-0.5 font-semibold truncate">
                Adjust preferences
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
export { Sidebar };
