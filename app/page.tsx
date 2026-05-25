"use client";

import { useState } from "react";
import Image from "next/image";
import Onboarding, { InitialMessage } from "@/components/Onboarding";
import GlossaryPanel from "@/components/GlossaryPanel";
import ChatPanel from "@/components/ChatPanel";
import dynamic from "next/dynamic";
const TourGuide = dynamic(() => import("@/components/TourGuide"), { ssr: false });
import { GlossaryTerm, UserProfile, ToneOption, TONE_OPTIONS, GLOSSARY_TERMS } from "@/lib/glossary";

const USER_ID_KEY = "glosario_user_id";
const USER_EMAIL_KEY = "glosario_user_email";

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialTone, setInitialTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<InitialMessage[]>([]);
  const [pendingTerm, setPendingTerm] = useState<GlossaryTerm | null>(null);
  const [activeView, setActiveView] = useState<"glossary" | "chat">("glossary");

  if (!profile || !userId) {
    return (
      <Onboarding
        onSelect={(s) => {
          setProfile(s.profile);
          setInitialTone(s.tone);
          setUserId(s.userId);
          setUserEmail(s.email);
          setConversationId(s.conversationId);
          setInitialMessages(s.initialMessages);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(USER_ID_KEY, s.userId);
            window.localStorage.setItem(USER_EMAIL_KEY, s.email);
          }
        }}
      />
    );
  }

  const handleTermClick = (term: GlossaryTerm) => {
    setPendingTerm(term);
    setActiveView("chat");
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_ID_KEY);
      window.localStorage.removeItem(USER_EMAIL_KEY);
    }
    setProfile(null);
    setUserId(null);
    setUserEmail(null);
    setConversationId(null);
    setInitialMessages([]);
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
          {userEmail && (
            <span className="text-slate-400 text-xs hidden md:inline">{userEmail}</span>
          )}
          <button
            onClick={handleReset}
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
              userId={userId}
              initialConversationId={conversationId}
              initialMessages={initialMessages}
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
              userId={userId}
              initialConversationId={conversationId}
              initialMessages={initialMessages}
              pendingTerm={pendingTerm}
              onTermConsumed={() => setPendingTerm(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
