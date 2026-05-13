"use client";

import { useState } from "react";
import { UserProfile, USER_PROFILES } from "@/lib/glossary";

interface OnboardingProps {
  onSelect: (profile: UserProfile) => void;
}

export default function Onboarding({ onSelect }: OnboardingProps) {
  const [customProfession, setCustomProfession] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customProfession.trim();
    if (!name) return;
    onSelect({
      profession: "custom",
      label: name,
      icon: "💼",
      systemPromptContext: `El usuario trabaja como ${name}. Adapta tus explicaciones y ejemplos al contexto de su profesión (${name}). Usa casos de uso, flujos de trabajo y terminología relevante para alguien en ese campo. Relaciona los conceptos de IA con aplicaciones prácticas que le serían útiles en su día a día como ${name}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-white mb-2">GlosarioIA</h1>
          <p className="text-slate-400 text-lg">
            Tu glosario personalizado de Inteligencia Artificial y Agentes
          </p>
          <p className="text-slate-500 mt-3 text-sm">
            Selecciona tu área profesional para recibir explicaciones adaptadas a tu contexto
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USER_PROFILES.map((profile) => (
            <button
              key={profile.profession}
              onClick={() => onSelect(profile)}
              className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-xl transition-all duration-200 text-left group"
            >
              <span className="text-3xl">{profile.icon}</span>
              <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                {profile.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-slate-500 text-sm text-center mb-3">
            ¿Tu profesión no aparece? Escríbela aquí
          </p>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customProfession}
              onChange={(e) => setCustomProfession(e.target.value)}
              placeholder="Ej: Arquitecto, Periodista, Chef..."
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!customProfession.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
            >
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
