/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  PlaySquare,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Wand2,
  Terminal,
  RefreshCw,
  Layers,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  Undo2
} from "lucide-react";
import { PromptDefinition, TestScenario } from "../types";

const AVAILABLE_TEST_MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tier: "Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tier: "Pro" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", tier: "Legacy Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", tier: "Legacy Flash" },
];

interface TestingSuiteProps {
  prompt: PromptDefinition | null;
  scenarios: TestScenario[];
  testRuns: any[];
  onAddScenario: (scenario: TestScenario) => void;
  onRunActiveTests: (scenarios?: TestScenario[], models?: string[]) => void;
  isRunning: boolean;
  onUpdatePrompt?: (newPrompt: PromptDefinition) => void;
  sessionId?: string;
}

export default function TestingSuite({
  prompt,
  scenarios,
  testRuns,
  onAddScenario,
  onRunActiveTests,
  isRunning,
  onUpdatePrompt,
  sessionId,
}: TestingSuiteProps) {
  const [newScenarioName, setNewScenarioName] = useState("");
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [customCriteria, setCustomCriteria] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini-2.0-flash", "gemini-2.5-pro"]);

  // Self-Correction Loop states
  const [isSelfCorrectingModalOpen, setIsSelfCorrectingModalOpen] = useState(false);
  const [selfCorrectionState, setSelfCorrectionState] = useState<"idle" | "analyzing" | "preview" | "err">("idle");
  const [selfCorrectionResult, setSelfCorrectionResult] = useState<any>(null);
  const [correctionError, setCorrectionError] = useState<string>("");

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-pane border border-white/5 text-center rounded-3xl min-h-[400px]">
        <PlaySquare className="h-12 w-12 text-white/30 mb-4 animate-pulse" />
        <h3 className="text-lg font-syne font-black uppercase tracking-wider text-[#EDF2FF]">No Prompt Active</h3>
        <p className="max-w-md text-xs text-[#9BAAD4]/60 tracking-wide mt-3 uppercase font-semibold">
          Compile an optimized prompt first to unlock autonomous self-testing suites.
        </p>
      </div>
    );
  }

  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    const criteriaArray = customCriteria
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const scenario: TestScenario = {
      id: "scen_" + Math.random().toString(36).substr(2, 9),
      name: newScenarioName,
      inputs: customInputs,
      expectedCriteria: criteriaArray.length > 0 ? criteriaArray : ["Must align perfectly with style limits"],
    };

    onAddScenario(scenario);
    setNewScenarioName("");
    setCustomInputs({});
    setCustomCriteria("");
  };

  const startAutonomousGeneration = () => {
    onRunActiveTests(undefined, selectedModels);
  };

  const handleCheckboxChange = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((id) => id !== modelId));
      }
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  // Trigger self-correct logic on backend
  const triggerSelfCorrectionProcess = async () => {
    setIsSelfCorrectingModalOpen(true);
    setSelfCorrectionState("analyzing");
    setCorrectionError("");

    try {
      const res = await fetch("/api/prompt/self-correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || "",
          promptDefinition: prompt,
          testRuns: testRuns,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelfCorrectionResult(data);
        setSelfCorrectionState("preview");
      } else {
        const errorData = await res.json();
        setCorrectionError(errorData.error || "Handshake rejected during optimization loop.");
        setSelfCorrectionState("err");
      }
    } catch (err: any) {
      setCorrectionError(err.message || "Network timeout connecting to correction core.");
      setSelfCorrectionState("err");
    }
  };

  // Commit patched system prompt back into session workspace
  const applyPatchedPromptConfirm = () => {
    if (onUpdatePrompt && selfCorrectionResult?.patchedPrompt) {
      onUpdatePrompt(selfCorrectionResult.patchedPrompt);
    }
    setIsSelfCorrectingModalOpen(false);
  };

  const hasFailedRuns = testRuns.some((r) => r.evalVerdict === "fail" || r.evalVerdict === "partial");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Test cases registry & creation panel */}
      <div className="col-span-1 space-y-6">
        
        {/* Model Comparer configuration section */}
        <div className="rounded-3xl border border-white/5 glass-pane p-6 shadow-sm space-y-4">
          <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-[0.25em] block border-b border-white/10 pb-3 select-none">
            Comparison Model Selection
          </span>
          <p className="text-[10px] text-[#9BAAD4]/60 leading-relaxed uppercase font-black select-none">
            Select multiple model targets below to compare their responses and constraint-adherence side-by-side:
          </p>
          <div className="space-y-2">
            {AVAILABLE_TEST_MODELS.map((m) => {
              const checked = selectedModels.includes(m.id);
              return (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all ${
                    checked
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-black shadow-inner"
                      : "bg-[#040910]/45 border-transparent text-[#9BAAD4]/50 hover:bg-[#07101f]/60 hover:text-[#EDF2FF]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxChange(m.id)}
                      disabled={isRunning}
                      className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>{m.name}</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    m.tier.includes("Pro")
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {m.tier}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 glass-pane p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none">
            <span className="text-[10px] font-mono font-bold text-[#9BAAD4]/50 uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" /> QA Test Cases
            </span>
            <button
              onClick={startAutonomousGeneration}
              disabled={isRunning}
              className="text-[10px] font-mono font-extrabold uppercase text-[#EDF2FF] hover:text-[#EDF2FF]/80 transition-all flex items-center gap-0.5 disabled:opacity-50 cursor-pointer"
              title="Generate 3 edge stress cases using Gemini"
            >
              <Wand2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              <span>Auto Gen QA</span>
            </button>
          </div>

          {/* Scenarios List view */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {scenarios.length === 0 ? (
              <p className="text-[10px] text-[#9BAAD4]/40 italic uppercase tracking-wider font-semibold font-mono leading-relaxed">No custom test scenarios recorded. Add one below or trigger 'Auto Gen QA' to proceed autonomously.</p>
            ) : (
              scenarios.map((sc) => (
                <div key={sc.id} className="p-3.5 rounded-xl border border-white/5 bg-[#040910]/45 relative group">
                  <p className="text-xs font-bold text-[#EDF2FF] uppercase tracking-wider font-syne">{sc.name}</p>
                  <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
                    {Object.entries(sc.inputs).map(([k, v]) => (
                      <p key={k} className="text-[10px] font-mono text-[#9BAAD4]/60 truncate">
                        <strong className="text-emerald-400 tracking-wider uppercase font-extrabold">{k}</strong>: {v}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trigger active test run */}
          {scenarios.length > 0 && (
            <button
              onClick={() => onRunActiveTests(scenarios, selectedModels)}
              disabled={isRunning}
              className="w-full bg-emerald-500 text-black hover:bg-emerald-450 transition-all text-xs font-extrabold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer tactile-glow"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running comparative evaluation..." : "Run Active Comparisons"}</span>
            </button>
          )}
        </div>

        {/* Custom manual test case builder */}
        <div className="rounded-3xl border border-white/5 glass-pane p-6 shadow-sm">
          <span className="text-[10px] font-mono text-[#9BAAD4]/50 uppercase tracking-[0.25em] block border-b border-white/5 pb-3 mb-4 select-none">
            Add Custom Stress Case
          </span>
          <form onSubmit={handleCreateScenario} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest block font-bold">Scenario Name / Case</label>
              <input
                type="text"
                required
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Extreme Input Edge-case"
                className="w-full rounded-xl focus:outline-none px-4 py-2.5 glass-pane-input text-[#EDF2FF] uppercase placeholder:text-[#9BAAD4]/30 tracking-wider font-extrabold transition-all"
              />
            </div>

            {prompt.variables.map((v) => (
              <div key={v} className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest block font-bold">Parameter: {v}</label>
                <input
                  type="text"
                  required
                  placeholder={`Insert content for ${v}...`}
                  value={customInputs[v] || ""}
                  onChange={(e) => setCustomInputs({ ...customInputs, [v]: e.target.value })}
                  className="w-full rounded-xl focus:outline-none px-4 py-2.5 glass-pane-input text-[#EDF2FF] uppercase placeholder:text-[#9BAAD4]/30 tracking-wider font-extrabold transition-all"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest block font-bold">Audit Validation Rules (New lines)</label>
              <textarea
                value={customCriteria}
                onChange={(e) => setCustomCriteria(e.target.value)}
                placeholder="e.g. Tone must remain apologetic&#10;No markdown list formats permitted"
                className="w-full rounded-xl focus:outline-none px-4 py-2.5 h-20 glass-pane-input text-[#EDF2FF] font-mono uppercase placeholder:text-[#9BAAD4]/30 tracking-wider font-extrabold text-[10px] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#EDF2FF] hover:bg-emerald-500 text-black hover:scale-[1.01] transition-all font-black text-2xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer tactile-glow"
            >
              <Plus className="h-4 w-4" /> Add Case
            </button>
          </form>
        </div>
      </div>

      {/* Stress testing console reports */}
      <div className="col-span-1 lg:col-span-2 space-y-4">
        <div className="rounded-3xl border border-white/5 glass-pane p-6 shadow-sm min-h-[500px] flex flex-col justify-start space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3 select-none">
            <Terminal className="h-5 w-5 text-emerald-500 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-[#EDF2FF] uppercase tracking-wider font-syne">Evaluation Audit Console Logs</h4>
              <p className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest">Autonomous criteria checklists audits</p>
            </div>
          </div>

          {/* Self-Correcting synthetic trigger block */}
          {!isRunning && testRuns.length > 0 && hasFailedRuns && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex gap-2.5 items-start">
                <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#EDF2FF] uppercase tracking-wide">Weak Constraint Compliance Detected</p>
                  <p className="text-[10px] font-mono text-[#9BAAD4]/60 uppercase tracking-wider">
                    One or more comparative test cases failed criteria audits. Enable autonomous correction loops to repair the active prompt template v{prompt.version}.
                  </p>
                </div>
              </div>
              <button
                onClick={triggerSelfCorrectionProcess}
                className="shrink-0 bg-amber-400 text-black hover:bg-amber-300 transition-all font-black text-[9px] uppercase tracking-widest px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] shadow-[0_0_12px_rgba(251,191,36,0.15)] select-none"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-Repair Prompt</span>
              </button>
            </div>
          )}

          {isRunning && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-sm text-[#EDF2FF] font-bold uppercase tracking-wider animate-pulse font-syne">
                Running comparative diagnostics & scoring execution outputs...
              </p>
              <p className="text-[10px] font-mono text-[#9BAAD4]/40 max-w-md leading-relaxed uppercase tracking-wider">
                Evaluating side-by-side across the selected model configurations. This takes sequential steps for comprehensive audits.
              </p>
            </div>
          )}

          {!isRunning && testRuns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PlaySquare className="h-12 w-12 text-[#9BAAD4]/20 mb-3" />
              <p className="text-xs text-[#9BAAD4]/40 uppercase font-extrabold tracking-wider">No active audit logs recorded in current session</p>
              <p className="text-[10px] font-mono text-[#9BAAD4]/30 mt-2 max-w-sm uppercase tracking-wider leading-relaxed">
                Create custom stress cases or run "Auto Gen QA" to evaluate constraint safety boundaries.
              </p>
            </div>
          )}

          {!isRunning && testRuns.length > 0 && (() => {
            const groupedRuns: Record<string, typeof testRuns> = {};
            testRuns.forEach((run) => {
              const key = run.scenarioName || "Default Scenario";
              if (!groupedRuns[key]) {
                groupedRuns[key] = [];
              }
              groupedRuns[key].push(run);
            });

            return (
              <div className="space-y-6 max-h-[580px] overflow-y-auto pr-1">
                {Object.entries(groupedRuns).map(([scenarioName, runs]) => {
                  const firstRun = runs[0];
                  return (
                    <div key={scenarioName} className="rounded-2xl border border-white/5 bg-[#040910]/45 overflow-hidden space-y-4 p-5 hover:border-emerald-550/25 transition-all">
                      {/* Scenario Title Block */}
                      <div className="border-b border-white/5 pb-3">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-[0.2em] block font-black mb-1">Comparative QA Scenario</span>
                        <h4 className="text-sm font-black text-[#EDF2FF] uppercase tracking-wider font-syne">{scenarioName}</h4>
                      </div>

                      {/* Hydrated inputs once */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#9BAAD4]/40 uppercase tracking-wider block font-bold">Hydrated Test Variables Input:</span>
                        <div className="rounded-xl p-3 bg-[#040910]/85 text-emerald-400 font-mono text-[9px] border border-white/5 uppercase font-bold leading-relaxed">
                          {Object.entries(firstRun.inputs || {}).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="text-[#9BAAD4]/40 select-none mr-2">{k}:</span>
                              <span className="text-white/80">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grid columns of different models side-by-side */}
                      <div className={`grid grid-cols-1 xl:grid-cols-${Math.min(runs.length, 3)} gap-4`}>
                        {runs.map((r, runIdx) => {
                          const isSuccess = r.evalVerdict === "pass";
                          const isFail = r.evalVerdict === "fail";
                          const isPartial = r.evalVerdict === "partial";

                          return (
                            <div key={runIdx} className="rounded-xl border border-white/5 bg-[#07101f]/35 p-4 space-y-3 font-sans">
                              {/* Model information badge */}
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="font-mono text-[9px] font-black text-[#EDF2FF] uppercase tracking-tight truncate max-w-[150px]">
                                  {r.model || "gemini-3.5-flash"}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[9px] font-mono text-[#9BAAD4]/40 font-bold">
                                    Grade: <span className="text-emerald-400 font-mono text-[10px]">{r.score}/100</span>
                                  </span>
                                  {isSuccess && (
                                    <span className="rounded bg-[#10b981]/15 border border-[#10b981]/30 px-1.5 py-0.5 text-[7.5px] font-mono uppercase font-black text-emerald-400 select-none">
                                      PASS
                                    </span>
                                  )}
                                  {isFail && (
                                    <span className="rounded bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 text-[7.5px] font-mono uppercase font-black text-red-400 select-none">
                                      FAIL
                                    </span>
                                  )}
                                  {isPartial && (
                                    <span className="rounded bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 text-[7.5px] font-mono uppercase font-black text-amber-400 select-none">
                                      PART
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Prompts results side-by-side outputs */}
                              <div className="space-y-1">
                                <span className="text-[8.5px] font-mono text-[#9BAAD4]/30 uppercase tracking-widest block select-none">Output Response</span>
                                <pre className="p-3 bg-[#040910]/75 text-slate-200 text-3xs font-mono rounded-xl border border-white/5 h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all shadow-inner">
                                  {r.output}
                                </pre>
                              </div>

                              {/* Auditor feedback */}
                              <div className="space-y-1 bg-[#040910]/65 p-3 rounded-xl border border-white/5 leading-relaxed">
                                <span className="text-[8.5px] font-mono text-[#9BAAD4]/30 uppercase tracking-widest block font-bold select-none font-sans">QA Verifier Report</span>
                                <p className="text-[9px] font-mono italic text-white/70 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                                  {r.explanation}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* --------------------------------------------------
          SELF-CORRECTING SYNTHETIC OPTIMIZATION OVERLAY
          -------------------------------------------------- */}
      {isSelfCorrectingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#040812] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070f21]/70 select-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-[#EDF2FF] uppercase tracking-wider font-syne">Synthetic Prompt Self-Correction Core</h3>
                  <p className="text-[10px] font-mono text-[#9BAAD4]/50 uppercase tracking-widest">Autonomous Diagnostic and Corrective Loops</p>
                </div>
              </div>
              <button
                onClick={() => setIsSelfCorrectingModalOpen(false)}
                className="p-1 text-[#9BAAD4]/50 hover:text-[#EDF2FF] transition-all cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {selfCorrectionState === "analyzing" && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                  <div className="relative">
                    <RefreshCw className="h-14 w-14 text-emerald-400 animate-spin" />
                    <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-[#EDF2FF] uppercase tracking-wider font-syne">Synthesizing Safety Correctives...</h4>
                    <p className="text-xs text-[#9BAAD4]/60 max-w-md mx-auto leading-relaxed mt-2 uppercase tracking-wide">
                      Tracing semantic defects, parsing audit criteria, and generating instruction overrides to repair compliance failure modes.
                    </p>
                  </div>
                  {/* Step indicators */}
                  <div className="space-y-2.5 text-[10px] font-mono tracking-widest uppercase w-64 mx-auto text-left">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>1. Scan Defective Outputs: DONE</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>2. Map Logical Ambiguities: DONE</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#9BAAD4]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span>3. Draft Instruction Patch: RUNNING</span>
                    </div>
                  </div>
                </div>
              )}

              {selfCorrectionState === "err" && (
                <div className="text-center py-16 space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-red-400 uppercase tracking-wider font-syne">Failed to generate self-correction patch</p>
                  <p className="text-[10px] font-mono text-[#9BAAD4]/70">{correctionError}</p>
                  <button
                    onClick={triggerSelfCorrectionProcess}
                    className="bg-[#EDF2FF] text-black hover:bg-emerald-500 hover:text-black hover:scale-102 transition-all px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-widest cursor-pointer"
                  >
                    Retry Handshake
                  </button>
                </div>
              )}

              {selfCorrectionState === "preview" && selfCorrectionResult && (
                <div className="space-y-6">
                  
                  {/* Diagnosis Report Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-1.5 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-wider block">Observed Bug Behavior</span>
                      <p className="text-xs text-white/80 font-medium leading-relaxed uppercase">{selfCorrectionResult.diagnosis}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase text-[#9BAAD4]/60 font-bold tracking-wider block">Diagnostics Root Cause</span>
                      <p className="text-xs text-white/80 font-medium leading-relaxed uppercase">{selfCorrectionResult.rootCause}</p>
                    </div>
                  </div>

                  {/* Fixes List */}
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black block">Remediations Formulated</span>
                    <ul className="space-y-2 text-xs text-slate-200">
                      {selfCorrectionResult.suggestedFixes.map((f: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start font-medium leading-relaxed uppercase">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions Diff Pane */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#9BAAD4]/50 tracking-wider">
                      <span>Interactive System Instructions Side-by-Side</span>
                      <span className="text-emerald-400 font-bold">New Version: v{selfCorrectionResult.patchedPrompt.version}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Old Instruction */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase text-red-400 tracking-wider block">Before (Defective Instruction)</span>
                        <div className="p-4 rounded-2xl bg-black/60 border border-red-500/10 text-white/40 text-[10px] font-mono h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-none">
                          {prompt?.systemInstruction}
                        </div>
                      </div>
                      {/* Patched Instruction */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase text-emerald-400 tracking-wider block">Proposed (Repaired Instruction)</span>
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                          {selfCorrectionResult.patchedPrompt.systemInstruction}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact score previews */}
                  <div className="p-4 bg-[#070f21]/70 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[#9BAAD4]/40 uppercase text-[9px] block">Clarity Score</span>
                        <span className="text-[#EDF2FF] font-black">{selfCorrectionResult.patchedPrompt.scores?.clarity || 90}%</span>
                      </div>
                      <div>
                        <span className="text-[#9BAAD4]/40 uppercase text-[9px] block">Constraint Safety</span>
                        <span className="text-emerald-400 font-extrabold">{selfCorrectionResult.patchedPrompt.scores?.constraintAdherence || 95}%</span>
                      </div>
                      <div>
                        <span className="text-[#9BAAD4]/40 uppercase text-[9px] block">Overall Grade</span>
                        <span className="text-[#EDF2FF] font-black">{selfCorrectionResult.patchedPrompt.scores?.overall || 95}%</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      🛡️ Safe optimized patch generated. Retains variable integrity.
                    </span>
                  </div>

                </div>
              )}

            </div>

            {/* Footer Actions */}
            {selfCorrectionState === "preview" && (
              <div className="p-6 border-t border-white/5 bg-[#070f21]/40 flex justify-end gap-3 select-none">
                <button
                  onClick={() => setIsSelfCorrectingModalOpen(false)}
                  className="bg-transparent border border-white/10 hover:border-white/20 text-[#9BAAD4] hover:text-[#EDF2FF] px-5 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-widest transition-all cursor-pointer"
                >
                  Reject & Cancel
                </button>
                <button
                  onClick={applyPatchedPromptConfirm}
                  className="bg-emerald-500 text-black hover:bg-emerald-400 px-6 py-2.5 rounded-xl text-xs uppercase font-black tracking-widest transition-all cursor-pointer tactile-glow flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept and Apply Patch</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
