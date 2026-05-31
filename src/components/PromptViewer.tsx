/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, animate } from "motion/react";
import { 
  Copy, Check, Eye, Variable, ListCollapse, Play, FileText, 
  ChevronDown, History, Star, Compass, ShieldCheck, X, Terminal
} from "lucide-react";
import { PromptDefinition } from "../types";

const RadialCircle = ({ value, title, color }: { value: number; title: string; color: string }) => {
  const [animatedVal, setAnimatedVal] = useState(0);
  const prevValueRef = useRef(0);
  
  useEffect(() => {
    const start = prevValueRef.current;
    const controls = animate(start, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // Custom premium ease-out bezier curve
      onUpdate: (latest) => setAnimatedVal(latest)
    });
    prevValueRef.current = value;
    return () => controls.stop();
  }, [value]);

  const radius = 26;
  const circumference = 2 * Math.PI * radius; // approx 163.36
  const strokeDashoffset = circumference - (animatedVal / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      className="flex flex-col items-center justify-center p-4 glass-pane border border-white/5 rounded-2xl text-center shadow-lg select-all"
    >
      <div className="relative flex items-center justify-center h-20 w-20">
        <svg className="absolute transform -rotate-90 w-20 h-20" viewBox="0 0 64 64">
          {/* Base circle background track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="stroke-white/5 fill-transparent"
            strokeWidth="4"
          />
          {/* Animated Progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="fill-transparent"
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-black font-mono text-[#EDF2FF] select-none">{Math.round(animatedVal)}%</span>
      </div>
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#9BAAD4]/60 mt-3 block">{title}</span>
    </motion.div>
  );
};

interface PromptViewerProps {
  prompt: PromptDefinition | null;
  versionHistory?: PromptDefinition[];
  onSelectVersion?: (p: PromptDefinition) => void;
  onRunTestScenario: (inputs: Record<string, string>) => void;
  isRunningTest: boolean;
}

export default function PromptViewer({ 
  prompt, 
  versionHistory, 
  onSelectVersion, 
  onRunTestScenario, 
  isRunningTest 
}: PromptViewerProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"system" | "template" | "examples" | "schemas">("system");
  const [hydratedPreview, setHydratedPreview] = useState("");
  const [selectedDiagramNode, setSelectedDiagramNode] = useState<string | null>("sys");
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  
  // Custom interactive states for Token Monitor and Export API modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);
  const [quickTestLoadedMsg, setQuickTestLoadedMsg] = useState<string | null>(null);

  // Sync variables empty value when prompt is compiled or toggled
  useEffect(() => {
    const initialInputs: Record<string, string> = {};
    if (prompt) {
      prompt.variables.forEach((v) => {
        initialInputs[v] = "";
      });
      setVariableInputs(initialInputs);
      setHydratedPreview(prompt.userTemplate);
    }
  }, [prompt?.id]);

  // 'Quick Test' smart variable parser & population logic
  const populateFromExample = (ex: { input: string; output: string }) => {
    if (!prompt) return;
    const newInputs: Record<string, string> = {};
    const { variables } = prompt;

    if (variables.length === 1) {
      newInputs[variables[0]] = ex.input;
    } else {
      // Look for quoted attributes inside the sample text
      const quotesMatch = [...ex.input.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
      let isJSON = false;
      try {
        if (ex.input.trim().startsWith("{")) {
          const parsed = JSON.parse(ex.input);
          variables.forEach(v => {
            if (parsed[v] !== undefined) {
              newInputs[v] = typeof parsed[v] === "object" ? JSON.stringify(parsed[v]) : String(parsed[v]);
              isJSON = true;
            }
          });
        }
      } catch (e) {}

      if (!isJSON) {
        if (quotesMatch.length > 0) {
          variables.forEach((v, idx) => {
            if (quotesMatch[idx]) {
              newInputs[v] = quotesMatch[idx];
            } else {
              newInputs[v] = "";
            }
          });
        } else {
          // Fallback splits by delimiter
          const parts = ex.input.split(/[,:|;-]/).map((p: string) => p.trim());
          variables.forEach((v, idx) => {
            newInputs[v] = parts[idx] || (idx === 0 ? ex.input : "");
          });
        }
      }
    }

    // Populate standard parameter fallbacks under evaluation
    variables.forEach((v) => {
      if (!newInputs[v]) {
        if (v === "edge_cases" && !newInputs[v]) {
          newInputs[v] = "Null/Undefined arrays or empty arrays";
        } else if (v === "raw_ledger_data" && !newInputs[v]) {
          newInputs[v] = ex.input;
        } else if (v === "target_fiscal_year" && !newInputs[v]) {
          const yearMatch = ex.input.match(/\b(20\d\d|19\d\d)\b/);
          newInputs[v] = yearMatch ? yearMatch[0] : "2024";
        } else if (v === "code_endpoint" && !newInputs[v]) {
          newInputs[v] = ex.input;
        } else if (v === "vulnerability_scope" && !newInputs[v]) {
          newInputs[v] = "SQL Injection, Route access bypasses";
        } else {
          newInputs[v] = "";
        }
      }
    });

    setVariableInputs(newInputs);

    // Rehydrate user view
    let preview = prompt.userTemplate;
    variables.forEach((v) => {
      preview = preview.replace(new RegExp(`{{\\s*${v}\\s*}}`, "g"), newInputs[v] || `[${v}]`);
    });
    setHydratedPreview(preview);

    setQuickTestLoadedMsg("Loaded example inputs into Compiler Hydrator bottom block!");
    setTimeout(() => setQuickTestLoadedMsg(null), 3000);
  };

  // Real-time token counter calculations
  const countTokens = (text: string) => {
    if (!text) return 0;
    // Core guideline standard formula: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  };

  const sysTokens = prompt ? countTokens(prompt.systemInstruction) : 0;
  const hydratedTemplateTokens = prompt ? countTokens(hydratedPreview || prompt.userTemplate) : 0;
  const examplesIncomingTokens = prompt ? prompt.examples.reduce((arrSum, ex) => {
    return arrSum + countTokens(ex.input) + countTokens(ex.output);
  }, 0) : 0;

  const totalEstimatedTokens = sysTokens + hydratedTemplateTokens + examplesIncomingTokens;

  // Code generation script for standard Node.js Google Gen AI SDK
  const generateCodeSnippet = () => {
    if (!prompt) return "";
    const formattedInputs = JSON.stringify(variableInputs, null, 2);
    const escapedUserTemplate = prompt.userTemplate.replace(/`/g, "\\`").replace(/\${/g, "\\${");
    const escapedSysInstruction = prompt.systemInstruction.replace(/`/g, "\\`").replace(/\${/g, "\\${");

    return `/**
 * Google AI Studio Prompt Deployment Bundle
 * Generated on ${new Date().toISOString()} via Prompt Optimizer
 * 
 * Dependencies:
 *   npm install @google/genai dotenv
 */

import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

// Create the unified GoogleGenAI client (passes 'aistudio-build' telemetry)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "YOUR_API_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

async function runPromptInference() {
  // 1. Dynamic variables payload
  const variables: Record<string, string> = ${formattedInputs};

  // 2. Hydrate variables into instructions template
  let promptContent = \`${escapedUserTemplate}\`;
  Object.entries(variables).forEach(([key, value]) => {
    promptContent = promptContent.replace(new RegExp(\`{{\\\\\\\\s*\${key}\\\\\\\\s*}}\`, 'g'), value);
  });

  console.log("Dispatching instruction-conditioned query to system...");

  // 3. Dispatch structured payload to Google Generative AI
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: ${prompt.examples && prompt.examples.length > 0 ? `[
      ${prompt.examples.map(ex => `{ role: "user", parts: [{ text: ${JSON.stringify(ex.input)} }] },
      { role: "model", parts: [{ text: ${JSON.stringify(ex.output)} }] }`).join(",\n      ")},
      { role: "user", parts: [{ text: promptContent }] }
    ]` : `promptContent`},
    config: {
      systemInstruction: \`${escapedSysInstruction}\`,
      temperature: 0.2, // Balanced factual generation
    }
  });

  console.log("\\n--- GEMINI RESPONSE ---");
  console.log(response.text);
}

runPromptInference().catch(console.error);`;
  };

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center glass-pane border border-white/5 p-12 text-center rounded-3xl h-full min-h-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 animate-pulse border border-emerald-500/20">
          <Eye className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-syne font-black tracking-tight text-[#EDF2FF] uppercase">No Prompt Compiled</h3>
        <p className="max-w-md text-xs text-[#9BAAD4]/70 tracking-wide mt-3 uppercase font-semibold text-center select-none">
          Submit your prompt goal or raw instructions in the chat workspace to compile your first scored template structure.
        </p>
      </div>
    );
  }

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  const handleVariableChange = (varName: string, value: string) => {
    const updated = { ...variableInputs, [varName]: value };
    setVariableInputs(updated);
    
    // Recalculate preview
    let preview = prompt.userTemplate;
    prompt.variables.forEach((v) => {
      preview = preview.replace(new RegExp(`{{\\s*${v}\\s*}}`, "g"), updated[v] || `[${v}]`);
    });
    setHydratedPreview(preview);
  };

  const executeLiveHydrationRun = () => {
    onRunTestScenario(variableInputs);
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col min-h-0 pb-4">
      {/* Version select dropdown & Active metadata bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-pane border border-white/5 px-5 py-3.5 rounded-2xl gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-[#9BAAD4]/50 tracking-widest block">Active Prompt State</span>
            <span className="text-xs font-extrabold uppercase text-[#EDF2FF] tracking-wider flex items-center gap-1.5">
              Version v{prompt.version} Active <span className="h-1.5 w-1.5 rounded-full bg-emerald-555 animate-pulse"></span>
            </span>
          </div>
        </div>

        {versionHistory && versionHistory.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
              className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#EDF2FF] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <span>Previous Versions ({versionHistory.length})</span>
              <ChevronDown className="h-3.5 w-3.5 text-white/50" />
            </button>

            {isVersionDropdownOpen && (
              <div className="absolute right-0 mt-2 z-30 w-64 rounded-xl glass-pane-dark border border-white/5 p-2 shadow-2xl animate-zoom-in">
                <div className="px-2.5 py-1.5 border-b border-white/5 text-[8px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest block mb-1 font-bold">
                  Toggle Version Branches
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {versionHistory.map((v) => {
                    const isCurrent = v.id === prompt.id || v.version === prompt.version;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          onSelectVersion?.(v);
                          setIsVersionDropdownOpen(false);
                        }}
                        className={`w-full text-left rounded-lg p-2.5 flex justify-between items-center transition-all ${
                          isCurrent
                            ? "bg-emerald-500/10 text-emerald-450 font-bold border border-emerald-500/15"
                            : "hover:bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        <div className="overflow-hidden mr-2">
                          <span className="text-[11px] font-mono tracking-wider block font-black">Version v{v.version}</span>
                          <span className="text-[8px] text-white/30 truncate block max-w-[140px] uppercase font-bold tracking-tight">
                            {new Date(v.createdAt).toLocaleDateString()} {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-0.5 shrink-0 font-extrabold">
                          <Star className="h-3 w-3 fill-current text-emerald-500 shrink-0" /> {v.scores.overall}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Counting & SDK Integration Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Dynamic Real-Time Tokens Hub */}
        <div className="glass-pane border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9BAAD4]/60">Real-Time Tokens Monitor</span>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                1 TOK ≈ 4 CHARS
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#EDF2FF] tracking-tight animate-pulse select-none">
                {totalEstimatedTokens.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-[#9BAAD4]/40 uppercase">est. tokens</span>
            </div>

            {/* Structured Token progress gauge bar */}
            <div className="space-y-2 pt-1">
              <div className="flex h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.max(5, (sysTokens / Math.max(1, totalEstimatedTokens)) * 100)}%` }}
                  title={`System Instructions: ${sysTokens} tokens`}
                ></div>
                <div 
                  className="bg-teal-500 transition-all duration-500" 
                  style={{ width: `${Math.max(5, (hydratedTemplateTokens / Math.max(1, totalEstimatedTokens)) * 100)}%` }}
                  title={`Template Layout: ${hydratedTemplateTokens} tokens`}
                ></div>
                <div 
                  className="bg-cyan-500 transition-all duration-500" 
                  style={{ width: `${Math.max(5, (examplesIncomingTokens / Math.max(1, totalEstimatedTokens)) * 100)}%` }}
                  title={`Few-Shot Examples: ${examplesIncomingTokens} tokens`}
                ></div>
              </div>

              {/* Dynamic Legend parameters */}
              <div className="grid grid-cols-3 gap-1 text-[8px] font-mono uppercase text-[#9BAAD4]/50 pt-1 select-none">
                <div className="flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">Sys: <strong className="text-white font-heavy">{sysTokens}</strong></span>
                </div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                  <span className="truncate flex-1">Temp: <strong className="text-white font-heavy">{hydratedTemplateTokens}</strong></span>
                </div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <span className="truncate flex-1">Ex: <strong className="text-white font-heavy">{examplesIncomingTokens}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] font-mono text-[#9BAAD4]/40 tracking-wider">
            <span>MODEL CALL SLIP COST (FLASH)</span>
            <span className="text-emerald-400 font-extrabold select-none">${((totalEstimatedTokens / 1_000_000) * 0.075).toFixed(6)}</span>
          </div>
        </div>

        {/* Dynamic SDK Generator Bridge */}
        <div className="glass-pane border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 select-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9BAAD4]/60 block">Developer API Bridge</span>
            <h4 className="text-sm font-extrabold uppercase text-[#EDF2FF] tracking-wider font-syne">Google Generative AI SDK</h4>
            <p className="text-[10px] text-[#9BAAD4]/50 leading-relaxed font-semibold uppercase tracking-tight">
              Compile the current scored prompt system instructions, dynamic parameters, and XML few-shot examples into certified deployment code.
            </p>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="w-full mt-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-450 hover:text-emerald-300 font-black font-mono uppercase tracking-widest text-[9px] py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Export deployment snippet</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Diagram flow represent */}
      <div className="rounded-3xl border border-white/5 glass-pane p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 select-none">
          <span className="text-[10px] font-mono font-bold text-[#9BAAD4]/60 uppercase tracking-[0.25em] flex items-center gap-1.5">
            <ListCollapse className="h-4 w-4 text-emerald-500" /> Interactive SVG Compile Blueprint
          </span>
          <span className="text-[9px] font-mono text-emerald-400 tracking-wider uppercase font-bold">Core Flow Sandbox</span>
        </div>

        <div className="flex justify-center bg-[#040910]/45 rounded-2xl p-4 overflow-x-auto border border-white/5">
          <svg width="680" height="150" viewBox="0 0 680 150" className="max-w-full">
            {/* Background Glows */}
            <defs>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Connecting lines */}
            <g className="stroke-white/10" strokeWidth="2">
              <line x1="140" y1="40" x2="190" y2="40" className="stroke-emerald-500/30" />
              <line x1="330" y1="40" x2="380" y2="40" />
              <line x1="140" y1="110" x2="380" y2="110" />
              <line x1="380" y1="40" x2="380" y2="110" strokeWidth="1" />
              <line x1="520" y1="75" x2="570" y2="75" className="stroke-emerald-500/40" strokeDasharray="4 2" />
            </g>

            {/* Glowing active line animations */}
            <circle cx="210" cy="40" r="2.5" className="fill-emerald-400 animate-pulse" />

            {/* 1. SYSTEM CARD */}
            <g
              onClick={() => setSelectedDiagramNode("sys")}
              className="cursor-pointer group select-none"
            >
              <rect
                x="10"
                y="15"
                width="130"
                height="50"
                rx="10"
                className={`transition-all duration-300 ${
                  selectedDiagramNode === "sys"
                    ? "fill-white/10 stroke-emerald-500 stroke-2"
                    : "fill-black/40 stroke-white/10 hover:stroke-white/30"
                }`}
              />
              <text x="22" y="38" className="fill-white font-sans text-[10px] font-extrabold uppercase tracking-wider">System Rails</text>
              <text x="22" y="52" className="fill-emerald-400 text-[8px] font-mono uppercase tracking-wider">v{prompt.version} active</text>
            </g>

            {/* 2. USER TEMPLATE CARD */}
            <g
              onClick={() => setSelectedDiagramNode("temp")}
              className="cursor-pointer group select-none"
            >
              <rect
                x="190"
                y="15"
                width="140"
                height="50"
                rx="10"
                className={`transition-all duration-300 ${
                  selectedDiagramNode === "temp"
                    ? "fill-white/10 stroke-emerald-500 stroke-2"
                    : "fill-black/40 stroke-white/10 hover:stroke-white/30"
                }`}
              />
              <text x="202" y="38" className="fill-white font-sans text-[10px] font-extrabold uppercase tracking-wider">User Template</text>
              <text x="202" y="52" className="fill-emerald-400 text-[8px] font-mono uppercase tracking-wider">{prompt.variables.length} parameters</text>
            </g>

            {/* 3. XML FEW SHOT CARD */}
            <g
              onClick={() => setSelectedDiagramNode("few")}
              className="cursor-pointer group select-none"
            >
              <rect
                x="10"
                y="85"
                width="130"
                height="50"
                rx="10"
                className={`transition-all duration-300 ${
                  selectedDiagramNode === "few"
                    ? "fill-white/10 stroke-emerald-500 stroke-2"
                    : "fill-black/40 stroke-white/10 hover:stroke-white/30"
                }`}
              />
              <text x="22" y="108" className="fill-white font-sans text-[10px] font-extrabold uppercase tracking-wider">Few-Shot XML</text>
              <text x="22" y="122" className="fill-emerald-400 text-[8px] font-mono uppercase tracking-wider">{prompt.examples.length} static pairs</text>
            </g>

            {/* 4. UNIFIED CONTEXT POOL */}
            <g
              onClick={() => setSelectedDiagramNode("pool")}
              className="cursor-pointer group select-none"
            >
              <rect
                x="380"
                y="45"
                width="140"
                height="60"
                rx="10"
                className={`transition-all duration-300 ${
                  selectedDiagramNode === "pool"
                    ? "fill-emerald-950/40 stroke-emerald-500 stroke-2"
                    : "fill-black/40 stroke-white/10 hover:stroke-white/30"
                }`}
              />
              <text x="392" y="72" className="fill-white font-sans text-[10px] font-extrabold uppercase tracking-wider">Hydrated Payload</text>
              <text x="392" y="86" className="fill-emerald-400 text-[8px] font-mono uppercase tracking-wider">Auto-prefixed sequence</text>
            </g>

            {/* 5. MODEL INFERENCE RESULT */}
            <g
              onClick={() => setSelectedDiagramNode("out")}
              className="cursor-pointer group select-none"
            >
              <rect
                x="570"
                y="50"
                width="100"
                height="50"
                rx="10"
                className={`transition-all duration-300 ${
                  selectedDiagramNode === "out"
                    ? "fill-white/10 stroke-emerald-400 stroke-2"
                    : "fill-black/60 stroke-white/10"
                }`}
              />
              <text x="580" y="75" className="fill-emerald-400 font-sans text-[10px] font-black uppercase tracking-wider">Output API</text>
              <text x="580" y="88" className="fill-white/30 text-[7px] font-mono uppercase">AI Studio</text>
            </g>
          </svg>
        </div>

        {/* Diagram explanation block */}
        <div className="mt-4 rounded-2xl bg-[#040910]/45 p-4 text-xs border border-white/5 text-[#EDF2FF]/90 select-text">
          {selectedDiagramNode === "sys" && (
            <p>
              <strong className="text-emerald-450 font-sans font-bold uppercase text-[10px] tracking-wider block mb-1">System Rule-Rails:</strong>
              The structural foundation of Gemini instruction. Configures the strict AI boundaries, target output schema variables, constraints, and separating parameters.
            </p>
          )}
          {selectedDiagramNode === "temp" && (
            <p>
              <strong className="text-emerald-450 font-sans font-bold uppercase text-[10px] tracking-wider block mb-1">Dynamic User Template:</strong>
              Standard query structures embedded with variables (curly brackets) allowing the host user application or script to dynamically feed variables.
            </p>
          )}
          {selectedDiagramNode === "few" && (
            <p>
              <strong className="text-emerald-450 font-sans font-bold uppercase text-[10px] tracking-wider block mb-1">XML Examples Mapping:</strong>
              Preconditioning samples utilizing paired tagging models (Input/Expected Output) to lock formatting constraints securely in place.
            </p>
          )}
          {selectedDiagramNode === "pool" && (
            <p>
              <strong className="text-emerald-450 font-sans font-bold uppercase text-[10px] tracking-wider block mb-1">Prompt Grounding Context:</strong>
              Direct assembly layer that marries reference documentation parameters from linked files (Google Drive, NotebookLM) with instructions before dispatch.
            </p>
          )}
          {selectedDiagramNode === "out" && (
            <p>
              <strong className="text-emerald-450 font-sans font-bold uppercase text-[10px] tracking-wider block mb-1">Google AI Studio Target:</strong>
              The finished output ready to be copied into AI Studio panels, or deployed via standard REST API endpoints securely.
            </p>
          )}
        </div>
      </div>

      {/* Primary tab display containing current prompt details */}
      <div className="rounded-3xl border border-white/5 glass-pane p-5 shadow-sm space-y-4 select-none">
        <div className="flex border-b border-white/5 font-sans">
          {[
            { id: "system", label: "System Instruction" },
            { id: "template", label: "User Template" },
            { id: "examples", label: `Few-Shot Examples (${prompt.examples.length})` },
            { id: "schemas", label: "Evaluation & Grades" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-3 text-xs uppercase font-extrabold tracking-wider text-center transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-b-2 border-emerald-500 text-[#EDF2FF]"
                  : "text-[#9BAAD4]/60 hover:text-[#EDF2FF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab display contents */}
        <div className="pt-2">
          {activeTab === "system" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9BAAD4]/50 uppercase tracking-widest">Compiled System Instruction Block</span>
                <button
                  onClick={() => handleCopyText(prompt.systemInstruction, "sys")}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold text-black bg-emerald-500 hover:bg-emerald-450 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer tactile-glow"
                >
                  {copiedSection === "sys" ? (
                    <>
                      <Check className="h-3 w-3 text-black" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy to AI Studio</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-5 rounded-2xl bg-[#040910]/75 text-emerald-400 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-white/5 select-all font-semibold shadow-inner">
                {prompt.systemInstruction}
              </pre>
            </div>
          )}

          {activeTab === "template" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9BAAD4]/50 uppercase tracking-widest">Context Template Structure</span>
                <button
                  onClick={() => handleCopyText(prompt.userTemplate, "user")}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold text-black bg-emerald-500 hover:bg-emerald-450 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer tactile-glow"
                >
                  {copiedSection === "user" ? (
                    <>
                      <Check className="h-3 w-3 text-black" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy user layout</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-5 rounded-2xl bg-[#040910]/75 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-white/5 select-all font-semibold shadow-inner">
                {prompt.userTemplate}
              </pre>
            </div>
          )}

          {activeTab === "examples" && (
            <div className="space-y-4">
              {quickTestLoadedMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-450 text-[10px] font-mono uppercase tracking-wider rounded-xl px-4 py-3 flex items-center justify-between animate-pulse">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    {quickTestLoadedMsg}
                  </span>
                  <span className="text-[8px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">AUTO MATCHED</span>
                </div>
              )}

              {prompt.examples.length === 0 ? (
                <p className="text-xs text-white/40 italic">No examples generated yet.</p>
              ) : (
                prompt.examples.map((ex, index) => (
                  <div key={ex.id || index} className="rounded-2xl border border-white/8 bg-[#040910]/60 overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 text-[10px] font-mono font-bold text-white/50 border-b border-white/8 uppercase tracking-widest flex justify-between items-center select-none">
                      <span>Example Pair #{index + 1}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Quick Test populate button */}
                        <button
                          onClick={() => populateFromExample(ex)}
                          className="text-[#6CECC8] hover:text-[#6CECC8]/80 hover:bg-[#6CECC8]/10 border border-[#6CECC8]/20 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 font-mono uppercase tracking-wider cursor-pointer"
                          title="Populate compiler values dynamically"
                        >
                          <Play className="h-3 w-3 fill-current text-current" />
                          <span>Quick Test</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(`<user_query>\n${ex.input}\n</user_query>\n<ideal_response>\n${ex.output}\n</ideal_response>`, `ex-${index}`)}
                          className="hover:text-white text-[#9BAAD4] transition-all font-mono uppercase tracking-wider px-3 py-1.5 border border-white/8 rounded-lg bg-white/5 cursor-pointer text-[9px]"
                        >
                          {copiedSection === `ex-${index}` ? "Copied Example!" : "Copy XML Couple"}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/8 text-xs font-mono">
                      <div className="p-4 bg-black/40">
                        <span className="text-[9px] text-[#68789F] font-bold uppercase block mb-2">Input Sample</span>
                        <div className="text-white/80 whitespace-pre-wrap leading-relaxed font-semibold">{ex.input}</div>
                      </div>
                      <div className="p-4 bg-[#6CECC8]/5">
                        <span className="text-[9px] text-[#6CECC8] font-bold uppercase block mb-2">Target Response</span>
                        <div className="text-[#6CECC8]/90 whitespace-pre-wrap leading-relaxed font-semibold">{ex.output}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "schemas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
              {/* Radial Metrics animating columns */}
              <div className="grid grid-cols-2 gap-4">
                <RadialCircle value={prompt.scores.clarity} title="Clarity Score" color="#6CECC8" />
                <RadialCircle value={prompt.scores.constraintAdherence} title="Limits Guard" color="#79AEFF" />
                <RadialCircle value={prompt.scores.edgeCases} title="Edge Conditions" color="#FFBA6A" />
                <RadialCircle value={prompt.scores.tokenEfficiency} title="Token Margins" color="#B48FFF" />
              </div>

              {/* Feedback Texts */}
              <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/8 text-xs">
                <span className="text-[10px] font-mono text-[#9BAAD4] uppercase tracking-widest block">Qualitative Assessment</span>
                <div className="space-y-3.5 border-l-2 border-[#6CECC8] pl-4">
                  <p className="text-white font-bold uppercase tracking-wider font-sans">Diagnosis Breakdown:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/70 leading-relaxed font-medium uppercase text-[10px] tracking-tight">
                    <li><strong className="text-white uppercase mr-1">Clarity:</strong> {prompt.scoringFeedback.clarity}</li>
                    <li><strong className="text-white uppercase mr-1">Limits:</strong> {prompt.scoringFeedback.constraintAdherence}</li>
                    <li><strong className="text-white uppercase mr-1">Edge conditions:</strong> {prompt.scoringFeedback.edgeCases}</li>
                    <li><strong className="text-white uppercase mr-1">Overheads:</strong> {prompt.scoringFeedback.tokenEfficiency}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Dynamic Prompt Hydrator Block */}
      {prompt.variables.length > 0 && (
        <div className="rounded-3xl border border-white/5 glass-pane p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Variable className="h-5 w-5 text-[#6CECC8]" />
            <div>
              <h4 className="text-sm font-bold text-[#EDF2FF] uppercase tracking-wider font-syne">Live Compiler Hydrator</h4>
              <p className="text-[10px] font-mono text-[#9BAAD4]/50 uppercase tracking-widest font-semibold">Inject variables and test compiler structures instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variables input console */}
            <div className="space-y-4 bg-[#040910]/45 p-5 rounded-2xl border border-white/5 select-none">
              <span className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase block tracking-wider">Variable Entries</span>
              {prompt.variables.map((v) => (
                <div key={v} className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-[#EDF2FF]/85 flex items-center justify-between">
                    <span>{v}</span>
                    <span className="text-[8px] font-mono text-[#9BAAD4]/40">{`{{${v}}}`}</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => handleVariableChange(v, e.target.value)}
                    value={variableInputs[v] || ""}
                    placeholder={`Insert custom ${v}...`}
                    className="w-full text-xs rounded-xl glass-pane-input px-4 py-2.5 focus:border-[#6CECC8] focus:outline-none text-[#EDF2FF] uppercase tracking-wider font-bold transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Compiled template output console preview */}
            <div className="flex flex-col space-y-3">
              <span className="text-[10px] font-mono text-[#9BAAD4]/40 uppercase tracking-widest block">Hydrated Context Draft Output</span>
              <div className="flex-1 p-5 rounded-2xl bg-[#040910]/75 font-mono text-[#6CECC8] text-xs whitespace-pre-wrap max-h-56 overflow-y-auto border border-white/5 select-all font-semibold shadow-inner">
                {hydratedPreview || prompt.userTemplate}
              </div>
              <button
                onClick={executeLiveHydrationRun}
                disabled={isRunningTest}
                className="w-full bg-[#6CECC8] text-black hover:bg-[#6CECC8]/80 transition-all font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none border border-[#6CECC8]/15 cursor-pointer tactile-glow"
              >
                <Play className="h-4 w-4 fill-current text-black" />
                <span>{isRunningTest ? "Running Simulation..." : "Run Simulated Inference"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Gen AI Node.js SDK Export Modal Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none animate-fade-in">
          <div className="relative bg-[#07101F] border border-white/8 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-zoom-in font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4.5 bg-[#040910]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#6CECC8]/15 border border-[#6CECC8]/25 text-[#6CECC8]">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Deployable SDK Client Bundle</h3>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[#6CECC8] mt-0.5">@google/genai TypeScript Boilerplate</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 select-none text-white/50 hover:text-white transition-all cursor-pointer bg-white/5 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Code Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-[11px] text-[#9BAAD4] leading-relaxed uppercase tracking-tight font-medium">
                Copy this fully resolved Node.js snippet. It initializes the official Google Gen AI SDK client, loads variable bindings, structures few-shot preconditioning blocks, and queries the optimized prompt.
              </p>

              <div className="relative rounded-2xl border border-white/8 bg-black overflow-hidden flex flex-col">
                {/* Editor Titlebar */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#040910]/65 border-b border-white/8 text-[9px] font-mono select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6CECC8]/40"></span>
                    <span className="text-white/40 ml-2">prompt_inference_runner.ts</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateCodeSnippet());
                      setApiCopied(true);
                      setTimeout(() => setApiCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[#6CECC8] hover:text-[#6CECC8]/80 font-bold uppercase cursor-pointer text-[10px]"
                  >
                    {apiCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied Snippet!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Editor Window */}
                <pre className="p-5 font-mono text-xs text-white/85 leading-relaxed overflow-x-auto max-h-[40vh] select-all font-semibold">
                  {generateCodeSnippet()}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/8 px-6 py-4 bg-[#040910] flex justify-end">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="bg-[#6CECC8] text-black hover:bg-[#6CECC8]/80 font-black font-mono text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                Close Deployment Bridge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
