"use client";

import { useState } from "react";
import Image from "next/image";
import { UserProfile, USER_PROFILES, ToneOption, TONE_OPTIONS, Sector, SECTORS } from "@/lib/glossary";

interface OnboardingSelection {
  profile: UserProfile;
  tone: ToneOption;
}

interface OnboardingProps {
  onComplete: (selection: OnboardingSelection) => void;
  onCancel?: () => void;
}

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [customProfession, setCustomProfession] = useState("");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [customSector, setCustomSector] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const professionReady = !!(selectedProfile || customProfession.trim());
  const sectorLabel = selectedSector?.label ?? customSector.trim();
  const canContinue = professionReady && !!sectorLabel && !submitting;

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
        throw new Error(j.error || "No se pudo guardar tu perfil");
      }
      onComplete({ profile, tone: selectedTone });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setSubmitting(false);
    }
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
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Personaliza tu asistente</h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-xl mx-auto">
            Cuéntanos a qué te dedicas para adaptar las explicaciones de IA a tu
            profesión y sector con ejemplos reales.
          </p>
        </div>

        {/* Profesión */}
        <div>
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

        {/* Sector */}
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

        {/* Tono */}
        {professionReady && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              3 · Selecciona el tono de las respuestas
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

        {canContinue && (
          <button
            onClick={handleContinue}
            disabled={submitting}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
          >
            {submitting
              ? "Guardando..."
              : `Continuar como ${selectedProfile?.icon ?? "💼"} ${
                  selectedProfile?.label ?? customProfession.trim()
                } · ${sectorLabel}`}
          </button>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={submitting}
            className="mt-3 w-full text-slate-400 hover:text-slate-600 text-sm transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
