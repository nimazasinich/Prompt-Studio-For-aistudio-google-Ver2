/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Cloud, FolderKanban, Github, Layers, ArrowUpRight, CheckCircle2, 
  FileText, GitCommit, GitBranch 
} from "lucide-react";
import { EcosystemIntegrationState, PromptDefinition } from "../types";

interface IntegrationsDashboardProps {
  integrations: EcosystemIntegrationState;
  onUpdateIntegrations: (nextState: EcosystemIntegrationState) => void;
  activePrompt: PromptDefinition | null;
  onInjectGroundingContent: (content: string, filename: string) => void;
  onHuggingFaceTemplatePicked: (promptTemplate: any) => void;
}

export default function IntegrationsDashboard({
  integrations,
  onUpdateIntegrations,
  activePrompt,
  onInjectGroundingContent,
  onHuggingFaceTemplatePicked,
}: IntegrationsDashboardProps) {
  const [gitCommitMsg, setGitCommitMsg] = useState("");
  const [gitBranch] = useState("main");
  const [, setSelectedDriveFileId] = useState<string | null>(null);
  const [, setSelectedNotebookNotesId] = useState<string | null>(null);
  const [showRepoTooltip, setShowRepoTooltip] = useState(false);

  // High-fidelity structured Google Drive documents catalog representing grounding assets
  const GOOGLE_DRIVE_FILES = [
    { id: "gd_policy_gdpr", name: "Client_GDPR_Compliance_Policy.md", size: "24 KB", content: "CRITICAL COMPLIANCE TARGETS:\n- Keep all client data locked within continental boundaries.\n- Delete historic cookies on browser termination.\n- Explicitly cite GDPR article index when answering safety questions." },
    { id: "gd_api_standard", name: "Global_Banking_API_Specifications.json", size: "45 KB", content: "BANKING ROUTER RULES:\n- Use /v3/accounts/transfer endpoint for transactions.\n- Return only explicit ISO standard error strings on rejections.\n- Always guard input parameters securely from code-injection." },
    { id: "gd_support_guide", name: "Support_Escalation_Workflows.txt", size: "12 KB", content: "ESCALATION RAILS:\n- If client asks for standard balance, respond directly.\n- If client asks for manual account audits, transfer cleanly to manager-on-call.\n- Never reveal supervisor personal information." }
  ];

  // NotebookLM grounding assets notes
  const NOTEBOOK_LM_PROJECTS = [
    { id: "nlm_marketing", name: "Brand tone & Writing Guidelines", notes: 14, content: "BRAND ATTRIBUTES:\n- Avoid corporate slang or high-pitched sales greetings.\n- Sound polite, minimalist, and objective.\n- Format all support lists as elegant Bullet points." },
    { id: "nlm_tech", name: "Developer Code guidelines", notes: 25, content: "CODE STYLE PRINCIPLES:\n- Prioritize Named imports for type cleanliness.\n- Never write trailing commas inside JSON objects.\n- Embed error fallback states directly." }
  ];

  // Hugging Face community templates
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

  const toggleConnection = (key: keyof EcosystemIntegrationState) => {
    const next = { ...integrations };
    if (key === "googleDrive") {
      next.googleDrive.connected = !next.googleDrive.connected;
      if (!next.googleDrive.connected) {
        next.googleDrive.linkedDocId = undefined;
        next.googleDrive.linkedDocName = undefined;
        next.googleDrive.linkedDocContent = undefined;
      }
    } else if (key === "notebookLM") {
      next.notebookLM.connected = !next.notebookLM.connected;
      if (!next.notebookLM.connected) {
        next.notebookLM.linkedProjectId = undefined;
        next.notebookLM.linkedProjectName = undefined;
        next.notebookLM.linkedContent = undefined;
      }
    } else if (key === "github") {
      next.github.connected = !next.github.connected;
      if (next.github.connected) {
        next.github.repoName = "ai-studio-prompt-templates";
        next.github.branch = "main";
      } else {
        next.github.repoName = undefined;
        next.github.branch = undefined;
        next.github.lastCommitHash = undefined;
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

    // Call callback to inject text content directly to grounding
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
    next.github.lastCommitHash = "git_rev_" + Math.random().toString(36).substr(2, 7);
    onUpdateIntegrations(next);
    setGitCommitMsg("");
  };

  return (
    <div className="space-y-6 font-sans text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Connector Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 select-none">
            <div className="flex items-center gap-2.5">
              <Cloud className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Google Drive Documents</h4>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Ground prompt inputs via assets</p>
              </div>
            </div>
            <button
              onClick={() => toggleConnection("googleDrive")}
              className={`rounded-xl px-4 py-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all border ${
                integrations.googleDrive.connected
                  ? "bg-red-500/15 text-red-400 border-red-500/35"
                  : "bg-emerald-500/10 text-emerald-450 border-emerald-500/25 hover:bg-emerald-500/20"
              }`}
            >
              {integrations.googleDrive.connected ? "Disconnect" : "Connect"}
            </button>
          </div>

          {integrations.googleDrive.connected ? (
            <div className="space-y-3.5">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Drive File Directory browser</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {GOOGLE_DRIVE_FILES.map((f) => {
                  const isLinked = integrations.googleDrive.linkedDocId === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleLinkDriveFile(f.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isLinked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.01]"
                          : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className={`h-4 w-4 shrink-0 ${isLinked ? "text-emerald-400" : "text-white/20"}`} />
                        <span className="truncate text-xs font-semibold uppercase tracking-wider">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono font-medium">{f.size}</span>
                    </div>
                  );
                })}
              </div>

              {integrations.googleDrive.linkedDocId && (
                <div className="bg-emerald-500/5 rounded-xl p-3.5 border border-emerald-500/20 text-[10px] select-all">
                  <p className="font-mono font-bold uppercase tracking-wider text-emerald-400">Linked Grounding Context:</p>
                  <p className="mt-1.5 leading-relaxed text-white/70 font-mono italic">{integrations.googleDrive.linkedDocContent}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center bg-black/40 rounded-2xl text-xs text-white/35 border border-dashed border-white/10 select-none">
              Connection to Google Drive not active. Click "Connect" above to access workspace files.
            </div>
          )}
        </div>

        {/* NotebookLM Connector panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 select-none">
            <div className="flex items-center gap-2.5">
              <FolderKanban className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">NotebookLM Workspace</h4>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Sync structured notes archives</p>
              </div>
            </div>
            <button
              onClick={() => toggleConnection("notebookLM")}
              className={`rounded-xl px-4 py-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all border ${
                integrations.notebookLM.connected
                  ? "bg-red-500/15 text-red-400 border-red-500/35"
                  : "bg-emerald-500/10 text-emerald-450 border-emerald-500/25 hover:bg-emerald-500/20"
              }`}
            >
              {integrations.notebookLM.connected ? "Disconnect" : "Connect"}
            </button>
          </div>

          {integrations.notebookLM.connected ? (
            <div className="space-y-3.5">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Notebook Projects Catalog</span>
              <div className="space-y-2 max-h-40 overflow-y-auto font-sans">
                {NOTEBOOK_LM_PROJECTS.map((p) => {
                  const isLinked = integrations.notebookLM.linkedProjectId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleLinkNotebookProject(p.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isLinked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.01]"
                          : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider">{p.name}</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full select-none">{p.notes} notes</span>
                    </div>
                  );
                })}
              </div>

              {integrations.notebookLM.linkedProjectId && (
                <div className="bg-emerald-500/5 rounded-xl p-3.5 border border-emerald-500/20 text-[10px] select-all">
                  <p className="font-mono font-bold uppercase tracking-wider text-emerald-400">Active synced ground notes content:</p>
                  <p className="mt-1.5 leading-relaxed text-white/70 font-mono italic">{integrations.notebookLM.linkedContent}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center bg-black/40 rounded-2xl text-xs text-white/35 border border-dashed border-white/10 select-none">
              Connection to NotebookLM not active. Click "Connect" above to sync research.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* GitHub version control sync workspace */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 select-none">
            <div className="flex items-center gap-2.5">
              <Github className="h-5 w-5 text-white" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">GitHub Sync Pipeline</h4>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Version control prompt revisions</p>
              </div>
            </div>
            <button
              onClick={() => toggleConnection("github")}
              className={`rounded-xl px-4 py-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all border ${
                integrations.github.connected
                  ? "bg-red-500/15 text-red-400 border-red-500/35"
                  : "bg-white text-black border-transparent hover:bg-white/90"
              }`}
            >
              {integrations.github.connected ? "Disconnect" : "Connect"}
            </button>
          </div>

          {integrations.github.connected && activePrompt ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono select-none">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2.5 text-white/70">
                  <GitBranch className="h-4 w-4 text-white/30" />
                  <span>Branch: <strong className="text-white font-mono">{gitBranch}</strong></span>
                </div>
                <div 
                  className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2.5 text-white/70 relative cursor-help select-none"
                  onMouseEnter={() => setShowRepoTooltip(true)}
                  onMouseLeave={() => setShowRepoTooltip(false)}
                >
                  <GitCommit className="h-4 w-4 text-white/30" />
                  <span>Repo: <strong className="text-white font-mono">{integrations.github.repoName || "Not configured"}</strong></span>

                  {showRepoTooltip && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 p-2.5 w-60 bg-[#07101F]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in text-[10px] uppercase text-[#9BAAD4] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#6CECC8] font-black border-b border-white/5 pb-1 tracking-wide">
                        <GitCommit className="h-3.5 w-3.5 text-[#6CECC8]" />
                        <span>Repository Context</span>
                      </div>
                      <div className="space-y-0.5 pt-1 text-[8px] font-mono leading-tight text-left">
                        <p className="flex justify-between">CONNECTED: <span className="text-white font-bold">{integrations.github.connected ? "YES" : "NO"}</span></p>
                        <p className="flex justify-between">SYNC STATE: <span className={integrations.github.connected ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                          {integrations.github.connected ? (integrations.github.mode === "REAL" ? "REAL PIPELINE" : "SANDBOX/MOCKED") : "NOT CONNECTED"}
                        </span></p>
                        <p className="flex justify-between">COMMIT HASH: <span className="text-[#bfdbfe] font-bold">{integrations.github.lastCommitHash || "No sync history yet"}</span></p>
                        <p className="flex justify-between">TIME: <span className="text-white/40">{integrations.github.syncTime ? new Date(integrations.github.syncTime).toLocaleTimeString() : "Awaiting sync"}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Commit panel */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block select-none">Sync Revision Commit Message</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gitCommitMsg}
                    onChange={(e) => setGitCommitMsg(e.target.value)}
                    placeholder="e.g., Added Edgecase safe parameters to Support block"
                    className="flex-1 rounded-xl border border-white/15 px-4 py-2 bg-white/5 text-white uppercase placeholder:text-white/20 tracking-wider font-bold focus:outline-none focus:border-emerald-500 transition-all text-xs"
                  />
                  <button
                    onClick={executeGitHubCommitPush}
                    className="bg-white text-black font-extrabold tracking-widest text-[10px] uppercase px-5 py-2 rounded-xl hover:bg-emerald-500 transition-all"
                  >
                    Commit
                  </button>
                </div>
              </div>

              {/* Version revision diff overview */}
              {integrations.github.lastCommitHash && (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black font-mono text-[10px] text-white/80">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between text-white/40 font-bold uppercase select-none">
                    <span>GIT DIFF WORKSPACE</span>
                    <span className="text-emerald-450">{integrations.github.lastCommitHash}</span>
                  </div>
                  <div className="p-4 space-y-1 max-h-24 overflow-y-auto leading-relaxed select-text">
                    <p className="text-blue-400"># Committed revision outputs:</p>
                    <p className="text-red-400 font-bold">- Ensure outputs deliver direct, basic text summaries.</p>
                    <p className="text-emerald-400 font-bold">+ Ensure formatting strictly adheres to valid compact JSON blocks.</p>
                    <p className="text-emerald-400 font-bold">+ Implement severe anti-pleasantries constraints natively.</p>
                  </div>
                </div>
              )}
            </div>
          ) : integrations.github.connected ? (
            <div className="py-10 text-center text-xs text-white/40 italic font-mono uppercase tracking-[0.15em] select-none">
              Active prompt compiled state empty. Prepare templates before tracking revisions.
            </div>
          ) : (
            <div className="py-10 text-center bg-black/40 rounded-2xl text-xs text-white/35 border border-dashed border-white/10 select-none">
              Connection to GitHub not active. Click "Connect" above to commit revisions.
            </div>
          )}
        </div>

        {/* Hugging Face Templates lookup sharing */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 select-none">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-amber-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Hugging Face Hub</h4>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Discover community templates</p>
              </div>
            </div>
            <button
              onClick={() => toggleConnection("huggingFace")}
              className={`rounded-xl px-4 py-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all border ${
                integrations.huggingFace.connected
                  ? "bg-red-500/15 text-red-400 border-red-500/35"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/25 hover:bg-amber-500/20"
              }`}
            >
              {integrations.huggingFace.connected ? "Disconnect" : "Connect"}
            </button>
          </div>

          {integrations.huggingFace.connected ? (
            <div className="space-y-3.5">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block select-none">Trending Prompts Hub</span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {HUGGING_FACE_TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onHuggingFaceTemplatePicked(t);
                    }}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-emerald-500/5 group cursor-pointer flex justify-between items-center transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-emerald-400 transition-all">{t.name}</p>
                      <p className="text-[10px] text-white/40 mt-1 uppercase font-mono tracking-wider">Author: {t.author} • DL: {t.downloads}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-emerald-450 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center bg-black/40 rounded-2xl text-xs text-white/35 border border-dashed border-white/10 select-none">
              Connection to Hugging Face template database not active. Click "Connect" to browse.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { IntegrationsDashboard };
