export interface ToneOption {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: "normal",
    label: "Normal",
    icon: "💬",
    prompt: "Usa un tono neutro, claro y directo. Ni formal ni informal. Responde de manera equilibrada: una definición precisa seguida de un ejemplo concreto. Sin adornos, sin frases motivacionales, sin estructura de clase. Solo la información necesaria, bien expresada.",
  },
  {
    id: "academico",
    label: "Académico",
    icon: "📖",
    prompt: "Adopta el estilo de un paper académico o un libro de texto universitario. Usa terminología técnica precisa y no la simplifiques. Estructura la respuesta con definición formal, fundamento teórico y contexto dentro del campo. Menciona limitaciones, matices y relaciones con otros conceptos del área. Evita coloquialismos. El tono debe ser impersonal, riguroso y denso en contenido. No uses frases como 'imagina que...' o 'es como si...'.",
  },
  {
    id: "profesional",
    label: "Profesional",
    icon: "💼",
    prompt: "Adopta el tono de un consultor senior hablando con un directivo. Ve directo al valor: qué es, qué problema resuelve, qué impacto tiene en el negocio y qué decisión debería tomar el usuario. Usa lenguaje ejecutivo: conciso, orientado a ROI, riesgos y oportunidades. Evita explicaciones largas. Si hay una recomendación clara, dala. El usuario no tiene tiempo que perder.",
  },
  {
    id: "didactico",
    label: "Didáctico",
    icon: "🎓",
    prompt: "Eres un profesor paciente explicando a alguien que aprende por primera vez. Empieza siempre con una analogía del mundo real antes de usar el término técnico. Luego introduce el concepto gradualmente. Usa frases como 'piénsalo así:', 'un ejemplo sencillo sería:', 'la diferencia clave es:'. Haz una pregunta de comprensión al final para invitar a seguir explorando. El objetivo es que el concepto quede grabado, no solo entendido.",
  },
  {
    id: "informal",
    label: "Informal",
    icon: "😊",
    prompt: "Habla como un amigo que sabe mucho de IA explicándote algo en un café. Usa lenguaje cotidiano, contracciones, ejemplos de la vida diaria y un tono relajado. Puedes usar expresiones como 'básicamente', 'o sea', 'la idea es que...'. Nada de jerga innecesaria. Si algo es complicado, admítelo con humor y búscale la vuelta más simple. El objetivo es que la persona se sienta cómoda preguntando cualquier cosa.",
  },
  {
    id: "mentor",
    label: "Mentor",
    icon: "🚀",
    prompt: "Eres un mentor que conoce bien el campo profesional del usuario y quiere ayudarle a crecer. No te limites a explicar el concepto: conecta ese conocimiento con el desarrollo profesional del usuario, señala por qué es estratégico aprenderlo ahora, y sugiere un próximo paso concreto que pueda dar. Usa un tono cálido, directo y motivador. Celebra la curiosidad. Termina siempre con una pregunta o reto que invite a profundizar.",
  },
];

export interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  shortDefinition: string;
  relatedTerms: string[];
}

export interface UserProfile {
  profession: string;
  label: string;
  icon: string;
  systemPromptContext: string;
}

