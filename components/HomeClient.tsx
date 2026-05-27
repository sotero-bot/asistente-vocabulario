"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Onboarding from "@/components/Onboarding";
import GlossaryPanel from "@/components/GlossaryPanel";
import ChatPanel from "@/components/ChatPanel";
import { GlossaryTerm, UserProfile, ToneOption, TONE_OPTIONS, GLOSSARY_TERMS } from "@/lib/glossary";
import { buildProfileFromRecord, UserRecord } from "@/lib/profile";
import { logout } from "@/app/actions";

const TourGuide = dynamic(() => import("@/components/TourGuide"), { ssr: false });

export interface InitialMessage {
  message_id: string;
  role: "user" | "assistant";
  content: string;
}

interface HomeClientProps {
  user: UserRecord & { active: boolean };
  needsOnboarding: boolean;
  initialConversationId: string | null;
  initialMessages: InitialMessage[];
}

export default function HomeClient({
  user,
  needsOnboarding,
  initialConversationId,
  initialMessages,
}: HomeClientProps) {
  const built = needsOnboarding ? null : buildProfileFromRecord(user);

  const [profile, setProfile] = useState<UserProfile | null>(built?.profile ?? null);
  const [initialTone, setInitialTone] = useState<ToneOption>(built?.tone ?? TONE_OPTIONS[0]);
  const [editing, setEditing] = useState(needsOnboarding);
  const [pendingTerm, setPendingTerm] = useState<GlossaryTerm | null>(null);
  const [activeView, setActiveView] = useState<"glossary" | "chat">("glossary");

  if (editing || !profile) {
    return (
      <Onboarding
        onComplete={(s) => {
          setProfile(s.profile);
          setInitialTone(s.tone);
          setEditing(false);
        }}
        onCancel={profile ? () => setEditing(false) : undefined}
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
          <span className="text-slate-400 text-xs hidden md:inline">{user.email}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-blue-600 text-xs underline transition-colors"
          >
            Cambiar perfil
          </button>
          <form action={logout}>
            <button
              type="submit"
              className="text-slate-400 hover:text-red-600 text-xs underline transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
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
              userId={user.user_id}
              initialConversationId={initialConversationId}
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
              userId={user.user_id}
              initialConversationId={initialConversationId}
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
