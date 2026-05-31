/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Layers, GitFork, ArrowUpRight, CheckCircle2, Play, GitBranch, 
  RefreshCw, Server, ShieldCheck, Activity, Terminal, AlertTriangle
} from "lucide-react";
import { PromptDefinition } from "../types";

interface PipelinesProps {
  prompt: PromptDefinition | null;
  onOptimizeClick: () => void;
}

export default function Pipelines({
  prompt,
  onOptimizeClick
}: PipelinesProps) {
  const [activeStage, setActiveStage] = useState<"dev" | "stage" | "release">("dev");
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    "STREAM_START: Hook established on active workspace",
    "TELEMETRY_PASS: Token counts evaluated within boundaries",
    "SECURITY_SECURED: PII filtering passed structural validation",
    "SYS_REPAIR: No logical infinite branches discovered",
    "COMPILE_PIPELINE: Version status updated strictly as Active Draft"
  ]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  const triggerMockPipelineRun = () => {
    setIsRunningPipeline(true);
    setPipelineLogs(prev => ["SYS_INIT: Instantiating evaluation workers...", ...prev]);
    setTimeout(() => {
      setPipelineLogs(prev => [
        "BENCHMARK_PROMPT: Precision scoring complete - 98.4%",
        "GUARDRAILS_PASS: Semantic jailbreak test - 0 issues found",
        "COMPILE_READY: Packed optimized deployment files correctly",
        "SYS_COMPLETE: Pipeline execution succeeded cleanly",
        ...prev
      ]);
      setIsRunningPipeline(false);
    }, 1500);
  };

  const PIPELINE_STEPS = [
    { title: "Lint & Validate", status: "success", desc: "Verifies tag pairing & braces" },
    { title: "Jailbreak Testing", status: "success", desc: "Simulates adversarial prompts" },
    { title: "Benchmark Evaluation", status: "success", desc: "Runs model verification criteria" },
    { title: "Release Package CJS", status: "pending", desc: "Bundles final instruction set" }
  ];

  const DEPLOYMENT_STREAM = [
    { version: "v1.4.1", status: "LIVE PRODUCTION", date: "Today, 11:24 AM", env: "Global API", author: "Amin Chinisaz" },
    { version: "v1.4.0", status: "ARCHIVED", date: "Yesterday, 4:15 PM", env: "Staging Canary", author: "Amin Chinisaz" },
    { version: "v1.3.9", status: "DELEGATED", date: "May 29, 2026", env: "Internal Test", author: "System AI Auto-Repair" }
  ];

  return (
    <div className="space-y-6 font-sans text-white h-full max-h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
      
      {/* Top Banner Control Panel */}
      <div className="rounded-3xl border border-[#B48FFF]/15 bg-gradient-to-tr from-[#07101F]/90 to-[#B48FFF]/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 select-none">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-black text-[#B48FFF] uppercase tracking-[0.2em] bg-[#B48FFF]/10 border border-[#B48FFF]/20 px-2.5 py-0.5 rounded leading-none inline-block">Enterprise CI/CD Pipelines</span>
          <h4 className="text-sm font-space font-extrabold uppercase tracking-wider text-white">Staged Deployment Stream</h4>
          <p className="text-[10px] text-white/50">Auto-deploy refined prompt revisions straight to cloud-ingress endpoints.</p>
        </div>

        <button 
          onClick={triggerMockPipelineRun}
          disabled={isRunningPipeline}
          className="rounded-xl px-4 py-2.5 bg-[#B48FFF] hover:bg-[#a37ce6] text-black text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer disabled:opacity-40"
        >
          {isRunningPipeline ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current text-black" />
          )}
          <span>{isRunningPipeline ? "Running Pipeline Execut..." : "Trigger Compile Pipeline"}</span>
        </button>
      </div>

      {/* Main body of layout details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Left column: Pipelines Status Timeline */}
        <div className="col-span-1 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col min-h-0">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-4 select-none shrink-0">
            <Layers className="h-5 w-5 text-[#B48FFF]" />
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-wider text-white">CI/CD Run Summary</h5>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5 leading-none">Automated testing validation steps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-0.5 min-h-0">
            
            {/* Steps execution blocks */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-white/35 uppercase tracking-wider block mb-1">Execution Pipeline Chain</span>
              {PIPELINE_STEPS.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#040910]/40 border border-white/5 flex items-start gap-3">
                  <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                    step.status === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-[#B48FFF]/10 border-[#B48FFF]/30 text-[#B48FFF]"
                  }`}>
                    {step.status === "success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    )}
                  </div>
                  <div>
                    <h6 className="text-[11px] font-bold text-white uppercase tracking-wider">{step.title}</h6>
                    <p className="text-[9px] text-white/50 leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timely Deploy history logs */}
            <div className="flex flex-col min-h-0">
              <span className="text-[10px] font-mono text-[#B48FFF]/65 uppercase tracking-wider block mb-2">Live Dev Release Logs</span>
              <div className="flex-1 rounded-xl bg-black/60 p-4 font-mono text-[10px] text-emerald-400 border border-white/5 leading-relaxed overflow-y-auto custom-scrollbar h-52 select-all whitespace-pre-wrap">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-white/[0.02] pb-1 mb-1 font-bold">
                    <span className="text-white/30 mr-1.5">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Target Environments Deployments */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col min-h-0">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-4 select-none shrink-0">
            <Server className="h-5 w-5 text-[#B48FFF]" />
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-wider text-white">Production Alignments</h5>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5 leading-none">Staged model endpoint mapping</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-0.5 min-h-0">
            <div className="p-3.5 rounded-xl border border-dashed border-white/5 select-none text-center">
              <Activity className="h-5 w-5 text-emerald-400 mx-auto mb-2 animate-pulse" />
              <p className="text-[10px] font-bold text-white uppercase tracking-wide">Automatic Sync Status</p>
              <p className="text-[9px] text-[#9BAAD4]/60 uppercase font-mono mt-0.5 leading-relaxed">
                Staged prompts automatically update client wrappers with zero cold starting overhead
              </p>
            </div>

            <span className="text-[10px] font-mono text-white/35 uppercase tracking-wider block select-none">Deployment Staging Register</span>
            
            {DEPLOYMENT_STREAM.map((stream, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#040910]/40 border border-white/5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black font-mono text-white uppercase tracking-wider">{stream.version}</span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-black border ${
                    stream.status === "LIVE PRODUCTION" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse" 
                      : "bg-white/5 border-white/10 text-white/45"
                  }`}>
                    {stream.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-white/50">
                  <span className="font-medium">{stream.env}</span>
                  <span className="font-mono text-white/30">{stream.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
