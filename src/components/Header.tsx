/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Menu } from "lucide-react";
import { PromptDefinition } from "../types";

interface HeaderProps {
  currentPrompt: PromptDefinition | null;
  apiHealthy: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ 
  currentPrompt, 
  apiHealthy, 
  isSidebarCollapsed = false,
  onToggleSidebar
}: HeaderProps) {
  const overallScore = currentPrompt?.scores?.overall || 94; // Default to 94 if none exists to align with design mockup specs
  const tokenEfficiency = currentPrompt?.scores?.tokenEfficiency ? `${currentPrompt.scores.tokenEfficiency * 123} tokens` : "12.4k";

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-glass pb-2 pt-0.5 select-none gap-2">
      <div className="flex items-center gap-2.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-lg border border-glass bg-white/5 hover:bg-white/10 text-accent-mint transition-all cursor-pointer shadow-sm hover:border-accent-mint/25"
            title={isSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Navigation Sidebar"}
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
        )}
        <div>
          <h1 className="text-base md:text-lg font-space font-extrabold tracking-tight text-brand-primary">
            PROMPT <span className="text-accent-mint font-space font-black">ARCHITECT</span>
            <span className="ml-2 text-[8px] font-mono uppercase tracking-[0.15em] text-brand-muted/40 hidden sm:inline-block">
              v7.0 // AI Studio Glass
            </span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {/* Core connection indicator */}
            <div className="flex items-center gap-1 rounded bg-white/5 border border-glass px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest text-brand-muted/80 select-none">
              <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_4px_#34d399]"></span>
              <span>API: {apiHealthy ? "ACTIVE" : "MOCKED"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between w-full md:w-auto text-right font-space shrink-0 items-center">
        {/* Metric 1 */}
        <div className="flex items-center gap-2 border-r border-glass pr-3">
          <div className="flex flex-col items-end">
            <span className="text-base md:text-lg font-bold leading-none text-accent-mint tracking-tight">
              {overallScore}%
            </span>
            <span className="text-[8px] font-mono text-brand-muted/50 uppercase tracking-widest mt-0.5">Optimized</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-end justify-center">
          <span className="text-base md:text-lg font-semibold leading-none text-brand-primary tracking-tight">
            {tokenEfficiency}
          </span>
          <span className="text-[8px] font-mono text-brand-muted/50 uppercase tracking-widest mt-0.5">Token Footprint</span>
        </div>
      </div>
    </header>
  );
}
