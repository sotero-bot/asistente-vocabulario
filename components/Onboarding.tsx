"use client";

import { useState } from "react";
import Image from "next/image";
import { UserProfile, USER_PROFILES, ToneOption, TONE_OPTIONS, Sector, SECTORS } from "@/lib/glossary";

interface OnboardingProps {
  onSelect: (profile: UserProfile, tone: ToneOption) => void;
}

export default function Onboarding({ onSelect }: OnboardingProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [customProfession, setCustomProfession] = useState("");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [customSector, setCustomSector] = useState("");

  const professionReady = !!(selectedProfile || customProfession.trim());
  const sectorLabel = selectedSector?.label ?? customSector.trim();
  const canContinue = professionReady && !!sectorLabel;

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

  const handleContinue = () => {
    if (!canContinue) return;
    onSelect(buildProfile(), selectedTone);
  };

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
          <div className="mt-5 text-left inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-600 space-y-2">
            <p className="font-semibold text-slate-700 mb-1">Para comenzar, sigue estos pasos:</p>
            <p>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">1</span>
              Selecciona tu profesión. Si no aparece en la lista, escríbela abajo.
            </p>
            <p>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">2</span>
              Selecciona el sector en el que trabajas.
            </p>
            <p>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">3</span>
              Selecciona el tono que quieres en las respuestas{" "}
              <span className="text-slate-400">(puedes cambiarlo después)</span>.
            </p>
          </div>
        </div>

        {/* Step 1: Profession */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          1 · Selecciona tu profesión
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

        {/* Step 2: Sector (appears once profession is ready) */}
        {professionReady && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              2 · Selecciona tu sector
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

        {/* Step 3: Tone */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {professionReady ? "3" : "2"} · Selecciona el tono de las respuestas
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

        {/* Continue button */}
        {canContinue && (
          <button
            onClick={handleContinue}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
          >
            Continuar como {selectedProfile?.icon ?? "💼"}{" "}
            {selectedProfile?.label ?? customProfession.trim()} · {sectorLabel}
          </button>
        )}
      </div>
    </div>
  );
}
