/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { 
  X, Settings, Layout, Cpu, Code2, BarChart2, Shield, Sparkles, 
  Cloud, FolderKanban, Github, Layers, ArrowUpRight, CheckCircle2,
  FileText, GitCommit, GitBranch, RefreshCw, Smartphone, Eye, HelpCircle,
  Activity, Lock
} from "lucide-react";
import { EcosystemIntegrationState, PromptDefinition } from "../types";
import { AppTheme } from "../theme";
import { Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: EcosystemIntegrationState;
  onUpdateIntegrations: (nextState: EcosystemIntegrationState) => void;
  activePrompt: PromptDefinition | null;
  onInjectGroundingContent: (content: string, filename: string) => void;
  onHuggingFaceTemplatePicked: (promptTemplate: any) => void;
  uiScale: "compact" | "comfortable" | "spacious";
  onChangeUiScale: (scale: "compact" | "comfortable" | "spacious") => void;
  appTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  preferredModel: string;
  onChangePreferredModel: (model: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  integrations,
  onUpdateIntegrations,
  activePrompt,
  onInjectGroundingContent,
  onHuggingFaceTemplatePicked,
  uiScale,
  onChangeUiScale,
  appTheme,
  onChangeTheme,
  preferredModel,
  onChangePreferredModel
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "preferences" | "modelCores" | "safetyAnalytics" | "cloudDrive" | "devGitHub"
  >("preferences");

  // GitHub integration auxiliary states
  const [gitCommitMsg, setGitCommitMsg] = useState("");
  const [gitBranch, setGitBranch] = useState("main");
  const [selectedDriveFileId, setSelectedDriveFileId] = useState<string | null>(null);
  const [selectedNotebookNotesId, setSelectedNotebookNotesId] = useState<string | null>(null);

  // Multi-stage connection flows states
  const [driveAuthStep, setDriveAuthStep] = useState<"idle" | "oauth_consent" | "retrieving" | "connected">("idle");
  const [notebookSyncStep, setNotebookSyncStep] = useState<"idle" | "syncing" | "connected">("idle");
  const [githubAuthStep, setGithubAuthStep] = useState<"idle" | "authorizing" | "connected">("idle");
  
  const [githubCommitLog, setGithubCommitLog] = useState<string[]>([]);
  const [searchHFQuery, setSearchHFQuery] = useState("");

  // Accordion toggle states inside tabs for advanced categories
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (name: string) => {
    setOpenAccordion(prev => prev === name ? null : name);
  };

  // High-fidelity structures Drive & Notebook files (representing grounding knowledge schemas)
  const GOOGLE_DRIVE_FILES = [
    { id: "gd_policy_gdpr", name: "Client_GDPR_Compliance_Policy.md", size: "24 KB", content: "CRITICAL COMPLIANCE TARGETS:\n- Keep all client data locked within continental boundaries.\n- Delete historic cookies on browser termination.\n- Explicitly cite GDPR article index when answering safety questions." },
    { id: "gd_api_standard", name: "Global_Banking_API_Specifications.json", size: "45 KB", content: "BANKING ROUTER RULES:\n- Use /v3/accounts/transfer endpoint for transactions.\n- Return only explicit ISO standard error strings on rejections.\n- Always guard input parameters securely from code-injection." },
    { id: "gd_support_guide", name: "Support_Escalation_Workflows.txt", size: "12 KB", content: "ESCALATION RAILS:\n- If client asks for standard balance, respond directly.\n- If client asks for manual account audits, transfer cleanly to manager-on-call.\n- Never reveal supervisor personal information." }
  ];

  const NOTEBOOK_LM_PROJECTS = [
    { id: "nlm_marketing", name: "Brand tone & Writing Guidelines", notes: 14, content: "BRAND ATTRIBUTES:\n- Avoid corporate slang or high-pitched sales greetings.\n- Sound polite, minimalist, and objective.\n- Format all support lists as elegant Bullet points." },
    { id: "nlm_tech", name: "Developer Code guidelines", notes: 25, content: "CODE STYLE PRINCIPLES:\n- Prioritize Named imports for type cleanliness.\n- Never write trailing commas inside JSON objects.\n- Embed error fallback states directly." }
  ];

  const GITHUB_PULLABLE_TEMPLATES = [
    { id: "gt_node", name: "Express_CJS_Backend_Template.ts", code: "import express from 'express';\nconst app = express();\n// Rule: Bind exclusively to port 3000\napp.listen(3000, '0.0.0.0', () => console.log('Server runs on port 3000'));", desc: "Production-ready backend with full error handling and port binding." },
    { id: "gt_rect", name: "React_Route_Interceptor.tsx", code: "export function RouteGuard() {\n  const token = localStorage.getItem('auth_token');\n  if (!token) return <Redirect to='/login' />;\n  return <Dashboard />;\n}", desc: "Route protection middleware keeping client state secure." },
    { id: "gt_ledger", name: "SQL_Safe_Ledger_Audits.sql", code: "CREATE TABLE security_logs (\n  id SERIAL PRIMARY KEY,\n  action VARCHAR(255) NOT NULL,\n  ip_address VARCHAR(45),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);", desc: "Structured safe SQL ledger schema protecting transaction queries." }
  ];

  const HUGGING_FACE_TEMPLATES = [
    {
      id: "hf_writer_v2",
      name: "creative-storytelling-assistant-v2",
      author: "prompt-labs-hf",
      downloads: "12k",
      systemInstruction: "You are an award-winning fantasy author. Write content using dense vocabulary, rich environmental descriptions, and slow pacing.",
      userTemplate: "Write a short scene inspired by: {{concept}}",
      variables: ["concept"],
    },
    {
      id: "hf_classifier_v1",
      name: "strict-zero-shot-json-classifier",
      author: "sentence-eval",
      downloads: "24k",
      systemInstruction: "You are a rigid classification machine. Evaluate the input content and output ONLY a valid compact JSON mapping to the requested criteria classes. Do not enclose in markdown backticks or pleasantries.",
      userTemplate: "Classify input: '{{query}}' across categories: {{categories}}",
      variables: ["query", "categories"],
    }
  ];

  // Sync auxiliary connection UI steps if state was reloaded
  React.useEffect(() => {
    if (integrations.googleDrive.connected && driveAuthStep === "idle") {
      setDriveAuthStep("connected");
    } else if (!integrations.googleDrive.connected && driveAuthStep === "connected") {
      setDriveAuthStep("idle");
    }

    if (integrations.notebookLM.connected && notebookSyncStep === "idle") {
      setNotebookSyncStep("connected");
    } else if (!integrations.notebookLM.connected && notebookSyncStep === "connected") {
      setNotebookSyncStep("idle");
    }

    if (integrations.github.connected && githubAuthStep === "idle") {
      setGithubAuthStep("connected");
    } else if (!integrations.github.connected && githubAuthStep === "connected") {
      setGithubAuthStep("idle");
    }
  }, [integrations]);

  if (!isOpen) return null;

  const toggleConnection = (key: keyof EcosystemIntegrationState) => {
    const next = { ...integrations };
    if (key === "googleDrive") {
      next.googleDrive.connected = !next.googleDrive.connected;
      if (!next.googleDrive.connected) {
        next.googleDrive.linkedDocId = undefined;
        next.googleDrive.linkedDocName = undefined;
        next.googleDrive.linkedDocContent = undefined;
        setDriveAuthStep("idle");
      } else {
        setDriveAuthStep("oauth_consent");
      }
    } else if (key === "notebookLM") {
      next.notebookLM.connected = !next.notebookLM.connected;
      if (!next.notebookLM.connected) {
        next.notebookLM.linkedProjectId = undefined;
        next.notebookLM.linkedProjectName = undefined;
        next.notebookLM.linkedContent = undefined;
        setNotebookSyncStep("idle");
      } else {
        setNotebookSyncStep("syncing");
        setTimeout(() => {
          setNotebookSyncStep("connected");
        }, 1200);
      }
    } else if (key === "github") {
      next.github.connected = !next.github.connected;
      if (next.github.connected) {
        next.github.repoName = next.github.repoName || "Not configured";
        next.github.branch = next.github.branch || "Awaiting Credentials";
        setGithubAuthStep("connected");
        next.github.mode = next.github.mode || "SANDBOX";
        setGithubCommitLog(["Sandbox connection initialized", "Awaiting repository configuration"]);
      } else {
        next.github.repoName = undefined;
        next.github.branch = undefined;
        next.github.lastCommitHash = undefined;
        next.github.syncTime = undefined;
        next.github.syncStatus = undefined;
        next.github.mode = undefined;
        setGithubAuthStep("idle");
        setGithubCommitLog([]);
      }
    } else if (key === "huggingFace") {
      next.huggingFace.connected = !next.huggingFace.connected;
    }
    onUpdateIntegrations(next);
  };

  const handleLinkDriveFile = (fileId: string) => {
    const file = GOOGLE_DRIVE_FILES.find(f => f.id === fileId);
    if (!file) return;
    const next = { ...integrations };
    next.googleDrive.linkedDocId = file.id;
    next.googleDrive.linkedDocName = file.name;
    next.googleDrive.linkedDocContent = file.content;
    onUpdateIntegrations(next);
    setSelectedDriveFileId(file.id);
    onInjectGroundingContent(file.content, file.name);
  };

  const handleLinkNotebookProject = (projectId: string) => {
    const proj = NOTEBOOK_LM_PROJECTS.find(p => p.id === projectId);
    if (!proj) return;
    const next = { ...integrations };
    next.notebookLM.linkedProjectId = proj.id;
    next.notebookLM.linkedProjectName = proj.name;
    next.notebookLM.notesCount = proj.notes;
    next.notebookLM.linkedContent = proj.content;
    onUpdateIntegrations(next);
    setSelectedNotebookNotesId(proj.id);
    onInjectGroundingContent(proj.content, proj.name);
  };

  const executeGitHubCommitPush = () => {
    if (!gitCommitMsg.trim() || !activePrompt) return;
    const next = { ...integrations };
    const hash = "sandbox_" + Math.random().toString(36).substr(2, 7);
    next.github.lastCommitHash = hash;
    next.github.syncTime = new Date().toISOString();
    if (!next.github.mode || next.github.mode !== "REAL") {
      next.github.mode = "SANDBOX";
    }
    onUpdateIntegrations(next);
    setGithubCommitLog(prev => [`Pushed commit [${hash}] // ${gitCommitMsg}`, ...prev]);
    setGitCommitMsg("");
  };

  const CONSOLIDATED_TABS = [
    { id: "preferences", label: "General & Appearance", icon: Layout, desc: "Scale typography & UI density" },
    { id: "modelCores", label: "Active Model Cores", icon: Cpu, desc: "Primary LLM routing parameters" },
    { id: "safetyAnalytics", label: "Rules & Security", icon: Shield, desc: "COTs, metrics & fallback rules" },
    { id: "cloudDrive", label: "Google Drive Sync", icon: Cloud, desc: "Grounding files synchronizer" },
    { id: "devGitHub", label: "GitHub & HuggingFace", icon: Github, desc: "Dev pushes & templates pulls" }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center theme-overlay backdrop-blur-md animate-fade-in p-4 select-none">
      <div className="relative w-full max-w-4xl h-[72vh] rounded-3xl theme-modal border border-glass shadow-[0_24px_50px_rgba(0,0,0,0.25)] flex overflow-hidden">
        
        {/* Absolute header-right close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-brand-muted/60 hover:bg-white/5 hover:text-white transition-all border border-glass cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Sidebar Tab Selector with compact header text */}
        <div className="w-[190px] md:w-[220px] bg-brand-deep/70 border-r border-glass flex flex-col p-4 shrink-0 select-none overflow-y-auto">
          <div className="flex items-center gap-2 px-1.5 py-4 border-b border-glass mb-3">
            <Settings className="h-4 w-4 text-accent-mint animate-spin" style={{ animationDuration: "16s" }} />
            <div>
              <span className="text-[10px] font-space font-black tracking-widest text-brand-primary uppercase leading-none block">
                Preferences
              </span>
              <span className="text-[8px] tracking-[0.2em] font-mono text-white/30 uppercase mt-0.5 block leading-none">
                AI Studio Config
              </span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            {CONSOLIDATED_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left flex items-start gap-2.5 rounded-xl border p-2.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-secondary/90 text-accent-mint border-glass shadow-inner"
                      : "text-brand-muted/50 border-transparent hover:bg-white/5 hover:text-brand-primary"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? "text-accent-mint" : "text-brand-muted/40"}`} />
                  <div>
                    <h6 className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-white" : ""}`}>{tab.label}</h6>
                    <p className="text-[8px] text-brand-muted/40 mt-0.5 leading-tight">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="pt-3 border-t border-glass text-center">
            <span className="text-[7.5px] font-mono text-brand-muted/40 uppercase tracking-widest inline-block">SYSTEM HOST: v1.4.1</span>
          </div>
        </div>

        {/* Right Content Pane - unified scroll boundaries */}
        <div className="flex-1 bg-brand-secondary/40 p-6 overflow-y-auto custom-scrollbar flex flex-col min-h-0 text-brand-primary select-text">
          <div className="mb-4 pb-2 border-b border-glass shrink-0 select-none">
            <span className="text-[9px] font-mono font-black text-accent-violet uppercase tracking-[0.2em] bg-accent-violet/10 border border-accent-violet/15 px-2 py-0.5 rounded leading-none inline-block mb-1.5">
              Refined Panel
            </span>
            <h3 className="text-xs font-space font-extrabold uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
              {activeTab === "preferences" && "System & UI Scale Settings"}
              {activeTab === "modelCores" && "Active Model Routing Config"}
              {activeTab === "safetyAnalytics" && "Rules Engine & Compliance Core"}
              {activeTab === "cloudDrive" && "Cloud Grounding Synchronizer"}
              {activeTab === "devGitHub" && "Developer Repositories Sync"}
            </h3>
          </div>

          <div className="flex-1 min-h-0">
            {/* 1. PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="space-y-5 animate-fade-in text-[11px] leading-relaxed text-brand-muted/80">
                <p>Configure primary environment identifiers and default workspace density scales.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold tracking-wider text-brand-primary/60 uppercase">Workspace ID Prefix</label>
                    <input
                      type="text"
                      defaultValue="prompt_workspace_local"
                      className="w-full rounded-xl focus:outline-none px-3.5 py-2.5 bg-brand-deep/60 border border-glass text-brand-primary uppercase tracking-wide font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold tracking-wider text-brand-primary/60 uppercase">System Prompt Instructions Tone</label>
                    <select className="w-full rounded-xl focus:outline-none px-3.5 py-2 bg-brand-deep/60 border border-glass text-brand-primary uppercase tracking-wide font-semibold text-[10px] h-[37px] cursor-pointer">
                      <option>Extremely Rigid / Academic</option>
                      <option>Slightly Editorial / Creative</option>
                      <option>Standard Assistant Default</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold tracking-wider text-brand-primary/60 uppercase block">
                    Interface Appearance
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      { id: "dark" as const, label: "Dark AI Studio Glass", desc: "Deep glass workspace", icon: Moon },
                      { id: "light" as const, label: "Light AI Studio Glass", desc: "Bright premium dashboard", icon: Sun },
                    ]).map((th) => {
                      const isSelected = appTheme === th.id;
                      const Icon = th.icon;
                      return (
                        <div
                          key={th.id}
                          onClick={() => onChangeTheme(th.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                            isSelected
                              ? "bg-accent-mint/10 border-accent-mint/40 text-brand-primary"
                              : "bg-brand-deep/45 border-transparent text-brand-muted/50 hover:bg-brand-deep hover:text-brand-primary"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isSelected ? "text-accent-mint" : "text-brand-muted/40"}`} />
                          <span className="font-bold text-[10px] uppercase tracking-wider">{th.label}</span>
                          <span className="text-[8.5px] opacity-60 font-mono uppercase leading-none">{th.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold tracking-wider text-brand-primary/60 uppercase block">
                    Visual UI Scale Density
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "compact", label: "Compact Mode", desc: "Density-oriented" },
                      { id: "comfortable", label: "Comfortable Mode", desc: "Standard margins" },
                      { id: "spacious", label: "Spacious Mode", desc: "Generous whitespace" }
                    ].map((sc) => {
                      const isSelected = uiScale === sc.id;
                      return (
                        <div
                          key={sc.id}
                          onClick={() => onChangeUiScale(sc.id as any)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-accent-mint/10 border-accent-mint/40 text-brand-primary"
                              : "bg-brand-deep/45 border-transparent text-brand-muted/50 hover:bg-brand-deep hover:text-brand-primary"
                          }`}
                        >
                          <span className="font-bold text-[10px] uppercase tracking-wider">{sc.label}</span>
                          <span className="text-[8.5px] opacity-60 font-mono mt-1 uppercase leading-none">{sc.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compact accordion for font descriptions */}
                <div className="rounded-xl border border-glass bg-brand-deep/30 overflow-hidden">
                  <button 
                    onClick={() => toggleAccordion("fonts")}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-bold text-brand-primary/70 uppercase tracking-wider hover:bg-brand-deep/50"
                  >
                    <span>View Imbedded Font Families</span>
                    <span className="text-[10px] font-mono">{openAccordion === "fonts" ? "[-]" : "[+]"}</span>
                  </button>
                  {openAccordion === "fonts" && (
                    <div className="p-4 border-t border-glass space-y-2 font-mono text-[9px] text-brand-muted/75 uppercase bg-brand-deep/60">
                      <div className="flex justify-between items-center pb-1 border-b border-white/[0.03]">
                        <span>Space Grotesk</span>
                        <span className="text-accent-mint">Titles & Hero Headers</span>
                      </div>
                      <div className="flex justify-between items-center pb-1 border-b border-white/[0.03]">
                        <span>Inter</span>
                        <span className="text-accent-mint">Buttons & Workspace Forms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>JetBrains Mono</span>
                        <span className="text-accent-mint">Strict variables & metrics compile logs</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-deep/40 border border-glass space-y-1.5">
                  <span className="text-[8.5px] font-mono font-bold text-accent-violet uppercase block">Platform State Status</span>
                  <p className="text-[9.5px] leading-relaxed uppercase font-mono text-white/50">
                    Session state persists locally. Connect credentials in the Secrets panel for cloud synchronization.
                  </p>
                </div>
              </div>
            )}

            {/* 2. MODELS */}
            {activeTab === "modelCores" && (
              <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed text-brand-muted/80">
                <p>Choose corresponding primary model routes for prompt generation, evaluations and synthetic scenarios iterations.</p>
                
                <div className="space-y-2">
                  {[
                    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Reasoning Engine)", desc: "Complex logical tasks, high variable density & guardrails verification tests" },
                    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Fast Compile Core)", desc: "Lightning fast validation feedback loops with optimal cost boundaries" },
                    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Legacy Base)", desc: "Standard baseline evaluations metrics matching historical benchmarks" }
                  ].map((m) => {
                    const isSelected = preferredModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onChangePreferredModel(m.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-accent-mint/10 border-accent-mint/35 text-brand-primary"
                            : "bg-brand-deep/45 border-transparent text-brand-muted/65 hover:bg-brand-deep"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 accent-accent-mint"
                        />
                        <div>
                          <p className="font-bold text-[10px] uppercase tracking-wide">{m.name}</p>
                          <p className="text-[8.5px] text-brand-muted/40 mt-1 uppercase font-mono">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Experimental Flags Grouped here elegantly */}
                <div className="p-4 rounded-xl bg-brand-deep/60 border border-glass space-y-3 mt-4">
                  <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase tracking-widest block leading-none">Self-Refinement Synthetic Loops Panel</span>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-brand-primary uppercase tracking-wide text-[10px] flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-accent-mint" /> Self-Correcting synthetic VM
                      </span>
                      <p className="text-[8.5px] text-brand-muted/40 uppercase mt-0.5">
                        Trigger mock code correction loops when metrics drop below 75% thresholds
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-accent-mint h-4 w-4 shrink-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. SAFETY & ANALYTICS */}
            {activeTab === "safetyAnalytics" && (
              <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed text-brand-muted/80">
                <p>Fine-tune security verification criteria, system constraints, COT requirements, and view diagnostic statistics.</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 p-3.5 rounded-2xl bg-brand-deep/60 border border-glass">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-primary uppercase tracking-wide text-[9.5px]">Chain-of-Thought Core</span>
                      <input type="checkbox" defaultChecked className="accent-accent-mint h-3.5 w-3.5 cursor-pointer" />
                    </div>
                    <p className="text-[8px] text-brand-muted/40 uppercase">Enforce structured thinking blocks ahead of prompt answers</p>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-2xl bg-brand-deep/60 border border-glass">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-primary uppercase tracking-wide text-[9.5px]">Strict Safety Shields</span>
                      <input type="checkbox" defaultChecked className="accent-accent-mint h-3.5 w-3.5 cursor-pointer" />
                    </div>
                    <p className="text-[8px] text-brand-muted/40 uppercase">Auto filters instructions matching PII & Google core safety blocks</p>
                  </div>
                </div>

                <div className="bg-brand-deep/30 rounded-xl overflow-hidden border border-glass">
                  <button 
                    onClick={() => toggleAccordion("latency")}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-bold text-brand-primary/70 uppercase tracking-wider hover:bg-brand-deep/50"
                  >
                    <span>Inspect Platform Compiler Latency Metrics</span>
                    <span className="text-[10px] font-mono">{openAccordion === "latency" ? "[-]" : "[+]"}</span>
                  </button>
                  {openAccordion === "latency" && (
                    <div className="p-4 border-t border-glass grid grid-cols-4 gap-2 text-center bg-brand-deep/60">
                      {[
                        { label: "Compiler Latency", val: "—" },
                        { label: "QA Checks Pass", val: "—" },
                        { label: "Token Savings", val: "—" },
                        { label: "Runs Logged", val: "—" }
                      ].map((an) => (
                        <div key={an.label} className="p-2 border border-white/[0.03] bg-black/30 rounded-lg">
                          <span className="text-[7.5px] font-mono text-brand-muted/40 uppercase block truncate">{an.label}</span>
                          <span className="text-[11px] font-bold font-mono text-accent-mint mt-1 block leading-none">{an.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3">
                  <Lock className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] font-mono font-bold text-orange-300 uppercase block">Credentials Safe Protection</span>
                    <p className="text-[8.5px] uppercase font-mono text-white/50 leading-relaxed mt-0.5">
                      Model API requests are proxied across deep backend layers to guarantee third-party keys are invisible inside browser frames.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CLOUD GROUNDING */}
            {activeTab === "cloudDrive" && (
              <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed text-brand-muted/85">
                <p>Authorize cloud storage and import corporate compliance documentation directly for evaluation and context injection.</p>

                {/* Google Drive Connector */}
                <div className="p-4 rounded-xl bg-brand-deep/60 border border-glass">
                  <div className="flex items-center justify-between pb-3.5 border-b border-glass mb-3.5">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4.5 w-4.5 text-accent-mint" />
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">Google Drive Sync</span>
                        <p className="text-[8px] text-white/40 uppercase font-mono leading-none mt-0.5">Synchronize raw compliance policies</p>
                      </div>
                    </div>
                    {integrations.googleDrive.connected ? (
                      <span className="px-2 py-0.5 text-[8px] font-mono leading-none bg-accent-mint/10 text-accent-mint border border-accent-mint/25 rounded-md font-bold uppercase tracking-wider">Connected</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[8px] font-mono leading-none bg-white/5 text-white/40 border border-glass rounded-md font-bold uppercase tracking-wider">Unlinked</span>
                    )}
                  </div>

                  {driveAuthStep === "idle" && (
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-white/30 uppercase">Initiate secure Google Auth scope authorization flow</span>
                      <button
                        onClick={() => setDriveAuthStep("oauth_consent")}
                        className="bg-accent-violet text-black font-black uppercase text-[8px] tracking-widest px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white transition-all font-space"
                      >
                        Authorize portal
                      </button>
                    </div>
                  )}

                  {driveAuthStep === "oauth_consent" && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-lg space-y-2">
                      <div className="text-[9px] uppercase font-mono space-y-1">
                        <p className="text-white">Connecting: <code className="text-amber-400">https://www.googleapis.com/auth/drive.readonly</code></p>
                        <p className="text-white/40">Credentials are secured via HTTP-only server-side cookie structures.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDriveAuthStep("retrieving");
                            setTimeout(() => {
                              const next = { ...integrations };
                              next.googleDrive.connected = true;
                              onUpdateIntegrations(next);
                              setDriveAuthStep("connected");
                            }, 1000);
                          }}
                          className="bg-amber-400 text-black font-extrabold text-[8px] uppercase tracking-wider px-3 py-1 rounded-md cursor-pointer"
                        >
                          Allow Drive Access
                        </button>
                        <button onClick={() => setDriveAuthStep("idle")} className="text-white/50 text-[8px] font-bold uppercase">Cancel</button>
                      </div>
                    </div>
                  )}

                  {driveAuthStep === "retrieving" && (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-400">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>RETRIEVING FILE EMBEDDINGS PROTOCOL...</span>
                    </div>
                  )}

                  {driveAuthStep === "connected" && (
                    <div className="space-y-3">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 text-accent-mint p-2.5 rounded-lg text-[9px] font-mono flex items-center justify-between">
                        <span>Status: <strong className="text-white">Drive Linked (Sandbox)</strong></span>
                        <button 
                          onClick={() => {
                            const next = { ...integrations };
                            next.googleDrive.connected = false;
                            next.googleDrive.linkedDocId = undefined;
                            next.googleDrive.linkedDocName = undefined;
                            next.googleDrive.linkedDocContent = undefined;
                            onUpdateIntegrations(next);
                            setDriveAuthStep("idle");
                          }}
                          className="text-red-400 font-bold uppercase bg-red-400/10 px-2 py-0.5 rounded"
                        >
                          Disconnect
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {GOOGLE_DRIVE_FILES.map((f) => {
                          const isLinked = integrations.googleDrive.linkedDocId === f.id;
                          return (
                            <div
                              key={f.id}
                              onClick={() => handleLinkDriveFile(f.id)}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isLinked ? "bg-accent-mint/10 border-accent-mint/30" : "bg-brand-deep border-glass hover:bg-brand-secondary"
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold truncate text-[10px] text-brand-primary">
                                <FileText className="h-3.5 w-3.5 text-brand-muted/60" />
                                <span className={isLinked ? "text-accent-mint" : ""}>{f.name}</span>
                              </div>
                              <div className="flex justify-between mt-1 text-[8px] text-white/40">
                                <span>{f.size}</span>
                                {isLinked && <span className="text-accent-mint">ACTIVE REFER</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* NotebookLM Connector as sub-accordion block */}
                <div className="p-4 rounded-xl bg-brand-deep/60 border border-glass">
                  <div className="flex items-center justify-between pb-3.5 border-b border-glass mb-3">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4.5 w-4.5 text-accent-violet" />
                      <div>
                        <span className="text-[10px] font-space font-bold text-white uppercase tracking-wide">NotebookLM Guidelines Sync</span>
                        <p className="text-[8px] text-white/40 uppercase font-mono mt-0.5">Parse brand notes assemblies</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleConnection("notebookLM")}
                      className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded-md border cursor-pointer transition-all ${
                        integrations.notebookLM.connected
                          ? "bg-red-400/10 text-red-400 border-red-400/25"
                          : "bg-accent-violet/10 text-accent-violet border-accent-violet/25"
                      }`}
                    >
                      {integrations.notebookLM.connected ? "Disconnect" : "Connect portal"}
                    </button>
                  </div>

                  {integrations.notebookLM.connected && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-left">
                      {NOTEBOOK_LM_PROJECTS.map((proj) => {
                        const isLinked = integrations.notebookLM.linkedProjectId === proj.id;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => handleLinkNotebookProject(proj.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isLinked ? "bg-accent-violet/10 border-accent-violet/30 text-white" : "bg-brand-deep border-glass hover:bg-brand-secondary text-brand-muted/80"
                            }`}
                          >
                            <span className="font-bold text-[10px] block text-brand-primary truncate">{proj.name}</span>
                            <div className="flex justify-between text-[8px] text-white/35 font-mono mt-1">
                              <span>{proj.notes} notes synced</span>
                              {isLinked && <span className="text-accent-violet font-black uppercase">LINKED REF</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. GITHUB & HUGGINGFACE */}
            {activeTab === "devGitHub" && (
              <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed text-brand-muted/85">
                <p>Manage git repositories linkage to commit prompt models, or browse Hugging Face open assemblies to pull parameters.</p>

                {/* Compact elegant GitHub repository setup */}
                <div className="p-4 rounded-xl bg-brand-deep/60 border border-glass">
                  <div className="flex items-center justify-between pb-3.5 border-b border-glass mb-3.5">
                    <div className="flex items-center gap-2">
                      <Github className="h-4.5 w-4.5 text-white" />
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">GitHub Repository Remote</span>
                        <p className="text-[8px] text-white/40 uppercase font-mono mt-0.5">Commit updates to remote branches</p>
                      </div>
                    </div>
                    {integrations.github.connected ? (
                      <span className="px-2 py-0.5 text-[8px] font-mono bg-accent-mint/10 text-accent-mint border border-accent-mint/20 rounded-md font-bold uppercase tracking-wider">Authorized</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[8px] font-mono bg-white/5 text-white/40 border border-glass rounded-md font-bold uppercase tracking-wider">Closed</span>
                    )}
                  </div>

                  {!integrations.github.connected ? (
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-white/30 uppercase">Establish repository mapping for version release control</span>
                      <button
                        onClick={() => toggleConnection("github")}
                        className="bg-accent-mint hover:bg-emerald-400 hover:text-black text-black font-black uppercase text-[8px] tracking-wider px-3 py-1.5 rounded-lg transition-all"
                      >
                        Authorize repository
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-[9px]">
                      <div className="flex justify-between items-center text-white/50">
                        <span>REPOSITORY: <strong className="text-accent-mint">{integrations.github.repoName}</strong></span>
                        <button onClick={() => toggleConnection("github")} className="text-red-400 uppercase font-semibold">Fork close</button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={gitCommitMsg}
                          onChange={(e) => setGitCommitMsg(e.target.value)}
                          placeholder="Short commit summary (e.g., policy constraints revision)..."
                          className="flex-1 bg-brand-deep border border-glass p-2 rounded-lg text-[9px] text-brand-primary"
                        />
                        <button
                          onClick={executeGitHubCommitPush}
                          disabled={!gitCommitMsg.trim()}
                          className="bg-accent-mint hover:bg-[#52cfaa] text-black font-black uppercase text-[8.5px] px-3 py-2 rounded-lg cursor-pointer disabled:opacity-30 self-stretch flex items-center justify-center uppercase font-sans"
                        >
                          Commit & Push
                        </button>
                      </div>

                      {githubCommitLog.length > 0 && (
                        <div className="bg-[#03060b] p-2.5 rounded-lg border border-white/[0.02] max-h-[60px] overflow-y-auto font-mono text-[8.5px] text-brand-muted/50 leading-normal uppercase">
                          {githubCommitLog.map((log, idx) => (
                            <div key={idx} className="truncate">• {log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hugging Face template database query */}
                <div className="p-4 rounded-xl bg-brand-deep/60 border border-glass">
                  <div className="flex items-center justify-between pb-3 border-b border-glass mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-accent-mint" />
                      <div>
                        <span className="text-[10px] font-space font-bold text-white uppercase tracking-wide">Hugging Face System Registry</span>
                        <p className="text-[8px] text-white/40 uppercase font-mono mt-0.5">Scaffold prompts templates directly</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConnection("huggingFace")}
                      className={`px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase rounded-md border cursor-pointer ${
                        integrations.huggingFace.connected ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-accent-mint/10 text-accent-mint border-accent-mint/20"
                      }`}
                    >
                      {integrations.huggingFace.connected ? "Closed" : "Portal open"}
                    </button>
                  </div>

                  {integrations.huggingFace.connected && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={searchHFQuery}
                        onChange={(e) => setSearchHFQuery(e.target.value)}
                        placeholder="Search open templates on HuggingFace registry (e.g., storytelling, classifier)..."
                        className="w-full rounded-lg focus:outline-none p-2 bg-brand-deep border border-glass text-[9.5px] text-white uppercase"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {HUGGING_FACE_TEMPLATES.filter(t => t.name.toLowerCase().includes(searchHFQuery.toLowerCase())).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              onHuggingFaceTemplatePicked(t);
                            }}
                            className="p-2.5 rounded-lg bg-brand-deep border border-glass hover:border-accent-mint/40 hover:bg-accent-mint/5 cursor-pointer transition-all flex justify-between items-center text-[10px] font-sans text-left"
                          >
                            <div>
                              <span className="font-extrabold text-brand-primary uppercase tracking-wide block truncate max-w-[170px]">{t.name}</span>
                              <span className="text-[8px] font-mono text-white/35 uppercase mt-0.5 leading-none block">by {t.author}</span>
                            </div>
                            <span className="text-[8px] font-mono text-accent-mint font-bold bg-accent-mint/10 border border-accent-mint/20 px-1.5 py-0.5 rounded shrink-0 uppercase">
                              {t.downloads} dls
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { SettingsModal };
