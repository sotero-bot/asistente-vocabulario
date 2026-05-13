"use client";

import { useState } from "react";
import { GlossaryTerm, GLOSSARY_TERMS, CATEGORIES } from "@/lib/glossary";

interface GlossaryPanelProps {
  onTermClick: (term: GlossaryTerm) => void;
}

export default function GlossaryPanel({ onTermClick }: GlossaryPanelProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = GLOSSARY_TERMS.filter((t) => {
    const matchSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <input
          type="text"
          placeholder="Buscar término..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              !activeCategory
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center mt-8">
            No se encontraron términos
          </p>
        ) : (
          filtered.map((term) => (
            <button
              key={term.id}
              onClick={() => onTermClick(term)}
              className="w-full text-left p-3 rounded-lg mb-1 hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                    {term.term}
                  </span>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                    {term.shortDefinition}
                  </p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-700 group-hover:bg-slate-600 px-1.5 py-0.5 rounded shrink-0">
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
