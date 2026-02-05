"use client";

import Link from "next/link";
import { Trash2, Zap, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendCardProps {
  id: string;
  name: string;
  keywords: string;
  status: string;
  styleCard: { locked: boolean } | null;
  postCount: number;
  scrapedCount: number;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-zinc-700 text-zinc-300" },
  scraped: { label: "Scraped", color: "bg-blue-900 text-blue-300" },
  styled: { label: "Styled", color: "bg-purple-900 text-purple-300" },
  active: { label: "Active", color: "bg-green-900 text-green-300" },
};

export function TrendCard({
  id,
  name,
  keywords,
  status,
  styleCard,
  postCount,
  scrapedCount,
  onDelete,
}: TrendCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.new;

  return (
    <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors bg-zinc-900/50">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/trends/${id}`} className="group flex-1">
          <h3 className="text-lg font-medium text-zinc-100 group-hover:text-white transition-colors">
            {name}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">{keywords}</p>
        </Link>
        <div className="flex items-center gap-2 ml-3">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              statusInfo.color
            )}
          >
            {statusInfo.label}
          </span>
          <button
            onClick={() => onDelete(id)}
            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Radio size={12} />
          {scrapedCount} scraped
        </span>
        <span className="flex items-center gap-1">
          <Zap size={12} />
          {styleCard?.locked ? "Style locked" : "No style"}
        </span>
        <span className="flex items-center gap-1">
          <FileText size={12} />
          {postCount} posts
        </span>
      </div>
    </div>
  );
}
