"use client";

import { Lock, RefreshCw } from "lucide-react";
import { StyleCardView } from "@/types";

interface StyleCardDisplayProps {
  styleCard: StyleCardView;
  onLock: () => void;
  onRegenerate: () => void;
  loading?: boolean;
}

export function StyleCardDisplay({
  styleCard,
  onLock,
  onRegenerate,
  loading,
}: StyleCardDisplayProps) {
  return (
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-zinc-100">Style Card</h3>
        <div className="flex items-center gap-2">
          {!styleCard.locked && (
            <>
              <button
                onClick={onRegenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Regenerate
              </button>
              <button
                onClick={onLock}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-green-900 text-green-300 hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                <Lock size={14} />
                Lock Style
              </button>
            </>
          )}
          {styleCard.locked && (
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-green-900/50 text-green-400">
              <Lock size={14} />
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              Tone
            </label>
            <p className="text-sm text-zinc-200 mt-1">{styleCard.tone}</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              Format
            </label>
            <p className="text-sm text-zinc-200 mt-1">{styleCard.format}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              Word Range
            </label>
            <p className="text-sm text-zinc-200 mt-1">
              {styleCard.minWords} - {styleCard.maxWords} words
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            Hooks
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {styleCard.hooks.map((hook, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300"
              >
                {hook}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            Avoid
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {styleCard.avoid.map((item, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded bg-red-950 text-red-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            Example Posts
          </label>
          <div className="space-y-2 mt-1">
            {styleCard.examples.map((example, i) => (
              <div
                key={i}
                className="text-sm text-zinc-300 p-3 rounded bg-zinc-800/50 border border-zinc-700"
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
