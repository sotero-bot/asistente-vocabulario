"use client";

import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import GlossaryPanel from "@/components/GlossaryPanel";
import ChatPanel from "@/components/ChatPanel";
import { GlossaryTerm, UserProfile, GLOSSARY_TERMS } from "@/lib/glossary";

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pendingTerm, setPendingTerm] = useState<GlossaryTerm | null>(null);
  const [activeView, setActiveView] = useState<"glossary" | "chat">("glossary");

  if (!profile) {
    return <Onboarding onSelect={(p) => setProfile(p)} />;
  }

  const handleTermClick = (term: GlossaryTerm) => {
    setPendingTerm(term);
    setActiveView("chat");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h1 className="text-white font-bold text-lg">GlosarioIA</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm hidden sm:inline">
            {profile.icon} {profile.label}
          </span>
          <button
            onClick={() => setProfile(null)}
            className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors"
          >
            Cambiar perfil
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-slate-700">
        <button
          onClick={() => setActiveView("glossary")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeView === "glossary"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-400"
          }`}
        >
          📚 Glosario
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeView === "chat"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-slate-400"
          }`}
        >
          💬 Chat
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Desktop: always show both panels */}
        <div className="hidden md:flex w-full overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
          <div className="w-80 border-r border-slate-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                📚 Glosario ({GLOSSARY_TERMS.length} términos)
              </p>
            </div>
            <GlossaryPanel onTermClick={handleTermClick} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatPanel
              profile={profile}
              pendingTerm={pendingTerm}
              onTermConsumed={() => setPendingTerm(null)}
            />
          </div>
        </div>

        {/* Mobile: show one panel at a time */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 105px)" }}>
          {activeView === "glossary" ? (
            <GlossaryPanel onTermClick={handleTermClick} />
          ) : (
            <ChatPanel
              profile={profile}
              pendingTerm={pendingTerm}
              onTermConsumed={() => setPendingTerm(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
