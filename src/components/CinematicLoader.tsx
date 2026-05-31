/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [activeMessageIdx, setActiveMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const LOADING_MESSAGES = [
    "Initializing Prompt Engine",
    "Loading AI Agents",
    "Connecting Knowledge Sources",
    "Preparing Workspace",
    "Optimizing Interface"
  ];

  // Rotate messages
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setActiveMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 550);

    return () => clearInterval(msgInterval);
  }, []);

  // Increment progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        if (next >= 100) {
          clearInterval(progressInterval);
          // Wait briefly for a dramatic transition pause
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onComplete();
            }, 600); // fade transition
          }, 350);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-deep transition-all duration-700 ease-in-out select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background radial gradient mesh and blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-mint/10 blur-[130px] animate-pulse" style={{ animationDuration: "8s" }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-violet/10 blur-[150px] animate-pulse" style={{ animationDuration: "12s" }}></div>
        
        {/* Render simple floating atmospheric particles */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-accent-mint/20 blur-sm animate-bounce" style={{ animationDuration: "6s" }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-accent-blue/20 blur-md animate-bounce" style={{ animationDuration: "9s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-accent-mint/25 blur-xs animate-pulse" style={{ animationDuration: "4s" }}></div>
      </div>

      {/* Cinematic Logo Core Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md px-6 space-y-8 animate-fade-in">
        {/* Animated Custom SVG Logo */}
        <div className="relative group">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-accent-mint via-accent-blue to-accent-violet opacity-30 blur-2xl group-hover:opacity-50 transition-all duration-550 animate-spin" style={{ animationDuration: "25s" }}></div>
          <svg className="w-24 h-24 text-accent-mint relative z-10 stroke-current text-accent-mint" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(108, 236, 200, 0.1)"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
            <path d="M12 22V12" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="3 3"></path>
          </svg>
          <div className="absolute top-0 right-0 p-1.5 bg-brand-deep rounded-full border border-glass shadow relative z-20 -mr-1.5">
            <Sparkles className="h-4 w-4 text-accent-mint animate-pulse" />
          </div>
        </div>

        {/* Brand Architecture Title */}
        <div className="space-y-2">
          <h2 className="text-4xl font-space font-extrabold tracking-tighter text-brand-primary uppercase">
            PROMPT <span className="text-accent-mint">ARCHITECT</span>
          </h2>
          <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-brand-muted/50">
            SYSTEM LOADER v7.0 // CLOUD RUN CORE
          </p>
        </div>

        {/* Display Message Dynamic Carousel */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted/80 transition-all duration-350 font-sans">
            {LOADING_MESSAGES[activeMessageIdx]}
          </p>
        </div>

        {/* Premium Progress Bar Wrapper */}
        <div className="w-full max-w-[280px]">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-glass p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-accent-mint via-accent-blue to-accent-violet rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_color-mix(in_srgb,var(--accent-primary)_70%,transparent)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2.5 px-1">
            <span className="text-[9px] font-mono text-brand-muted/40 uppercase tracking-widest">
              SYSTEM BOOTING
            </span>
            <span className="text-[9px] font-mono text-accent-mint font-bold">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
