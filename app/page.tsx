"use client";

import { useState } from "react";
import Image from "next/image";
import Onboarding from "@/components/Onboarding";
import GlossaryPanel from "@/components/GlossaryPanel";
import ChatPanel from "@/components/ChatPanel";
import dynamic from "next/dynamic";
const TourGuide = dynamic(() => import("@/components/TourGuide"), { ssr: false });
import { GlossaryTerm, UserProfile, ToneOption, TONE_OPTIONS, GLOSSARY_TERMS } from "@/lib/glossary";

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialTone, setInitialTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [pendingTerm, setPendingTerm] = useState<GlossaryTerm | null>(null);
  const [activeView, setActiveView] = useState<"glossary" | "chat">("glossary");

  if (!profile) {
    return (
      <Onboarding
        onSelect={(p, tone) => {
          setProfile(p);
          setInitialTone(tone);
        }}
      />
    );
  }

  const handleTermClick = (term: GlossaryTerm) => {
    setPendingTerm(term);
    setActiveView("chat");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center shadow-sm relative">
        <Image
          src="/logo-horizontal.png"
          alt="GlosarioIA"
          width={140}
          height={40}
          className="object-contain"
        />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-slate-800 hidden sm:block">
          Asistente Vocabulario
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-slate-500 text-sm hidden sm:inline">
            {profile.icon} {profile.label}
          </span>
          <button
            onClick={() => setProfile(null)}
            className="text-slate-400 hover:text-blue-600 text-xs underline transition-colors"
          >
            Cambiar perfil
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="md:hidden flex bg-white border-b border-slate-200">
        <button
          onClick={() => setActiveView("glossary")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeView === "glossary"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-400"
          }`}
        >
          📚 Glosario
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeView === "chat"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-400"
          }`}
        >
          💬 Chat
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Desktop */}
        <TourGuide />
        <div className="hidden md:flex w-full overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
          <div id="tour-glossary" className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                📚 Glosario · {GLOSSARY_TERMS.length} términos
              </p>
            </div>
            <GlossaryPanel onTermClick={handleTermClick} />
          </div>
          <div id="tour-chat" className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <ChatPanel
              profile={profile}
              initialTone={initialTone}
              pendingTerm={pendingTerm}
              onTermConsumed={() => setPendingTerm(null)}
            />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden bg-white" style={{ height: "calc(100vh - 105px)" }}>
          {activeView === "glossary" ? (
            <GlossaryPanel onTermClick={handleTermClick} />
          ) : (
            <ChatPanel
              profile={profile}
              initialTone={initialTone}
              pendingTerm={pendingTerm}
              onTermConsumed={() => setPendingTerm(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
