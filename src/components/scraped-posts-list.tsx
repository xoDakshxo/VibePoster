"use client";

import { Heart, Repeat2, MessageCircle } from "lucide-react";

interface ScrapedPost {
  id: string;
  authorHandle: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  engagement: number;
}

interface ScrapedPostsListProps {
  posts: ScrapedPost[];
}

export function ScrapedPostsList({ posts }: ScrapedPostsListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4">
        No scraped posts yet. Run a scrape to pull viral posts from Bluesky.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50"
        >
          <p className="text-xs text-zinc-500 mb-1">@{post.authorHandle}</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {post.content}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 size={12} />
              {post.reposts}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {post.replies}
            </span>
            <span className="text-zinc-600">
              score: {post.engagement}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
