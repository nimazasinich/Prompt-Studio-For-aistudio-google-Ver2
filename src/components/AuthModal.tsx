/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Shield, Lock, Mail, User, BookOpen, LogOut, Check, Globe } from "lucide-react";
import { UserProfile } from "../types";

interface AuthModalProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export default function AuthModal({ onClose, currentUser, onLogin, onLogout }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "profile">(
    currentUser ? "profile" : "login"
  );
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [preferredModel, setPreferredModel] = useState(currentUser?.preferredModel || "Gemini 2.0 Flash");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages on tab change
  const handleTabChange = (tab: "login" | "signup" | "profile") => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg("All fields are required to register.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Registration successful! Logging you in...");
        onLogin(data);
        setTimeout(() => {
          setActiveTab("profile");
          setBio(data.bio || "");
          setPreferredModel(data.preferredModel || "Gemini 2.0 Flash");
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(data.error || "Failed to register.");
      }
    } catch (err: any) {
      setErrorMsg("Network error encountered during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Logged in successfully!");
        onLogin(data);
        setTimeout(() => {
          setActiveTab("profile");
          setBio(data.bio || "");
          setPreferredModel(data.preferredModel || "Gemini 2.0 Flash");
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(data.error || "Invalid user credentials.");
      }
    } catch (err) {
      setErrorMsg("Network error encountered during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMockLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailMock = `${provider}-developer@aistudio.com`;
    const nameMock = provider === "google" ? "Google Architect" : "GitHub Contributor";
    const avatarMock = provider === "google" 
      ? "https://lh3.googleusercontent.com/a/default-user" 
      : "https://github.com/identicons/default.png";

    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailMock,
          name: nameMock,
          provider,
          avatarUrl: avatarMock,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Authenticated via ${provider.toUpperCase()}!`);
        onLogin(data);
        setTimeout(() => {
          setActiveTab("profile");
          setBio(data.bio || "");
          setPreferredModel(data.preferredModel || "Gemini 2.0 Flash");
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(data.error || "Social authentication failed.");
      }
    } catch (err) {
      setErrorMsg("Network error during social auth.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Email": currentUser.email,
        },
        body: JSON.stringify({ 
          name: currentUser.name, // hold name same or editable
          bio, 
          preferredModel 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Profile metadata synced perfectly!");
        onLogin(data); // update cache in App.tsx
        setTimeout(() => setSuccessMsg(null), 2500);
      } else {
        setErrorMsg(data.error || "Sync update failed.");
      }
    } catch (err) {
      setErrorMsg("Network error during profile update.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoff = () => {
    onLogout();
    setActiveTab("login");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040910]/95 backdrop-blur-md p-6 select-none animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#07101F] border border-white/8 p-8 shadow-2xl overflow-hidden animate-zoom-in text-[#EDF2FF]/95">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#6CECC8] via-[#79AEFF] to-[#B48FFF]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Identity Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-[#6CECC8]/10 text-[#6CECC8] border border-[#6CECC8]/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-black uppercase tracking-wider text-white">Identity Console</h4>
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Secured sandbox session key</p>
          </div>
        </div>

        {/* Tab selection */}
        {!currentUser && (
          <div className="flex border-b border-white/10 mb-6 font-sans">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 pb-3 text-xs uppercase font-extrabold tracking-wider text-center transition-all ${
                activeTab === "login"
                  ? "border-b-2 border-emerald-500 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("signup")}
              className={`flex-1 pb-3 text-xs uppercase font-extrabold tracking-wider text-center transition-all ${
                activeTab === "signup"
                  ? "border-b-2 border-emerald-500 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Notification Feedback block */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-mono uppercase tracking-wider">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login tab */}
        {activeTab === "login" && !currentUser && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white tracking-wide placeholder:text-white/20"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Access Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/20"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? "Authenticating..." : "Synchronize Identity"}
            </button>

            {/* Social Divider */}
            <div className="relative my-6 flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-3xs font-mono text-white/30 uppercase tracking-widest">Federated Access</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialMockLogin("google")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] uppercase font-mono tracking-wider font-extrabold hover:bg-white/10 transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialMockLogin("github")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] uppercase font-mono tracking-wider font-extrabold hover:bg-white/10 transition-all"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>GitHub</span>
              </button>
            </div>
          </form>
        )}

        {/* Signup Tab */}
        {activeTab === "signup" && !currentUser && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white tracking-wide placeholder:text-white/20"
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white tracking-wide placeholder:text-white/20"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Choose Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/20"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? "Provisioning..." : "Launch Account Session"}
            </button>
          </form>
        )}

        {/* Profile Management Tab */}
        {currentUser && (
          <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
            {/* User Identity Banner */}
            <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-2xl p-4 mb-2">
              <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black text-xs font-black uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{currentUser.provider === "local" ? "Verified Local User" : `${currentUser.provider} account`}</span>
                <h5 className="text-sm font-bold text-white truncate">{currentUser.name}</h5>
                <p className="text-[10px] font-mono text-white/40 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Role / Executive Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Weave a brief bio of your system architectural specializations..."
                rows={2}
                className="w-full text-xs rounded-xl border border-white/10 px-4 py-2.5 focus:border-emerald-500 focus:outline-none bg-white/5 text-white placeholder:text-white/20 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-mono text-white/40 uppercase tracking-widest block">Default Workspace Model</label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/8 px-4 py-2.5 focus:border-[#6CECC8] focus:outline-none bg-white/5 text-[#9BAAD4] focus:text-white"
              >
                <option value="Gemini 2.0 Flash" className="bg-[#07101F]">Gemini 2.0 Flash (Default)</option>
                <option value="Gemini 1.5 Pro" className="bg-[#07101F]">Gemini 1.5 Pro (Precision Context)</option>
                <option value="Gemini 1.5 Flash" className="bg-[#07101F]">Gemini 1.5 Flash (Bulk Inferences)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleLogoff}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-extrabold text-[11px] uppercase tracking-wider transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-500 text-black hover:bg-emerald-450 transition-all font-black text-[11px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-1"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>Sync Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
