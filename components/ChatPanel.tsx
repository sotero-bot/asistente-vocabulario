"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlossaryTerm, UserProfile, ToneOption, TONE_OPTIONS } from "@/lib/glossary";

interface Message {
  role: "user" | "assistant";
  content: string;
  messageId?: string | null;
}

interface InitialMessageDTO {
  message_id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  profile: UserProfile;
  initialTone: ToneOption;
  userId: string;
  initialConversationId?: string | null;
  initialMessages?: InitialMessageDTO[];
  pendingTerm: GlossaryTerm | null;
  onTermConsumed: () => void;
}

const REPORT_REASONS = [
  { id: "incorrecto", label: "Información incorrecta" },
  { id: "no_responde", label: "No responde a mi pregunta" },
  { id: "tono", label: "Tono inadecuado" },
  { id: "otro", label: "Otro" },
];

const defaultWelcome = (profile: UserProfile): Message => ({
  role: "assistant",
  content: `Hola ${profile.icon} ¡Bienvenido! Estoy aquí para explicarte conceptos de IA adaptados a tu contexto como **${profile.label}**.\n\nPuedes hacer clic en cualquier término del glosario para que te lo explique con ejemplos de tu área, o simplemente preguntarme lo que necesites.`,
});

const hydrateMessages = (incoming: InitialMessageDTO[] | undefined, profile: UserProfile): Message[] => {
  if (!incoming || incoming.length === 0) return [defaultWelcome(profile)];
  return incoming.map((m) => ({
    role: m.role,
    content: m.content,
    messageId: m.message_id,
  }));
};

export default function ChatPanel({
  profile,
  initialTone,
  userId,
  initialConversationId,
  initialMessages,
  pendingTerm,
  onTermConsumed,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    hydrateMessages(initialMessages, profile)
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTone, setActiveTone] = useState(initialTone);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [reportFor, setReportFor] = useState<{ index: number; messageId: string | null } | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0].id);
  const [reportComment, setReportComment] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportedIndices, setReportedIndices] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string, termClicked?: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map(({ role, content }) => ({ role, content })),
            profession: profile.profession,
            systemPromptContext: profile.systemPromptContext,
            tonePrompt: activeTone.prompt,
            tone: activeTone.id,
            userId,
            conversationId,
            termClicked: termClicked ?? null,
          }),
        });

        if (!response.ok) throw new Error("Error en la respuesta");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No se pudo leer la respuesta");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: updated[updated.length - 1].content + parsed.text,
                    };
                    return updated;
                  });
                } else if (parsed.meta) {
                  if (parsed.meta.conversationId) {
                    setConversationId(parsed.meta.conversationId);
                  }
                  const assistantMessageId: string | null = parsed.meta.assistantMessageId ?? null;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      messageId: assistantMessageId,
                    };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Lo siento, ocurrió un error. Por favor intenta de nuevo.",
          };
          return updated;
        });
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, loading, profile, activeTone, userId, conversationId]
  );

  useEffect(() => {
    if (pendingTerm) {
      sendMessage(
        `Explícame el término "${pendingTerm.term}" con un ejemplo práctico para mi área de trabajo.`,
        pendingTerm.term
      );
      onTermConsumed();
    }
  }, [pendingTerm, onTermConsumed, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  const submitReport = async () => {
    if (!reportFor) return;
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messageId: reportFor.messageId,
          reason: reportReason,
          userComment: reportComment.trim() || null,
        }),
      });
      if (res.ok) {
        setReportedIndices((s) => new Set(s).add(reportFor.index));
      }
    } catch {}
    finally {
      setReportSubmitting(false);
      setReportFor(null);
      setReportReason(REPORT_REASONS[0].id);
      setReportComment("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Single compact header: tone selector + reset */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-slate-400 text-xs shrink-0 mr-1">Tono:</span>
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone.id}
            onClick={() => setActiveTone(tone)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeTone.id === tone.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span>{tone.icon}</span>
            <span>{tone.label}</span>
          </button>
        ))}
        <button
          onClick={() => {
            setMessages([
              {
                role: "assistant",
                content: `Hola ${profile.icon} Chat reiniciado. ¿En qué puedo ayudarte?`,
              },
            ]);
            setConversationId(null);
            setReportedIndices(new Set());
          }}
          className="ml-auto shrink-0 text-slate-400 hover:text-blue-600 text-xs transition-colors"
          title="Reiniciar chat"
        >
          ↺ Reiniciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col max-w-[85%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.role === "assistant" && i > 0 && msg.content && !loading && (
                <div className="flex justify-start mt-1 px-1">
                  {reportedIndices.has(i) ? (
                    <span className="text-[10px] text-emerald-600">✓ Reporte enviado</span>
                  ) : (
                    <button
                      onClick={() =>
                        setReportFor({ index: i, messageId: msg.messageId ?? null })
                      }
                      className="text-[10px] text-slate-400 hover:text-red-600 transition-colors"
                      title="Reportar respuesta"
                    >
                      🚩 Reportar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre cualquier término..."
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shadow-sm"
        >
          Enviar
        </button>
      </form>

      {/* Report modal */}
      {reportFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Reportar respuesta</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tu reporte nos ayuda a mejorar las respuestas del asistente.
            </p>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    reportReason === r.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={reportReason === r.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-blue-600"
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={reportComment}
              onChange={(e) => setReportComment(e.target.value)}
              placeholder="¿Algo más que quieras comentar? (opcional)"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportFor(null)}
                disabled={reportSubmitting}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={submitReport}
                disabled={reportSubmitting}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg font-medium"
              >
                {reportSubmitting ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
