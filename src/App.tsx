/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, MessageSquare, Send, Sparkles, Upload, FileText, X, 
  Settings, CheckCircle, AlertTriangle, Layers, Info, Trash2, ShieldAlert,
  Mic, MicOff
} from "lucide-react";
import { 
  PromptSession, PromptDefinition, EcosystemIntegrationState, 
  TestScenario, PromptHistoryItem, UserProfile 
} from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PromptViewer from "./components/PromptViewer";
import TestingSuite from "./components/TestingSuite";
import FeedbackAnalyzer from "./components/FeedbackAnalyzer";
import KnowledgeSearch from "./components/KnowledgeSearch";
import SettingsModal from "./components/SettingsModal";
import CinematicLoader from "./components/CinematicLoader";
import RightUtilityRail from "./components/RightUtilityRail";
import AuthModal from "./components/AuthModal";
import AssetsFolder from "./components/AssetsFolder";
import Pipelines from "./components/Pipelines";
import IntegrationsDashboard from "./components/IntegrationsDashboard";

export default function App() {
  const [sessions, setSessions] = useState<PromptSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("workspace");
  const [promptIdeaInput, setPromptIdeaInput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication Management States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const cachedUser = localStorage.getItem("userProfile");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem("userProfile");
      }
    }
  }, []);

  // Ecosystem Integrations states
  const [integrations, setIntegrations] = useState<EcosystemIntegrationState>({
    googleDrive: { connected: false },
    notebookLM: { connected: false },
    github: { connected: false },
    huggingFace: { connected: false },
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uiScale, setUiScale] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [preferredModel, setPreferredModel] = useState<string>("gemini-2.0-flash");
  const [showLoader, setShowLoader] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // File loading/Multi-modal state
  const [groundingDocContent, setGroundingDocContent] = useState<string>("");
  const [groundingDocName, setGroundingDocName] = useState<string>("");
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string>("");
  const [uploadedImageName, setUploadedImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Testing & Evaluation states
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Feedback Analyzer states
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);
  const [feedbackAnalysisResult, setFeedbackAnalysisResult] = useState<any>(null);

  useEffect(() => {
    checkApiHealth();
    loadSessions();
    fetchGithubMetadata();
  }, []);

  const fetchGithubMetadata = async () => {
    try {
      const res = await fetch("/api/integrations/github/metadata");
      if (res.ok) {
        const meta = await res.json();
        setIntegrations(prev => ({
          ...prev,
          github: {
            connected: meta.connected,
            repoName: meta.repoName,
            branch: meta.branch,
            lastCommitHash: meta.lastCommitHash,
            syncStatus: meta.syncStatus,
            syncTime: meta.syncTime,
            mode: meta.mode
          }
        }));
      }
    } catch (err) {
      console.error("Failed to load GitHub integrations metadata: ", err);
    }
  };

  const checkApiHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setApiHealthy(data.hasApiKey);
        if (!data.hasApiKey) {
          setErrorMessage("GEMINI_API_KEY is missing or unconfigured in Secrets panel. API calls will simulate response paths securely.");
        }
      } else {
        setApiHealthy(false);
      }
    } catch {
      setApiHealthy(false);
    }
  };

  const loadSessions = async (selectLatestId?: string) => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const list = await res.json();
        setSessions(list);
        
        if (list.length > 0) {
          if (selectLatestId) {
            setActiveSessionId(selectLatestId);
          } else if (!activeSessionId) {
            setActiveSessionId(list[0].id);
          }
        } else {
          // Auto create a draft session if empty to ensure visual layout is immediately interactive
          handleCreateSession();
        }
      }
    } catch (err) {
      console.error("Failed to fetch sessions: ", err);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });
      if (res.ok) {
        const nextSess = await res.json();
        loadSessions(nextSess.id);
      }
    } catch (err) {
      console.error("Failed to instantiate session:", err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        const nextId = activeSessionId === id ? null : activeSessionId;
        setActiveSessionId(nextId);
        loadSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectVersion = async (promptVersion: PromptDefinition) => {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/api/sessions/${activeSessionId}/version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: promptVersion.id }),
      });
      if (res.ok) {
        // Reload all workspaces and hold active selection
        loadSessions(activeSessionId);
      }
    } catch (err) {
      console.error("Failed to select prompt version dynamic index: ", err);
    }
  };

  const getActiveSession = (): PromptSession | null => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  };

  // Compile active prompt from pure idea with grounding document inline
  const executePromptOptimization = async () => {
    if (!promptIdeaInput.trim()) return;
    setIsCompiling(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/prompt/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptIdea: promptIdeaInput,
          contextDoc: groundingDocContent,
          sessionId: activeSessionId,
        }),
      });

      if (response.ok) {
        setPromptIdeaInput("");
        setGroundingDocContent("");
        setGroundingDocName("");
        loadSessions(activeSessionId || undefined);
      } else {
        const errData = await response.json();
        setErrorMessage(errData.error || "Failed to compile prompt.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network optimization error.");
    } finally {
      setIsCompiling(false);
    }
  };

  // Chat message submission matching continuous active conversational flow
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptIdeaInput.trim() || !activeSessionId) return;

    setIsSendingChat(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/sessions/${activeSessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptIdeaInput,
          imageBase64: uploadedImageBase64 || undefined,
        }),
      });

      if (response.ok) {
        setPromptIdeaInput("");
        setUploadedImageBase64("");
        setUploadedImageName("");
        loadSessions(activeSessionId);
      } else {
        const errData = await response.json();
        setErrorMessage(errData.error || "Failed sending chat turn.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed running conversational turn.");
    } finally {
      setIsSendingChat(false);
    }
  };

  // Manage manual Grounding Document file parsing (support drag-and-drop or manual picks)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setGroundingDocContent(text);
      setGroundingDocName(file.name);
    };
    reader.readAsText(file);
  };

  // Manage uploaded multimodality file photo parsing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fullData = event.target?.result as string;
      // Extract base64 segment by stripping mime headers
      const base64Str = fullData.split(",")[1];
      setUploadedImageBase64(base64Str);
      setUploadedImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Direct injection callback from GDrive picker
  const handleInjectGroundingDoc = (content: string, filename: string) => {
    setGroundingDocContent(content);
    setGroundingDocName(filename);
  };

  // Direct HuggingFace Template deployment callback
  const handleHuggingFaceTemplateSelection = async (tmpl: any) => {
    if (!activeSessionId) return;
    setIsCompiling(true);

    try {
      const activeDef: PromptDefinition = {
        id: "pdef_" + Math.random().toString(36).substr(2, 9),
        version: 1,
        systemInstruction: tmpl.systemInstruction,
        userTemplate: tmpl.userTemplate,
        variables: tmpl.variables,
        examples: [
          { id: "ex_1", input: "Generate custom classifications values...", output: "{\"classification_status\": \"success\"}" }
        ],
        createdAt: new Date().toISOString(),
        scores: { clarity: 95, constraintAdherence: 90, edgeCases: 85, tokenEfficiency: 95, overall: 91 },
        scoringFeedback: {
          clarity: "Community validated clear instructions.",
          constraintAdherence: "Enforces strict JSON schema rails.",
          edgeCases: "Fallback variables defined.",
          tokenEfficiency: "Lightweight and efficient system overhead."
        }
      };

      const pushResponse = await fetch(`/api/sessions/${activeSessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Pulled trending Hugging Face template: ${tmpl.name}`,
        }),
      });

      if (pushResponse.ok) {
        // Manually push to state version files
        const data = await pushResponse.json();
        loadSessions(activeSessionId);
      }
    } catch {
      setErrorMessage("Failed to deploy Hugging Face template.");
    } finally {
      setIsCompiling(false);
    }
  };

  // Run autonomous QA tests iterations or specialized manual stress runs
  const handleRunTestingSuite = async (customScenariosSpec?: TestScenario[], targetModels?: string[]) => {
    const activeSession = getActiveSession();
    if (!activeSession || !activeSession.currentPrompt) return;

    setIsRunningTests(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/prompt/run-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          promptDefinition: activeSession.currentPrompt,
          testScenarios: customScenariosSpec || [],
          models: targetModels || [],
        }),
      });

      if (response.ok) {
        const outcome = await response.json();
        setTestRuns(outcome.testRuns);
        if (outcome.generatedScenarios) {
          setScenarios(outcome.generatedScenarios);
        }
        loadSessions(activeSessionId);
      } else {
        const errData = await response.json();
        setErrorMessage(errData.error || "Failed running autonomous testers.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Autonomous QA connection failed.");
    } finally {
      setIsRunningTests(false);
    }
  };

  // Automated prompt update callback for self-correction loops
  const handleUpdateActivePrompt = async (newPrompt: PromptDefinition) => {
    if (!activeSessionId) return;
    try {
      const response = await fetch(`/api/sessions/${activeSessionId}/update-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: newPrompt }),
      });
      if (response.ok) {
        loadSessions(activeSessionId);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Failed to save updated prompt.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed connecting to updates server.");
    }
  };

  // Google AI Studio Disappointing output Feedback debugger diagnostics patch tool
  const handleFeedbackAuditReview = async (original: string, badOut: string, expect: string) => {
    setIsAnalyzingFeedback(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/prompt/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          originalPrompt: original,
          pastedOutput: badOut,
          expectation: expect,
        }),
      });

      if (response.ok) {
        const outcome = await response.json();
        setFeedbackAnalysisResult(outcome);
        loadSessions(activeSessionId);
      } else {
        const errorDetails = await response.json();
        setErrorMessage(errorDetails.error || "Failed examining logs.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Diagnostics connection failed.");
    } finally {
      setIsAnalyzingFeedback(false);
    }
  };

  // Web Speech recognition integration
  const [isRecording, setIsRecording] = useState(false);
  const [supportSpeech, setSupportSpeech] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportSpeech(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setPromptIdeaInput((prev) => prev ? prev + " " + resultText : resultText);
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const activeSess = getActiveSession();

  const panelHeight = errorMessage 
    ? "calc(100vh - 188px)" 
    : "calc(100vh - 146px)";

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden bg-[#040910] bg-cyber-grid font-sans antialiased text-[#EDF2FF] density-${uiScale}`}
      style={{ "--workspace-panel-height": panelHeight } as React.CSSProperties}
    >
      {/* Cinematic Loader Core Landing */}
      {showLoader && (
        <CinematicLoader onComplete={() => setShowLoader(false)} />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
        }}
        uiScale={uiScale}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={currentUser}
        onAuthClick={() => setIsAuthOpen(true)}
      />

      {/* Main workspace arena */}
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent p-4 gap-4">
        {/* Top Header Controls bar */}
        <Header 
          currentPrompt={activeSess?.currentPrompt || null} 
          apiHealthy={apiHealthy}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Global Warning / Notifications center banner */}
        {errorMessage && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-300 font-medium flex items-center justify-between shadow-sm animate-fade-in rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-amber-500/20 rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Core Workspace Screens switching grids */}
        <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col">
          {activeTab === "workspace" && (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 h-full w-full items-stretch animate-fade-in min-h-0">
              
              {/* Chat Thread Console column */}
              <div className="col-span-1 lg:col-span-3 flex flex-col glass-pane border border-white/5 rounded-3xl p-5 relative overflow-hidden lg:h-[var(--workspace-panel-height)] h-full min-h-0">
                {/* Conversations display body panel */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar">
                  {activeSess ? (
                    activeSess.history.map((hist) => {
                      const isSystem = hist.role === "system";
                      const isUser = hist.role === "user";
                      return (
                        <div
                          key={hist.id}
                          className={`flex items-start gap-3.5 max-w-[85%] ${
                            isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-3xs font-black uppercase shrink-0 ${
                              isUser ? "bg-emerald-500 text-black shadow" : "bg-[#040910]/85 text-[#9BAAD4] border border-white/5"
                            }`}
                          >
                            {isUser ? "U" : "P"}
                          </div>
                          
                          <div className="space-y-1">
                            <div
                              className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed shadow-sm ${
                                isUser
                                  ? "bg-emerald-500 text-black rounded-tr-none font-bold shadow-md"
                                  : "bg-[#040910]/45 border border-white/5 text-[#EDF2FF]/90 rounded-tl-none font-medium"
                              }`}
                            >
                              <p className="whitespace-pre-wrap font-sans">{hist.content}</p>
                            </div>
                            <span className="text-[10px] font-mono text-[#9BAAD4]/40 tracking-wider block px-1 text-right uppercase">
                              {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-[#9BAAD4]/40 italic text-xs uppercase font-mono tracking-widest font-extrabold">
                      Select or instantiate an active workshop session.
                    </div>
                  )}
                </div>

                {/* Multimodal document or photo selection indicator bar */}
                <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {/* Document grounding linked badge */}
                    {groundingDocName && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-3xs font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                        <FileText className="h-3 w-3 text-emerald-400" />
                        <span className="truncate max-w-[140px]">{groundingDocName}</span>
                        <button onClick={() => { setGroundingDocName(""); setGroundingDocContent(""); }} className="hover:bg-white/10 rounded p-0.5 ml-1 cursor-pointer">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}

                    {/* Image multi-modal preview badge */}
                    {uploadedImageName && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-3xs font-mono uppercase tracking-wider text-amber-400 border border-amber-500/20">
                        <Upload className="h-3 w-3 text-amber-400" />
                        <span className="truncate max-w-[140px]">{uploadedImageName}</span>
                        <button onClick={() => { setUploadedImageName(""); setUploadedImageBase64(""); }} className="hover:bg-white/10 rounded p-0.5 ml-1 cursor-pointer">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Input text areas buttons */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    {/* Hidden entries controls for file pickers */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.json,.csv,.md"
                    />
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />

                    {/* Quick attach utility options */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all border border-white/10 shrink-0 cursor-pointer"
                      title="Attach .txt, .json or .md grounding files"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all border border-white/10 shrink-0 cursor-pointer"
                      title="Attach multimodality image sources"
                    >
                      <Upload className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      value={promptIdeaInput}
                      onChange={(e) => setPromptIdeaInput(e.target.value)}
                      placeholder="Discuss revisions, or type a prompt goal..."
                      className="flex-1 rounded-xl focus:outline-none px-4 text-xs text-[#EDF2FF] uppercase placeholder:text-[#9BAAD4]/30 tracking-wider font-extrabold transition-all glass-pane-input"
                    />
                    
                    {/* Voice Recording Prominent Control */}
                    {supportSpeech && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-350 relative border cursor-pointer shrink-0 ${
                          isRecording 
                            ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                            : "bg-[#040910]/40 text-[#6CECC8] border-[#6CECC8]/25 hover:bg-[#6CECC8]/15 hover:border-[#6CECC8]/50 hover:shadow-[0_0_12px_rgba(108,236,200,0.25)]"
                        }`}
                        title={isRecording ? "Listening... click to pause" : "Record Voice Prompt"}
                      >
                        {isRecording && (
                          <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-75"></span>
                        )}
                        {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                      </button>
                    )}

                    {/* Optimize (Icon-only with Sparks) */}
                    <button
                      type="button"
                      onClick={executePromptOptimization}
                      disabled={isCompiling || !promptIdeaInput.trim()}
                      className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#07101F]/40 border border-white/5 text-[#6CECC8] hover:bg-[#6CECC8]/10 hover:border-[#6CECC8]/35 transition-all disabled:opacity-40 shrink-0 cursor-pointer tactile-glow"
                      title="Compile and optimize structured prompt instantly"
                    >
                      {isCompiling ? (
                        <div className="h-4 w-4 border-2 border-[#6CECC8] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                      )}
                    </button>

                    {/* Send Control */}
                    <button
                      type="submit"
                      disabled={isSendingChat || !promptIdeaInput.trim()}
                      className="h-12 w-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all disabled:opacity-40 shrink-0 cursor-pointer tactile-glow"
                      title="Send instructions"
                    >
                      {isSendingChat ? (
                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Advanced blueprint and visualization layouts panel column */}
              <div className="col-span-1 lg:col-span-2 lg:h-[var(--workspace-panel-height)] h-full min-h-0 flex flex-col">
                <PromptViewer
                  prompt={activeSess?.currentPrompt || null}
                  versionHistory={activeSess?.versionHistory || []}
                  onSelectVersion={handleSelectVersion}
                  onRunTestScenario={(mInputs) => {
                    const scene: TestScenario = {
                      id: "scen_temp",
                      name: "Quick Hydrator execution test",
                      inputs: mInputs,
                      expectedCriteria: ["Evaluate variable formats", "Check output readability"],
                    };
                    handleRunTestingSuite([scene]);
                    setActiveTab("testing");
                  }}
                  isRunningTest={isRunningTests}
                />
              </div>

              {/* Right Telemetry Column Rail */}
              <div className="col-span-1 lg:col-span-1 lg:h-[var(--workspace-panel-height)] h-full min-h-0 flex flex-col">
                <RightUtilityRail
                  currentPrompt={activeSess?.currentPrompt || null}
                  activeSession={activeSess}
                  isRunningTests={isRunningTests}
                  onOptimizeClick={executePromptOptimization}
                  onTriggerSelfCorrection={async () => {
                    if (activeSess?.currentPrompt) {
                      handleRunTestingSuite([], [preferredModel]);
                    }
                  }}
                  uiScale={uiScale}
                  totalSessionsCount={sessions.length}
                  integrations={integrations}
                  preferredModel={preferredModel}
                  onChangePreferredModel={setPreferredModel}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>

            </div>
          )}

          {activeTab === "testing" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-y-auto pr-1 custom-scrollbar min-h-0">
              <TestingSuite
                prompt={activeSess?.currentPrompt || null}
                scenarios={scenarios}
                testRuns={testRuns}
                onAddScenario={(sc) => setScenarios([...scenarios, sc])}
                onRunActiveTests={handleRunTestingSuite}
                isRunning={isRunningTests}
                onUpdatePrompt={handleUpdateActivePrompt}
                sessionId={activeSessionId || ""}
              />
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-hidden pr-1 min-h-0">
              <FeedbackAnalyzer
                prompt={activeSess?.currentPrompt || null}
                onAnalyzeFeedback={handleFeedbackAuditReview}
                isAnalyzing={isAnalyzingFeedback}
                analysisResult={feedbackAnalysisResult}
              />
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-y-auto pr-1 custom-scrollbar min-h-0">
              <KnowledgeSearch
                onSelectKnowledgeRef={(guidelineSnippet) => {
                  setPromptIdeaInput((p) => p ? p + "\n\n" + guidelineSnippet : guidelineSnippet);
                  setActiveTab("workspace");
                }}
                activeSessionId={activeSessionId}
                onImportTemplate={() => {
                  if (activeSessionId) {
                    loadSessions(activeSessionId);
                  }
                  setActiveTab("workspace");
                }}
              />
            </div>
          )}

          {activeTab === "assets" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-y-auto pr-1 custom-scrollbar min-h-0">
              <AssetsFolder
                groundingDocName={groundingDocName}
                groundingDocContent={groundingDocContent}
                onSelectGrounding={(fileName, content) => {
                  setGroundingDocName(fileName);
                  setGroundingDocContent(content);
                }}
                onClearGrounding={() => {
                  setGroundingDocName("");
                  setGroundingDocContent("");
                }}
                uploadedImageName={uploadedImageName}
                onSelectImage={(name, base64) => {
                  setUploadedImageName(name);
                  setUploadedImageBase64(base64);
                }}
                onClearImage={() => {
                  setUploadedImageName("");
                  setUploadedImageBase64("");
                }}
              />
            </div>
          )}

          {activeTab === "pipelines" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-y-auto pr-1 custom-scrollbar min-h-0">
              <Pipelines
                prompt={activeSess?.currentPrompt || null}
                onOptimizeClick={executePromptOptimization}
              />
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="max-w-7xl w-full mx-auto lg:h-[var(--workspace-panel-height)] h-full overflow-y-auto pr-1 custom-scrollbar min-h-0">
              <IntegrationsDashboard
                integrations={integrations}
                onUpdateIntegrations={setIntegrations}
                activePrompt={activeSess?.currentPrompt || null}
                onInjectGroundingContent={handleInjectGroundingDoc}
                onHuggingFaceTemplatePicked={handleHuggingFaceTemplateSelection}
              />
            </div>
          )}
        </main>

        {/* Sub-Footer Status */}
        <footer className="mt-1 flex flex-col sm:flex-row justify-between items-center border-t border-white/5 py-2 select-none gap-2 shrink-0">
          <div className="flex flex-wrap gap-4 items-center text-[9px] font-mono text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-[#6CECC8] rounded-full shadow-[0_0_4px_#6cecc8]"></div>
              <span>Server: <span className="text-white">ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-[#79AEFF] rounded-full shadow-[0_0_4px_#79aeff]"></div>
              <span>RAG Pipeline: <span className="text-[#79AEFF]">OPTIMIZED</span></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500">
              <div className="w-1 h-1 bg-[#6CECC8] rounded-full animate-pulse shadow-[0_0_4px_#6cecc8]"></div>
              <span>Self-Correction Loop: <span className="font-extrabold uppercase animate-pulse text-[#6CECC8]">RUNNING</span></span>
            </div>
          </div>
          <div className="text-[9px] uppercase font-mono text-white/35">
            SESSION_ID &rarr; <span className="text-[#6CECC8] font-bold tracking-wider">{activeSessionId ? activeSessionId.toUpperCase() : "G-STUDIO-8891-X"}</span>
          </div>
        </footer>
      </div>

      {/* Pop-up Ecosystem settings modal overlay */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          integrations={integrations}
          onUpdateIntegrations={setIntegrations}
          activePrompt={activeSess?.currentPrompt || null}
          onInjectGroundingContent={handleInjectGroundingDoc}
          onHuggingFaceTemplatePicked={handleHuggingFaceTemplateSelection}
          uiScale={uiScale}
          onChangeUiScale={setUiScale}
          preferredModel={preferredModel}
          onChangePreferredModel={setPreferredModel}
        />
      )}

      {/* Auth Modal overlay */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onLogin={(userObj) => {
            setCurrentUser(userObj);
            localStorage.setItem("userProfile", JSON.stringify(userObj));
          }}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem("userProfile");
          }}
        />
      )}
    </div>
  );
}
export { App };
