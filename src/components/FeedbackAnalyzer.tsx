/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LifeBuoy, AlertTriangle, Lightbulb, Wand2, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { PromptDefinition } from "../types";

interface FeedbackAnalyzerProps {
  prompt: PromptDefinition | null;
  onAnalyzeFeedback: (originalPrompt: string, pastedOutput: string, expectation: string) => void;
  isAnalyzing: boolean;
  analysisResult: any;
}

export default function FeedbackAnalyzer({
  prompt,
  onAnalyzeFeedback,
  isAnalyzing,
  analysisResult,
}: FeedbackAnalyzerProps) {
  const [originalPromptText, setOriginalPromptText] = useState("");
  const [badOutputText, setBadOutputText] = useState("");
  const [expectationText, setExpectationText] = useState("");

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badOutputText.trim()) return;

    // Use current prompt's system instructions if they don't specify an alternative
    const promptToSend = originalPromptText.trim() || (prompt ? prompt.systemInstruction : "");
    onAnalyzeFeedback(promptToSend, badOutputText, expectationText);
  };

  const loadCurrentPromptIntoInputs = () => {
    if (prompt) {
      setOriginalPromptText(prompt.systemInstruction);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 font-sans lg:h-full lg:max-h-full min-h-0">
      {/* Input Form console */}
      <div className="col-span-1 lg:col-span-2 rounded-3xl border border-glass bg-white/5 p-5 shadow-sm space-y-3 lg:h-full lg:max-h-full flex flex-col min-h-0">
        <div className="flex items-center gap-2 border-b border-glass pb-2.5 select-none shrink-0">
          <LifeBuoy className="h-4.5 w-4.5 text-accent-mint" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Studio Feedback Debugger</h4>
            <p className="text-[9px] font-mono text-white/45 uppercase tracking-widest leading-none mt-0.5">Auto diagnose & patch prompt bugs</p>
          </div>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-3 text-xs flex-1 flex flex-col min-h-0 justify-between">
          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center text-[9px] font-mono uppercase text-brand-muted/50 tracking-widest select-none shrink-0">
              <label>Original System Instruction</label>
              {prompt && (
                <button
                  type="button"
                  onClick={loadCurrentPromptIntoInputs}
                  className="text-accent-mint hover:text-accent-mint/80 font-extrabold cursor-pointer"
                >
                  Load Active Prompt
                </button>
              )}
            </div>
            <textarea
              value={originalPromptText}
              onChange={(e) => setOriginalPromptText(e.target.value)}
              placeholder="Paste original AI Studio instruction here (or leave blank to use active prompt)..."
              className="w-full text-[11px] rounded-xl border border-glass px-3 py-2 font-mono bg-white/5 text-white uppercase placeholder:text-white/20 tracking-wider font-semibold min-h-0 flex-1 resize-none focus:border-accent-mint/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <label className="text-[9px] font-mono uppercase text-brand-muted/50 tracking-widest block select-none shrink-0">Pasted Defective Output (AI Studio Response)</label>
            <textarea
              required
              value={badOutputText}
              onChange={(e) => setBadOutputText(e.target.value)}
              placeholder="Paste the bad, bloated, or buggy response the model returned here..."
              className="w-full text-[11px] rounded-xl border border-glass px-3 py-2 font-mono text-red-400 bg-red-500/5 focus:outline-none min-h-0 flex-1 resize-none focus:border-red-500/20"
            />
          </div>

          <div className="space-y-1 shrink-0">
            <label className="text-[9px] font-mono uppercase text-brand-muted/50 tracking-widest block select-none">Correct Target Expectation / Criteria</label>
            <input
              type="text"
              required
              value={expectationText}
              onChange={(e) => setExpectationText(e.target.value)}
              placeholder="e.g. Needs to output bullet points, of max 20 words, or strictly in JSON format"
              className="w-full text-[11px] rounded-xl border border-glass px-3 py-2 bg-white/5 text-white uppercase placeholder:text-white/20 tracking-wider font-semibold focus:border-accent-mint/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-[#10B981] hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer tactile-glow"
          >
            <Wand2 className="h-4 w-4 shrink-0 text-black" />
            <span>{isAnalyzing ? "Processing Diagnosis Logs..." : "Diagnose & Apply Patch"}</span>
          </button>
        </form>
      </div>

      {/* Reports output panel */}
      <div className="col-span-1 lg:col-span-3 lg:h-full lg:max-h-full flex flex-col min-h-0">
        <div className="rounded-3xl border border-glass bg-white/5 p-5 shadow-sm lg:h-full lg:max-h-full flex flex-col justify-between min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center gap-2 border-b border-glass pb-2.5 select-none shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-accent-mint" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Diagnostic Analysis & Security Re-Writes</h4>
                <p className="text-[9px] font-mono text-white/45 uppercase tracking-widest leading-none mt-0.5">Strategic prompt correction readouts</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 my-auto">
                  <RefreshCw className="h-9 w-9 text-emerald-500 animate-spin" />
                  <p className="text-xs text-white font-bold uppercase tracking-wider animate-pulse">Debugging system instruction limits...</p>
                  <p className="text-[9px] font-mono text-white/40 max-w-sm leading-relaxed uppercase tracking-wider">
                    Analyzing semantic bugs, comparing instruction gaps, and drafting protective structural code changes.
                  </p>
                </div>
              )}

              {!isAnalyzing && !analysisResult && (
                <div className="flex flex-col items-center justify-center py-24 text-center select-none my-auto">
                  <AlertTriangle className="h-10 w-10 text-white/20 mb-2.5" />
                  <p className="text-xs text-white/45 font-bold uppercase tracking-wider">Awaiting evaluation feedback logs</p>
                  <p className="text-[9px] font-mono text-white/30 mt-1.5 max-w-sm uppercase tracking-wider leading-relaxed">
                    Provide original system prompts, paste buggy returns, and run debugger to observe diagnostics and patch models.
                  </p>
                </div>
              )}

              {!isAnalyzing && analysisResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Diagnosis */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/15 text-xs space-y-1.5 leading-relaxed">
                      <span className="font-bold uppercase text-red-400 font-mono text-[9px] tracking-wider block">Observed Bug Behavior</span>
                      <p className="text-white/80 leading-relaxed font-semibold text-[11px]">{analysisResult.diagnosis}</p>
                    </div>

                    {/* Root cause */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-glass text-xs space-y-1.5 leading-relaxed">
                      <span className="font-bold uppercase text-white/40 font-mono text-[9px] tracking-wider block">Instruction Flaw Root Cause</span>
                      <p className="text-white/80 leading-relaxed font-semibold text-[11px]">{analysisResult.rootCause}</p>
                    </div>
                  </div>

                  {/* Applied patches */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs space-y-2">
                    <span className="font-mono font-bold uppercase text-emerald-400 text-[9px] tracking-widest block">Structural Patches Injected</span>
                    <ul className="space-y-1.5 pl-0.5">
                      {analysisResult.suggestedFixes.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-white/80 leading-relaxed font-medium text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mini Diff display */}
                  <div className="space-y-1 select-none">
                    <span className="font-mono font-bold uppercase text-white/30 text-[9px] tracking-widest block">Strategic Prompt Rewriting</span>
                    <div className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[11px] h-20 overflow-y-auto border border-glass leading-relaxed select-all">
                      {analysisResult.patchedPrompt.systemInstruction}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isAnalyzing && analysisResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-white/90 gap-2 mt-3 shrink-0">
              <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Prompt Patched and Saved in Current Session.
              </span>
              <span className="font-mono text-emerald-400 font-bold uppercase text-[9px] tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Refined Grade: {analysisResult.patchedPrompt.scores.overall}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { FeedbackAnalyzer };
