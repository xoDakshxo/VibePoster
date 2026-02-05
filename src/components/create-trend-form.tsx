"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface CreateTrendFormProps {
  onCreated: () => void;
}

export function CreateTrendForm({ onCreated }: CreateTrendFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !keywords.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          keywords: keywords.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (res.ok) {
        setName("");
        setKeywords("");
        setDescription("");
        setOpen(false);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        <Plus size={16} />
        New Trend
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 space-y-3"
    >
      <div>
        <label className="text-xs text-zinc-500 uppercase tracking-wide">
          Topic Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., AI Agents"
          className="w-full mt-1 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-500 uppercase tracking-wide">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., AI agents, autonomous AI, agentic"
          className="w-full mt-1 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-500 uppercase tracking-wide">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional context for the LLM"
          className="w-full mt-1 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim() || !keywords.trim()}
          className="text-sm px-4 py-2 rounded-md bg-white text-black font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Trend"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm px-4 py-2 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
