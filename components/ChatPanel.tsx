"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlossaryTerm, UserProfile } from "@/lib/glossary";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  profile: UserProfile;
  pendingTerm: GlossaryTerm | null;
  onTermConsumed: () => void;
}

export default function ChatPanel({ profile, pendingTerm, onTermConsumed }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hola ${profile.icon} ¡Bienvenido! Estoy aquí para explicarte conceptos de IA adaptados a tu contexto como **${profile.label}**.\n\nPuedes hacer clic en cualquier término del glosario para que te lo explique con ejemplos de tu área, o simplemente preguntarme lo que necesites.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
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
            messages: updatedMessages,
            profession: profile.profession,
            systemPromptContext: profile.systemPromptContext,
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
                const { text } = JSON.parse(data);
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: updated[updated.length - 1].content + text,
                  };
                  return updated;
                });
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
    [messages, loading, profile]
  );

  useEffect(() => {
    if (pendingTerm) {
      sendMessage(
        `Explícame el término "${pendingTerm.term}" con un ejemplo práctico para mi área de trabajo.`
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
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 rounded text-blue-300 text-sm">$1</code>')
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-700 flex items-center gap-2">
        <span className="text-lg">{profile.icon}</span>
        <div>
          <p className="text-white text-sm font-medium">Asistente IA</p>
          <p className="text-slate-400 text-xs">{profile.label}</p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Hola ${profile.icon} Chat reiniciado. ¿En qué puedo ayudarte?`,
              },
            ])
          }
          className="ml-auto text-slate-500 hover:text-slate-300 text-xs transition-colors"
          title="Reiniciar chat"
        >
          ↺ Reiniciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-slate-700 text-slate-100 rounded-bl-sm"
              }`}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre cualquier término..."
          disabled={loading}
          className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
