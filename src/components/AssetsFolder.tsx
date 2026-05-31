/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FolderKanban, FileText, Image, Search, Upload, Trash2, 
  Plus, CheckCircle2, Cloud, ArrowUpRight, ShieldCheck, Database, HardDrive
} from "lucide-react";

interface AssetsFolderProps {
  groundingDocName: string;
  groundingDocContent: string;
  onSelectGrounding: (fileName: string, content: string) => void;
  onClearGrounding: () => void;
  uploadedImageName: string;
  onSelectImage: (name: string, base64: string) => void;
  onClearImage: () => void;
}

export default function AssetsFolder({
  groundingDocName,
  groundingDocContent,
  onSelectGrounding,
  onClearGrounding,
  uploadedImageName,
  onSelectImage,
  onClearImage
}: AssetsFolderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // High-fidelity mocking files database
  const PRESET_DOCUMENTS = [
    {
      name: "Client_GDPR_Compliance_Policy.md",
      size: "24 KB",
      type: "Markdown Document",
      source: "Google Drive Sync",
      content: "CRITICAL COMPLIANCE TARGETS:\n- Keep all client data locked within continental boundaries.\n- Delete historic cookies on browser termination.\n- Explicitly cite GDPR article index when answering safety questions."
    },
    {
      name: "Global_Banking_API_Specifications.json",
      size: "45 KB",
      type: "JSON Dataset",
      source: "Workspace NotebookLM",
      content: "BANKING ROUTER RULES:\n- Use /v3/accounts/transfer endpoint for transactions.\n- Return only explicit ISO standard error strings on rejections.\n- Always guard input parameters securely from code-injection."
    },
    {
      name: "Support_Escalation_Workflows.txt",
      size: "12 KB",
      type: "Plain Text Guide",
      source: "Local Upload",
      content: "ESCALATION RAILS:\n- If client asks for standard balance, respond directly.\n- If client asks for manual account audits, transfer cleanly to manager-on-call.\n- Never reveal supervisor personal information."
    }
  ];

  const PRESET_IMAGES = [
    {
      name: "ai_studio_dashboard_layout.png",
      size: "145 KB",
      type: "Multimodal Asset",
      preview: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%236CECC8' fill-opacity='0.1'/><circle cx='50' cy='50' r='30' fill='none' stroke='%236CECC8' stroke-width='2'/></svg>"
    },
    {
      name: "mobile_checkout_wireframe.jpg",
      size: "280 KB",
      type: "Wireframe Layout",
      preview: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23B48FFF' fill-opacity='0.1'/><rect x='25' y='25' width='50' height='50' fill='none' stroke='%23B48FFF' stroke-width='2'/></svg>"
    }
  ];

  const filteredDocs = PRESET_DOCUMENTS.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-white h-full max-h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
      {/* Overview stats header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center gap-4.5">
          <div className="h-10 w-10 rounded-xl bg-[#6CECC8]/10 text-[#6CECC8] border border-[#6CECC8]/20 flex items-center justify-center">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#9BAAD4]/65 uppercase tracking-widest leading-none mb-1">Knowledge Storage</p>
            <h4 className="text-sm font-black uppercase tracking-wider text-white">81.0 KB Grounded</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center gap-4.5">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#9BAAD4]/65 uppercase tracking-widest leading-none mb-1">Retrieval Weight</p>
            <h4 className="text-sm font-black uppercase tracking-wider text-white">Hybrid Vector / RAG</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center gap-4.5">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#9BAAD4]/65 uppercase tracking-widest leading-none mb-1">Security Guardrails</p>
            <h4 className="text-sm font-black uppercase tracking-wider text-white">PII Redacted</h4>
          </div>
        </div>
      </div>

      {/* Main Files & Image catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Left column: Documents List */}
        <div className="col-span-1 lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 select-none shrink-0">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-[#6CECC8]" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Grounding Document Registries</h4>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5 leading-none">Pre-structured prompt contexts</p>
              </div>
            </div>
            
            <div className="relative w-44">
              <input
                type="text"
                placeholder="Filter files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-[10px] rounded-lg border border-white/10 py-1.5 pl-7 pr-3 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#6CECC8]/30 font-bold uppercase tracking-wide"
              />
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-white/30" />
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-0.5 min-h-0">
            {filteredDocs.map((doc, idx) => {
              const isCurrentlyActive = groundingDocName === doc.name;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isCurrentlyActive 
                      ? "border-[#6CECC8]/35 bg-[#6CECC8]/5" 
                      : "border-white/5 bg-[#040910]/30 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCurrentlyActive 
                        ? "bg-[#6CECC8]/15 border-[#6CECC8]/30 text-[#6CECC8]" 
                        : "bg-white/5 border-white/10 text-white/50"
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h5 className="text-[11px] font-black text-white truncate uppercase tracking-wider">{doc.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-white/35 uppercase">{doc.size}</span>
                        <span className="text-[9px] font-mono text-white/20">&bull;</span>
                        <span className="text-[9px] font-mono text-[#6CECC8] uppercase tracking-wider">{doc.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentlyActive ? (
                      <button
                        onClick={onClearGrounding}
                        className="rounded-xl px-3 py-1.5 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectGrounding(doc.name, doc.content)}
                        className="rounded-xl px-3 py-1.5 border border-[#6CECC8]/25 bg-[#6CECC8]/10 text-[#6CECC8] hover:bg-[#6CECC8]/20 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer flex items-center gap-1"
                      >
                        Ground Active Workspace
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Multimodal Vault */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col min-h-0">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-4 select-none shrink-0">
            <Image className="h-5 w-5 text-purple-400" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Multimodal Image Vault</h4>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5 leading-none">Photo/design file alignments</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-0.5 min-h-0">
            {PRESET_IMAGES.map((img, idx) => {
              const isCurrentlyActive = uploadedImageName === img.name;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3.5 ${
                    isCurrentlyActive 
                      ? "border-purple-500/35 bg-purple-500/5" 
                      : "border-white/5 bg-[#040910]/30 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-[#040910] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={img.preview} alt="mock preview" className="h-9 w-9 object-contain" />
                    </div>
                    <div className="min-w-0 text-left flex-1">
                      <h5 className="text-[11px] font-black text-white truncate uppercase tracking-wider">{img.name}</h5>
                      <p className="text-[9px] font-mono text-white/45 uppercase mt-0.5">{img.size} &bull; {img.type}</p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-white/5 pt-3">
                    {isCurrentlyActive ? (
                      <button
                        onClick={onClearImage}
                        className="rounded-lg px-2.5 py-1.5 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/25 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Remove Grounding
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectImage(img.name, "preset_base64_demo")}
                        className="rounded-lg px-2.5 py-1.5 border border-purple-500/25 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                      >
                        Inject Grounding
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
