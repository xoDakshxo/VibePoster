"use client";

import { Check, X, Copy, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostPreviewProps {
  id: string;
  content: string;
  status: string;
  tweetUrl?: string | null;
  trendName?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPublish?: (id: string) => void;
  onCopy?: (content: string) => void;
  loading?: boolean;
}

export function PostPreview({
  id,
  content,
  status,
  tweetUrl,
  trendName,
  onApprove,
  onReject,
  onPublish,
  onCopy,
  loading,
}: PostPreviewProps) {
  const charCount = content.length;
  const isOverLimit = charCount > 280;

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
      {trendName && (
        <p className="text-xs text-zinc-500 mb-2">{trendName}</p>
      )}

      <p
        className={cn(
          "text-sm leading-relaxed",
          isOverLimit ? "text-red-400" : "text-zinc-200"
        )}
      >
        {content}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-red-400" : "text-zinc-500"
          )}
        >
          {charCount}/280
        </span>

        <div className="flex items-center gap-2">
          {status === "draft" && (
            <>
              <button
                onClick={() => onReject?.(id)}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <X size={12} />
                Reject
              </button>
              <button
                onClick={() => onApprove?.(id)}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-green-900 text-green-300 hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                <Check size={12} />
                Approve
              </button>
            </>
          )}
          {status === "approved" && (
            <>
              <button
                onClick={() => onCopy?.(content)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <Copy size={12} />
                Copy
              </button>
              <button
                onClick={() => onPublish?.(id)}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                <Send size={12} />
                Publish
              </button>
            </>
          )}
          {status === "published" && tweetUrl && (
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View on X
            </a>
          )}
          {status === "published" && !tweetUrl && (
            <span className="text-xs text-green-400">Published</span>
          )}
          {status === "rejected" && (
            <span className="text-xs text-zinc-500">Rejected</span>
          )}
        </div>
      </div>
    </div>
  );
}