export const USER_PROFILES: UserProfile[] = [
  {
    profession: "medico",
    label: "Médico / Profesional de la salud",
    icon: "🏥",
    systemPromptContext:
      "El usuario es médico o profesional de la salud. Usa analogías con diagnósticos, registros de pacientes, flujos clínicos y gestión hospitalaria. Relaciona los conceptos de IA con aplicaciones en salud como diagnóstico asistido, análisis de imágenes médicas, resumen de historiales clínicos o asistentes de prescripción.",
  },
  {
    profession: "ingeniero",
    label: "Ingeniero / Desarrollador",
    icon: "⚙️",
    systemPromptContext:
      "El usuario es ingeniero o desarrollador de software. Usa terminología técnica precisa, habla de APIs, pipelines, arquitecturas de sistemas, code review automatizado, CI/CD y automatización de procesos de desarrollo. Puedes usar pseudocódigo o ejemplos técnicos.",
  },
  {
    profession: "abogado",
    label: "Abogado / Profesional legal",
    icon: "⚖️",
    systemPromptContext:
      "El usuario es abogado o trabaja en el ámbito legal. Usa analogías con contratos, due diligence, revisión de documentos legales, análisis de jurisprudencia y gestión de casos. Relaciona la IA con aplicaciones como revisión contractual automatizada, búsqueda legal y redacción de documentos.",
  },
  {
    profession: "educador",
    label: "Educador / Docente",
    icon: "🎓",
    systemPromptContext:
      "El usuario es educador o docente. Usa analogías con planes de estudio, evaluación de estudiantes, personalización del aprendizaje y gestión del aula. Relaciona la IA con tutoría personalizada, generación de contenido educativo, evaluación automática y asistentes de aprendizaje.",
  },
  {
    profession: "marketing",
    label: "Marketing / Ventas",
    icon: "📊",
    systemPromptContext:
      "El usuario trabaja en marketing o ventas. Usa analogías con campañas, segmentación de clientes, generación de leads, copywriting y análisis de métricas. Relaciona la IA con generación de contenido, personalización de mensajes, análisis de sentimiento y automatización de campañas.",
  },
  {
    profession: "financiero",
    label: "Finanzas / Contabilidad",
    icon: "💰",
    systemPromptContext:
      "El usuario trabaja en finanzas o contabilidad. Usa analogías con análisis financiero, auditoría, gestión de riesgos y reportes. Relaciona la IA con detección de fraude, análisis predictivo, automatización de reportes contables y asistentes de inversión.",
  },
  {
    profession: "rrhh",
    label: "Recursos Humanos",
    icon: "👥",
    systemPromptContext:
      "El usuario trabaja en recursos humanos. Usa analogías con procesos de selección, evaluación de desempeño, onboarding y cultura organizacional. Relaciona la IA con screening de CVs, entrevistas asistidas, análisis de engagement y automatización de procesos de RRHH.",
  },
  {
    profession: "otro",
    label: "Otro / General",
    icon: "🌐",
    systemPromptContext:
      "El usuario tiene un perfil general o no especificado. Usa ejemplos cotidianos y claros, evita jerga técnica excesiva. Relaciona los conceptos con situaciones del día a día en el trabajo.",
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "agente",
    term: "Agente (AI Agent)",
    category: "Agentes",
    shortDefinition: "Sistema de IA que puede tomar decisiones, usar herramientas y ejecutar acciones de forma autónoma para completar tareas complejas.",
    relatedTerms: ["skill", "tool-use", "workflow"],
  },
  {
    id: "hallucination",
    term: "Alucinación (Hallucination)",
    category: "Conceptos",
    shortDefinition: "Cuando un modelo genera información incorrecta o inventada con aparente seguridad. Es un riesgo clave a mitigar en aplicaciones críticas.",
    relatedTerms: ["rag", "prompt", "llm"],
  },
  {
    id: "api",
    term: "API",
    category: "Infraestructura",
    shortDefinition: "Application Programming Interface — interfaz que permite integrar las capacidades de un modelo de IA en cualquier aplicación o sistema.",
    relatedTerms: ["token", "gpt", "tool-use"],
  },
  {
    id: "contexto",
    term: "Contexto (Context Window)",
    category: "Modelos",
    shortDefinition: "La cantidad máxima de texto (tokens) que un modelo puede procesar en una sola interacción, incluyendo el historial de la conversación.",
    relatedTerms: ["token", "llm", "prompt"],
  },
  {
    id: "copilot",
    term: "Copilot",
    category: "Conceptos",
    shortDefinition: "Asistente de IA que trabaja junto al humano, sugiriendo y apoyando decisiones sin reemplazar al profesional. El humano mantiene el control.",
    relatedTerms: ["agente", "workflow"],
  },
  {
    id: "embedding",
    term: "Embedding",
    category: "Técnicas",
    shortDefinition: "Representación numérica de texto que captura su significado semántico. Permite comparar y buscar textos por similitud de significado.",
    relatedTerms: ["rag", "vector-db", "llm"],
  },
  {
    id: "fine-tuning",
    term: "Fine-tuning",
    category: "Técnicas",
    shortDefinition: "Proceso de re-entrenar un modelo pre-existente con datos específicos de un dominio para especializarlo en tareas concretas.",
    relatedTerms: ["llm", "prompt"],
  },
  {
    id: "gpt",
    term: "GPT",
    category: "Modelos",
    shortDefinition: "Generative Pre-trained Transformer — familia de modelos de lenguaje de OpenAI. La base de ChatGPT y la API de OpenAI.",
    relatedTerms: ["llm", "token", "api"],
  },
  {
    id: "llm",
    term: "LLM",
    category: "Modelos",
    shortDefinition: "Large Language Model — modelo de IA entrenado con grandes volúmenes de texto capaz de generar y comprender lenguaje natural.",
    relatedTerms: ["gpt", "prompt", "token"],
  },
  {
    id: "modelo",
    term: "Modelo",
    category: "Modelos",
    shortDefinition: "Sistema computacional entrenado con grandes volúmenes de datos que aprende patrones para realizar tareas como generar texto o tomar decisiones. Ejemplos: GPT-4, Claude, Gemini.",
    relatedTerms: ["llm", "fine-tuning", "temperatura"],
  },
  {
    id: "multimodal",
    term: "Multimodal",
    category: "Modelos",
    shortDefinition: "Modelo capaz de procesar y generar diferentes tipos de información: texto, imágenes, audio o video en una misma interacción.",
    relatedTerms: ["llm", "gpt"],
  },
  {
    id: "prompt",
    term: "Prompt",
    category: "Interacción",
    shortDefinition: "Instrucción o texto que se le da a un modelo de IA para obtener una respuesta. Es la forma principal de comunicarse con un LLM.",
    relatedTerms: ["llm", "system-prompt", "contexto"],
  },
  {
    id: "prompt-engineering",
    term: "Prompt Engineering",
    category: "Técnicas",
    shortDefinition: "Disciplina de diseñar instrucciones efectivas para obtener mejores resultados de un modelo de IA. Incluye técnicas como chain-of-thought o few-shot prompting.",
    relatedTerms: ["prompt", "system-prompt", "llm"],
  },
  {
    id: "rag",
    term: "RAG",
    category: "Técnicas",
    shortDefinition: "Retrieval-Augmented Generation — técnica que combina búsqueda en documentos propios con generación de texto para dar respuestas más precisas y actualizadas.",
    relatedTerms: ["embedding", "vector-db", "llm"],
  },
  {
    id: "skill",
    term: "Skill",
    category: "Agentes",
    shortDefinition: "Capacidad específica que se le da a un agente de IA: una función, herramienta o comportamiento pre-definido que el agente puede invocar.",
    relatedTerms: ["agente", "tool-use", "workflow"],
  },
  {
    id: "system-prompt",
    term: "System Prompt",
    category: "Interacción",
    shortDefinition: "Instrucción inicial que define el comportamiento, rol y restricciones del modelo antes de que el usuario empiece a interactuar.",
    relatedTerms: ["prompt", "agente", "contexto"],
  },
  {
    id: "temperatura",
    term: "Temperatura",
    category: "Modelos",
    shortDefinition: "Parámetro que controla la creatividad/aleatoriedad de las respuestas. Temperatura 0 = respuestas predecibles, temperatura 1 = más creativas.",
    relatedTerms: ["llm", "prompt"],
  },
  {
    id: "token",
    term: "Token",
    category: "Modelos",
    shortDefinition: "Unidad básica de texto que procesa un LLM. Aproximadamente 1 token ≈ 0.75 palabras. Los costos de la API se calculan en tokens.",
    relatedTerms: ["llm", "contexto", "api"],
  },
  {
    id: "tool-use",
    term: "Tool Use / Function Calling",
    category: "Agentes",
    shortDefinition: "Capacidad de un LLM para invocar funciones externas (buscar en internet, ejecutar código, consultar APIs) durante una conversación.",
    relatedTerms: ["agente", "skill", "api"],
  },
  {
    id: "vector-db",
    term: "Vector Database",
    category: "Técnicas",
    shortDefinition: "Base de datos especializada en almacenar y buscar embeddings de forma eficiente. Es la infraestructura central de sistemas RAG.",
    relatedTerms: ["embedding", "rag"],
  },
  {
    id: "workflow",
    term: "Workflow / Pipeline",
    category: "Agentes",
    shortDefinition: "Secuencia estructurada de pasos que un agente sigue para completar una tarea, combinando múltiples llamadas al modelo y herramientas.",
    relatedTerms: ["agente", "skill", "tool-use"],
  },
];
