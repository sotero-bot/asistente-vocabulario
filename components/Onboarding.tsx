"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserProfile, USER_PROFILES, ToneOption, TONE_OPTIONS, Sector, SECTORS } from "@/lib/glossary";
import { buildProfileFromRecord, UserRecord } from "@/lib/profile";

export interface InitialMessage {
  message_id: string;
  role: "user" | "assistant";
  content: string;
}

interface OnboardingSelection {
  profile: UserProfile;
  tone: ToneOption;
  userId: string;
  email: string;
  conversationId: string | null;
  initialMessages: InitialMessage[];
}

interface OnboardingProps {
  onSelect: (selection: OnboardingSelection) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Onboarding({ onSelect }: OnboardingProps) {
  const [email, setEmail] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [customProfession, setCustomProfession] = useState("");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [customSector, setCustomSector] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returning user flow
  const [existingUser, setExistingUser] = useState<UserRecord | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const professionReady = !!(selectedProfile || customProfession.trim());
  const sectorLabel = selectedSector?.label ?? customSector.trim();
  const canContinue = emailValid && professionReady && !!sectorLabel && !submitting;

  // Lookup email when it becomes valid (debounced)
  useEffect(() => {
    if (!emailValid) {
      setExistingUser(null);
      return;
    }
    const t = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await fetch("/api/users/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            setExistingUser(data.user as UserRecord);
            setForceEdit(false);
          } else {
            setExistingUser(null);
          }
        }
      } catch {}
      finally {
        setLookupLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [email, emailValid]);

  const resetSector = () => {
    setSelectedSector(null);
    setCustomSector("");
  };

  const buildProfile = (): UserProfile => {
    const sector = selectedSector?.label ?? customSector.trim();
    if (selectedProfile) {
      return {
        ...selectedProfile,
        systemPromptContext:
          selectedProfile.systemPromptContext +
          `\n\nIMPORTANTE: El usuario trabaja específicamente en el sector de ${sector}. Aterriza todos los ejemplos, casos de uso y referencias al contexto concreto de ese sector.`,
      };
    }
    const name = customProfession.trim();
    return {
      profession: "custom",
      label: `${name} · ${sector}`,
      icon: "💼",
      systemPromptContext: `El usuario trabaja como ${name} en el sector de ${sector}. Adapta tus explicaciones y ejemplos a ese contexto específico. Usa casos de uso, flujos de trabajo y terminología relevante para un ${name} en el sector de ${sector}. Relaciona los conceptos de IA con aplicaciones prácticas que le serían útiles en su día a día.`,
    };
  };

  const loadHistoryAndFinish = async (
    profile: UserProfile,
    tone: ToneOption,
    userId: string
  ) => {
    let conversationId: string | null = null;
    let initialMessages: InitialMessage[] = [];
    try {
      const res = await fetch("/api/conversations/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          conversationId = data.conversation_id;
          initialMessages = data.messages;
        }
      }
    } catch {}
    onSelect({
      profile,
      tone,
      userId,
      email: email.trim().toLowerCase(),
      conversationId,
      initialMessages,
    });
  };

