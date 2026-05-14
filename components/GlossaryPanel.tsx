"use client";

import { useState } from "react";
import { GlossaryTerm, GLOSSARY_TERMS } from "@/lib/glossary";

interface GlossaryPanelProps {
  onTermClick: (term: GlossaryTerm) => void;
}

export default function GlossaryPanel({ onTermClick }: GlossaryPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY_TERMS.filter((t) =>
    t.term.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-slate-100">
        <input
          type="text"
          placeholder="Buscar término..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          Haz clic en cualquier concepto para que el asistente te lo explique con ejemplos de tu área.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center mt-8">
            No se encontraron términos
          </p>
        ) : (
          filtered.map((term) => (
            <button
              key={term.id}
              onClick={() => onTermClick(term)}
              className="w-full text-left p-3 rounded-xl mb-1 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-slate-800 font-semibold text-sm group-hover:text-blue-600 transition-colors">
                    {term.term}
                  </span>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                    {term.shortDefinition}
                  </p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-500 px-2 py-0.5 rounded-full shrink-0 transition-colors">
                  {term.category}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
