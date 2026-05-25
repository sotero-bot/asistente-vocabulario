import {
  UserProfile,
  USER_PROFILES,
  TONE_OPTIONS,
  SECTORS,
  ToneOption,
} from "@/lib/glossary";

export interface UserRecord {
  user_id: string;
  email: string;
  profession: string | null;
  profession_label: string | null;
  custom_profession: string | null;
  sector: string | null;
  custom_sector: string | null;
  tone: string | null;
}

export function buildProfileFromRecord(rec: UserRecord): {
  profile: UserProfile;
  tone: ToneOption;
  sectorLabel: string;
} {
  const sectorObj = rec.sector ? SECTORS.find((s) => s.id === rec.sector) : null;
  const sectorLabel = sectorObj?.label ?? rec.custom_sector ?? "";
  const tone =
    (rec.tone && TONE_OPTIONS.find((t) => t.id === rec.tone)) || TONE_OPTIONS[0];

  if (rec.profession && rec.profession !== "custom") {
    const base = USER_PROFILES.find((p) => p.profession === rec.profession);
    if (base) {
      return {
        profile: {
          ...base,
          systemPromptContext:
            base.systemPromptContext +
            `\n\nIMPORTANTE: El usuario trabaja específicamente en el sector de ${sectorLabel}. Aterriza todos los ejemplos, casos de uso y referencias al contexto concreto de ese sector.`,
        },
        tone,
        sectorLabel,
      };
    }
  }

  const name = rec.custom_profession ?? rec.profession_label ?? "Profesional";
  return {
    profile: {
      profession: "custom",
      label: `${name} · ${sectorLabel}`,
      icon: "💼",
      systemPromptContext: `El usuario trabaja como ${name} en el sector de ${sectorLabel}. Adapta tus explicaciones y ejemplos a ese contexto específico. Usa casos de uso, flujos de trabajo y terminología relevante para un ${name} en el sector de ${sectorLabel}. Relaciona los conceptos de IA con aplicaciones prácticas que le serían útiles en su día a día.`,
    },
    tone,
    sectorLabel,
  };
}