  const handleContinueExisting = async () => {
    if (!existingUser) return;
    setSubmitting(true);
    setError(null);
    const { profile, tone } = buildProfileFromRecord(existingUser);
    // touch last_seen_at
    try {
      await fetch("/api/users/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } catch {}
    await loadHistoryAndFinish(profile, tone, existingUser.user_id);
  };

  const handleContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    const profile = buildProfile();
    const sectorVal = selectedSector?.label ?? customSector.trim();
    try {
      const res = await fetch("/api/users/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          profession: selectedProfile?.profession ?? "custom",
          profession_label: selectedProfile?.label ?? customProfession.trim(),
          custom_profession: selectedProfile ? null : customProfession.trim(),
          sector: selectedSector?.id ?? null,
          custom_sector: selectedSector ? null : sectorVal,
          tone: selectedTone.id,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo registrar el usuario");
      }
      const { user_id } = (await res.json()) as { user_id: string };
      await loadHistoryAndFinish(profile, selectedTone, user_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setSubmitting(false);
    }
  };

  // Returning user view: skip profession/sector/tone
  const showReturning = existingUser && !forceEdit;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo-horizontal.png"
              alt="Asistente Vocabulario"
              width={260}
              height={80}
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Asistente Vocabulario</h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-xl mx-auto">
            Tu glosario personalizado de IA que te permite resolver dudas y hacer preguntas sobre
            Inteligencia Artificial y Agentes, aterrizado a tu mercado con ejemplos reales de tu
            profesión.
          </p>
          {!showReturning && (
            <div className="mt-5 text-left inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-700 mb-1">Para comenzar, sigue estos pasos:</p>
              <p>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">1</span>
                Ingresa tu correo electrónico.
              </p>
              <p>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">2</span>
                Selecciona tu profesión. Si no aparece en la lista, escríbela abajo.
              </p>
              <p>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">3</span>
                Selecciona el sector en el que trabajas.
              </p>
              <p>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">4</span>
                Selecciona el tono que quieres en las respuestas{" "}
                <span className="text-slate-400">(puedes cambiarlo después)</span>.
              </p>
            </div>
          )}
        </div>

        {/* Step 1: Email */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          1 · Tu correo electrónico
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full bg-white border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors shadow-sm"
          autoComplete="email"
        />
        {lookupLoading && (
          <p className="mt-2 text-xs text-slate-400">Buscando tu cuenta...</p>
        )}

        {/* Returning user welcome */}
        {showReturning && (() => {
          const { profile: rebuilt, tone: rebuiltTone, sectorLabel: secLabel } =
            buildProfileFromRecord(existingUser);
          return (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                👋 ¡Hola de nuevo!
              </p>
              <p className="text-sm text-slate-700 mb-1">
                Te recordamos como:
              </p>
              <p className="text-sm text-slate-800 mb-3">
                <span className="mr-1">{rebuilt.icon}</span>
                <span className="font-medium">{rebuilt.label}</span>
                {secLabel && !rebuilt.label.includes(secLabel) && (
                  <span className="text-slate-500"> · {secLabel}</span>
                )}
                <span className="text-slate-500">
                  {" · "}Tono {rebuiltTone.icon} {rebuiltTone.label}
                </span>
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Cargaremos tu última conversación para que sigas donde la dejaste.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleContinueExisting}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? "Cargando..." : "Continuar con mi perfil"}
                </button>
                <button
                  onClick={() => setForceEdit(true)}
                  disabled={submitting}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  Editar perfil
                </button>
              </div>
            </div>
          );
        })()}

        {/* Step 2: Profession */}
        {emailValid && !showReturning && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              2 · Selecciona tu profesión
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {USER_PROFILES.map((profile) => (
                <button
                  key={profile.profession}
                  onClick={() => { setSelectedProfile(profile); setCustomProfession(""); resetSector(); }}
                  className={`flex items-center gap-4 p-4 border rounded-xl transition-all duration-200 text-left shadow-sm ${
                    selectedProfile?.profession === profile.profession
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                      : "bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <span className="text-3xl">{profile.icon}</span>
                  <span
                    className={`font-medium transition-colors ${
                      selectedProfile?.profession === profile.profession
                        ? "text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    {profile.label}
                  </span>
                  {selectedProfile?.profession === profile.profession && (
                    <span className="ml-auto text-blue-600 text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom profession */}
            <div className="mt-4">
              <p className="text-slate-400 text-sm text-center mb-3">
                ¿Tu profesión no aparece? Escríbela aquí
              </p>
              <input
                type="text"
                value={customProfession}
                onChange={(e) => {
                  setCustomProfession(e.target.value);
                  if (e.target.value.trim()) { setSelectedProfile(null); resetSector(); }
                }}
                placeholder="Ej: Arquitecto, Periodista, Chef..."
                className="w-full bg-white border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Sector */}
        {emailValid && !showReturning && professionReady && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              3 · Selecciona tu sector
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTORS.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => { setSelectedSector(sector); setCustomSector(""); }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedSector?.id === sector.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <span>{sector.icon}</span>
                  <span>{sector.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-slate-400 text-sm text-center mb-3">
                ¿Tu sector no aparece? Escríbelo aquí
              </p>
              <input
                type="text"
                value={customSector}
                onChange={(e) => {
                  setCustomSector(e.target.value);
                  if (e.target.value.trim()) setSelectedSector(null);
                }}
                placeholder="Ej: Energía, Turismo, Seguros..."
                className="w-full bg-white border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Tone */}
        {emailValid && !showReturning && professionReady && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              4 · Selecciona el tono de las respuestas
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedTone.id === tone.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <span>{tone.icon}</span>
                  <span>{tone.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Continue button for new users / editing flow */}
        {!showReturning && canContinue && (
          <button
            onClick={handleContinue}
            disabled={submitting}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
          >
            {submitting
              ? "Registrando..."
              : `Continuar como ${selectedProfile?.icon ?? "💼"} ${
                  selectedProfile?.label ?? customProfession.trim()
                } · ${sectorLabel}`}
          </button>
        )}
      </div>
    </div>
  );
}
