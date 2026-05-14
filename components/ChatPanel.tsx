"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { GlossaryTerm, UserProfile, TONE_OPTIONS } from "@/lib/glossary";

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
  const [activeTone, setActiveTone] = useState(TONE_OPTIONS[0]);
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
            tonePrompt: activeTone.prompt,
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
    [messages, loading, profile, activeTone]
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
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <Image
          src="/logo-horizontal.png"
          alt="GlosarioIA"
          width={120}
          height={36}
          className="object-contain"
        />
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 text-sm">{profile.icon} {profile.label}</span>
        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Hola ${profile.icon} Chat reiniciado. ¿En qué puedo ayudarte?`,
              },
            ])
          }
          className="ml-auto text-slate-400 hover:text-blue-600 text-xs transition-colors"
          title="Reiniciar chat"
        >
          ↺ Reiniciar
        </button>
      </div>

      {/* Tone selector */}
      <div className="bg-white border-b border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
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
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
              }`}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
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
    </div>
  );
}
