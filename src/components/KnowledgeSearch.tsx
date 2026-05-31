/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, Layers, Compass, HardDrive, ShieldCheck, 
  Flame, Cpu, Import, Check, Star, CornerDownRight, Tag 
} from "lucide-react";
import { InternalKnowledgeArticle } from "../types";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  model: string;
  description: string;
  systemInstruction: string;
  userTemplate: string;
  variables: string[];
  examples: Array<{ id: string; input: string; output: string }>;
  scores: {
    overall: number;
    clarity: number;
    constraintAdherence: number;
    edgeCases: number;
    tokenEfficiency: number;
  };
  scoringFeedback: {
    clarity: string;
    constraintAdherence: string;
    edgeCases: string;
    tokenEfficiency: string;
  };
  tags?: string[];
}

interface KnowledgeSearchProps {
  onSelectKnowledgeRef: (content: string) => void;
  activeSessionId: string | null;
  onImportTemplate: () => void;
}

export default function KnowledgeSearch({ 
  onSelectKnowledgeRef, 
  activeSessionId, 
  onImportTemplate 
}: KnowledgeSearchProps) {
  const [activeCatalogTab, setActiveCatalogTab] = useState<"articles" | "templates">("templates");
  
  // Articles states
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<InternalKnowledgeArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<InternalKnowledgeArticle | null>(null);

  // Templates states
  const [templateQuery, setTemplateQuery] = useState("");
  const [selectedModelFilter, setSelectedModelFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState("all");
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [query]);

  useEffect(() => {
    fetchTemplates();
  }, [templateQuery, selectedModelFilter, selectedCategoryFilter, selectedTagFilter]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/kb/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
        if (data.length > 0 && !selectedArticle) {
          setSelectedArticle(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load knowledge articles:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      let url = `/api/templates?q=${encodeURIComponent(templateQuery)}`;
      if (selectedModelFilter !== "all") {
        url += `&model=${encodeURIComponent(selectedModelFilter)}`;
      }
      if (selectedCategoryFilter !== "all") {
        url += `&category=${encodeURIComponent(selectedCategoryFilter)}`;
      }
      if (selectedTagFilter !== "all") {
        url += `&tag=${encodeURIComponent(selectedTagFilter)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          // If the previously selected template is not in the list, default to first item
          const stillExists = data.some((t: any) => t.id === selectedTemplate?.id);
          if (!stillExists) {
            setSelectedTemplate(data[0]);
          }
        } else {
          setSelectedTemplate(null);
        }
      }
    } catch (err) {
      console.error("Failed to load templates catalog:", err);
    }
  };

  const handleImportClick = async (templateId: string) => {
    if (!activeSessionId) {
      setImportError("Please select or instantiate an active workshop session first on the left panel.");
      return;
    }
    
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const res = await fetch("/api/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          templateId,
        }),
      });

      if (res.ok) {
        setImportSuccess(true);
        onImportTemplate(); // trigger parent reload
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        const details = await res.json();
        setImportError(details.error || "Execution error importing template.");
      }
    } catch (err) {
      setImportError("Network error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  const categories = [
    { id: "all", label: "All Library Articles" },
    { id: "token_mgmt", label: "Token Allocation", icon: Flame },
    { id: "sys_inst", label: "System Instruction Structures", icon: Compass },
    { id: "safety", label: "Mitigating Filters", icon: ShieldCheck },
    { id: "few_shot", label: "Few-Shot XML Structures", icon: Layers },
    { id: "ai_studio", label: "Google AI Studio Workflow", icon: HardDrive },
  ];

  const filteredArticles = activeCategory === "all"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Selectors for Dual-Catalog Mode */}
      <div className="flex border-b border-white/10 select-none pb-1.5 justify-start items-center gap-6">
        <button
          onClick={() => setActiveCatalogTab("templates")}
          className={`pb-2.5 text-sm uppercase font-black tracking-widest transition-all relative ${
            activeCatalogTab === "templates"
              ? "text-emerald-400"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          <span>Prompt Templates Hub</span>
          {activeCatalogTab === "templates" && (
            <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-emerald-500 rounded-full animate-fade-in"></div>
          )}
        </button>
        
        <button
          onClick={() => setActiveCatalogTab("articles")}
          className={`pb-2.5 text-sm uppercase font-black tracking-widest transition-all relative ${
            activeCatalogTab === "articles"
              ? "text-emerald-400"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          <span>Directives & Guidelines</span>
          {activeCatalogTab === "articles" && (
            <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-emerald-500 rounded-full animate-fade-in"></div>
          )}
        </button>
      </div>

      {activeCatalogTab === "articles" ? (
        /* Original RAG Knowledge Library */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search token parameters, prompt patterns..."
                className="w-full text-xs rounded-xl border border-white/10 pl-11 pr-4 py-3 bg-white/5 text-white uppercase placeholder:text-white/20 tracking-wider font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const matched = cat.id === "all" ? articles : articles.filter(a => a.category === cat.id);
                    if (matched.length > 0) {
                      setSelectedArticle(matched[0]);
                    }
                  }}
                  className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider transition-all border ${
                    activeCategory === cat.id
                      ? "bg-emerald-500 text-black border-transparent shadow-md"
                      : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-xs text-white/30 italic font-mono uppercase tracking-[0.2em]">No matching directives</p>
                </div>
              ) : (
                filteredArticles.map((art) => {
                  const isSelected = selectedArticle?.id === art.id;
                  return (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className={`p-4.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/45 text-emerald-400 font-bold"
                          : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase font-black tracking-[0.2em] block text-emerald-500 mb-1.5">{art.category}</span>
                      <p className="font-extrabold text-sm text-white uppercase tracking-wider">{art.title}</p>
                      <p className="text-[10px] text-white/50 mt-2 leading-relaxed uppercase font-semibold">{art.summary}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            {selectedArticle ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-black tracking-[0.25em] text-emerald-500 block">{selectedArticle.category}</span>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">{selectedArticle.title}</h3>
                  </div>
                  
                  <button
                    onClick={() => onSelectKnowledgeRef(`Matched Google AI Studio Guideline:\n${selectedArticle.content}`)}
                    className="bg-emerald-500 hover:bg-emerald-450 text-black text-xs font-black uppercase tracking-wider py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Layers className="h-4 w-4" /> Ground Active Optimizer
                  </button>
                </div>

                <div className="text-xs text-white/80 leading-relaxed font-sans max-h-[400px] overflow-y-auto pr-2 space-y-4 select-text">
                  {selectedArticle.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("###")) {
                      return <h3 key={i} className="text-sm font-black text-emerald-400 uppercase tracking-widest mt-6 border-b border-white/5 pb-1.5">{para.replace("###", "")}</h3>;
                    } else if (para.startsWith("####")) {
                      return <h4 key={i} className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mt-4">{para.replace("####", "")}</h4>;
                    } else if (para.includes("- ")) {
                      return (
                        <ul key={i} className="list-disc list-inside space-y-2 pl-2">
                          {para.split("\n").map((li, liIndex) => (
                            <li key={liIndex} className="text-white/70 font-medium leading-relaxed">{li.replace("- ", "").replace("*", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={i} className="text-white/70 leading-relaxed">{para}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 h-96 text-center rounded-3xl">
                <BookOpen className="h-10 w-10 text-white/20 mb-3 animate-pulse" />
                <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Select an article catalog index to begin reading</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Highly Categorized Templates catalog index layout */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-4">
            
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={templateQuery}
                onChange={(e) => setTemplateQuery(e.target.value)}
                placeholder="Search templates (e.g. refactor, financial)..."
                className="w-full text-xs rounded-xl border border-white/10 pl-11 pr-4 py-3 bg-white/5 text-white uppercase placeholder:text-white/20 tracking-wider font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Use-case categorization filters */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">Use Case Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Cases" },
                  { id: "Code Generation", label: "Code Generation" },
                  { id: "Creative Writing", label: "Creative Writing" },
                  { id: "Data Analysis", label: "Data Analysis" },
                  { id: "System Engineering", label: "System Engineering" },
                ].map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedCategoryFilter(tc.id)}
                    className={`rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                      selectedCategoryFilter === tc.id
                        ? "bg-emerald-500 text-black border-transparent"
                        : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Target Filters */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">Target AI Model</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Models" },
                  { id: "Gemini 2.0 Flash", label: "Gemini 2.0 Flash" },
                  { id: "Gemini 1.5 Pro", label: "Gemini 1.5 Pro" },
                  { id: "Gemini 1.5 Flash", label: "Gemini 1.5 Flash" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelFilter(m.id)}
                    className={`rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                      selectedModelFilter === m.id
                        ? "bg-slate-200 text-black border-transparent"
                        : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags System Filter UI */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">Filter by Custom Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Tags" },
                  { id: "production", label: "#production" },
                  { id: "experimental", label: "#experimental" },
                  { id: "safety-hardened", label: "#safety-hardened" },
                ].map((tg) => (
                  <button
                    key={tg.id}
                    onClick={() => setSelectedTagFilter(tg.id)}
                    className={`rounded-full px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                      selectedTagFilter === tg.id
                        ? "bg-emerald-500 text-black border-transparent"
                        : "bg-white/5 text-emerald-450 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="border-t border-white/15 my-3"></div>

            {/* Catalog Display matches list */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {templates.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-2xs text-white/30 italic uppercase font-mono tracking-widest">No matching engineering blueprints found</p>
                </div>
              ) : (
                templates.map((tmpl) => {
                  const isSel = selectedTemplate?.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => { setSelectedTemplate(tmpl); setImportError(null); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSel
                          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                          : "bg-white/5 border-transparent hover:bg-white/10 text-white/60"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono uppercase bg-white/10 text-white/80 border border-white/10 rounded px-1.5 py-0.5 tracking-wider mb-2 font-bold select-none">{tmpl.category}</span>
                        <span className="text-[8px] font-mono text-emerald-400 uppercase font-black">{tmpl.model}</span>
                      </div>
                      <p className="font-extrabold text-xs text-white uppercase tracking-wider truncate mb-1">{tmpl.name}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 uppercase font-bold tracking-tight">{tmpl.description}</p>
                      {tmpl.tags && tmpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tmpl.tags.map((tg) => (
                            <span
                              key={tg}
                              className="text-[8px] font-mono font-bold bg-[#040910] text-[#6CECC8] px-1.5 py-0.5 rounded border border-[#6CECC8]/10 uppercase"
                            >
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Renders Selected Template read detail view & Sandbox import features */}
          <div className="col-span-1 lg:col-span-3">
            {selectedTemplate ? (
              <div className="rounded-3xl border border-white/8 bg-[#07101F] p-6 shadow-sm space-y-5 relative">
                
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2 py-0.5 tracking-widest font-black select-none">
                        {selectedTemplate.category}
                      </span>
                      <span className="text-[8px] font-mono uppercase bg-white/10 text-white/80 border border-white/10 rounded-md px-2 py-0.5 tracking-widest font-black select-none">
                        Target: {selectedTemplate.model}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">{selectedTemplate.name}</h3>
                    {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTemplate.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[8px] font-mono font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded uppercase"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleImportClick(selectedTemplate.id)}
                    disabled={isImporting || !activeSessionId}
                    className="bg-emerald-500 hover:bg-emerald-450 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
                  >
                    {isImporting ? (
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : importSuccess ? (
                      <>
                        <Check className="h-4 w-4 text-black" />
                        <span>Ready in Workspace!</span>
                      </>
                    ) : (
                      <>
                        <Import className="h-4 w-4" />
                        <span>Import Template</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Import parameters notifications helper */}
                {importError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-mono uppercase tracking-wider">
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3 rounded-xl text-xs font-mono uppercase tracking-wider">
                    Import successful! Layout linked beautifully inside active threads workspace. Switch to 'Prompt Workspace' to run dynamic compilations.
                  </div>
                )}

                {/* Quick Info */}
                <p className="text-xs text-white/70 italic leading-relaxed select-text p-4 rounded-2xl bg-white/5 border border-white/10">{selectedTemplate.description}</p>

                {/* Grading Parameters Row */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1 text-[10px] font-mono uppercase tracking-widest text-white/40">
                    <span>Template Blueprint Score Index</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" /> {selectedTemplate.scores.overall}/100 QUALITY_RATING</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-mono uppercase font-bold text-white/60">
                    <div className="flex justify-between">
                      <span>Clarity:</span>
                      <span className="text-emerald-400">{selectedTemplate.scores.clarity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negatives Constraint:</span>
                      <span className="text-emerald-400">{selectedTemplate.scores.constraintAdherence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge Conditions:</span>
                      <span className="text-emerald-400">{selectedTemplate.scores.edgeCases}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Efficiency:</span>
                      <span className="text-emerald-400">{selectedTemplate.scores.tokenEfficiency}%</span>
                    </div>
                  </div>
                </div>

                {/* Template Fields breakdown Tabs */}
                <div className="space-y-4">
                  {/* System instruction read block */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Core System Instruction Block</span>
                    <pre className="p-4 rounded-2xl bg-black text-slate-300 text-2xs font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-white/15 select-all">
                      {selectedTemplate.systemInstruction}
                    </pre>
                  </div>

                  {/* User template structure */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Query Parameter Layout</span>
                    <pre className="p-4 rounded-2xl bg-black text-slate-300 text-2xs font-mono whitespace-pre-wrap leading-relaxed border border-white/15 select-all">
                      {selectedTemplate.userTemplate}
                    </pre>
                  </div>

                  {/* Variables listing badges */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Linked Placeholders</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((val) => (
                        <div key={val} className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                          <Tag className="h-3 w-3" />
                          <span>{`{{${val}}}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 h-96 text-center rounded-3xl">
                <Compass className="h-10 w-10 text-white/20 mb-3 animate-pulse" />
                <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Select a template blueprint above to see architectural specification details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
