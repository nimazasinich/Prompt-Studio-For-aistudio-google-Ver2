/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, HelpCircle, ChevronDown, ChevronUp,
  Sliders, RotateCw, Workflow,
  Radar, GitBranch, BarChart3, MonitorDot, Terminal
} from "lucide-react";
import { EcosystemIntegrationState, PromptDefinition, PromptSession } from "../types";

interface RightUtilityRailProps {
  currentPrompt: PromptDefinition | null;
  activeSession: PromptSession | null;
  isRunningTests: boolean;
  onOptimizeClick: () => void;
  onTriggerSelfCorrection: () => void;
  uiScale: "compact" | "comfortable" | "spacious";
  totalSessionsCount: number;
  integrations: EcosystemIntegrationState;
  preferredModel: string;
  onChangePreferredModel: (model: string) => void;
  onOpenSettings?: () => void;
}

export default function RightUtilityRail({
  currentPrompt,
  activeSession,
  isRunningTests,
  onOptimizeClick,
  onTriggerSelfCorrection,
  uiScale,
  totalSessionsCount,
  integrations,
  preferredModel,
  onChangePreferredModel,
  onOpenSettings
}: RightUtilityRailProps) {
  const clarityScore = currentPrompt?.scores?.clarity ?? 0;
  const constraintsScore = currentPrompt?.scores?.constraintAdherence ?? 0;
  const efficiencyScore = currentPrompt?.scores?.tokenEfficiency ?? 0;
  const edgeCasesScore = currentPrompt?.scores?.edgeCases ?? 0;
  const hasPrompt = !!currentPrompt;

  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [isSubsystemsOpen, setIsSubsystemsOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);
  const [isAgentDetailsOpen, setIsAgentDetailsOpen] = useState(false);

  const constraintsActive = currentPrompt?.systemInstruction ? "Active" : "None";
  const ragActive = (integrations?.googleDrive?.connected || integrations?.notebookLM?.connected) ? "Synced" : "Offline";
  const hasExamples = currentPrompt && currentPrompt.examples && currentPrompt.examples.length > 0;

  const PLATFORM_TOOLS = [
    { name: "CoT Reasoning", status: "Active", color: "text-accent-mint" },
    { name: "Constraint Rails", status: constraintsActive, color: currentPrompt?.systemInstruction ? "text-accent-mint" : "text-brand-muted/40" },
    { name: "Grounding (RAG)", status: ragActive, color: ragActive === "Synced" ? "text-accent-blue" : "text-brand-muted/40" },
    { name: "Few-Shot Core", status: hasExamples ? "Active" : "No Examples", color: hasExamples ? "text-accent-violet" : "text-brand-muted/40" }
  ];

  const tooltipContent: Record<string, { title: string; text: string; breakdown: string }> = {
    clarity: {
      title: "Clarity Index",
      text: "Evaluates how effectively the prompt communicates its role, core task boundaries, and expected output schema.",
      breakdown: "Target schema structural clarity: 100% // Role precision: 95% // Instruction logic: 90%"
    },
    constraints: {
      title: "Constraint Rails",
      text: "Measures compliance to boundaries. Verifies restriction formatting, active exclusions, and negative rules.",
      breakdown: "Intro/greeting prevention: 98% // Format limits: 94% // Safety boundaries: 100%"
    },
    efficiency: {
      title: "Token Economy",
      text: "Analyzes systemic token footprint efficiency, brevity of context triggers, and compression ratios.",
      breakdown: "Few-shot representation: 92% // Redundant words: 91% // Layout compactness: 90%"
    },
    edgeCases: {
      title: "Edge-Case Coverage",
      text: "Checks resilience against complex/malformed inputs, empty values, and systemic error handling paths.",
      breakdown: "Fallback directions: 88% // Noise robustness: 90% // Ambiguity trap protection: 89%"
    }
  };

  const githubMode = integrations?.github?.mode;
  const githubConnected = integrations?.github?.connected;

  const getGitHubStatusLabel = () => {
    if (!githubConnected) return "Not connected";
    if (integrations.github.syncStatus === "connected") {
      return githubMode === "REAL" ? "Synchronized" : "Sandbox Active";
    }
    return integrations.github.syncStatus || "Not connected";
  };

  const activeSubsystemCount = [true, !!currentPrompt?.systemInstruction, ragActive === "Synced", !!hasExamples].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full glass-pane rounded-3xl p-3 select-none justify-between overflow-y-auto shadow-sm relative space-y-3 custom-scrollbar">
      {/* Agent Monitor Header */}
      <div className="flex items-center justify-between border-b border-glass pb-1.5 shrink-0 select-none">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-brand-primary/85 flex items-center gap-1.5">
          <Radar className={`h-3.5 w-3.5 transition-all duration-300 ${hasPrompt ? "text-accent-mint drop-shadow-[0_0_4px_rgba(108,236,200,0.5)]" : "text-brand-muted/40"}`} /> Agent Monitor
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-accent-mint font-extrabold uppercase bg-accent-mint/10 px-1.5 py-0.5 rounded border border-accent-mint/20">
            {hasPrompt ? `${currentPrompt.scores.overall}% Health` : "Draft State"}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            githubConnected && githubMode === "REAL"
              ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
              : githubConnected
                ? "bg-cyan-400/60"
                : "bg-white/10"
          }`}></span>
        </div>
      </div>

      {/* Metrics Audit */}
      <div className="space-y-1.5 shrink-0 relative">
        <div className="flex items-center justify-between select-none">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-muted/50 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-accent-mint" /> Metrics Audit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[9px] relative">
          {[
            { key: "clarity", label: "Clarity", score: clarityScore, gradient: "from-accent-mint to-accent-blue" },
            { key: "constraints", label: "Rails", score: constraintsScore, color: "bg-accent-blue" },
            { key: "efficiency", label: "Token", score: efficiencyScore, color: "bg-accent-violet" },
            { key: "edgeCases", label: "Edges", score: edgeCasesScore, color: "bg-amber-400" },
          ].map((m) => (
            <div
              key={m.key}
              className="space-y-0.5 cursor-help transition-all hover:bg-white/5 p-1 rounded-lg relative border border-transparent hover:border-glass"
              onMouseEnter={() => setHoveredMetric(m.key)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex justify-between text-brand-muted/65 uppercase font-medium">
                <span className="flex items-center gap-0.5">{m.label} <HelpCircle className="h-2.5 w-2.5 opacity-40" /></span>
                <span className="font-mono text-brand-primary/90 font-bold">{hasPrompt ? `${m.score}%` : "—"}</span>
              </div>
              <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${m.gradient ? `bg-gradient-to-r ${m.gradient}` : m.color}`} style={{ width: `${hasPrompt ? m.score : 0}%` }}></div>
              </div>
            </div>
          ))}

          {hoveredMetric && tooltipContent[hoveredMetric] && (
            <div className="absolute left-0 right-0 z-50 p-2.5 bg-brand-secondary/95 border border-glass rounded-xl shadow-2xl backdrop-blur-md animate-fade-in text-[9px] uppercase leading-tight text-brand-muted space-y-1 -top-8">
              <div className="flex items-center gap-1.5 text-accent-mint font-black border-b border-glass pb-1 tracking-wide font-sans">
                <Sparkles className="h-3 w-3 shrink-0" />
                <span>{tooltipContent[hoveredMetric].title}</span>
              </div>
              <p className="text-white/80 lowercase first-letter:uppercase">{tooltipContent[hoveredMetric].text}</p>
              <div className="pt-0.5 text-[7.5px] font-mono text-white/40 leading-snug">
                {tooltipContent[hoveredMetric].breakdown}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Core */}
      <div className="space-y-1 pt-1 border-t border-glass shrink-0 select-none">
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-primary/65 flex items-center gap-1.5 hover:text-white transition-all">
          <BarChart3 className={`h-3.5 w-3.5 transition-all duration-300 ${preferredModel.includes("2.0") ? "text-accent-mint drop-shadow-[0_0_4px_rgba(108,236,200,0.4)]" : "text-accent-violet"}`} /> Benchmark Core
        </span>
        <div className="grid grid-cols-3 gap-1 bg-brand-deep/45 p-0.5 rounded-lg border border-glass">
          {[
            { id: "gemini-2.0-flash", label: "2.0 Flash" },
            { id: "gemini-1.5-pro", label: "1.5 Pro" },
            { id: "gemini-1.5-flash", label: "1.5 Flash" }
          ].map((m) => {
            const isSelected = preferredModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onChangePreferredModel(m.id)}
                className={`text-[8px] font-mono font-bold py-1 rounded-md border cursor-pointer transition-all uppercase text-center ${
                  isSelected
                    ? "bg-accent-mint/10 text-accent-mint border-accent-mint/25 font-black shadow-[0_0_4px_rgba(108,236,200,0.1)]"
                    : "text-brand-muted/45 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordions */}
      <div className="flex-1 space-y-2 min-h-0">
        
        {/* Subsystems */}
        <div className="border border-glass rounded-xl overflow-hidden bg-brand-deep/20 transition-all">
          <button onClick={() => setIsSubsystemsOpen(!isSubsystemsOpen)} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
            <span className="text-[9px] font-mono font-bold text-brand-muted/75 uppercase tracking-wide flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5 text-accent-mint" /> Subsystems
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] font-mono bg-emerald-500/10 text-emerald-300 px-1 py-0.5 rounded uppercase font-semibold">{activeSubsystemCount} Active</span>
              {isSubsystemsOpen ? <ChevronUp className="h-3.5 w-3.5 text-white/40" /> : <ChevronDown className="h-3.5 w-3.5 text-white/40" />}
            </div>
          </button>
          {isSubsystemsOpen && (
            <div className="px-2 pb-2.5 pt-0.5 space-y-1 animate-fade-in">
              {PLATFORM_TOOLS.map((t) => (
                <div key={t.name} className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                  <span className="text-brand-muted/70 font-semibold text-[8px] truncate">{t.name}</span>
                  <span className={`font-mono text-[7.5px] uppercase font-bold tracking-wider ${t.color}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GitHub Sync */}
        <div className="border border-glass rounded-xl overflow-hidden bg-brand-deep/20 transition-all select-none group">
          <button onClick={() => setIsGitHubSyncOpen(!isGitHubSyncOpen)} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
            <span className="text-[9px] font-mono font-bold text-brand-primary/75 uppercase tracking-wide flex items-center gap-1.5 group-hover:text-white transition-colors">
              <GitBranch className={`h-3.5 w-3.5 transition-all duration-300 ${
                githubConnected && githubMode === "REAL" ? "text-accent-mint drop-shadow-[0_0_4px_rgba(108,236,200,0.4)]" : githubConnected ? "text-cyan-400/80" : "text-white/40"
              }`} /> GitHub Sync
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[7.5px] font-mono px-1 py-0.5 rounded uppercase font-semibold border transition-all ${
                githubConnected
                  ? (githubMode === "REAL" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" : "bg-cyan-500/10 text-cyan-300 border-cyan-500/25")
                  : "bg-white/5 text-white/40 border-transparent"
              }`}>
                {githubConnected ? (githubMode === "REAL" ? "CONNECTED" : "SANDBOX") : "Not connected"}
              </span>
              {isGitHubSyncOpen ? <ChevronUp className="h-3.5 w-3.5 text-white/40" /> : <ChevronDown className="h-3.5 w-3.5 text-white/40" />}
            </div>
          </button>
          {isGitHubSyncOpen && (
            <div className="px-2 pb-2.5 pt-0.5 space-y-1.5 animate-fade-in font-mono text-[8px] leading-tight text-brand-muted">
              {githubConnected ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                    <span className="text-white/30 uppercase text-[7.5px]">Repo</span>
                    <span className={`truncate max-w-[110px] font-bold ${githubMode === "SANDBOX" ? "text-cyan-400" : "text-emerald-400"}`}>{integrations.github.repoName || "Not configured"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                    <span className="text-white/30 uppercase text-[7.5px]">Branch</span>
                    <span className="text-white font-semibold">{integrations.github.branch || "Awaiting Credentials"}</span>
                  </div>
                  {integrations.github.lastCommitHash && integrations.github.lastCommitHash !== "No sync history yet" && (
                    <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                      <span className="text-white/30 uppercase text-[7.5px]">Commit</span>
                      <span className="text-[#bfdbfe] font-bold">{integrations.github.lastCommitHash.substring(0, 10)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                    <span className="text-white/30 uppercase text-[7.5px]">Status</span>
                    <span className={`font-bold ${githubMode === "SANDBOX" ? "text-cyan-400" : "text-accent-mint"}`}>{getGitHubStatusLabel()}</span>
                  </div>
                  {integrations.github.syncTime && (
                    <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                      <span className="text-white/30 uppercase text-[7.5px]">Last Sync</span>
                      <span className="text-white/45 font-semibold">{new Date(integrations.github.syncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {onOpenSettings && (
                    <button onClick={onOpenSettings} className="w-full mt-1 py-1 text-[8px] uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded border border-glass text-accent-mint cursor-pointer text-center font-bold">
                      Repository Rails
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-brand-deep/45 p-2 rounded border border-dashed border-glass text-center italic text-white/40 space-y-1.5">
                  <p>Repository is currently unlinked.</p>
                  {onOpenSettings && (
                    <button onClick={onOpenSettings} className="inline-block py-0.5 px-1.5 text-[7px] uppercase font-bold tracking-wider bg-white/5 hover:bg-white/10 text-accent-mint border border-glass rounded cursor-pointer transition-all">
                      Connect in Settings
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Session Details */}
        <div className="border border-glass rounded-xl overflow-hidden bg-brand-deep/45 transition-all">
          <button onClick={() => setIsAgentDetailsOpen(!isAgentDetailsOpen)} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
            <span className="text-[9px] font-mono font-bold text-brand-muted/75 uppercase tracking-wide flex items-center gap-1.5">
              <MonitorDot className="h-3.5 w-3.5 text-accent-blue" /> Session Details
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] font-mono bg-accent-blue/10 text-accent-blue px-1 py-0.5 rounded uppercase font-semibold">
                {activeSession ? "Writable" : "Read-only"}
              </span>
              {isAgentDetailsOpen ? <ChevronUp className="h-3.5 w-3.5 text-white/40" /> : <ChevronDown className="h-3.5 w-3.5 text-white/40" />}
            </div>
          </button>
          {isAgentDetailsOpen && (
            <div className="px-2 pb-2.5 pt-0.5 space-y-1 animate-fade-in font-mono text-[8px] leading-tight text-brand-muted">
              <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                <span className="text-white/30 uppercase text-[7.5px]">Cached sessions</span>
                <span className="text-brand-primary font-black">{totalSessionsCount}</span>
              </div>
              <div className="flex justify-between items-center bg-brand-deep/45 px-2 py-1 rounded border border-glass">
                <span className="text-white/30 uppercase text-[7.5px]">Prompt State</span>
                <span className={`font-bold ${hasPrompt ? "text-emerald-400" : "text-brand-muted/40"}`}>{hasPrompt ? `v${currentPrompt.version} Active` : "No prompt"}</span>
              </div>
              {activeSession && (
                <div className="space-y-1 mt-1">
                  <div className="text-[7.5px] text-white/30 uppercase tracking-widest px-1 block">Active ID:</div>
                  <div className="flex justify-between items-center bg-brand-deep/60 p-1.5 rounded border border-glass select-all text-emerald-400 font-bold">
                    <span className="truncate max-w-[125px]">{activeSession.id.toUpperCase()}</span>
                    <span className="text-[7px] text-brand-muted/40 font-normal">Copyable</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1 pt-1.5 border-t border-glass shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOptimizeClick}
            className="group bg-accent-mint/10 border border-accent-mint/20 hover:bg-accent-mint hover:text-black transition-all py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-accent-mint flex items-center justify-center gap-1 cursor-pointer hover:shadow-[0_0_8px_rgba(108,236,200,0.2)]"
          >
            <Sparkles className="h-3 w-3 group-hover:animate-pulse" /> Optimize
          </button>
          <button
            onClick={onTriggerSelfCorrection}
            className="group bg-accent-blue/10 border border-accent-blue/15 hover:bg-accent-blue/25 hover:text-brand-primary transition-all py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-accent-blue flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCw className="h-3 w-3 bg-transparent group-hover:rotate-180 transition-transform duration-500" /> Force Loop
          </button>
        </div>
        <div className="flex justify-between pt-1 text-[8.5px] text-brand-muted/30 font-mono scale-95 origin-left select-none">
          <span>{activeSession?.updatedAt ? `Synced: ${new Date(activeSession.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : "Sandbox Ready"}</span>
          <span>{hasPrompt ? "Logs: Audited" : "Draft Mode"}</span>
        </div>
      </div>
    </div>
  );
}
